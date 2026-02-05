import { createAdminClient } from "./src/lib/supabase/server";
import { automateShiprocketShipment } from "./src/lib/shiprocket-automation";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config();

async function runTest() {
  const supabase = createAdminClient();
  const testEmail = "tabrezkhangnt@gmail.com";

  console.log("🛠️ Creating Test Order for:", testEmail);

  // 1. Create Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      email: testEmail,
      status: "pending",
      total_amount: 390.00,
      subtotal: 350.00,
      shipping_cost: 40.00,
      payment_method: "card",
      payment_status: "paid",
      shipping_address: {
        firstName: "Tabrez",
        lastName: "Khan",
        address: "Alinagar",
        city: "Guntur",
        state: "Andhra Pradesh",
        zip: "522001",
        country: "IN",
        phone: "9391773656",
        email: testEmail
      },
      order_number: `TEST-${Date.now()}`
    } as any)
    .select()
    .single();

  if (orderError || !order) {
    console.error("❌ Failed to create order:", orderError);
    return;
  }

  console.log("✅ Order created ID:", order.id);

  // 2. Create Order Item
  const { error: itemError } = await supabase
    .from("order_items")
    .insert({
      order_id: order.id,
      product_id: "b203f543-4ce0-4a6e-a5f9-f20a88689b60", // Kashmiri Kahwa Tea
      name: "Kashmiri Kahwa Tea (Test)",
      quantity: 1,
      price: 350.00,
      total: 350.00,
      sku: "KASH-TEA-TEST"
    } as any);

  if (itemError) {
    console.error("❌ Failed to create order item:", itemError);
    return;
  }

  console.log("✅ Order items added.");

  // 3. Trigger Automation
  console.log("🤖 Triggering Shiprocket Automation...");
  const result = await automateShiprocketShipment(order.id);

  if (result.success) {
    console.log("🎉 SUCCESS! Shiprocket order created.");
    console.log("Tracking Ref:", result.trackingNumber);
  } else {
    console.error("❌ Automation failed:", result.error);
  }
}

runTest().catch(console.error);
