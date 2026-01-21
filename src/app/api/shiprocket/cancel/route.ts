import { NextRequest, NextResponse } from "next/server";
import { cancelShipment } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, awbCode } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    if (!awbCode) {
      return NextResponse.json(
        { error: "AWB code is required" },
        { status: 400 }
      );
    }

    const result = await cancelShipment(token, awbCode);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to cancel shipment" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Cancel shipment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
