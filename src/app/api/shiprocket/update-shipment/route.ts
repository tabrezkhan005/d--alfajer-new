import { NextRequest, NextResponse } from "next/server";
import { updateShipment } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, ...updateData } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    const result = await updateShipment(token, updateData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update shipment" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Update shipment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
