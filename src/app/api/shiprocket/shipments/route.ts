import { NextRequest, NextResponse } from "next/server";
import { getAllShipments, getShipmentDetails } from "@/src/lib/shiprocket";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const shipmentId = searchParams.get("shipmentId");

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    let result;

    if (shipmentId) {
      result = await getShipmentDetails(token, parseInt(shipmentId));
    } else {
      const params: any = {};
      const page = searchParams.get("page");
      const perPage = searchParams.get("per_page");
      const status = searchParams.get("status");
      const startDate = searchParams.get("start_date");
      const endDate = searchParams.get("end_date");

      if (page) params.page = parseInt(page);
      if (perPage) params.per_page = parseInt(perPage);
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      result = await getAllShipments(token, params);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Get shipments error:", error);
    const statusCode = error.message?.includes("401") || error.message?.includes("Authentication") ? 401 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to fetch shipments" },
      { status: statusCode }
    );
  }
}
