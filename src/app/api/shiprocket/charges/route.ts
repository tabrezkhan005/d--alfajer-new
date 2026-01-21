import { NextRequest, NextResponse } from "next/server";
import { getShipmentCharges } from "@/src/lib/shiprocket";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const shipmentId = searchParams.get("shipmentId");

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    if (!shipmentId) {
      return NextResponse.json(
        { error: "Shipment ID is required" },
        { status: 400 }
      );
    }

    const result = await getShipmentCharges(token, parseInt(shipmentId));

    if (!result) {
      return NextResponse.json(
        { error: "Failed to fetch shipment charges" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Get charges error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
