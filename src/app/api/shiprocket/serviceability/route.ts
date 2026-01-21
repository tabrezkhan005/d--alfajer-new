import { NextRequest, NextResponse } from "next/server";
import { checkServiceability } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, ...serviceabilityData } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    const result = await checkServiceability(token, serviceabilityData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to check serviceability" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Serviceability check error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
