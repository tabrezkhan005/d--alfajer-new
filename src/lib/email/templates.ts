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

// Base URL for logo and links (absolute required in email)
const BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) || 'https://alfajer.com';
const LOGO_URL = `${BASE_URL}/images/alfajernewlogo.jpeg`;

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

// Shared header with logo (light theme)
function emailHeader(): string {
  return `
  <div class="header">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 28px 24px;">
          <a href="${BASE_URL}" target="_blank" rel="noopener">
            <img src="${LOGO_URL}" alt="Al Fajer" width="180" height="auto" style="display:block; max-width:180px; height:auto; border:0;" />
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
    <img src="${LOGO_URL}" alt="Al Fajer" width="120" height="auto" style="display:block; max-width:120px; height:auto; margin:0 auto 16px; border:0;" />
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
    .order-info-box {
      background: ${BRAND_COLORS.backgroundSecondary};
      border: 1px solid ${BRAND_COLORS.border};
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .order-info-row { margin-bottom: 10px; }
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
    .totals-section {
      background: ${BRAND_COLORS.backgroundSecondary};
      border: 1px solid ${BRAND_COLORS.border};
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    .total-row { padding: 6px 0; color: ${BRAND_COLORS.textMuted}; font-size: 14px; }
    .total-row.grand-total {
      border-top: 2px solid ${BRAND_COLORS.primary};
      margin-top: 10px;
      padding-top: 14px;
      color: ${BRAND_COLORS.text};
      font-size: 18px;
      font-weight: 600;
    }
    .grand-total .amount { color: ${BRAND_COLORS.primary}; }
    .address-box {
      background: ${BRAND_COLORS.backgroundSecondary};
      border: 1px solid ${BRAND_COLORS.border};
      border-radius: 8px;
      padding: 18px;
      margin: 16px 0;
    }
    .address-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_COLORS.primary}; margin-bottom: 8px; font-weight: 600; }
    .address-text { color: ${BRAND_COLORS.text}; font-size: 14px; line-height: 1.7; }
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
    .tracking-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .tracking-number {
      font-family: 'Courier New', monospace;
      font-size: 17px;
      font-weight: 600;
      color: ${BRAND_COLORS.text};
      background: ${BRAND_COLORS.background};
      padding: 10px 18px;
      border-radius: 6px;
      display: inline-block;
      margin: 10px 0;
      letter-spacing: 1px;
      border: 1px solid ${BRAND_COLORS.border};
    }
    .delivery-estimate {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 18px;
      margin: 24px 0;
      text-align: center;
    }
    .delivery-date { font-size: 18px; font-weight: 600; color: ${BRAND_COLORS.success}; }
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

// Generate items table HTML
function generateItemsTable(items: OrderEmailData['items'], currency: string): string {
  const rows = items.map(item => `
    <tr>
      <td>
        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image" />` : ''}
      </td>
      <td>
        <strong>${item.name}</strong>
      </td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatCurrency(item.price * item.quantity, currency)}</td>
    </tr>
  `).join('');

  return `
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 70px;"></th>
          <th>Product</th>
          <th style="text-align: center; width: 60px;">Qty</th>
          <th style="text-align: right; width: 100px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// Generate totals section HTML
function generateTotalsSection(data: OrderEmailData): string {
  const { subtotal, shippingCost, tax, discount, total, currency } = data;

  return `
    <div class="totals-section">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(subtotal, currency)}</span>
      </div>
      ${discount > 0 ? `
        <div class="total-row" style="color: ${BRAND_COLORS.success};">
          <span>Discount</span>
          <span>-${formatCurrency(discount, currency)}</span>
        </div>
      ` : ''}
      <div class="total-row">
        <span>Shipping</span>
        <span>${shippingCost === 0 ? '<span style="color: ' + BRAND_COLORS.success + ';">FREE</span>' : formatCurrency(shippingCost, currency)}</span>
      </div>
      ${tax > 0 ? `
        <div class="total-row">
          <span>Tax</span>
          <span>${formatCurrency(tax, currency)}</span>
        </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>Total</span>
        <span class="amount">${formatCurrency(total, currency)}</span>
      </div>
    </div>
  `;
}

// Generate address section
function generateAddressSection(address: OrderEmailData['shippingAddress']): string {
  return `
    <div class="address-box">
      <div class="address-title">📍 Shipping Address</div>
      <div class="address-text">
        ${address.name || ''}<br/>
        ${address.address || ''}<br/>
        ${address.city ? `${address.city}, ` : ''}${address.state || ''} ${address.postalCode || ''}<br/>
        ${address.country || ''}<br/>
        ${address.phone ? `📞 ${address.phone}` : ''}
      </div>
    </div>
  `;
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

      <div class="order-info-box">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Order Number</span></td><td style="text-align:right; padding:4px 0;"><span class="order-info-value highlight">${data.orderNumber}</span></td></tr></table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Order Date</span></td><td style="text-align:right; padding:4px 0;"><span class="order-info-value">${formatDate(data.orderDate)}</span></td></tr></table>
        ${data.estimatedDelivery ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Estimated Delivery</span></td><td style="text-align:right; padding:4px 0;"><span class="order-info-value" style="color: ${BRAND_COLORS.success};">${data.estimatedDelivery}</span></td></tr></table>` : ''}
      </div>

      ${data.estimatedDelivery ? `
        <div class="delivery-estimate">
          <div style="font-size: 14px; color: ${BRAND_COLORS.textMuted}; margin-bottom: 5px;">Expected Delivery</div>
          <div class="delivery-date">📦 ${data.estimatedDelivery}</div>
        </div>
      ` : ''}

      <h2>Order Summary</h2>
      ${generateItemsTable(data.items, data.currency)}
      ${generateTotalsSection(data)}

      ${generateAddressSection(data.shippingAddress)}

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: ${BRAND_COLORS.textMuted};">You can track your order status in your account.</p>
        <a href="${BASE_URL}/account/orders" class="cta-button">View Order Details</a>
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

      <div class="order-info-box">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Order Number</span></td><td style="text-align:right;"><span class="order-info-value highlight">${data.orderNumber}</span></td></tr></table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Status</span></td><td style="text-align:right;"><span class="order-info-value" style="color: ${BRAND_COLORS.warning};">Processing</span></td></tr></table>
        ${data.estimatedDelivery ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Expected Delivery</span></td><td style="text-align:right;"><span class="order-info-value">${data.estimatedDelivery}</span></td></tr></table>` : ''}
      </div>

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
        <div class="tracking-box">
          <div style="font-size: 14px; color: ${BRAND_COLORS.textMuted}; margin-bottom: 10px;">📍 Track Your Package</div>
          <div class="tracking-number">${data.trackingNumber}</div>
          ${data.trackingUrl ? `<div style="margin-top: 15px;"><a href="${data.trackingUrl}" class="cta-button" style="margin: 0;">Track Shipment</a></div>` : ''}
        </div>
      ` : ''}

      <div class="order-info-box">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Order Number</span></td><td style="text-align:right;"><span class="order-info-value highlight">${data.orderNumber}</span></td></tr></table>
        ${data.estimatedDelivery ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Expected Delivery</span></td><td style="text-align:right;"><span class="order-info-value" style="color: ${BRAND_COLORS.success};">${data.estimatedDelivery}</span></td></tr></table>` : ''}
      </div>

      ${data.estimatedDelivery ? `<div class="delivery-estimate"><div style="font-size: 14px; color: ${BRAND_COLORS.textMuted}; margin-bottom: 5px;">Arriving</div><div class="delivery-date">🎁 ${data.estimatedDelivery}</div></div>` : ''}

      <h2>Delivery Address</h2>
      ${generateAddressSection(data.shippingAddress)}

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

      <div class="order-info-box">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Order Number</span></td><td style="text-align:right;"><span class="order-info-value highlight">${data.orderNumber}</span></td></tr></table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Status</span></td><td style="text-align:right;"><span class="order-info-value" style="color: ${BRAND_COLORS.success};">✓ Delivered</span></td></tr></table>
      </div>

      <h2>Your Items</h2>
      ${generateItemsTable(data.items, data.currency)}

      <div style="background: ${BRAND_COLORS.backgroundSecondary}; border: 1px solid ${BRAND_COLORS.border}; border-radius: 8px; padding: 24px; margin: 28px 0; text-align: center;">
        <h2 style="border: none; margin-top: 0;">How Did We Do? ⭐</h2>
        <p>We'd love to hear your feedback. Your review helps other customers discover our collection.</p>
        <a href="${BASE_URL}/reviews" class="cta-button">Leave a Review</a>
      </div>

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

      <div class="order-info-box">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Order Number</span></td><td style="text-align:right;"><span class="order-info-value">${data.orderNumber}</span></td></tr></table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;"><span class="order-info-label">Refund Amount</span></td><td style="text-align:right;"><span class="order-info-value">${formatCurrency(data.total, data.currency)}</span></td></tr></table>
      </div>

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
