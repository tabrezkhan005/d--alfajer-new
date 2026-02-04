import { NextRequest, NextResponse } from "next/server";
import { sendOrderStatusEmail } from "@/src/lib/email";
import type { OrderEmailData } from "@/src/lib/email/templates";

const TEST_RECIPIENT = "tabrezkhangnt@gmail.com";

/**
 * GET /api/email/test-shiprocket-notifications
 * Returns instructions to test shipped/delivered emails.
 */
export async function GET() {
  return NextResponse.json({
    message: "POST to this URL to send test Shiprocket-style emails (shipped + delivered) to your inbox.",
    recipient: TEST_RECIPIENT,
    postUrl: "/api/email/test-shiprocket-notifications",
    example:
      "curl -X POST http://localhost:3000/api/email/test-shiprocket-notifications -H \"Content-Type: application/json\" -d \"{}\"",
  });
}

/**
 * POST /api/email/test-shiprocket-notifications
 * Sends sample "Order Shipped" and "Order Delivered" emails to verify the flow.
 * Use this to confirm you receive Shiprocket-triggered emails at your address.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const to = (typeof body.to === "string" && body.to.includes("@") ? body.to : TEST_RECIPIENT) as string;

    const orderNumber = "ORD-TEST-" + Date.now();
    const trackingNumber = "19041424751540";
    const trackingUrl = "https://www.shiprocket.in/tracking/19041424751540";

    const baseData: OrderEmailData = {
      orderNumber,
      customerName: "Test Customer",
      customerEmail: to,
      items: [
        { name: "Premium Kashmiri Saffron 1g", quantity: 2, price: 599 },
        { name: "Pure Himalayan Shilajit 20g", quantity: 1, price: 899 },
      ],
      subtotal: 2097,
      shippingCost: 99,
      tax: 0,
      discount: 100,
      total: 2096,
      currency: "INR",
      shippingAddress: {
        name: "Test Customer",
        address: "123 Test Street, Block A",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "IN",
        phone: "+91 9876543210",
      },
      estimatedDelivery: "Thu, Feb 6 – Fri, Feb 7",
      orderDate: new Date().toISOString(),
      status: "shipped",
      trackingNumber,
      trackingUrl,
    };

    const results: { email: string; success: boolean; messageId?: string; error?: string }[] = [];

    // 1. Send "Order Shipped" email
    const shippedResult = await sendOrderStatusEmail("shipped", { ...baseData, status: "shipped" });
    results.push({
      email: "shipped",
      success: shippedResult.success,
      messageId: shippedResult.messageId,
      error: shippedResult.error,
    });

    // 2. Send "Order Delivered" email
    const deliveredResult = await sendOrderStatusEmail("delivered", {
      ...baseData,
      status: "delivered",
      orderNumber,
    });
    results.push({
      email: "delivered",
      success: deliveredResult.success,
      messageId: deliveredResult.messageId,
      error: deliveredResult.error,
    });

    const allOk = results.every((r) => r.success);

    return NextResponse.json({
      success: allOk,
      to,
      orderNumber,
      results,
      message: allOk
        ? `Test emails sent. Check ${to} (and spam) for "Order Shipped" and "Order Delivered" emails.`
        : "One or more emails failed. Check results and server logs.",
    });
  } catch (error) {
    console.error("Test Shiprocket notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send test emails",
      },
      { status: 500 }
    );
  }
}
