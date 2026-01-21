import { NextRequest, NextResponse } from "next/server";
import { createShiprocketShipment } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, shipmentData } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    if (!shipmentData) {
      return NextResponse.json(
        { error: "Shipment data is required" },
        { status: 400 }
      );
    }

    const result = await createShiprocketShipment(token, shipmentData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create shipment" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Shiprocket shipment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
