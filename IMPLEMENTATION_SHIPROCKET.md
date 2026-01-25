# Shiprocket Complete Integration Guide

## Overview
This document outlines the complete implementation of the Shiprocket integration in the Alfajer admin panel. The integration allows for seamless order fulfillment, from checking serviceability to generating shipping labels (AWB).

## Features Implemented
1.  **Automated Courier Selection UI**: A new modal in the Admin Order Detail page allowing admins to view available couriers, their rates, and estimated delivery times.
2.  **Instant AWB Generation**: The backend now automatically assigns the selected courier and generates an AWB (Air Waybill) immediately upon shipment creation.
3.  **Serviceability Check**: Real-time checking of pickup and delivery pincodes to ensure valid routes before booking.
4.  **Tracking Integration**: Direct links to track shipments via Shiprocket's tracking page.

## Data Flow

### 1. Shipment Initiation
*   **Actor**: Admin
*   **Action**: Clicks "Create Shiprocket Shipment" on the Order Detail page (`/admin/orders/[id]`).
*   **System Response**: Opens a dialog modal.

### 2. Rate Calculation (Serviceability)
*   **Process**:
    1.  Frontend fetches the configured **Pickup Location** (e.g., "Primary") to get the source pincode.
    2.  Frontend takes the order's **Delivery Pincode** and calculated **Weight**.
    3.  Calls `/api/shiprocket/serviceability`.
    4.  Shiprocket API returns a list of available couriers with:
        *   `rate` (Cost)
        *   `rating` (Reliability)
        *   `estimated_delivery_days` (ETA)
        *   `courier_company_id` (ID)

### 3. Courier Selection
*   **Actor**: Admin
*   **Action**: Selects a preferred courier (e.g., "Delhivery Air", "Bluedart") from the list and clicks "Ship via [Courier]".

### 4. Order Creation & Courier Assignment (Backend)
*   **Endpoint**: `POST /api/shiprocket/shipment`
*   **Payload**: Order details + `courier_id`.
*   **Server Logic**:
    1.  **Create Order**: Calls Shiprocket `orders/create/adhoc` to register the shipment.
    2.  **Assign AWB**: Immediately calls `courier/assign/awb` using the new `shipment_id` and the provided `courier_id`.
    3.  **Response**: Returns the `shipment_id` and the generated `awb_code`.

### 5. Post-Processing
*   **Database Update**: The Order status is updated to `shipped`, and the `tracking_number` (AWB) is saved to Supabase.
*   **Notification**: An email is triggered to the customer with the tracking details.
*   **UI Update**: The Admin panel updates to show the "Shipment Created" status with a "Track Shipment" button.

## File Structure & Responsibilities

| File Path | Responsibility |
| :--- | :--- |
| `src/app/admin/orders/[id]/page.tsx` | **Frontend UI**: Handles the modal, courier selection, and user interaction. |
| `src/app/api/shiprocket/shipment/route.ts` | **Backend API**: Orchestrates the order creation and auto-assignment of AWB. |
| `src/lib/shiprocket.ts` | **Core Library**: Contains the raw API wrapper functions (`checkServiceability`, `createShiprocketShipment`, `assignCourierAndGenerateAWB`). |
| `src/lib/shiprocket-client.ts` | **Helpers**: Client-side utilities like tracking URL generation. |

## How to Test
1.  Go to **Admin Panel > Orders**.
2.  Open a **Pending** or **Processing** order.
3.  Ensure the order has a valid address with a 6-digit Pincode.
4.  Click **"Create Shiprocket Shipment"**.
5.  Wait for the list of couriers to load.
6.  Select a courier (e.g., Ecom Express or Delhivery).
7.  Click **"Ship via..."**.
8.  Verify that a green success message appears with an **AWB Code**.
9.  Click **"Track Shipment"** to verify the link works.

## Troubleshooting
*   **"Delivery pincode is missing"**: Ensure the customer address has a valid ZIP/Postal Code.
*   **"No couriers available"**: Check if the Pickup Location is correctly configured in Settings and that the route (Source Pincode -> Destination Pincode) is serviceable.
*   **"Authentication failed"**: Check `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` in `.env` or Admin Settings.
