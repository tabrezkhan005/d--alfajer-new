/**
 * Email sending via SMTP (Nodemailer).
 * Logo is embedded from public/images/alfajernewlogo.jpeg so it displays without a public URL.
 *
 * Required env:
 *   SMTP_HOST       - e.g. smtp.gmail.com, smtp.office365.com
 *   SMTP_PORT       - 587 (TLS) or 465 (SSL). Default 587
 *   SMTP_SECURE     - set "true" for port 465
 *   SMTP_USER       - auth username (optional for some servers)
 *   SMTP_PASSWORD   - auth password / app password (optional)
 *   EMAIL_FROM      - e.g. "Al Fajer <orders@alfajermart.com>"
 *   EMAIL_REPLY_TO  - optional reply-to address
 */
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  OrderEmailData,
  getEmailTemplateForStatus,
  orderConfirmationEmail,
  orderProcessingEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  EMAIL_LOGO_CID,
} from "./templates";

const FROM_EMAIL = process.env.EMAIL_FROM || "Al Fajer <orders@alfajermart.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "support@alfajermart.com";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host) {
    console.warn("❌ SMTP_HOST not set. Email will not be sent.");
    return null;
  }

  const portNum = port ? parseInt(port, 10) : 587;
  const secure = process.env.SMTP_SECURE === "true" || portNum === 465;

  transporter = nodemailer.createTransport({
    host,
    port: portNum,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    // Serverless-friendly: don't pool connections (they go stale between invocations)
    pool: false,
    // Timeouts to prevent hanging on Vercel
    connectionTimeout: 10000, // 10s to establish connection
    greetingTimeout: 10000,   // 10s for SMTP greeting
    socketTimeout: 30000,     // 30s for the entire operation
  } as any);

  return transporter;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via SMTP (Nodemailer)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo: string = REPLY_TO,
  fromOverride?: string
): Promise<SendEmailResult> {
  const from = fromOverride || FROM_EMAIL;

  try {
    console.log("📧 sendEmail called:", {
      to,
      subject,
      from,
      replyTo,
      htmlLength: html?.length || 0,
    });

    const transport = getTransporter();
    if (!transport) {
      return {
        success: false,
        error: "Email not configured. Set SMTP_HOST (and SMTP_USER/SMTP_PASSWORD if required).",
      };
    }

    // Embed logo so it displays in email (no external URL needed)
    const logoPath = path.join(process.cwd(), "public", "images", "alfajernewlogo.jpeg");
    const attachments: { filename: string; content: Buffer; cid: string }[] = [];
    if (fs.existsSync(logoPath)) {
      try {
        attachments.push({
          filename: "alfajer-logo.jpeg",
          content: fs.readFileSync(logoPath),
          cid: EMAIL_LOGO_CID,
        });
      } catch (e) {
        console.warn("Could not attach logo for email:", e);
      }
    }

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
      replyTo,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    const messageId = typeof info.messageId === "string" ? info.messageId : undefined;
    console.log("✅ Email sent via SMTP:", { messageId, to, subject });

    return { success: true, messageId };
  } catch (error) {
    console.error("❌ SMTP send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<SendEmailResult> {
  const template = orderConfirmationEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send order processing email
 */
export async function sendOrderProcessingEmail(data: OrderEmailData): Promise<SendEmailResult> {
  const template = orderProcessingEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(data: OrderEmailData): Promise<SendEmailResult> {
  const template = orderShippedEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(data: OrderEmailData): Promise<SendEmailResult> {
  const template = orderDeliveredEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send order cancelled email
 */
export async function sendOrderCancelledEmail(data: OrderEmailData): Promise<SendEmailResult> {
  const template = orderCancelledEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send email based on order status
 */
export async function sendOrderStatusEmail(
  status: string,
  data: OrderEmailData
): Promise<SendEmailResult> {
  const template = getEmailTemplateForStatus(status, data);
  if (!template) {
    console.log(`No email template for status: ${status}`);
    return { success: false, error: `No email template for status: ${status}` };
  }
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Helper to prepare OrderEmailData from an order object
 */
export function prepareOrderEmailData(order: {
  id: string;
  order_number?: string;
  email?: string;
  status?: string;
  subtotal?: number;
  shipping_cost?: number;
  tax?: number;
  discount?: number;
  total_amount?: number;
  total?: number;
  currency?: string;
  shipping_address?: any;
  shipping_method?: string;
  tracking_number?: string;
  created_at?: string;
  items?: Array<{
    name?: string;
    quantity: number;
    price?: number;
    image_url?: string;
  }>;
}): OrderEmailData {
  const address = order.shipping_address || {};
  const isIndia = (address.country === "IN" || address.country === "India");
  const isNorthIndia =
    isIndia &&
    [
      "Delhi",
      "Haryana",
      "Punjab",
      "Himachal Pradesh",
      "Uttarakhand",
      "Rajasthan",
      "Uttar Pradesh",
      "Chandigarh",
      "Jammu & Kashmir",
      "Ladakh",
    ].some((state) => address.state?.toLowerCase().includes(state.toLowerCase()));

  let estimatedDelivery = "";
  if (order.status === "shipped" || order.status === "processing") {
    const deliveryDays = isNorthIndia ? "2-3" : isIndia ? "4-5" : "7-14";
    const today = new Date();
    const minDays = parseInt(deliveryDays.split("-")[0]);
    const maxDays = parseInt(deliveryDays.split("-")[1] || deliveryDays);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + minDays);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxDays);
    const formatDeliveryDate = (date: Date) =>
      date.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
    estimatedDelivery = `${formatDeliveryDate(minDate)} - ${formatDeliveryDate(maxDate)}`;
  }

  let trackingUrl = "";
  const orderAny = order as { tracking_url?: string };
  if (orderAny.tracking_url && String(orderAny.tracking_url).trim()) {
    trackingUrl = String(orderAny.tracking_url).trim();
  } else if (order.tracking_number) {
    if (order.tracking_number.startsWith("SR-")) {
      trackingUrl = `https://www.shiprocket.in/tracking/${order.tracking_number.replace("SR-", "")}`;
    } else {
      trackingUrl = `https://www.shiprocket.in/tracking/${order.tracking_number}`;
    }
  }

  return {
    orderNumber: order.order_number || order.id,
    customerName: address.name || address.firstName || "Valued Customer",
    customerEmail: order.email || address.email || "",
    items: (order.items || []).map((item) => ({
      name: item.name || "Product",
      quantity: item.quantity || 1,
      price: item.price || 0,
      image: item.image_url,
    })),
    subtotal: order.subtotal || 0,
    shippingCost: order.shipping_cost || 0,
    tax: order.tax || 0,
    discount: order.discount || 0,
    total: order.total_amount || order.total || 0,
    currency: order.currency || "INR",
    shippingAddress: {
      name: address.name || address.firstName || "",
      address: address.address || address.line1 || address.street || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || address.postal_code || address.zipCode || "",
      country: address.country || "IN",
      phone: address.phone || "",
    },
    estimatedDelivery,
    trackingNumber: order.tracking_number || undefined,
    trackingUrl: trackingUrl || undefined,
    orderDate: order.created_at || new Date().toISOString(),
    status: order.status || "pending",
  };
}
