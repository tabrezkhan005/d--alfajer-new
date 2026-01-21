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

    const locations = await getShiprocketPickupLocations(token);

    if (!locations) {
      return NextResponse.json(
        { error: "Failed to fetch pickup locations" },
        { status: 500 }
      );
    }

    return NextResponse.json(locations);
  } catch (error: any) {
    console.error("Shiprocket pickup locations error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
