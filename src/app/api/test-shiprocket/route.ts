import { NextRequest, NextResponse } from "next/server";
import { automateShiprocketShipment } from "@/src/lib/shiprocket-automation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }

  console.log(`🧪 Testing automation for Order ID: ${orderId}`);
  const result = await automateShiprocketShipment(orderId);

  return NextResponse.json(result);
}
