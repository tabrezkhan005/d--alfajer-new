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

    // Validate required fields - support both pincode and postcode
    const pickupPostcode = serviceabilityData.pickup_postcode || serviceabilityData.pickup_pincode;
    const deliveryPostcode = serviceabilityData.delivery_postcode || serviceabilityData.delivery_pincode;
    
    if (!pickupPostcode || !deliveryPostcode || !serviceabilityData.weight) {
      return NextResponse.json(
        { error: "pickup_postcode, delivery_postcode, and weight are required" },
        { status: 400 }
      );
    }

    // Ensure cod is always present (default to 0 for Prepaid)
    if (serviceabilityData.cod === undefined) {
      serviceabilityData.cod = 0;
    }

    // Normalize field names for the API call
    const normalizedData = {
      ...serviceabilityData,
      pickup_postcode: pickupPostcode,
      delivery_postcode: deliveryPostcode,
    };

    const result = await checkServiceability(token, normalizedData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to check serviceability - no response from Shiprocket" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Serviceability check error:", error);
    // Return the actual error message from Shiprocket
    const errorMessage = error.message || "Internal server error";
    const statusCode = error.message?.includes("required") ? 400 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
