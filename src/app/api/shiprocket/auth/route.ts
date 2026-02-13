import { NextRequest, NextResponse } from "next/server";
import { getShiprocketToken } from "@/src/lib/shiprocket";
import { getOrRefreshShiprocketToken } from "@/src/lib/shiprocket-auth";

export async function POST(request: NextRequest) {
  try {
    // Try to get credentials from request body
    let email: string | undefined;
    let password: string | undefined;

    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch {
      // No body provided
    }

    // If credentials are provided explicitly, use them directly (no caching)
    if (email && password) {
      const result = await getShiprocketToken(email, password);

      if ("error" in result) {
        return NextResponse.json(
          { error: result.error },
          { status: 401 }
        );
      }

      return NextResponse.json({ token: result.token });
    }

    // Otherwise use cached/fresh token from environment
    try {
      const token = await getOrRefreshShiprocketToken();
      return NextResponse.json({ token });
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Shiprocket auth error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
