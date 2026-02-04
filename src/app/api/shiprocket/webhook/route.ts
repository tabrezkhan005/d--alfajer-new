import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/server";
import { prepareOrderEmailData, sendOrderStatusEmail } from "@/src/lib/email";

/**
 * Shiprocket Webhook – automated order status updates and customer emails
 *
 * Guidelines: POST, Content-Type: application/json, token in x-api-key, respond with 200 only.
 * Prefer URL without "shiprocket/sr/kr" in path – use https://yourdomain.com/api/courier/webhook
 * Token: set same value in Shiprocket (Token field) and env SHIPROCKET_WEBHOOK_SECRET.
 */

const SHIPPED_STATUSES = new Set([
  "DISPATCHED",
  "DISPATCHED_FROM_ORIGIN",
  "IN_TRANSIT",
  "PICKED_UP",
  "PICKUP_SCHEDULED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "MANIFEST_GENERATED",
  "RTO_INITIATED",
]);
const DELIVERED_STATUS = "DELIVERED";

function normalizeStatus(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.toUpperCase().trim().replace(/\s+/g, "_");
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
    payload.current_status ??
    payload.shipment_status ??
    payload.status ??
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

/** Always return 200 per provider guideline: "The URL should be set to send only code 200 in response." */
function ok(body: { received: boolean; processed?: boolean; message?: string }) {
  return NextResponse.json(body, { status: 200 });
}

export async function POST(request: NextRequest) {
  let processed = false;
  try {
    const token = request.headers.get("x-api-key") ?? request.headers.get("x-shiprocket-webhook-secret") ?? request.headers.get("x-webhook-secret");
    const configuredSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
    if (configuredSecret && configuredSecret.length > 0) {
      if (token !== configuredSecret) {
        console.warn("Shiprocket webhook: token mismatch");
        return ok({ received: true, processed: false, message: "Unauthorized" });
      }
    }

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      console.warn("Shiprocket webhook: invalid JSON body");
      return ok({ received: true, processed: false, message: "Invalid JSON" });
    }

    const ref = getOrderReference(payload);
    if (!ref) {
      console.warn("Shiprocket webhook: no order reference in payload", JSON.stringify(payload, null, 2));
      return ok({ received: true, processed: false, message: "No order reference" });
    }

    const status = getShipmentStatus(payload);
    if (!status) {
      console.warn("Shiprocket webhook: no status in payload", JSON.stringify(payload, null, 2));
      return ok({ received: true, processed: false, message: "No status" });
    }

    const awbCode = getAwbCode(payload);
    const supabase = createAdminClient();

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
      return ok({ received: true, processed: false, message: "Order not found" });
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
      return ok({ received: true, processed: false, message: `Status ${status} not mapped` });
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
      return ok({ received: true, processed: false, message: "Update failed" });
    }

    processed = true;
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
    return ok({ received: true, processed: false, message: "Internal error" });
  }

  return ok({ received: true, processed });
}
