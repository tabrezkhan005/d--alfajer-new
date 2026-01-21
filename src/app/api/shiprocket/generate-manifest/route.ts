import { NextRequest, NextResponse } from "next/server";
import { generateManifest } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, shipmentIds } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    if (!shipmentIds || !Array.isArray(shipmentIds)) {
      return NextResponse.json(
        { error: "Shipment IDs array is required" },
        { status: 400 }
      );
    }

    const result = await generateManifest(token, shipmentIds);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to generate manifest" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Generate manifest error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
