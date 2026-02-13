import { NextRequest, NextResponse } from "next/server";
import { requestPickup, getShiprocketPickupLocations } from "@/src/lib/shiprocket";
import { getOrRefreshShiprocketToken } from "@/src/lib/shiprocket-auth";

export async function POST(request: NextRequest) {
  try {
    const { token: providedToken, ...pickupData } = await request.json();

    // Get Shiprocket token from provided token or environment variables
    let token: string | null = providedToken || null;

    // If no token provided, try to get cached/fresh token from environment variables
    if (!token) {
      try {
        token = await getOrRefreshShiprocketToken();
      } catch (error: any) {
        return NextResponse.json(
          { error: `Authentication failed: ${error.message}` },
          { status: 401 }
        );
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required. Please provide token or configure SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in environment variables." },
        { status: 401 }
      );
    }

    // Validate and sanitize required fields
    if (!pickupData.pickup_date || !pickupData.pickup_time || !pickupData.expected_package_count) {
      return NextResponse.json(
        { error: "pickup_date, pickup_time, and expected_package_count are required" },
        { status: 400 }
      );
    }

    // Ensure expected_package_count is a positive integer
    const packageCount = Number(pickupData.expected_package_count);
    if (isNaN(packageCount) || packageCount <= 0 || !Number.isInteger(packageCount)) {
      return NextResponse.json(
        { error: "expected_package_count must be a positive integer" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(pickupData.pickup_date)) {
      return NextResponse.json(
        { error: "pickup_date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(pickupData.pickup_time)) {
      return NextResponse.json(
        { error: "pickup_time must be in HH:MM format (24-hour)" },
        { status: 400 }
      );
    }

    // Prepare clean pickup request data
    const cleanPickupData: any = {
      pickup_date: pickupData.pickup_date.trim(),
      pickup_time: pickupData.pickup_time.trim(),
      expected_package_count: packageCount,
    };

    // Handle pickup_location_id - Shiprocket API requires this field
    // Default pickup location ID from Shiprocket configuration
    const DEFAULT_PICKUP_LOCATION_ID = 29390324;

    let locationId: number | null = null;

    // First, try to get from request
    if (pickupData.pickup_location_id !== undefined && pickupData.pickup_location_id !== null && pickupData.pickup_location_id !== '') {
      const parsedId = parseInt(pickupData.pickup_location_id.toString(), 10);
      if (!isNaN(parsedId) && parsedId > 0) {
        locationId = parsedId;
      }
    }

    // If no location ID provided, try to fetch from API
    if (!locationId) {
      try {
        const locations = await getShiprocketPickupLocations(token);
        if (locations.data && Array.isArray(locations.data) && locations.data.length > 0) {
          // Find Primary or default location
          const primaryLocation = locations.data.find(
            (loc: any) => loc.name === 'Primary' || loc.is_default === 1 || loc.is_default === true
          ) || locations.data[0];

          // Try different possible field names for location ID
          if (primaryLocation) {
            locationId = primaryLocation.pickup_location_id ||
                        primaryLocation.id ||
                        primaryLocation.location_id ||
                        (primaryLocation.pickup_location ? primaryLocation.pickup_location.id : null);

            // If still no ID found, try to extract from any numeric field
            if (!locationId) {
              for (const key of Object.keys(primaryLocation)) {
                const value = primaryLocation[key];
                if (typeof value === 'number' && value > 0) {
                  locationId = value;
                  console.log(`Found location ID in field '${key}': ${locationId}`);
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching pickup locations:', error);
        // Will fall back to default location ID
      }
    }

    // If still no location ID, use the default from configuration
    if (!locationId || locationId <= 0) {
      locationId = DEFAULT_PICKUP_LOCATION_ID;
      console.log(`Using default pickup location ID: ${locationId}`);
    }

    // pickup_location_id is likely required by Shiprocket API
    // If we couldn't get it, return an error instead of sending incomplete data
    if (!locationId || locationId <= 0) {
      return NextResponse.json(
        {
          error: "pickup_location_id is required. Please select a pickup location or ensure your Shiprocket account has a default pickup location configured.",
          details: "Could not fetch pickup locations. Please check your Shiprocket configuration."
        },
        { status: 400 }
      );
    }

    // Always include pickup_location_id to avoid Laravel binding errors
    cleanPickupData.pickup_location_id = locationId;

    // Log final request for debugging
    console.log('Final pickup request payload:', JSON.stringify(cleanPickupData, null, 2));

    try {
      const result = await requestPickup(token, cleanPickupData);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error("Request pickup error:", error);
      // Determine status code based on error message
      let statusCode = 500;
      if (error.message?.includes("Authentication") || error.message?.includes("401")) {
        statusCode = 401;
      } else if (error.message?.includes("Invalid") || error.message?.includes("400")) {
        statusCode = 400;
      } else if (error.message?.includes("404")) {
        statusCode = 404;
      }

      return NextResponse.json(
        { error: error.message || "Failed to request pickup" },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error("Request pickup route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
