import { NextRequest, NextResponse } from "next/server";
import { getShiprocketToken } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
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
