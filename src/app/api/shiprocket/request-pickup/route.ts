import { NextRequest, NextResponse } from "next/server";
import { requestPickup } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, ...pickupData } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    const result = await requestPickup(token, pickupData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to request pickup" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Request pickup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
