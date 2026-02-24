import { getOrRefreshShiprocketToken } from "./src/lib/shiprocket-auth";
import { assignCourierAndGenerateAWB, createShiprocketShipment, checkServiceability } from "./src/lib/shiprocket";
import 'dotenv/config';

async function testNativeEmail() {
  try {
     console.log("Fetching token...");
     const token = await getOrRefreshShiprocketToken();
     if(!token) throw new Error("No token");
     console.log("Token acquired: " + token.substring(0, 10) + "...");

     // Create order
     const shipmentData = {
      order_id: `TEST-${Date.now()}`,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: process.env.NEXT_PUBLIC_SHIPROCKET_PICKUP_LOCATION || "Home-1",

      billing_customer_name: "Tabrez Khan",
      billing_last_name: "",
      billing_address: "Alinagar Old guntur, Do no 16-27-98 Khans manzil",
      billing_city: "Guntur",
      billing_pincode: "522001",
      billing_state: "Andhra Pradesh",
      billing_country: "India",
      billing_email: "tabrezkhangnt@gmail.com",
      billing_phone: "9391773656",

      shipping_is_billing: true,

      order_items: [{
        name: "Test Email Product",
        sku: "TEST-SKU-001",
        units: 1,
        selling_price: 100,
      }],

      payment_method: "Prepaid",
      sub_total: 100,
      weight: 0.5,
      length: 10,
      breadth: 10,
      height: 5,
    };

    console.log("Creating shipment:", shipmentData.order_id);
    const createResult = await createShiprocketShipment(token, shipmentData as any);

    if (!createResult) {
       console.error("Failed to create shipment");
       return;
    }

    const shipmentId = createResult.shipment_id || (createResult as any).payload?.shipment_id;
    console.log("Created shipment ID:", shipmentId);

    // Get couriers
    console.log("Checking serviceability...");
    let pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "400001";
    const serviceability = await checkServiceability(token, {
        pickup_postcode: pickupPincode,
        delivery_postcode: "522001",
        weight: 0.5,
        cod: 0,
    });

    if (serviceability?.data?.available_courier_companies?.length) {
       const couriers = serviceability.data.available_courier_companies.sort((a: any, b: any) => a.rate - b.rate);
       const topCourier = couriers[0];
       console.log(`Assigning top courier: ${topCourier.courier_name} (ID: ${topCourier.courier_company_id})`);

       const assignResult = await assignCourierAndGenerateAWB(token, {
           shipment_id: shipmentId,
           courier_id: topCourier.courier_company_id
       });

       const responseData = assignResult?.response?.data || assignResult?.data || assignResult;
       if (responseData?.awb_code) {
           console.log(`✅ Success! AWB Generated: ${responseData.awb_code}`);
           console.log("Check tabrezkhangnt@gmail.com for the Shiprocket email!");
       } else {
           console.error("Failed to assign courier:", responseData?.message || assignResult?.message);
       }
    } else {
       console.error("No serviceable couriers found.");
    }
  } catch(e) {
     console.error("Error:", e);
  }
}

testNativeEmail().catch(console.error);
