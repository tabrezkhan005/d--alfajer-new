import { sendOrderStatusEmail, prepareOrderEmailData } from "./src/lib/email";
import 'dotenv/config';

async function testEmail() {
  const dummyOrder = {
    id: "test-uuid-123",
    order_number: "TEST-ORD-001",
    email: "tabrezkhangnt@gmail.com",
    status: "shipped",
    subtotal: 1000,
    shipping_cost: 0,
    tax: 0,
    discount: 0,
    total_amount: 1000,
    currency: "INR",
    tracking_number: "SR-123456789", // Using a dummy tracking number
    shipping_address: {
      name: "Tabrez Khan",
      address: "123 Test St",
      city: "Guntur",
      state: "Andhra Pradesh",
      postalCode: "522001",
      country: "IN",
      phone: "9876543210"
    },
    created_at: new Date().toISOString(),
    items: [
      {
        name: "Test Fragrance",
        quantity: 1,
        price: 1000,
      }
    ]
  };

  const emailData = prepareOrderEmailData(dummyOrder as any);

  console.log("Prepared Email Data:", emailData);

  console.log("Sending email...");
  const result = await sendOrderStatusEmail("shipped", emailData);

  if (result.success) {
    console.log("✅ Email sent successfully!", result.messageId);
  } else {
    console.error("❌ Email sending failed:", result.error);
  }
}

testEmail().catch(console.error);
