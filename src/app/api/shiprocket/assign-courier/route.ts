import { NextRequest, NextResponse } from "next/server";
import { assignCourierAndGenerateAWB } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, ...assignData } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    const result = await assignCourierAndGenerateAWB(token, assignData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to assign courier" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Assign courier error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
