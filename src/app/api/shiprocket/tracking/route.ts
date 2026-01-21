import { NextRequest, NextResponse } from "next/server";
import { getShiprocketTracking, getShiprocketTrackingByAWB } from "@/src/lib/shiprocket";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const shipmentId = searchParams.get("shipmentId");
    const awbCode = searchParams.get("awbCode");

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    let result;

    if (awbCode) {
      result = await getShiprocketTrackingByAWB(token, awbCode);
    } else if (shipmentId) {
      result = await getShiprocketTracking(token, parseInt(shipmentId));
    } else {
      return NextResponse.json(
        { error: "Either shipmentId or awbCode is required" },
        { status: 400 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: "Failed to fetch tracking information" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Shiprocket tracking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
