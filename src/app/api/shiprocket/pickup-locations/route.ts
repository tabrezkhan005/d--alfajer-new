import { NextRequest, NextResponse } from "next/server";
import { getShiprocketPickupLocations } from "@/src/lib/shiprocket";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    try {
      const locations = await getShiprocketPickupLocations(token);
      return NextResponse.json(locations);
    } catch (error: any) {
      console.error("Shiprocket pickup locations error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch pickup locations" },
        { status: error.message?.includes("401") || error.message?.includes("Authentication") ? 401 : 500 }
      );
    }
  } catch (error: any) {
    console.error("Shiprocket pickup locations route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
