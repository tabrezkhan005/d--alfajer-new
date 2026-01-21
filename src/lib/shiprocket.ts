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
export async function getShiprocketToken(email: string, password: string): Promise<{ token: string } | { error: string }> {
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
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shipmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create shipment");
    }

    return data;
  } catch (error) {
    console.error("Shiprocket shipment creation error:", error);
    return null;
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
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch pickup locations");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket pickup locations error:", error);
    return null;
  }
}

// Serviceability Check - Check if courier can deliver
export interface ServiceabilityRequest {
  pickup_pincode: string;
  delivery_pincode: string;
  weight: number;
  cod?: number; // COD amount
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
    const params = new URLSearchParams({
      pickup_pincode: request.pickup_pincode,
      delivery_pincode: request.delivery_pincode,
      weight: request.weight.toString(),
      ...(request.cod && { cod: request.cod.toString() }),
      ...(request.cod_type && { cod_type: request.cod_type }),
    });

    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check serviceability");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket serviceability error:", error);
    return null;
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
}

export async function requestPickup(
  token: string,
  request: PickupRequest
): Promise<any> {
  try {
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/courier/generate/pickup",
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
      throw new Error("Failed to request pickup");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket pickup request error:", error);
    return null;
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
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch shipments");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket get shipments error:", error);
    return null;
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
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch shipment details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Shiprocket get shipment details error:", error);
    return null;
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
