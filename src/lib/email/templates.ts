// Email Templates for Order Notifications
// Light theme, professional layout with logo

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  estimatedDelivery?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  orderDate: string;
  status: string;
}

// Base URL for logo and links – must be absolute HTTPS so images load in email clients
function getBaseUrl(): string {
  const raw =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) ||
    (typeof process !== 'undefined' && process.env?.EMAIL_APP_URL) ||
    'https://alfajermart.com';
  return raw.startsWith('http') ? raw : `https://${raw}`;
}
const BASE_URL = getBaseUrl();
// Logo: use cid:alfajerlogo so the logo is embedded in the email (no external URL needed)
export const EMAIL_LOGO_CID = 'alfajerlogo';

// Contact / shipping address in emails = footer contact info (single source of truth)
const CONTACT_ADDRESS = 'NH44, Lethpora - Jammu and Kashmir';
const CONTACT_PHONE = '+91 96228 63806';
const CONTACT_EMAIL = 'alfajermart@gmail.com';

// Light theme – professional, high contrast
const BRAND_COLORS = {
  primary: '#B8860B',
  primaryDark: '#996f09',
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  border: '#e2e8f0',
  text: '#1e293b',
  textMuted: '#64748b',
  accent: '#dc2626',
  success: '#059669',
  warning: '#d97706',
};

// Currency formatting
function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    GBP: '£',
    EUR: '€',
    AED: 'AED ',
    SAR: 'SAR ',
  };
  return `${symbols[currency] || currency + ' '}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format date string
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Shared header with logo (embedded via cid so it always displays)
function emailHeader(): string {
  return `
  <div class="header">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 28px 24px;">
          <a href="${BASE_URL}" target="_blank" rel="noopener">
            <img src="cid:${EMAIL_LOGO_CID}" alt="Al Fajer" width="180" height="58" style="display:block; max-width:180px; width:180px; height:auto; border:0; outline:none;" />
          </a>
          <p class="tagline">Premium quality, delivered with care</p>
        </td>
      </tr>
    </table>
  </div>`;
}

// Shared footer with logo and legal
function emailFooter(): string {
  return `
  <div class="footer">
    <img src="cid:${EMAIL_LOGO_CID}" alt="Al Fajer" width="120" height="auto" style="display:block; max-width:120px; height:auto; margin:0 auto 16px; border:0;" />
    <p class="footer-text">Premium Arabian Fragrances &amp; Natural Products</p>
    <p class="footer-legal">&copy; ${new Date().getFullYear()} Al Fajer. All rights reserved.<br/>Questions? Reply to this email or contact support@alfajer.com</p>
  </div>`;
}

// Base email template wrapper – light theme, professional
function baseTemplate(content: string, preheaderText: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Al Fajer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f1f5f9;
      color: ${BRAND_COLORS.text};
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .preheader { display: none !important; visibility: hidden; opacity: 0; height: 0; width: 0; overflow: hidden; }
    .container { max-width: 600px; margin: 0 auto; background: ${BRAND_COLORS.background}; }
    .header {
      background: ${BRAND_COLORS.background};
      border-bottom: 1px solid ${BRAND_COLORS.border};
      text-align: center;
    }
    .tagline {
      font-size: 12px;
      color: ${BRAND_COLORS.textMuted};
      letter-spacing: 0.5px;
      margin-top: 8px;
    }
    .content { padding: 40px 32px; }
    .status-badge {
      display: inline-block;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    .status-confirmed { background: ${BRAND_COLORS.success}; color: #fff; }
    .status-processing { background: ${BRAND_COLORS.warning}; color: #fff; }
    .status-shipped { background: #2563eb; color: #fff; }
    .status-delivered { background: ${BRAND_COLORS.primary}; color: #fff; }
    h1 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 26px;
      font-weight: 600;
      margin-bottom: 12px;
      color: ${BRAND_COLORS.text};
      line-height: 1.3;
    }
    h2 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18px;
      font-weight: 600;
      margin: 28px 0 12px;
      color: ${BRAND_COLORS.text};
      border-bottom: 1px solid ${BRAND_COLORS.border};
      padding-bottom: 8px;
    }
    p { color: ${BRAND_COLORS.textMuted}; margin-bottom: 14px; font-size: 15px; }
    .highlight { color: ${BRAND_COLORS.primary}; font-weight: 600; }
    .order-info-row { margin-bottom: 8px; }
    .order-info-row:last-child { margin-bottom: 0; }
    .order-info-label { color: ${BRAND_COLORS.textMuted}; font-size: 13px; }
    .order-info-value { color: ${BRAND_COLORS.text}; font-weight: 500; font-size: 14px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    .items-table th {
      text-align: left;
      padding: 12px 10px;
      background: ${BRAND_COLORS.backgroundSecondary};
      color: ${BRAND_COLORS.text};
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid ${BRAND_COLORS.border};
    }
    .items-table td {
      padding: 14px 10px;
      border-bottom: 1px solid ${BRAND_COLORS.border};
      color: ${BRAND_COLORS.text};
      vertical-align: middle;
    }
    .item-image { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; border: 1px solid ${BRAND_COLORS.border}; }
    .cta-button {
      display: inline-block;
      background: ${BRAND_COLORS.primary};
      color: #fff !important;
      padding: 14px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      margin: 20px 0;
    }
    .delivery-date { font-size: 15px; font-weight: 600; color: ${BRAND_COLORS.success}; }
    .footer {
      background: ${BRAND_COLORS.backgroundSecondary};
      border-top: 1px solid ${BRAND_COLORS.border};
      padding: 28px 32px;
      text-align: center;
    }
    .footer-text { font-size: 13px; color: ${BRAND_COLORS.textMuted}; margin-bottom: 12px; }
    .footer-legal { font-size: 11px; color: ${BRAND_COLORS.textMuted}; line-height: 1.6; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px 20px !important; }
      .header td { padding: 20px 16px !important; }
      h1 { font-size: 22px !important; }
      .items-table td, .items-table th { padding: 10px 8px !important; font-size: 13px !important; }
      .item-image { width: 44px !important; height: 44px !important; }
    }
  </style>
</head>
<body>
  <span class="preheader">${preheaderText}</span>
  <div class="container">
    ${content}
  </div>
</body>
</html>
  `;
}

// Generate items table with serial no (S.No.), product, qty, amount – clean, professional
function generateItemsTable(items: OrderEmailData['items'], currency: string): string {
  if (!items || items.length === 0) {
    return `<p style="color: ${BRAND_COLORS.textMuted}; margin: 12px 0;">No items listed.</p>`;
  }
  const rows = items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 10px 12px; font-size: 13px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.border};">${index + 1}</td>
      <td style="padding: 10px 12px; font-size: 14px; color: ${BRAND_COLORS.text}; border-bottom: 1px solid ${BRAND_COLORS.border};">
        <strong>${String(item.name).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong>
      </td>
      <td style="padding: 10px 12px; text-align: center; font-size: 14px; color: ${BRAND_COLORS.text}; border-bottom: 1px solid ${BRAND_COLORS.border};">${item.quantity}</td>
      <td style="padding: 10px 12px; text-align: right; font-size: 14px; color: ${BRAND_COLORS.text}; border-bottom: 1px solid ${BRAND_COLORS.border};">${formatCurrency((item.price || 0) * (item.quantity || 1), currency)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin: 16px 0; font-size: 14px;">
      <thead>
        <tr>
          <th style="width: 44px; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.border};">S.No.</th>
          <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.border};">Product</th>
          <th style="padding: 10px 12px; text-align: center; width: 48px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.border};">Qty</th>
          <th style="padding: 10px 12px; text-align: right; width: 90px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.border};">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Totals: clean rows, no box
function generateTotalsSection(data: OrderEmailData): string {
  const { subtotal, shippingCost, tax, discount, total, currency } = data;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; font-size: 14px;">
      <tr><td style="padding: 6px 0; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.border};">Subtotal</td><td style="padding: 6px 0; text-align: right; color: ${BRAND_COLORS.text}; border-bottom: 1px solid ${BRAND_COLORS.border};">${formatCurrency(subtotal, currency)}</td></tr>
      ${discount > 0 ? `<tr><td style="padding: 6px 0; color: ${BRAND_COLORS.success}; border-bottom: 1px solid ${BRAND_COLORS.border};">Discount</td><td style="padding: 6px 0; text-align: right; color: ${BRAND_COLORS.success}; border-bottom: 1px solid ${BRAND_COLORS.border};">-${formatCurrency(discount, currency)}</td></tr>` : ''}
      <tr><td style="padding: 6px 0; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.border};">Shipping</td><td style="padding: 6px 0; text-align: right; color: ${BRAND_COLORS.text}; border-bottom: 1px solid ${BRAND_COLORS.border};">${shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost, currency)}</td></tr>
      ${tax > 0 ? `<tr><td style="padding: 6px 0; color: ${BRAND_COLORS.textMuted}; border-bottom: 1px solid ${BRAND_COLORS.border};">Tax</td><td style="padding: 6px 0; text-align: right; color: ${BRAND_COLORS.text}; border-bottom: 1px solid ${BRAND_COLORS.border};">${formatCurrency(tax, currency)}</td></tr>` : ''}
      <tr><td style="padding: 12px 0 0 0; font-weight: 600; color: ${BRAND_COLORS.text};">Total</td><td style="padding: 12px 0 0 0; text-align: right; font-weight: 600; font-size: 16px; color: ${BRAND_COLORS.primary};">${formatCurrency(total, currency)}</td></tr>
    </table>
  `;
}

// Order info as simple rows (no box)
function generateOrderInfoLines(lines: Array<{ label: string; value: string; highlight?: boolean }>): string {
  if (lines.length === 0) return ''
  const rows = lines
    .map(
      (l) =>
        `<tr><td style="padding: 6px 0; color: ${BRAND_COLORS.textMuted}; font-size: 13px;">${l.label}</td><td style="padding: 6px 0; text-align: right; font-size: 14px; font-weight: 500; color: ${l.highlight ? BRAND_COLORS.primary : BRAND_COLORS.text};">${l.value}</td></tr>`
    )
    .join('')
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
      ${rows}
    </table>
  `
}

// Contact / shipping address in email = footer contact info (no box)
function generateContactSection(): string {
  return `
    <p style="margin: 20px 0 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_COLORS.textMuted};">Contact &amp; Address</p>
    <p style="margin: 0; font-size: 14px; color: ${BRAND_COLORS.text}; line-height: 1.7;">
      ${CONTACT_ADDRESS}<br/>
      <a href="tel:${CONTACT_PHONE.replace(/\s/g, '')}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">${CONTACT_PHONE}</a><br/>
      <a href="mailto:${CONTACT_EMAIL}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">${CONTACT_EMAIL}</a>
    </p>
  `
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Order Confirmation Email
 * Sent when order is successfully placed
 */
export function orderConfirmationEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${emailHeader()}
    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge status-confirmed">✓ Order Confirmed</span>
        <h1>Thank You for Your Order!</h1>
        <p>Hi ${data.customerName},</p>
        <p>We're thrilled to confirm your order. Your items are being prepared with care.</p>
      </div>

      ${generateOrderInfoLines([
        { label: 'Order Number', value: data.orderNumber, highlight: true },
        { label: 'Order Date', value: formatDate(data.orderDate) },
        ...(data.estimatedDelivery ? [{ label: 'Expected delivery', value: data.estimatedDelivery, highlight: true } as const] : []),
      ])}

      <h2>Order Summary</h2>
      ${generateItemsTable(data.items, data.currency)}
      ${generateTotalsSection(data)}

      ${generateContactSection()}

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: ${BRAND_COLORS.textMuted};">Thank you for shopping with Al Fajer!</p>
      </div>
    </div>
    ${emailFooter()}
  `;

  return {
    subject: `Order Confirmed! 🎉 Your Al Fajer Order #${data.orderNumber}`,
    html: baseTemplate(content, `Thank you! Your order #${data.orderNumber} has been confirmed.`),
  };
}

/**
 * Order Processing Email
 * Sent when order moves to processing
 */
export function orderProcessingEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${emailHeader()}
    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge status-processing">⏳ Processing</span>
        <h1>Your Order is Being Prepared</h1>
        <p>Hi ${data.customerName},</p>
        <p>Great news! We've started preparing your order. Our team is carefully packaging your items.</p>
      </div>

      ${generateOrderInfoLines([
        { label: 'Order Number', value: data.orderNumber, highlight: true },
        { label: 'Status', value: 'Processing' },
        ...(data.estimatedDelivery ? [{ label: 'Expected delivery', value: data.estimatedDelivery } as const] : []),
      ])}

      <h2>What's Next?</h2>
      <p>📦 Your order is being carefully packaged</p>
      <p>🚚 You'll receive a shipping notification with tracking details once your order is dispatched</p>
      <p>📧 We'll keep you updated every step of the way</p>

      <h2>Your Items</h2>
      ${generateItemsTable(data.items, data.currency)}

      <div style="text-align: center; margin-top: 30px;">
        <a href="${BASE_URL}/account/orders" class="cta-button">Track Your Order</a>
      </div>
    </div>
    ${emailFooter()}
  `;

  return {
    subject: `Your Order is Being Prepared 📦 #${data.orderNumber}`,
    html: baseTemplate(content, `Your order #${data.orderNumber} is now being prepared for shipping.`),
  };
}

/**
 * Order Shipped Email
 * Sent when order is shipped
 */
export function orderShippedEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${emailHeader()}
    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge status-shipped">🚚 Shipped</span>
        <h1>Your Order is On Its Way!</h1>
        <p>Hi ${data.customerName},</p>
        <p>Your order has been shipped and is on its way to you.</p>
      </div>

      ${data.trackingNumber ? `
      <div style="text-align: center; margin: 24px 0 32px;">
        <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_COLORS.textMuted}; margin-bottom: 8px;">Tracking Number (AWB)</p>
        <p style="font-size: 20px; font-weight: 700; color: ${BRAND_COLORS.text}; margin-bottom: 24px;">${data.trackingNumber}</p>
        ${data.trackingUrl ? `<a href="${data.trackingUrl}" class="cta-button" style="margin: 0;">Track Shipment</a>` : ''}
      </div>` : ''}

      ${generateOrderInfoLines([
        { label: 'Order Number', value: data.orderNumber, highlight: true },
        ...(data.estimatedDelivery ? [{ label: 'Expected delivery', value: data.estimatedDelivery, highlight: true } as const] : []),
      ])}

      <h2>Contact &amp; Address</h2>
      ${generateContactSection()}

      <h2>Your Items</h2>
      ${generateItemsTable(data.items, data.currency)}

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: ${BRAND_COLORS.textMuted};">Keep an eye on your tracking for delivery updates.</p>
      </div>
    </div>
    ${emailFooter()}
  `;

  return {
    subject: `Your Order is On Its Way! 🚚 #${data.orderNumber}`,
    html: baseTemplate(content, `Great news! Your order #${data.orderNumber} has been shipped and is on its way!`),
  };
}

/**
 * Order Delivered Email
 * Sent when order is delivered
 */
export function orderDeliveredEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${emailHeader()}
    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge status-delivered">✓ Delivered</span>
        <h1>Your Order Has Been Delivered!</h1>
        <p>Hi ${data.customerName},</p>
        <p>Your Al Fajer order has arrived. We hope you love it.</p>
      </div>

      ${generateOrderInfoLines([
        { label: 'Order Number', value: data.orderNumber, highlight: true },
        { label: 'Status', value: 'Delivered' },
      ])}

      <h2>Your Items</h2>
      ${generateItemsTable(data.items || [], data.currency)}

      ${generateTotalsSection(data)}

      ${data.trackingNumber && data.trackingUrl ? `
      ${generateOrderInfoLines([
        { label: 'Tracking (AWB)', value: data.trackingNumber },
      ])}
      <p style="margin: 0 0 20px 0;"><a href="${data.trackingUrl}" style="color: ${BRAND_COLORS.primary}; font-weight: 600;">Track your delivery</a></p>
      ` : ''}

      <h2>How Did We Do? ⭐</h2>
      <p>We'd love to hear your feedback. Your review helps other customers discover our collection.</p>
      <p style="margin-bottom: 24px;"><a href="${BASE_URL}/reviews" class="cta-button">Leave a Review</a></p>

      <div style="text-align: center; margin-top: 28px;">
        <p style="color: ${BRAND_COLORS.textMuted};">Thank you for choosing Al Fajer.</p>
        <p style="color: ${BRAND_COLORS.textMuted};">Need help? Reply to this email or contact support@alfajer.com</p>
      </div>
    </div>
    ${emailFooter()}
  `;

  return {
    subject: `Your Order Has Arrived! 🎁 #${data.orderNumber}`,
    html: baseTemplate(content, `Your Al Fajer order #${data.orderNumber} has been delivered! We hope you love it.`),
  };
}

/**
 * Order Cancelled Email
 * Sent when order is cancelled
 */
export function orderCancelledEmail(data: OrderEmailData): { subject: string; html: string } {
  const content = `
    ${emailHeader()}
    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge" style="background: ${BRAND_COLORS.accent}; color: white;">Order Cancelled</span>
        <h1>Order Cancellation Confirmed</h1>
        <p>Hi ${data.customerName},</p>
        <p>Your order has been cancelled as requested. If you paid online, your refund will be processed within 5–7 business days.</p>
      </div>

      ${generateOrderInfoLines([
        { label: 'Order Number', value: data.orderNumber },
        { label: 'Refund amount', value: formatCurrency(data.total, data.currency) },
      ])}

      <h2>Cancelled Items</h2>
      ${generateItemsTable(data.items, data.currency)}

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: ${BRAND_COLORS.textMuted};">We're sorry to see you go. If there was an issue, please let us know.</p>
        <a href="${BASE_URL}" class="cta-button">Continue Shopping</a>
      </div>
    </div>
    ${emailFooter()}
  `;

  return {
    subject: `Order Cancelled - #${data.orderNumber}`,
    html: baseTemplate(content, `Your order #${data.orderNumber} has been cancelled.`),
  };
}

/**
 * Get email template based on order status
 */
export function getEmailTemplateForStatus(
  status: string,
  data: OrderEmailData
): { subject: string; html: string } | null {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'pending':
      return orderConfirmationEmail(data);
    case 'processing':
      return orderProcessingEmail(data);
    case 'shipped':
      return orderShippedEmail(data);
    case 'delivered':
      return orderDeliveredEmail(data);
    case 'cancelled':
    case 'canceled':
      return orderCancelledEmail(data);
    default:
      return null;
  }
}
