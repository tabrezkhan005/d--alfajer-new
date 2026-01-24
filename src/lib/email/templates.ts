// Email Templates for Order Notifications
// Beautiful, responsive HTML email templates

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

// Brand colors and styling
const BRAND_COLORS = {
  primary: '#D4AF37', // Gold
  primaryDark: '#B8860B',
  background: '#1a1a2e',
  backgroundLight: '#16213e',
  text: '#ffffff',
  textMuted: '#a0a0b0',
  accent: '#e94560',
  success: '#10b981',
  warning: '#f59e0b',
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

// Base email template wrapper
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: ${BRAND_COLORS.background};
      color: ${BRAND_COLORS.text};
      line-height: 1.6;
    }

    .preheader {
      display: none !important;
      visibility: hidden;
      opacity: 0;
      color: transparent;
      height: 0;
      width: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, ${BRAND_COLORS.backgroundLight} 0%, ${BRAND_COLORS.background} 100%);
    }

    .header {
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
      padding: 30px 40px;
      text-align: center;
    }

    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      color: ${BRAND_COLORS.background};
      text-decoration: none;
      letter-spacing: 2px;
    }

    .tagline {
      font-size: 12px;
      color: ${BRAND_COLORS.background};
      opacity: 0.8;
      margin-top: 5px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .content {
      padding: 40px;
    }

    .status-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .status-confirmed {
      background: linear-gradient(135deg, ${BRAND_COLORS.success}, #059669);
      color: white;
    }

    .status-processing {
      background: linear-gradient(135deg, ${BRAND_COLORS.warning}, #d97706);
      color: white;
    }

    .status-shipped {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .status-delivered {
      background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.primaryDark});
      color: ${BRAND_COLORS.background};
    }

    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 15px;
      color: ${BRAND_COLORS.primary};
    }

    h2 {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 600;
      margin: 25px 0 15px;
      color: ${BRAND_COLORS.text};
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);
      padding-bottom: 10px;
    }

    p {
      color: ${BRAND_COLORS.textMuted};
      margin-bottom: 15px;
    }

    .highlight {
      color: ${BRAND_COLORS.primary};
      font-weight: 600;
    }

    .order-info-box {
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
    }

    .order-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .order-info-label {
      color: ${BRAND_COLORS.textMuted};
      font-size: 14px;
    }

    .order-info-value {
      color: ${BRAND_COLORS.text};
      font-weight: 500;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .items-table th {
      text-align: left;
      padding: 12px;
      background: rgba(212, 175, 55, 0.1);
      color: ${BRAND_COLORS.primary};
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: ${BRAND_COLORS.text};
    }

    .item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }

    .totals-section {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: ${BRAND_COLORS.textMuted};
    }

    .total-row.grand-total {
      border-top: 2px solid ${BRAND_COLORS.primary};
      margin-top: 10px;
      padding-top: 15px;
      color: ${BRAND_COLORS.text};
      font-size: 18px;
      font-weight: 600;
    }

    .grand-total .amount {
      color: ${BRAND_COLORS.primary};
    }

    .address-box {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
    }

    .address-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${BRAND_COLORS.primary};
      margin-bottom: 10px;
    }

    .address-text {
      color: ${BRAND_COLORS.text};
      font-size: 14px;
      line-height: 1.8;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryDark} 100%);
      color: ${BRAND_COLORS.background} !important;
      padding: 15px 35px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 20px 0;
      transition: all 0.3s ease;
    }

    .tracking-box {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    }

    .tracking-number {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: 600;
      color: ${BRAND_COLORS.text};
      background: rgba(0, 0, 0, 0.3);
      padding: 10px 20px;
      border-radius: 8px;
      display: inline-block;
      margin: 10px 0;
      letter-spacing: 2px;
    }

    .delivery-estimate {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 25px 0;
      text-align: center;
    }

    .delivery-date {
      font-size: 20px;
      font-weight: 600;
      color: ${BRAND_COLORS.success};
    }

    .footer {
      background: rgba(0, 0, 0, 0.3);
      padding: 30px 40px;
      text-align: center;
    }

    .footer-logo {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: ${BRAND_COLORS.primary};
      margin-bottom: 15px;
    }

    .footer-text {
      font-size: 12px;
      color: ${BRAND_COLORS.textMuted};
      margin-bottom: 15px;
    }

    .social-links {
      margin: 20px 0;
    }

    .social-link {
      display: inline-block;
      margin: 0 10px;
      color: ${BRAND_COLORS.primary};
      text-decoration: none;
      font-size: 14px;
    }

    .footer-legal {
      font-size: 11px;
      color: ${BRAND_COLORS.textMuted};
      opacity: 0.7;
      margin-top: 20px;
    }

    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .content {
        padding: 20px !important;
      }
      .header {
        padding: 20px !important;
      }
      h1 {
        font-size: 24px !important;
      }
      .items-table td, .items-table th {
        padding: 8px !important;
        font-size: 12px !important;
      }
      .item-image {
        width: 40px !important;
        height: 40px !important;
      }
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
    <div class="header">
      <div class="logo">AL FAJER</div>
      <div class="tagline">Premium Fragrances</div>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge status-confirmed">✓ Order Confirmed</span>
        <h1>Thank You for Your Order!</h1>
        <p>Hi ${data.customerName},</p>
        <p>We're thrilled to confirm your order. Your premium fragrances are being prepared with care.</p>
      </div>

      <div class="order-info-box">
        <div class="order-info-row">
          <span class="order-info-label">Order Number</span>
          <span class="order-info-value highlight">${data.orderNumber}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Order Date</span>
          <span class="order-info-value">${formatDate(data.orderDate)}</span>
        </div>
        ${data.estimatedDelivery ? `
          <div class="order-info-row">
            <span class="order-info-label">Estimated Delivery</span>
            <span class="order-info-value" style="color: ${BRAND_COLORS.success};">${data.estimatedDelivery}</span>
          </div>
        ` : ''}
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
        <a href="https://alfajer.com/account/orders" class="cta-button">View Order Details</a>
      </div>
    </div>

    <div class="footer">
      <div class="footer-logo">AL FAJER</div>
      <div class="footer-text">
        Premium Arabian Fragrances<br/>
        Crafted with passion, delivered with care
      </div>
      <div class="social-links">
        <a href="#" class="social-link">Instagram</a>
        <a href="#" class="social-link">Facebook</a>
        <a href="#" class="social-link">WhatsApp</a>
      </div>
      <div class="footer-legal">
        © 2024 Al Fajer. All rights reserved.<br/>
        If you have any questions, reply to this email or contact us at support@alfajer.com
      </div>
    </div>
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
    <div class="header">
      <div class="logo">AL FAJER</div>
      <div class="tagline">Premium Fragrances</div>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge status-processing">⏳ Processing</span>
        <h1>Your Order is Being Prepared</h1>
        <p>Hi ${data.customerName},</p>
        <p>Great news! We've started preparing your order. Our team is carefully packaging your premium fragrances.</p>
      </div>

      <div class="order-info-box">
        <div class="order-info-row">
          <span class="order-info-label">Order Number</span>
          <span class="order-info-value highlight">${data.orderNumber}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Status</span>
          <span class="order-info-value" style="color: ${BRAND_COLORS.warning};">Processing</span>
        </div>
        ${data.estimatedDelivery ? `
          <div class="order-info-row">
            <span class="order-info-label">Expected Delivery</span>
            <span class="order-info-value">${data.estimatedDelivery}</span>
          </div>
        ` : ''}
      </div>

      <h2>What's Next?</h2>
      <p>📦 Your order is being carefully packaged</p>
      <p>🚚 You'll receive a shipping notification with tracking details once your order is dispatched</p>
      <p>📧 We'll keep you updated every step of the way</p>

      <h2>Your Items</h2>
      ${generateItemsTable(data.items, data.currency)}

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://alfajer.com/account/orders" class="cta-button">Track Your Order</a>
      </div>
    </div>

    <div class="footer">
      <div class="footer-logo">AL FAJER</div>
      <div class="footer-text">Premium Arabian Fragrances</div>
      <div class="footer-legal">
        © 2024 Al Fajer. All rights reserved.<br/>
        Questions? Reply to this email or contact support@alfajer.com
      </div>
    </div>
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
    <div class="header">
      <div class="logo">AL FAJER</div>
      <div class="tagline">Premium Fragrances</div>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge status-shipped">🚚 Shipped</span>
        <h1>Your Order is On Its Way!</h1>
        <p>Hi ${data.customerName},</p>
        <p>Exciting news! Your order has been shipped and is on its way to you.</p>
      </div>

      ${data.trackingNumber ? `
        <div class="tracking-box">
          <div style="font-size: 14px; color: ${BRAND_COLORS.textMuted}; margin-bottom: 10px;">📍 Track Your Package</div>
          <div class="tracking-number">${data.trackingNumber}</div>
          ${data.trackingUrl ? `
            <div style="margin-top: 15px;">
              <a href="${data.trackingUrl}" class="cta-button" style="margin: 0;">Track Shipment</a>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="order-info-box">
        <div class="order-info-row">
          <span class="order-info-label">Order Number</span>
          <span class="order-info-value highlight">${data.orderNumber}</span>
        </div>
        ${data.estimatedDelivery ? `
          <div class="order-info-row">
            <span class="order-info-label">Expected Delivery</span>
            <span class="order-info-value" style="color: ${BRAND_COLORS.success};">${data.estimatedDelivery}</span>
          </div>
        ` : ''}
      </div>

      ${data.estimatedDelivery ? `
        <div class="delivery-estimate">
          <div style="font-size: 14px; color: ${BRAND_COLORS.textMuted}; margin-bottom: 5px;">Arriving</div>
          <div class="delivery-date">🎁 ${data.estimatedDelivery}</div>
        </div>
      ` : ''}

      <h2>Delivery Address</h2>
      ${generateAddressSection(data.shippingAddress)}

      <h2>Your Items</h2>
      ${generateItemsTable(data.items, data.currency)}

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: ${BRAND_COLORS.textMuted};">Keep an eye on your tracking for delivery updates!</p>
      </div>
    </div>

    <div class="footer">
      <div class="footer-logo">AL FAJER</div>
      <div class="footer-text">Premium Arabian Fragrances</div>
      <div class="footer-legal">
        © 2024 Al Fajer. All rights reserved.<br/>
        Questions about your delivery? Reply to this email.
      </div>
    </div>
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
    <div class="header">
      <div class="logo">AL FAJER</div>
      <div class="tagline">Premium Fragrances</div>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge status-delivered">✓ Delivered</span>
        <h1>Your Order Has Been Delivered!</h1>
        <p>Hi ${data.customerName},</p>
        <p>Your Al Fajer fragrances have arrived! We hope you love them as much as we loved crafting them for you.</p>
      </div>

      <div class="order-info-box">
        <div class="order-info-row">
          <span class="order-info-label">Order Number</span>
          <span class="order-info-value highlight">${data.orderNumber}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Status</span>
          <span class="order-info-value" style="color: ${BRAND_COLORS.success};">✓ Delivered</span>
        </div>
      </div>

      <h2>Your Items</h2>
      ${generateItemsTable(data.items, data.currency)}

      <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(184, 134, 11, 0.1)); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <h2 style="border: none; margin-top: 0;">How Did We Do? ⭐</h2>
        <p>We'd love to hear your feedback! Your review helps other fragrance lovers discover our collection.</p>
        <a href="https://alfajer.com/reviews" class="cta-button">Leave a Review</a>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: ${BRAND_COLORS.textMuted};">Thank you for choosing Al Fajer! 💛</p>
        <p style="color: ${BRAND_COLORS.textMuted};">Need help or have questions? We're always here for you.</p>
      </div>
    </div>

    <div class="footer">
      <div class="footer-logo">AL FAJER</div>
      <div class="footer-text">Premium Arabian Fragrances</div>
      <div class="social-links">
        <a href="#" class="social-link">Instagram</a>
        <a href="#" class="social-link">Facebook</a>
        <a href="#" class="social-link">WhatsApp</a>
      </div>
      <div class="footer-legal">
        © 2024 Al Fajer. All rights reserved.<br/>
        Contact us: support@alfajer.com
      </div>
    </div>
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
    <div class="header">
      <div class="logo">AL FAJER</div>
      <div class="tagline">Premium Fragrances</div>
    </div>

    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge" style="background: ${BRAND_COLORS.accent}; color: white;">Order Cancelled</span>
        <h1>Order Cancellation Confirmed</h1>
        <p>Hi ${data.customerName},</p>
        <p>Your order has been cancelled as requested. If you paid online, your refund will be processed within 5-7 business days.</p>
      </div>

      <div class="order-info-box">
        <div class="order-info-row">
          <span class="order-info-label">Order Number</span>
          <span class="order-info-value">${data.orderNumber}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Refund Amount</span>
          <span class="order-info-value">${formatCurrency(data.total, data.currency)}</span>
        </div>
      </div>

      <h2>Cancelled Items</h2>
      ${generateItemsTable(data.items, data.currency)}

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: ${BRAND_COLORS.textMuted};">We're sorry to see you go. If there was an issue, please let us know - we're always improving!</p>
        <a href="https://alfajer.com" class="cta-button">Continue Shopping</a>
      </div>
    </div>

    <div class="footer">
      <div class="footer-logo">AL FAJER</div>
      <div class="footer-text">Premium Arabian Fragrances</div>
      <div class="footer-legal">
        © 2024 Al Fajer. All rights reserved.<br/>
        Questions about your refund? Reply to this email.
      </div>
    </div>
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
