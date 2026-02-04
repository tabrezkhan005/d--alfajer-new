import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/server";
import { prepareOrderEmailData, sendOrderStatusEmail } from "@/src/lib/email";

/**
 * Shiprocket Webhook – automated order status updates and customer emails
 *
 * Register this URL in Shiprocket: Settings → API → Webhooks (URL + Token).
 * Token is sent in HTTP header: x-api-key. Set the same value in env as SHIPROCKET_WEBHOOK_SECRET.
 * e.g. https://yourdomain.com/api/shiprocket/webhook
 *
 * When Shiprocket sends status updates (dispatched, delivered), we:
 * 1. Find the order by channel_order_id or order_id (our order_number or id)
 * 2. Update order status and tracking_number
 * 3. Send the appropriate email (shipped with tracking, or delivered) with full order details
 */

const SHIPPED_STATUSES = new Set([
  "DISPATCHED",
  "DISPATCHED_FROM_ORIGIN",
  "IN_TRANSIT",
  "PICKED_UP",
  "PICKUP_SCHEDULED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "RTO_INITIATED", // optional: you may treat differently
]);
const DELIVERED_STATUS = "DELIVERED";

function normalizeStatus(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.toUpperCase().trim();
}

function getAwbCode(payload: Record<string, unknown>): string {
  const awb =
    payload.awb_code ??
    payload.awb ??
    (payload.tracking_data as Record<string, unknown>)?.awb_code ??
    (payload.tracking_data as Record<string, unknown>)?.awb ??
    "";
  return String(awb).trim();
}

function getShipmentStatus(payload: Record<string, unknown>): string {
  const raw =
    payload.status ??
    payload.shipment_status ??
    payload.shipment_status_label ??
    (payload.tracking_data as Record<string, unknown>)?.shipment_status ??
    (payload.tracking_data as Record<string, unknown>)?.status ??
    "";
  return normalizeStatus(raw);
}

/** Resolve our order reference: channel_order_id or order_id (we send order_number or id when creating shipment) */
function getOrderReference(payload: Record<string, unknown>): string | null {
  const channel = payload.channel_order_id ?? payload.order_id;
  if (channel != null && String(channel).trim()) return String(channel).trim();
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Shiprocket sends the token in the x-api-key header (as per their Webhooks settings)
    const token = request.headers.get("x-api-key") ?? request.headers.get("x-shiprocket-webhook-secret") ?? request.headers.get("x-webhook-secret");
    const configuredSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
    if (configuredSecret && configuredSecret.length > 0) {
      if (token !== configuredSecret) {
        console.warn("Shiprocket webhook: token mismatch");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const ref = getOrderReference(payload);
    if (!ref) {
      console.warn("Shiprocket webhook: no order reference in payload", JSON.stringify(payload, null, 2));
      return NextResponse.json({ received: true, message: "No order reference" });
    }

    const status = getShipmentStatus(payload);
    if (!status) {
      console.warn("Shiprocket webhook: no status in payload", JSON.stringify(payload, null, 2));
      return NextResponse.json({ received: true, message: "No status" });
    }

    const awbCode = getAwbCode(payload);
    const supabase = createAdminClient();

    // Find order by order_number or id (we send one of these as order_id when creating shipment)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);
    const query = supabase
      .from("orders")
      .select("id, order_number, status, tracking_number, email, shipping_address, subtotal, total_amount, total, currency, shipping_cost, tax, discount, created_at")
      .limit(1);
    const { data: orders, error: findError } = isUuid
      ? await query.eq("id", ref)
      : await query.eq("order_number", ref);

    if (findError || !orders?.length) {
      console.warn("Shiprocket webhook: order not found for ref", ref, findError);
      return NextResponse.json({ received: true, message: "Order not found" });
    }

    const order = orders[0] as any;
    const orderId = order.id;
    const currentStatus = (order.status || "").toLowerCase();

    let newStatus: "shipped" | "delivered" | null = null;
    if (status === DELIVERED_STATUS) {
      newStatus = "delivered";
    } else if (SHIPPED_STATUSES.has(status)) {
      newStatus = "shipped";
    }

    if (!newStatus) {
      return NextResponse.json({ received: true, message: `Status ${status} not mapped to shipped/delivered` });
    }

    const updates: { status?: string; tracking_number?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (newStatus) updates.status = newStatus;
    if (awbCode && !order.tracking_number) updates.tracking_number = awbCode;

    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (updateError) {
      console.error("Shiprocket webhook: failed to update order", orderId, updateError);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Idempotency: only send email once per status (optional: could add a sent_emails log)
    const alreadyShipped = currentStatus === "shipped" || currentStatus === "delivered";
    const alreadyDelivered = currentStatus === "delivered";
    const shouldSendShipped = newStatus === "shipped" && !alreadyShipped;
    const shouldSendDelivered = newStatus === "delivered" && !alreadyDelivered;

    if (shouldSendShipped || shouldSendDelivered) {
      const { data: fullOrder } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", orderId)
        .single();

      if (fullOrder) {
        const orderData = fullOrder as any;
        if (awbCode) {
          orderData.tracking_number = awbCode;
          orderData.tracking_url = `https://www.shiprocket.in/tracking/${String(awbCode).replace(/^SR-/i, "")}`;
        }
        orderData.status = newStatus;

        const emailData = prepareOrderEmailData(orderData);
        if (emailData.customerEmail && emailData.customerEmail.trim()) {
          sendOrderStatusEmail(newStatus, emailData)
            .then((result) => {
              if (result.success) console.log("Shiprocket webhook: email sent", newStatus, result.messageId);
              else console.error("Shiprocket webhook: email failed", newStatus, result.error);
            })
            .catch((err) => console.error("Shiprocket webhook: email error", err));
        } else {
          console.warn("Shiprocket webhook: no customer email for order", orderId);
        }
      }
    }
  } catch (err) {
    console.error("Shiprocket webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
