import { NextRequest, NextResponse } from "next/server";
import { getCourierCompanies } from "@/src/lib/shiprocket";

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

    const result = await getCourierCompanies(token);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to fetch courier companies" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Get couriers error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
