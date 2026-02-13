import { createAdminClient } from "./supabase/server";
import {
  createShiprocketShipment,
  getShiprocketToken,
  CreateShipmentRequest,
  ShiprocketOrderItem
} from "./shiprocket";

/**
 * Automatically creates a Shiprocket shipment for a given order ID.
 * This is intended for use in webhooks or automated flows.
 */
export async function automateShiprocketShipment(orderId: string) {
  const supabase = createAdminClient();

  try {
    console.log(`🚀 Starting Shiprocket automation for Order: ${orderId}`);

    // 1. Fetch Order and Items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }

    const orderData = order as any;

    // 2. Validate if already shipped
    if (orderData.status === "shipped" || orderData.tracking_number) {
      console.log(`⏩ Order ${orderId} is already shipped or has tracking. Skipping.`);
      return { success: true, skipped: true, message: "Already shipped" };
    }

    // 3. Authenticate with Shiprocket
    let email = process.env.SHIPROCKET_EMAIL;
    let password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      throw new Error("Shiprocket credentials (SHIPROCKET_EMAIL/PASSWORD) not configured in env.");
    }

    // Strip literal quotes if present (some env loaders include them)
    if (email.startsWith("'") && email.endsWith("'")) email = email.slice(1, -1);
    if (email.startsWith('"') && email.endsWith('"')) email = email.slice(1, -1);
    email = email.trim();

    if (password.startsWith("'") && password.endsWith("'")) password = password.slice(1, -1);
    if (password.startsWith('"') && password.endsWith('"')) password = password.slice(1, -1);
    password = password.trim();

    console.log(`🔑 Using Shiprocket Email: ${email}`);
    console.log(`🔑 Password length: ${password.length}`);
    console.log(`🔑 Password first 3 chars: ${password.substring(0, 3)}...`);

    const authResult = await getShiprocketToken(email, password);
    if ("error" in authResult) {
      throw new Error(`Authentication failed: ${authResult.error}`);
    }
    const token = authResult.token;

    // 4.1 Get Correct Pickup Pincode
    let pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "400001";
    const pickupLocationName = process.env.NEXT_PUBLIC_SHIPROCKET_PICKUP_LOCATION || "Home-1";

    try {
      const { getShiprocketPickupLocations } = await import("./shiprocket");
      const locationsResult = await getShiprocketPickupLocations(token);

      if (locationsResult?.data?.shipping_address) {
        const location = locationsResult.data.shipping_address.find(
          (loc: any) => loc.pickup_location === pickupLocationName
        );
        if (location) {
          pickupPincode = location.pin_code;
        }
      }
    } catch (locError) {
      console.error("Failed to fetch pickup locations, using default:", locError);
    }

    // 4. Prepare Shipment Data
    const shippingAddress = order.shipping_address as any;
    const orderItems = order.items as any[] || [];

    // Map items to Shiprocket format
    const shiprocketItems: ShiprocketOrderItem[] = orderItems.map((item) => ({
      name: item.name || "Product",
      sku: item.sku || item.product_id || "SKU-UNKNOWN",
      units: item.quantity || 1,
      selling_price: Number(item.price) || 0,
    }));

    // Calculate total weight (defaulting to 0.5kg per item if not known)
    const totalWeight = orderItems.reduce((sum, item) => sum + (item.quantity * 0.5), 0);

    const shipmentData: CreateShipmentRequest = {
      order_id: orderData.id,
      order_date: new Date(orderData.created_at || Date.now()).toISOString().split('T')[0],
      pickup_location: pickupLocationName,
      billing_customer_name: shippingAddress.firstName || "Customer",
      billing_last_name: shippingAddress.lastName || "",
      billing_address: shippingAddress.address || shippingAddress.streetAddress || "",
      billing_address_2: shippingAddress.apartment || "",
      billing_city: shippingAddress.city || "",
      billing_pincode: shippingAddress.zip || shippingAddress.postalCode || "",
      billing_state: shippingAddress.state || "",
      billing_country: shippingAddress.country || "India",
      billing_email: orderData.email || shippingAddress.email || "",
      billing_phone: shippingAddress.phone || "",
      shipping_is_billing: true,
      order_items: shiprocketItems,
      payment_method: orderData.payment_method === "cod" ? "COD" : "Prepaid",
      sub_total: Number(orderData.subtotal) || Number(orderData.total_amount) || 0,
      weight: totalWeight,
      length: 15,
      breadth: 15,
      height: 10,
    };

    console.log(`📦 Creating Shiprocket Order for ${orderId}...`);
    const result = await createShiprocketShipment(token, shipmentData);

    if (!result) {
      throw new Error("No response from Shiprocket API");
    }

    const srOrderId = result.order_id || (result as any).payload?.order_id;
    const shipmentId = result.shipment_id || (result as any).payload?.shipment_id;

    // 5. Auto-Assign Courier (Generate AWB)
    let awbCode = result.awb_code || (result as any).payload?.awb_code;
    let courierName = "";

    if (!awbCode && shipmentId) {
      console.log(`🔍 Checking serviceability for Order ${orderId}...`);
      try {
         const { checkServiceability, assignCourierAndGenerateAWB } = await import("./shiprocket");
         const deliveryPincode = shipmentData.billing_pincode;

         const serviceability = await checkServiceability(token, {
           pickup_postcode: pickupPincode,
           delivery_postcode: deliveryPincode,
           weight: totalWeight,
           cod: shipmentData.payment_method === "COD" ? 1 : 0
         });

         if (serviceability?.data?.available_courier_companies?.length) {
            // Pick cheapest courier
            const couriers = serviceability.data.available_courier_companies;
            const bestCourier = couriers.sort((a, b) => a.rate - b.rate)[0];

            console.log(`🚚 Assigning courier ${bestCourier.courier_name} (ID: ${bestCourier.courier_company_id})...`);

            const assignResult = await assignCourierAndGenerateAWB(token, {
              shipment_id: shipmentId,
              courier_id: bestCourier.courier_company_id
            });

            const responseData = assignResult?.response?.data || assignResult?.data || assignResult;
            if (responseData?.awb_code) {
               awbCode = responseData.awb_code;
               courierName = bestCourier.courier_name;
               console.log(`✅ AWB Generated: ${awbCode}`);
            } else {
               console.error("❌ AWB generation failed:", JSON.stringify(assignResult));
            }
         } else {
            console.warn("⚠️ No serviceable couriers found via automation.");
         }
      } catch (shipError: any) {
        console.error("❌ Auto-shipping failed:", shipError.message);
      }
    }

    // 6. Update Database
    // Use a reference if AWB is not yet assigned
    const trackingRef = awbCode || `SR-${shipmentId || srOrderId}`;
    const status = awbCode ? "shipped" : "processing"; // Only mark as shipped if AWB is generated

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: status,
        tracking_number: trackingRef,
        updated_at: new Date().toISOString(),
        // Store in dedicated columns so webhook lookups work
        shiprocket_order_id: srOrderId ? Number(srOrderId) : null,
        shiprocket_shipment_id: shipmentId ? Number(shipmentId) : null,
        notes: JSON.stringify({
          shiprocket_order_id: srOrderId,
          shiprocket_shipment_id: shipmentId,
          automated: true,
          courier: courierName,
          awb: awbCode,
          shiprocket_response: result
        })
      } as any)
      .eq("id", orderId);

    if (updateError) {
      console.error(`❌ Failed to update order in DB: ${updateError.message}`);
    }

    // 7. Send Custom Email Notification (Fallback/Primary if Shiprocket native fails)
    if (awbCode) {
      console.log(`📧 Sending shipping confirmation email for Order ${orderId}...`);
      try {
        const { sendOrderShippedEmail, prepareOrderEmailData } = await import("./email");

        // Prepare updated order object with shipping info
        const updatedOrder = {
          ...orderData,
          status: "shipped",
          tracking_number: awbCode,
          shipping_method: courierName || "Standard Shipping",
          // Construct absolute tracking URL if possible
          tracking_url: `https://shiprocket.co/tracking/${awbCode}`,
          // Ensure items is correct structure
          items: orderItems,
        };

        const emailData = prepareOrderEmailData(updatedOrder);
        const emailResult = await sendOrderShippedEmail(emailData);

        if (emailResult.success) {
          console.log(`✅ Shipping email sent successfully to ${emailData.customerEmail}`);
        } else {
          console.error(`❌ Failed to send shipping email: ${emailResult.error}`);
        }
      } catch (emailErr: any) {
        console.error("❌ Email sending failed:", emailErr.message);
      }
    }

    console.log(`✅ Shiprocket automation completed for ${orderId}. Reference: ${trackingRef}`);
    return { success: true, trackingNumber: trackingRef, shiprocketOrderId: srOrderId, awb: awbCode };

  } catch (error: any) {
    console.error(`❌ Shiprocket Automation Error [${orderId}]:`, error.message);
    return { success: false, error: error.message };
  }
}
