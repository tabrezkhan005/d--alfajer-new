// Shiprocket API Integration
// Documentation: https://apidocs.shiprocket.in/
// This file contains server-side utility functions for Shiprocket API

export interface ShiprocketConfig {
  email: string;
  password: string;
  token?: string;
  tokenExpiry?: number;
}

export interface ShiprocketAddress {
  name: string;
  phone: string;
  email: string;
  address: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number;
}

export interface CreateShipmentRequest {
  order_id: string; // Your order ID
  order_date: string; // ISO date string
  pickup_location: string; // Pickup location name from Shiprocket
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  billing_alternate_phone?: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: string; // Prepaid or COD
  sub_total: number;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number;
}

export interface ShiprocketShipmentResponse {
  status: number;
  message: string;
  shipment_id?: number;
  awb_code?: string;
  courier_name?: string;
  courier_company_id?: number;
  order_id?: string;
  channel_order_id?: string;
  tracking_data?: {
    awb_code: string;
    courier_name: string;
    shipment_status: string;
    shipment_track: Array<{
      tracking_date: string;
      tracking_time: string;
      status: string;
      location: string;
    }>;
  };
}

export interface ShiprocketTrackingResponse {
  tracking_data: {
    shipment_status: string;
    shipment_track: Array<{
      tracking_date: string;
      tracking_time: string;
      status: string;
      location: string;
    }>;
  };
}

// Get authentication token from Shiprocket
// Shiprocket uses token-based authentication - you must authenticate with email/password to get a token
// Tokens expire after 24 hours and need to be refreshed
export async function getShiprocketToken(email: string, password: string): Promise<{ token: string } | { error: string }> {
  // Shiprocket requires email and password to get a token
  if (!email || !password) {
    return { error: "Shiprocket requires email and password for authentication. Please provide both credentials." };
  }

  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Authentication failed (Status: ${response.status})`;
      return { error: errorMessage };
    }

    const data = await response.json();
    if (!data.token) {
      return { error: "No token received from Shiprocket" };
    }
    return { token: data.token };
  } catch (error: any) {
    console.error("Shiprocket authentication error:", error);
    return { error: error.message || "Network error: Could not connect to Shiprocket" };
  }
}

// Create a shipment in Shiprocket
export async function createShiprocketShipment(
  token: string,
  shipmentData: CreateShipmentRequest
): Promise<ShiprocketShipmentResponse | null> {
  try {
    // Validate required fields
    if (!shipmentData.order_items || shipmentData.order_items.length === 0) {
      throw new Error("Order items are required to create a shipment");
    }

    if (!shipmentData.billing_pincode || !shipmentData.billing_city || !shipmentData.billing_state) {
      throw new Error("Complete address details (pincode, city, state) are required");
    }

    // Ensure all required fields have valid values
    const requestData = {
      ...shipmentData,
      // Ensure dimensions are numbers
      length: Number(shipmentData.length) || 20,
      breadth: Number(shipmentData.breadth) || 15,
      height: Number(shipmentData.height) || 10,
      weight: Number(shipmentData.weight) || 0.5,
      // Ensure sub_total is a number
      sub_total: Number(shipmentData.sub_total) || 0,
      // Add channel_id if not present (using custom channel for API orders)
      channel_id: (shipmentData as any).channel_id || "",
      // Ensure billing_phone has proper format (10 digits for India)
      billing_phone: String(shipmentData.billing_phone || "").replace(/[^0-9]/g, "").slice(-10),
    };

    console.log("Shiprocket Create Shipment Request:", JSON.stringify(requestData, null, 2));

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    const responseText = await response.text();
    console.log("Shiprocket Raw Response:", responseText);

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Shiprocket response:", parseError);
      throw new Error(`Invalid response from Shiprocket: ${responseText.substring(0, 200)}`);
    }

    console.log("Shiprocket Parsed Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      // Provide more detailed error message
      let errorMessage = data.message || data.error || `Shiprocket API error (Status: ${response.status})`;

      // Handle errors object (validation errors)
      if (data.errors) {
        let errorDetails = "";
        if (typeof data.errors === 'object' && !Array.isArray(data.errors)) {
          errorDetails = Object.entries(data.errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('; ');
        } else if (Array.isArray(data.errors)) {
          errorDetails = data.errors.join(', ');
        } else {
          errorDetails = String(data.errors);
        }
        if (errorDetails) {
          errorMessage = `${errorMessage}: ${errorDetails}`;
        }
      }

      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error("Shiprocket shipment creation error:", error);
    // Re-throw to allow caller to handle the error
    throw error;
  }
}

// Get tracking information
export async function getShiprocketTracking(
  token: string,
  shipmentId: number
): Promise<ShiprocketTrackingResponse | null> {
  try {
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tracking information");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket tracking error:", error);
    return null;
  }
}

// Get tracking by AWB code
export async function getShiprocketTrackingByAWB(
  token: string,
  awbCode: string
): Promise<ShiprocketTrackingResponse | null> {
  try {
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tracking information");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket tracking error:", error);
    return null;
  }
}

// Get pickup locations
export async function getShiprocketPickupLocations(token: string) {
  try {
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/settings/company/pickup", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Failed to fetch pickup locations (Status: ${response.status})`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Shiprocket pickup locations error:", error);
    throw error; // Re-throw to get better error messages
  }
}

// Serviceability Check - Check if courier can deliver
export interface ServiceabilityRequest {
  pickup_pincode?: string; // For backward compatibility
  delivery_pincode?: string; // For backward compatibility
  pickup_postcode?: string; // Shiprocket API expects this
  delivery_postcode?: string; // Shiprocket API expects this
  weight: number;
  cod: number; // COD amount (required, use 0 for Prepaid)
  cod_type?: string; // COD or Prepaid
}

export interface ServiceabilityResponse {
  status: number;
  data: {
    available_courier_companies: Array<{
      courier_company_id: number;
      courier_name: string;
      rate: number;
      estimated_delivery_days: string;
      cod_charges?: number;
    }>;
  };
}

export async function checkServiceability(
  token: string,
  request: ServiceabilityRequest
): Promise<ServiceabilityResponse | null> {
  try {
    // Support both pincode and postcode for backward compatibility
    const pickupPostcode = request.pickup_postcode || request.pickup_pincode;
    const deliveryPostcode = request.delivery_postcode || request.delivery_pincode;

    // Validate required fields
    if (!pickupPostcode || !deliveryPostcode || !request.weight) {
      throw new Error("pickup_postcode, delivery_postcode, and weight are required");
    }

    // COD is required by Shiprocket API (use 0 for Prepaid)
    const codAmount = request.cod !== undefined ? request.cod : 0;

    const params = new URLSearchParams({
      pickup_postcode: pickupPostcode,
      delivery_postcode: deliveryPostcode,
      weight: request.weight.toString(),
      cod: codAmount.toString(), // Always include cod (0 for Prepaid)
    });

    // Add optional cod_type parameter
    if (request.cod_type) {
      params.append("cod_type", request.cod_type);
    }

    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Try to parse JSON response
    let data: any;
    let responseText: string = "";

    try {
      responseText = await response.text();
      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        data = {};
      }
    } catch (parseError) {
      // If JSON parsing fails, create error with response text
      throw new Error(`Invalid JSON response from Shiprocket: ${responseText || response.statusText || 'No response body'}`);
    }

    if (!response.ok) {
      // Provide detailed error message from Shiprocket
      let errorMessage = data.message || data.error || `Shiprocket API error (Status: ${response.status})`;

      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = "Authentication failed. Please check your Shiprocket credentials or API key. Token may be expired.";
      } else if (response.status === 400) {
        errorMessage = data.message || data.error || "Invalid request parameters. Please check pickup_pincode, delivery_pincode, and weight.";
      } else if (response.status === 404) {
        errorMessage = "Serviceability endpoint not found. Please check the Shiprocket API version.";
      } else if (response.status >= 500) {
        errorMessage = "Shiprocket server error. Please try again later.";
      }

      // Handle errors object
      if (data.errors) {
        let errorDetails = "";
        if (Array.isArray(data.errors)) {
          errorDetails = data.errors.join(", ");
        } else if (typeof data.errors === 'object') {
          errorDetails = Object.entries(data.errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('; ');
        } else {
          errorDetails = String(data.errors);
        }
        if (errorDetails) {
          errorMessage = `${errorMessage}: ${errorDetails}`;
        }
      }

      throw new Error(errorMessage);
    }

    // Check if response has expected structure
    if (!data || (data.status !== undefined && data.status !== 200 && data.status !== 1)) {
      throw new Error(data.message || data.error || "Invalid response from Shiprocket API");
    }

    return data;
  } catch (error: any) {
    console.error("Shiprocket serviceability error:", error);
    // Re-throw to allow caller to handle the error
    throw error;
  }
}

// Assign Courier and Generate AWB
export interface AssignCourierRequest {
  shipment_id: number;
  courier_id: number;
}

export async function assignCourierAndGenerateAWB(
  token: string,
  request: AssignCourierRequest
): Promise<any> {
  try {
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to assign courier");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket courier assignment error:", error);
    return null;
  }
}

// Generate Shipping Label
export async function generateShippingLabel(
  token: string,
  shipmentIds: number[]
): Promise<{ label_url?: string } | null> {
  try {
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/generate/label",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipment_id: shipmentIds,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate label");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket label generation error:", error);
    return null;
  }
}

// Generate Manifest
export async function generateManifest(
  token: string,
  shipmentIds: number[]
): Promise<{ manifest_url?: string } | null> {
  try {
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/manifests/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipment_id: shipmentIds,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate manifest");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket manifest generation error:", error);
    return null;
  }
}

// Generate Invoice
export async function generateInvoice(
  token: string,
  shipmentIds: number[]
): Promise<{ invoice_url?: string } | null> {
  try {
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/print/invoice",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipment_id: shipmentIds,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate invoice");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket invoice generation error:", error);
    return null;
  }
}

// Request Pickup
export interface PickupRequest {
  pickup_date: string; // YYYY-MM-DD
  pickup_time: string; // HH:MM
  expected_package_count: number;
  pickup_location_id?: number;
  shipment_id?: number[]; // Optional: Array of shipment IDs if requesting pickup for specific shipments
}

export async function requestPickup(
  token: string,
  request: PickupRequest
): Promise<any> {
  try {
    // Ensure all required fields are present and properly formatted
    // Shiprocket API requires these fields to be non-null and properly typed
    const cleanRequest: any = {
      pickup_date: String(request.pickup_date || '').trim(),
      pickup_time: String(request.pickup_time || '').trim(),
      expected_package_count: Number(request.expected_package_count) || 0,
    };

    // Validate that required fields are not empty
    if (!cleanRequest.pickup_date || !cleanRequest.pickup_time || cleanRequest.expected_package_count <= 0) {
      throw new Error("pickup_date, pickup_time, and expected_package_count are required and cannot be empty");
    }

    // Ensure expected_package_count is an integer (not float)
    cleanRequest.expected_package_count = Math.floor(cleanRequest.expected_package_count);

    // pickup_location_id is required by Shiprocket API to avoid Laravel binding errors
    if (request.pickup_location_id === undefined || request.pickup_location_id === null) {
      throw new Error("pickup_location_id is required. Please provide a valid pickup location ID.");
    }

    const locationId = Number(request.pickup_location_id);
    if (isNaN(locationId) || locationId <= 0) {
      throw new Error("pickup_location_id must be a valid positive integer.");
    }

    cleanRequest.pickup_location_id = Math.floor(locationId);

    // Include shipment_id array if provided (for requesting pickup for specific shipments)
    // Note: If shipment_id is not provided, we don't include it (not an empty array)
    // Some API versions might require this, but sending empty array might cause issues
    if (request.shipment_id && Array.isArray(request.shipment_id) && request.shipment_id.length > 0) {
      // Ensure all shipment IDs are valid integers
      const validShipmentIds = request.shipment_id
        .map((id: any) => Number(id))
        .filter((id: number) => !isNaN(id) && id > 0);

      if (validShipmentIds.length > 0) {
        cleanRequest.shipment_id = validShipmentIds;
      }
    }

    // Log the request for debugging
    console.log('Shiprocket pickup request payload:', JSON.stringify(cleanRequest, null, 2));

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanRequest),
      }
    );

    // Parse response
    let responseData: any = {};
    let responseText = "";

    try {
      responseText = await response.text();
      if (responseText) {
        responseData = JSON.parse(responseText);
      }
    } catch (parseError) {
      // If parsing fails, use response text as error message
      responseData = { message: responseText || response.statusText || "Unknown error" };
    }

    if (!response.ok) {
      // Provide detailed error message from Shiprocket
      let errorMessage = responseData.message || responseData.error || `Failed to request pickup (Status: ${response.status})`;

      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = "Authentication failed. Please check your Shiprocket credentials or API key. Token may be expired.";
      } else if (response.status === 400) {
        errorMessage = responseData.message || responseData.error || "Invalid request parameters. Please check pickup_date, pickup_time, and expected_package_count.";
      } else if (response.status === 404) {
        errorMessage = "Pickup endpoint not found. Please check the Shiprocket API version.";
      } else if (response.status >= 500) {
        errorMessage = responseData.message || responseData.error || "Shiprocket server error. Please try again later.";
      }

      // Handle errors object
      if (responseData.errors) {
        let errorDetails = "";
        if (Array.isArray(responseData.errors)) {
          errorDetails = responseData.errors.join(", ");
        } else if (typeof responseData.errors === 'object') {
          errorDetails = Object.entries(responseData.errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('; ');
        } else {
          errorDetails = String(responseData.errors);
        }
        if (errorDetails) {
          errorMessage = `${errorMessage}: ${errorDetails}`;
        }
      }

      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error: any) {
    console.error("Shiprocket pickup request error:", error);
    // Re-throw the error to allow caller to handle it
    throw error;
  }
}

// Cancel Shipment
export async function cancelShipment(
  token: string,
  awbCode: string
): Promise<any> {
  try {
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs/${awbCode}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to cancel shipment");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket cancel shipment error:", error);
    return null;
  }
}

// Get All Shipments
export interface GetShipmentsParams {
  page?: number;
  per_page?: number;
  status?: string;
  channel_id?: number;
  start_date?: string;
  end_date?: string;
}

export async function getAllShipments(
  token: string,
  params?: GetShipmentsParams
): Promise<any> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.channel_id) queryParams.append("channel_id", params.channel_id.toString());
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);

    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Failed to fetch shipments (Status: ${response.status})`;

      // If 401, it's an authentication error
      if (response.status === 401) {
        throw new Error(`Authentication failed: ${errorMessage}. Please check your API key or credentials.`);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Shiprocket get shipments error:", error);
    throw error; // Re-throw to preserve error message
  }
}

// Get Shipment Details
export async function getShipmentDetails(
  token: string,
  shipmentId: number
): Promise<any> {
  try {
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders/show/${shipmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `Failed to fetch shipment details (Status: ${response.status})`;

      if (response.status === 401) {
        throw new Error(`Authentication failed: ${errorMessage}. Please check your API key or credentials.`);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Shiprocket get shipment details error:", error);
    throw error; // Re-throw to preserve error message
  }
}

// Get Courier Companies
export async function getCourierCompanies(token: string): Promise<any> {
  try {
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/courierList",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch courier companies");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket courier companies error:", error);
    return null;
  }
}

// Create Return Order
export interface CreateReturnOrderRequest {
  order_id: string;
  order_date: string;
  channel_id?: number;
  pickup_customer_name: string;
  pickup_last_name?: string;
  pickup_address: string;
  pickup_address_2?: string;
  pickup_city: string;
  pickup_state: string;
  pickup_pincode: string;
  pickup_country: string;
  pickup_email: string;
  pickup_phone: string;
  order_items: ShiprocketOrderItem[];
  sub_total: number;
  length?: number;
  breadth?: number;
  height?: number;
  weight?: number;
}

export async function createReturnOrder(
  token: string,
  returnData: CreateReturnOrderRequest
): Promise<any> {
  try {
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/return",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(returnData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create return order");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket return order creation error:", error);
    return null;
  }
}

// Get Shipment Charges
export async function getShipmentCharges(
  token: string,
  shipmentId: number
): Promise<any> {
  try {
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders/show/${shipmentId}/charges`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch shipment charges");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket shipment charges error:", error);
    return null;
  }
}

// Update Shipment
export interface UpdateShipmentRequest {
  shipment_id: number;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
}

export async function updateShipment(
  token: string,
  request: UpdateShipmentRequest
): Promise<any> {
  try {
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders/update/shipment/${request.shipment_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weight: request.weight,
          length: request.length,
          breadth: request.breadth,
          height: request.height,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update shipment");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket update shipment error:", error);
    return null;
  }
}
