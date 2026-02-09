# 🚀 Complete Shiprocket Integration Guide for Alfajer Admin Panel

## Table of Contents
1. [Initial Setup](#1-initial-setup)
2. [Admin Panel Features](#2-admin-panel-features)
3. [Step-by-Step Workflow](#3-step-by-step-workflow)
4. [Advanced Features](#4-advanced-features)
5. [Shiprocket Dashboard Configuration](#5-shiprocket-dashboard-configuration)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Initial Setup

### Step 1: Create Shiprocket Account
- Sign up at [Shiprocket](https://www.shiprocket.in/)
- Add your pickup address in **Settings > Pickup Address** (This is crucial)
  - **Important**: The "Pickup Location Name" you set here must match the "Pickup Location" in your code/config exactly.

### Step 2: Configure Admin Panel
1. Go to your **Admin Panel > Settings > Shiprocket**.
2. Enter your Shiprocket credentials:
   - **Email**: Your login email
   - **Password**: Your login password
   - **Pickup Location**: The exact name from Step 1 (e.g., "Primary", "Warehouse")
3. Click **Save Configuration**.
4. You should see a status "Connected" with a green checkmark.

---

## 2. Admin Panel Features

Your admin panel now includes a comprehensive suite of shipping tools:

### 📦 Order Management
- **Create Shipment**: Automatically push order details to Shiprocket.
- **Track Shipment**: Real-time tracking status.
- **Print Label**: Generate and print shipping labels directly from the order page.
- **Cancel Shipment**: Cancel shipments before pickup.
- **Bulk Shipment**: Select multiple orders and create shipments in one click.

### 📊 Analytics & Reporting
- **Real-Time Data**: Dashboard now fetches live data directly from Shiprocket API.
- **Auto-Token Refresh**: The system automatically refreshes your Shiprocket token if it expires, ensuring uninterrupted access.
- **Analytics Dashboard**: View shipping costs, delivery times, and courier performance.
- **COD Remittance**: Track COD payments, settled amounts, and pending remittances.
- **Shipment Volume**: Visualize daily shipment trends.

### 🚚 Logistics Operations
- **Pickup Scheduling**: Schedule carrier pickups for your ready packages.
- **Serviceability Check**: Check courier availability for a pincode.
- **Rate Calculator**: Estimate shipping costs before shipping.
- **Returns Management**: Manage customer returns.

---

## 3. Step-by-Step Workflow

### A. Processing a Single Order
1. Go to **Orders** and click on a "Pending" order.
2. Review the order items and shipping address.
3. Click **Create Shiprocket Shipment**.
   - This sends the order to Shiprocket.
   - Shiprocket automatically assigns the best courier (Cheapest/Fastest based on your generic settings).
4. Once created, you will see the **AWB Code**.
5. Click **Print Label** to download/print the shipping label.
6. Stick the label on the package.
7. Click **Request Pickup** (or use the Bulk Pickup feature).

### B. Bulk Shipment Processing
1. Go to **Orders** page.
2. Use the checkboxes to select multiple "Pending" orders.
3. Click the **Ship X Orders** button at the top.
4. A progress modal will show the status of each shipment creation.
5. Once done, you can print labels individually or use the Shiprocket dashboard for bulk label printing.

### C. Tracking & Status Updates
- The system automatically updates order status via **Webhooks**.
- When Shiprocket status changes (e.g., "Picked Up", "In Transit", "Delivered"):
  - Your local database is updated.
  - The customer (if email configured) receives updates.
  - Returns and RTOs are also tracked.

---

## 4. Advanced Features

### 📈 Analytics Dashboard
Navigate to **Shiprocket > Analytics** to view:
- **Total Spend**: How much you are spending on shipping.
- **RTO Rate**: Percentage of orders returned to origin.
- **Courier Performance**: Which courier delivers fastest and has highest success rate.

### 💰 COD Remittance
Navigate to **Shiprocket > COD Remittance** to reconcile payments:
- **Pending**: Delivered COD orders where money hasn't reached your bank yet.
- **Remitted**: Money successfully deposited by Shiprocket.
- **Discrepancy**: Track any missing payments.

### 🔄 Returns
Navigate to **Shiprocket > Returns** to manage return requests.
- You can initiate a return for an order if a customer requests it.
- Schedule a reverse pickup.

---

## 5. Shiprocket Dashboard Configuration

To ensure everything works smoothly, configure these in your Shiprocket account:

### A. Auto-Assignment (Recommended: DISABLED) ❌
**Keep "Auto-Assign Courier" DISABLED** in Shiprocket settings if you want to manually verify rates in the Shiprocket panel.
**HOWEVER**, your Admin Panel integration uses "Auto-Assign" logic by default (cheapest/best) to make the "Create Shipment" button one-click.
- If you want manual control, create the shipment in Admin Panel, but don't schedule pickup immediately. Go to Shiprocket to change courier if needed.

### B. Courier Priority
In **Settings > Courier Priority**, set your preferred carriers (e.g., Delhivery, BlueDart, Ecom Express) so the system picks them first.

### C. Webhooks (Automated) ✅
Your system now has a dedicated webhook endpoint: `https://your-domain.com/api/shiprocket/webhook`.
- You don't need to manually configure this if you are using the API integration we built, as we can set it up programmatically, or you can add it in **Shiprocket > Settings > API > Webhooks**.
- Events to subscribe: `Order`, `Shipment`, `Tracking`.

---

## 6. Troubleshooting

### "Pickup Location Not Found"
- **Cause**: The pickup location name in Admin Panel settings doesn't match Shiprocket.
- **Fix**: Login to Shiprocket, copy the exact "Location Name" from Settings > Pickup Address, and update it in your Admin Panel.

### "Pincode Not Serviceable"
- **Cause**: The customer's pincode is not covered by any courier.
- **Fix**: Check the address with the customer or try a different courier in the Shiprocket dashboard.

### "Authentication Failed"
- **Cause**: Password changed or email incorrect.
- **Fix**: Update credentials in Admin Panel > Settings > Shiprocket.

### "Label Not Generating"
- **Cause**: Shipment not yet assigned to a courier or AWB not generated.
- **Fix**: Wait a few minutes or check Shiprocket dashboard for errors on that specific order.
