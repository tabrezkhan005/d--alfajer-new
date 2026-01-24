import { Resend } from 'resend';
import {
  OrderEmailData,
  getEmailTemplateForStatus,
  orderConfirmationEmail,
  orderProcessingEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
} from './templates';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// From email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'Al Fajer <orders@alfajer.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@alfajer.com';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo: string = REPLY_TO
): Promise<SendEmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  data: OrderEmailData
): Promise<SendEmailResult> {
  const template = orderConfirmationEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send order processing email
 */
export async function sendOrderProcessingEmail(
  data: OrderEmailData
): Promise<SendEmailResult> {
  const template = orderProcessingEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(
  data: OrderEmailData
): Promise<SendEmailResult> {
  const template = orderShippedEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(
  data: OrderEmailData
): Promise<SendEmailResult> {
  const template = orderDeliveredEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send order cancelled email
 */
export async function sendOrderCancelledEmail(
  data: OrderEmailData
): Promise<SendEmailResult> {
  const template = orderCancelledEmail(data);
  return sendEmail(data.customerEmail, template.subject, template.html);
}

/**
 * Send email based on order status
 * Automatically selects the appropriate template
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
  const isIndia = (address.country === 'IN' || address.country === 'India');
  const isNorthIndia = isIndia && [
    'Delhi', 'Haryana', 'Punjab', 'Himachal Pradesh', 'Uttarakhand',
    'Rajasthan', 'Uttar Pradesh', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh'
  ].some(state => address.state?.toLowerCase().includes(state.toLowerCase()));

  // Calculate estimated delivery based on shipping zone
  let estimatedDelivery = '';
  if (order.status === 'shipped' || order.status === 'processing') {
    const deliveryDays = isNorthIndia ? '2-3' : (isIndia ? '4-5' : '7-14');
    const today = new Date();
    const minDays = parseInt(deliveryDays.split('-')[0]);
    const maxDays = parseInt(deliveryDays.split('-')[1] || deliveryDays);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + minDays);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + maxDays);

    const formatDeliveryDate = (date: Date) => date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    estimatedDelivery = `${formatDeliveryDate(minDate)} - ${formatDeliveryDate(maxDate)}`;
  }

  // Build tracking URL if tracking number exists
  let trackingUrl = '';
  if (order.tracking_number) {
    // Shiprocket tracking URL
    if (order.tracking_number.startsWith('SR-')) {
      trackingUrl = `https://www.shiprocket.in/tracking/${order.tracking_number.replace('SR-', '')}`;
    } else {
      trackingUrl = `https://www.shiprocket.in/tracking/${order.tracking_number}`;
    }
  }

  return {
    orderNumber: order.order_number || order.id,
    customerName: address.name || address.firstName || 'Valued Customer',
    customerEmail: order.email || address.email || '',
    items: (order.items || []).map(item => ({
      name: item.name || 'Product',
      quantity: item.quantity || 1,
      price: item.price || 0,
      image: item.image_url,
    })),
    subtotal: order.subtotal || 0,
    shippingCost: order.shipping_cost || 0,
    tax: order.tax || 0,
    discount: order.discount || 0,
    total: order.total_amount || order.total || 0,
    currency: order.currency || 'INR',
    shippingAddress: {
      name: address.name || address.firstName || '',
      address: address.address || address.line1 || address.street || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || address.postal_code || address.zipCode || '',
      country: address.country || 'IN',
      phone: address.phone || '',
    },
    estimatedDelivery,
    trackingNumber: order.tracking_number || undefined,
    trackingUrl: trackingUrl || undefined,
    orderDate: order.created_at || new Date().toISOString(),
    status: order.status || 'pending',
  };
}
