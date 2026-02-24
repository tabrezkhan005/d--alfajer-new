import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/server";
import { createShiprocketShipment, assignCourierAndGenerateAWB } from "@/src/lib/shiprocket";
import { getOrRefreshShiprocketToken } from "@/src/lib/shiprocket-auth";

export async function POST(request: NextRequest) {
  try {
    const { token, shipmentData, courier_id } = await request.json();

    let authToken = token;

    // If no token provided, try to get cached/fresh token from environment variables
    if (!authToken) {
      try {
        authToken = await getOrRefreshShiprocketToken();
      } catch (error: any) {
        return NextResponse.json(
          { error: `Authentication failed: ${error.message}` },
          { status: 401 }
        );
      }
    }

    if (!shipmentData) {
      return NextResponse.json(
        { error: "Shipment data is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    // IMPORTANT: billing_email is required for Shiprocket to send customer notifications (dispatch, delivery, etc.)
    const requiredFields = [
      'order_id',
      'order_date',
      'pickup_location',
      'billing_customer_name',
      'billing_address',
      'billing_city',
      'billing_pincode',
      'billing_state',
      'billing_country',
      'billing_email', // Required for customer notifications
      'billing_phone',
      'order_items',
      'payment_method',
      'sub_total',
      'weight',
      'length',
      'breadth',
      'height',
    ];

    // Warn if email is empty (Shiprocket won't send notifications without valid email)
    if (!shipmentData.billing_email || shipmentData.billing_email.trim() === '') {
      console.warn('WARNING: billing_email is empty or missing. Customer will NOT receive Shiprocket notifications (dispatch, delivery updates, etc.)');
    } else {
      console.log('Shiprocket shipment will send notifications to:', shipmentData.billing_email);
    }

    const missingFields = requiredFields.filter(field => {
      const value = shipmentData[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      const message = missingFields.includes('billing_email')
        ? 'Customer email (billing_email) is required so Shiprocket can send order updates (shipped, delivered) to the customer. Ensure the order has an email in shipping address or order details.'
        : `Missing required fields: ${missingFields.join(', ')}`;
      return NextResponse.json(
        {
          error: message,
          missing_fields: missingFields
        },
        { status: 400 }
      );
    }

    // Validate order_items has at least one item
    if (!Array.isArray(shipmentData.order_items) || shipmentData.order_items.length === 0) {
      return NextResponse.json(
        { error: "At least one order item is required" },
        { status: 400 }
      );
    }

    // Log shipment data for debugging
    console.log("Creating Shiprocket shipment with data:", JSON.stringify(shipmentData, null, 2));

    const result = await createShiprocketShipment(authToken, shipmentData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create shipment - no response from Shiprocket" },
        { status: 500 }
      );
    }

    // Check for Shiprocket-specific error responses
    if (result.status === 0 || (result as any).status_code === 0) {
      const errorMessage = result.message || (result as any).error || "Shipment creation failed";
      console.error("Shiprocket returned error:", result);
      return NextResponse.json(
        { error: errorMessage, shiprocket_response: result },
        { status: 400 }
      );
    }

    // Store Shiprocket order id/shipment id on our order
    const srOrderId = result.order_id ?? (result as any).payload?.order_id ?? (result as any).sr_order_id;
    const shipmentId = result.shipment_id ?? (result as any).payload?.shipment_id;

    if (shipmentData.order_id) {
      try {
        const supabase = createAdminClient();
        const ourRef = String(shipmentData.order_id).trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ourRef);

        // Prepare update data
        const updates: any = {};
        if (srOrderId) updates.shiprocket_order_id = typeof srOrderId === "number" ? srOrderId : parseInt(String(srOrderId), 10);
        if (shipmentId) updates.shiprocket_shipment_id = typeof shipmentId === "number" ? shipmentId : parseInt(String(shipmentId), 10);

        if (Object.keys(updates).length > 0) {
          if (isUuid) {
            await supabase.from("orders").update(updates).eq("id", ourRef);
          } else {
            await supabase.from("orders").update(updates).eq("order_number", ourRef);
          }
          console.log("Stored Shiprocket IDs:", updates);
        }
      } catch (e) {
        console.warn("Failed to store shiprocket IDs on order:", e);
      }
    }

    // If courier_id is provided, try to assign courier and generate AWB immediately
    if (courier_id && result.shipment_id) {
       console.log(`Auto-assigning courier ${courier_id} for shipment ${result.shipment_id}`);
       try {
         const awbResult = await assignCourierAndGenerateAWB(authToken, {
           shipment_id: result.shipment_id,
           courier_id: Number(courier_id)
         });

         if (awbResult && (awbResult.awb_assign_status === 1 || awbResult.response?.data?.awb_assign_status === 1)) {
            const awbCode = awbResult.response?.data?.awb_code || awbResult.awb_code;

            // Save AWB to order in database immediately
            if (shipmentData.order_id && awbCode) {
              const supabase = createAdminClient();
              const ourRef = String(shipmentData.order_id).trim();
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ourRef);

              const updates: any = { tracking_number: awbCode };
              if (isUuid) {
                await supabase.from("orders").update(updates).eq("id", ourRef);
              } else {
                await supabase.from("orders").update(updates).eq("order_number", ourRef);
              }
              console.log(`Saved AWB ${awbCode} to order ${ourRef}`);
            }

            // Merge response
            return NextResponse.json({
              ...result,
              awb_code: awbCode,
              courier_name: awbResult.response?.data?.courier_name || awbResult.courier_name,
              courier_company_id: courier_id,
              awb_status: "assigned",
              message: "Shipment created and courier assigned successfully"
            });
         } else {
           console.warn("Courier assignment failed:", awbResult);
           // Return partial success - order created but courier not assigned
            return NextResponse.json({
              ...result,
              awb_status: "failed",
              awb_error: awbResult?.message || "Failed to assign courier",
              message: "Order created but courier assignment failed. Please assign manually."
            });
         }
       } catch (awbError: any) {
         console.error("Error during auto-courier assignment:", awbError);
         return NextResponse.json({
            ...result,
            awb_status: "failed",
            awb_error: awbError.message,
            message: "Order created but courier assignment failed. Please assign manually."
         });
       }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Shiprocket shipment creation error:", error);

    // Parse error message for more specific errors
    const errorMessage = error.message || "Internal server error";

    // Check for specific Shiprocket error patterns
    if (errorMessage.includes("pickup location") || errorMessage.includes("Pickup location")) {
      return NextResponse.json(
        {
          error: "Invalid pickup location. Please ensure the pickup_location name exactly matches one configured in your Shiprocket dashboard.",
          suggestion: "Go to Shiprocket Dashboard > Settings > Pickup Addresses to verify the exact pickup location name."
        },
        { status: 400 }
      );
    }

    const statusCode = errorMessage.includes("required") || errorMessage.includes("Invalid") ? 400 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
