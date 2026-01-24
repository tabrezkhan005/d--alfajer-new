import { NextRequest, NextResponse } from "next/server";
import { getShiprocketToken } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    let email: string | undefined;
    let password: string | undefined;

    // Try to get credentials from request body
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch {
      // No body provided, will use env variables
    }

    // Fall back to environment variables if not provided in request
    if (!email || !password) {
      email = process.env.SHIPROCKET_EMAIL || process.env.NEXT_PUBLIC_SHIPROCKET_EMAIL;
      password = process.env.SHIPROCKET_PASSWORD || process.env.NEXT_PUBLIC_SHIPROCKET_PASSWORD;
    }

    // Shiprocket requires email and password authentication
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Shiprocket authentication requires email and password. Please configure credentials in environment variables or provide them in the request."
        },
        { status: 400 }
      );
    }

    const result = await getShiprocketToken(email, password);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ token: result.token });
  } catch (error: any) {
    console.error("Shiprocket auth error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
