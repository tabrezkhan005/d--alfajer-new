import { NextRequest, NextResponse } from "next/server";
import { sendOrderShippedEmail, prepareOrderEmailData } from "@/src/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || "tabrezkhangnt@gmail.com";

    // Mock order data
    const mockOrder = {
      id: "TEST-EMAIL-123",
      email: email,
      status: "shipped",
      tracking_number: "19041869658144", // Real AWB from previous step
      tracking_url: "https://www.shiprocket.in/tracking/19041869658144",
      shipping_address: {
        firstName: "Tabrez",
        lastName: "Khan",
        address: "Alinagar Old guntur",
        city: "Guntur",
        state: "Andhra Pradesh",
        postalCode: "522001",
        country: "India"
      },
      items: [
        { name: "Test Product", quantity: 1, price: 100 }
      ],
      subtotal: 100,
      total: 100,
      currency: "INR"
    };

    const emailData = prepareOrderEmailData(mockOrder as any);
    const result = await sendOrderShippedEmail(emailData);

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Test email sent successfully" : "Failed to send email",
      error: result.error
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
