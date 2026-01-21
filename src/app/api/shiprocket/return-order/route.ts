import { NextRequest, NextResponse } from "next/server";
import { createReturnOrder } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, ...returnData } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    const result = await createReturnOrder(token, returnData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create return order" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Create return order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
