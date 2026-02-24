import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/server";
import { sendOrderStatusEmail, prepareOrderEmailData } from "@/src/lib/email";

// Increase serverless function timeout for email operations
export const maxDuration = 60;

/**
 * Shiprocket Webhook – update order status in DB and log analytics.
 * Customer emails (shipped, out for delivery, delivered) are sent by Shiprocket when
 * billing_email and billing_phone are set in the Create Order API and Email Notifications
 * are enabled in Shiprocket Dashboard → Settings → Communication.
 *
 * Guidelines: POST, Content-Type: application/json, token in x-api-key, respond with 200 only.
 * Webhook URL: https://yourdomain.com/api/shiprocket/webhook
 * Token: set in Shiprocket (Token field) and env SHIPROCKET_WEBHOOK_SECRET.
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
const RTO_STATUSES = new Set(["RTO_INITIATED", "RTO_IN_TRANSIT", "RTO_DELIVERED", "RTO"]);
const CANCELLED_STATUSES = new Set(["CANCELLED", "CANCELLATION REQUESTED"]);

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

/** Resolve order reference: Shiprocket may send order_id (our ref or theirs) or sr_order_id (numeric). */
function getOrderReference(payload: Record<string, unknown>): { ref: string; srOrderId?: number } | null {
  const channel = payload.channel_order_id ?? payload.order_id;
  const ref = channel != null && String(channel).trim() ? String(channel).trim() : null;
  const srOrderId = payload.sr_order_id != null ? Number(payload.sr_order_id) : undefined;
  if (ref || (srOrderId !== undefined && !Number.isNaN(srOrderId))) {
    return { ref: ref || String(srOrderId), srOrderId: srOrderId };
  }
  return null;
}

/** Always return 200 per provider guideline: "The URL should be set to send only code 200 in response." */
function ok(body: { received: boolean; processed?: boolean; message?: string }) {
  return NextResponse.json(body, { status: 200 });
}

export async function POST(request: NextRequest) {
  let processed = false;
  const supabase = createAdminClient();

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

    const status = getShipmentStatus(payload);
    const awbCode = getAwbCode(payload);

    // Log webhook event for debuggin
    try {
      await supabase.from("shiprocket_webhook_logs" as any).insert({
        event_type: payload.event_type || "status_update",
        awb_code: awbCode || null,
        status: status || null,
        payload: payload,
        processed: false,
      });
    } catch (logError) {
      console.error("Failed to log webhook:", logError);
    }

    const orderRef = getOrderReference(payload);
    if (!orderRef) {
      console.warn("Shiprocket webhook: no order reference in payload", JSON.stringify(payload, null, 2));
      return ok({ received: true, processed: false, message: "No order reference" });
    }

    if (!status) {
      console.warn("Shiprocket webhook: no status in payload", JSON.stringify(payload, null, 2));
      return ok({ received: true, processed: false, message: "No status" });
    }

    const { ref, srOrderId } = orderRef;

    // Find order: by order_number, by id (UUID), by shiprocket_order_id, or by notes.shiprocket_order_id
    let orders: any[] | null = null;
    let findError: any = null;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);
    const isNumeric = /^\d+$/.test(ref);

    const baseSelect = "id, order_number, status, tracking_number, email, shipping_address, subtotal, total_amount, currency, shipping_cost, tax, discount, created_at, notes, shiprocket_order_id, shiprocket_shipment_id, payment_method";

    // Try to find by UUID
    if (isUuid) {
      const r = await supabase.from("orders").select(baseSelect).eq("id", ref).limit(1);
      findError = r.error;
      orders = r.data;
    // Try to find by order_number
    } else if (!isNumeric) {
      const r = await supabase.from("orders").select(baseSelect).eq("order_number", ref).limit(1);
      findError = r.error;
      orders = r.data;
    }

    // Try to find by shiprocket_order_id column
    if ((!orders || orders.length === 0) && (isNumeric || srOrderId !== undefined)) {
      const srId = srOrderId ?? (isNumeric ? parseInt(ref, 10) : undefined);
      if (srId !== undefined && !Number.isNaN(srId)) {
        const r = await supabase.from("orders").select(baseSelect).eq("shiprocket_order_id", srId).limit(1);
        if (!r.error && r.data?.length) {
          orders = r.data;
        } else {
          // Fallback: search in notes JSON
          const r2 = await supabase.from("orders").select(baseSelect).not("notes", "is", null).limit(500);
          if (!r2.error && r2.data?.length) {
            const found = (r2.data as any[]).find((o) => {
              try {
                const n = o.notes && typeof o.notes === "string" ? JSON.parse(o.notes) : o.notes;
                return n && (Number(n.shiprocket_order_id) === srId || Number(n.sr_order_id) === srId);
              } catch {
                return false;
              }
            });
            if (found) orders = [found];
          }
        }
      }
    }

    // Also try by AWB code (tracking_number) as a reliable fallback
    if ((!orders || orders.length === 0) && awbCode) {
      const r3 = await supabase.from("orders").select(baseSelect).eq("tracking_number", awbCode).limit(1);
      if (!r3.error && r3.data?.length) {
        orders = r3.data;
        console.log("Shiprocket webhook: found order by AWB code", awbCode);
      }
    }

    if (findError || !orders?.length) {
      console.warn("Shiprocket webhook: order not found", { ref, srOrderId, awbCode, findError, payloadKeys: Object.keys(payload) });
      return ok({ received: true, processed: false, message: "Order not found" });
    }

    const order = orders[0] as any;
    const orderId = order.id;
    const currentStatus = (order.status || "").toLowerCase();

    // Determine new order status
    let newStatus: "shipped" | "delivered" | "return_requested" | "cancelled" | null = null;
    if (status === DELIVERED_STATUS) {
      newStatus = "delivered";
    } else if (RTO_STATUSES.has(status)) {
      newStatus = "return_requested";
    } else if (CANCELLED_STATUSES.has(status)) {
      newStatus = "cancelled";
    } else if (SHIPPED_STATUSES.has(status)) {
      newStatus = "shipped";
    }

    if (!newStatus) {
      return ok({ received: true, processed: false, message: `Status ${status} not mapped` });
    }

    // Don't downgrade status (e.g., don't change delivered back to shipped)
    const statusOrder: Record<string, number> = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
      return_requested: 4,
      returned: 5,
      cancelled: 6,
    };

    // Check if the order status is already at this level or higher
    // Exception: If it's already "shipped", but we didn't have a tracking number before, we SHOULD process this to save the AWB
    let shouldUpdateOrder = true;
    let isAwbOnlyUpdate = false;

    if (statusOrder[newStatus] <= statusOrder[currentStatus] && newStatus !== "return_requested") {
      if (newStatus === "shipped" && !order.tracking_number && awbCode) {
        console.log("Shiprocket webhook: status is unchanged (shipped), but new AWB found. Updating DB.");
        isAwbOnlyUpdate = true;
      } else {
        console.log("Shiprocket webhook: skipping status downgrade", { currentStatus, newStatus });
        return ok({ received: true, processed: false, message: "Status not updated (no downgrade)" });
      }
    }

    // Update order
    const updates: { status?: string; tracking_number?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (!isAwbOnlyUpdate && newStatus) {
      updates.status = newStatus;
    }

    if (awbCode && !order.tracking_number) {
      updates.tracking_number = awbCode;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (updateError) {
      console.error("Shiprocket webhook: failed to update order", orderId, updateError);
      return ok({ received: true, processed: false, message: "Update failed" });
    }

    // Update shipping analytics
    try {
      const analyticsUpdate: any = {
        status: status,
        last_status_update: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // If delivered, calculate delivery days
      if (status === DELIVERED_STATUS) {
        analyticsUpdate.delivered_date = new Date().toISOString();
        // Calculate delivery days from order creation
        const createdDate = new Date(order.created_at);
        const deliveredDate = new Date();
        const diffTime = Math.abs(deliveredDate.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        analyticsUpdate.delivery_days = diffDays;
      }

      // Update or insert analytics record
      if (awbCode) {
        const { data: existingAnalytics } = await supabase
          .from("shipping_analytics" as any)
          .select("id")
          .eq("awb_code", awbCode)
          .limit(1);

        if (existingAnalytics && existingAnalytics.length > 0) {
          await supabase
            .from("shipping_analytics" as any)
            .update(analyticsUpdate)
            .eq("awb_code", awbCode);
        } else if (order.shiprocket_shipment_id) {
          await supabase
            .from("shipping_analytics" as any)
            .insert({
              order_id: orderId,
              shiprocket_order_id: order.shiprocket_order_id,
              shiprocket_shipment_id: order.shiprocket_shipment_id,
              awb_code: awbCode,
              courier_name: payload.courier_name || null,
              status: status,
              last_status_update: new Date().toISOString(),
            });
        }
      }

      // Mark webhook log as processed
      if (awbCode) {
        await supabase
          .from("shiprocket_webhook_logs" as any)
          .update({ processed: true })
          .eq("awb_code", awbCode)
          .order("created_at", { ascending: false })
          .limit(1);
      }
    } catch (analyticsError) {
      console.error("Failed to update analytics:", analyticsError);
      // Don't fail the webhook if analytics update fails
    }

    processed = true;
    console.log("Shiprocket webhook: order updated", { orderId, newStatus: isAwbOnlyUpdate ? "(AWB Only)" : newStatus, awbCode: awbCode || "(none)" });

    // Send status update email to customer
    // User requested: "custom email i dont want i want shiprocket email like the demo email"
    // So we disable Al Fajer SMTP emails for Shipped/Delivered statuses to let Shiprocket handle it.
    /*
    if (newStatus && ["shipped", "delivered", "cancelled"].includes(newStatus)) {
      try {
        // Re-fetch order with items for email
        const { data: fullOrder } = await supabase
          .from("orders")
          .select("*, items:order_items(*)")
          .eq("id", orderId)
          .single();

        if (fullOrder) {
          const trackingUrl = awbCode
            ? `https://www.shiprocket.in/tracking/${awbCode}`
            : undefined;

          const emailData = prepareOrderEmailData({
            ...fullOrder,
            status: newStatus,
            tracking_number: awbCode || (fullOrder as any).tracking_number || undefined,
            tracking_url: trackingUrl,
          } as any);

          if (emailData.customerEmail && emailData.customerEmail.trim()) {
            const result = await sendOrderStatusEmail(newStatus, emailData);
            if (result.success) {
              console.log(`✅ Shiprocket webhook: ${newStatus} email sent to ${emailData.customerEmail}`);
            } else {
              console.error(`❌ Shiprocket webhook: ${newStatus} email failed:`, result.error);
            }
          } else {
            console.warn("Shiprocket webhook: no customer email for order", orderId);
          }
        }
      } catch (emailError) {
        console.error("Shiprocket webhook: error sending status email:", emailError);
      }
    }
    */
  } catch (err) {
    console.error("Shiprocket webhook error:", err);
    return ok({ received: true, processed: false, message: "Internal error" });
  }

  return ok({ received: true, processed });
}

/** GET: Quick health check — visit /api/shiprocket/webhook in browser to verify reachability */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Shiprocket webhook endpoint is reachable",
    timestamp: new Date().toISOString(),
    webhookSecretConfigured: !!process.env.SHIPROCKET_WEBHOOK_SECRET,
    smtpConfigured: !!process.env.SMTP_HOST,
  });
}
