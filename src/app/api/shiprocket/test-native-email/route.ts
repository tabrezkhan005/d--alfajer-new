import { NextRequest, NextResponse } from "next/server";
import {
  getShiprocketToken,
  createShiprocketShipment,
  CreateShipmentRequest,
  checkServiceability,
  assignCourierAndGenerateAWB
} from "@/src/lib/shiprocket";

/**
 * POST /api/shiprocket/test-native-email
 *
 * Creates a TEST shipment in Shiprocket AND assigns a courier to trigger their native email notification.
 * This will send Shiprocket's default email (with tracking) to the provided email address.
 *
 * IMPORTANT: This creates a real order with AWB in Shiprocket (can be cancelled later).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Use provided email or default to your email
    const testEmail = body.email || "tabrezkhangnt@gmail.com";
    const testPhone = body.phone || "9876543210";

    // Authenticate with Shiprocket
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Shiprocket credentials not configured"
      }, { status: 500 });
    }

    const authResult = await getShiprocketToken(email, password);
    if ("error" in authResult) {
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${authResult.error}`
      }, { status: 401 });
    }

    const token = authResult.token;

    // Step 0: Get correct pickup location details
    console.log("📍 Step 0: Fetching pickup location details...");
    let pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "400001";
    const pickupLocationName = process.env.NEXT_PUBLIC_SHIPROCKET_PICKUP_LOCATION || "Home-1";

    try {
      // delayed import or use existing import
      const { getShiprocketPickupLocations } = await import("@/src/lib/shiprocket");
      const locationsResult = await getShiprocketPickupLocations(token);

      if (locationsResult?.data?.shipping_address) {
        const location = locationsResult.data.shipping_address.find(
          (loc: any) => loc.pickup_location === pickupLocationName
        );

        if (location) {
          pickupPincode = location.pin_code; // Shiprocket returns 'pin_code'
          console.log(`✅ Found pickup location '${pickupLocationName}' with pincode: ${pickupPincode}`);
        } else {
          console.warn(`⚠️ Pickup location '${pickupLocationName}' not found in Shiprocket account. Using default pincode: ${pickupPincode}`);
          console.log("Available locations:", locationsResult.data.shipping_address.map((l: any) => l.pickup_location).join(", "));
        }
      }
    } catch (locError) {
      console.error("Failed to fetch pickup locations:", locError);
    }

    // Step 1: Create a test order
    const testOrderId = `TEST-${Date.now()}`;
    const deliveryPincode = "522001"; // Guntur pincode for test

    const shipmentData: CreateShipmentRequest = {
      order_id: testOrderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: pickupLocationName,

      // Customer details - Shiprocket sends email to this address
      billing_customer_name: "Tabrez Khan",
      billing_last_name: "",
      billing_address: "Alinagar Old guntur, Do no 16-27-98 Khans manzil, Old Guntur",
      billing_city: "Guntur",
      billing_pincode: "522001",
      billing_state: "Andhra Pradesh",
      billing_country: "India",
      billing_email: "tabrezkhangnt@gmail.com",
      billing_phone: "9391773656",

      shipping_is_billing: true,

      order_items: [{
        name: "Test Product - Shiprocket Email Test",
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

    console.log("🚀 Step 1: Creating TEST Shiprocket order...");
    console.log("📧 Email will be sent to:", testEmail);

    const createResult = await createShiprocketShipment(token, shipmentData);

    if (!createResult) {
      return NextResponse.json({
        success: false,
        error: "Failed to create Shiprocket order"
      }, { status: 500 });
    }

    const shiprocketOrderId = createResult.order_id || (createResult as any).payload?.order_id;
    const shipmentId = createResult.shipment_id || (createResult as any).payload?.shipment_id;

    console.log("✅ Order created:", { shiprocketOrderId, shipmentId });

    // Step 2: Check serviceability and get available couriers
    console.log("🔍 Step 2: Checking serviceability...");

    let awbCode: string | null = null;
    let assignResult: any = null;
    let assignError: string | null = null;
    let courierName: string = "";

    try {
      const serviceability = await checkServiceability(token, {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        weight: 0.5,
        cod: 0, // Prepaid
      });

      if (serviceability?.data?.available_courier_companies?.length) {
        // Get valid couriers and sort by rate
        const couriers = serviceability.data.available_courier_companies.sort((a: any, b: any) => a.rate - b.rate);

        console.log(`🔍 Found ${couriers.length} couriers. Trying to assign...`);

        // Try top 3 couriers
        const couriersToTry = couriers.slice(0, 3);

        for (const courier of couriersToTry) {
          console.log(`🚚 Trying courier: ${courier.courier_name} (ID: ${courier.courier_company_id})...`);

          try {
            assignResult = await assignCourierAndGenerateAWB(token, {
              shipment_id: shipmentId,
              courier_id: courier.courier_company_id
            });

            // Check if successful
            const responseData = assignResult?.response?.data || assignResult?.data || assignResult;
            if (responseData?.awb_code) {
              awbCode = responseData.awb_code;
              courierName = courier.courier_name;
              console.log(`✅ Success! AWB Generated: ${awbCode} with ${courierName}`);
              break; // Stop trying, we succeeded
            } else {
              const errorMsg = responseData?.message || assignResult?.message;
              console.warn(`⚠️ Failed with ${courier.courier_name}: ${errorMsg}`);
              // Capture error but continue to next courier
              assignError = errorMsg;
            }
          } catch (err: any) {
            console.error(`❌ Error with ${courier.courier_name}:`, err.message);
          }
        }
      } else {
        assignError = "No serviceable couriers found for this route.";
        console.warn("⚠️ No serviceable couriers found.");
      }
    } catch (serviceError) {
      console.error("Serviceability check failed:", serviceError);
      assignError = `Serviceability check failed: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`;
    }

    return NextResponse.json({
      success: true,
      message: awbCode
        ? `Test order created AND shipped! Shiprocket should send a native email to ${testEmail} with tracking number ${awbCode}`
        : `Test order created but courier assignment failed. Check Shiprocket dashboard to manually assign courier.`,
      debug_raw: JSON.stringify(assignResult, null, 2), // Return response as string to bypass PowerShell formatting issues
      testOrderId,
      shiprocketOrderId,
      shipmentId,
      courierAssigned: !!awbCode,
      courierName: courierName || null,
      awbCode: awbCode || null,
      assignError: assignError,
      emailSentTo: testEmail,
      steps: {
        orderCreated: true,
        courierAssigned: !!awbCode,
      },
      note: awbCode
        ? "Check your inbox (and spam folder) for Shiprocket's shipping notification email with tracking details."
        : `Courier assignment failed${assignError ? `: ${assignError}` : ""}. Go to Shiprocket Dashboard → Orders → Find this order → Click 'Ship Now' to assign a courier manually.`,
      cancelNote: "You can cancel this test order from Shiprocket Dashboard after testing.",
    });

  } catch (error) {
    console.error("Test native email error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to create a test Shiprocket order, assign courier, and trigger their native email",
    example: {
      method: "POST",
      body: {
        email: "your-email@example.com",
        phone: "9876543210"
      }
    },
    note: "If no email is provided, it will use the default test email. This will CREATE an order AND ASSIGN a courier (generate AWB) to trigger Shiprocket's email."
  });
}
