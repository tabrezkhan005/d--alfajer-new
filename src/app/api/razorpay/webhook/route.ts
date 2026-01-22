import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/server';
import crypto from 'crypto';

// POST: Razorpay Webhook Handler
// This endpoint receives payment events from Razorpay
// Configure this URL in Razorpay Dashboard: Settings > Webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('Missing Razorpay webhook signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!razorpayWebhookSecret) {
      console.error('Razorpay webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update(body)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    )) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
      case 'payment.authorized':
        await handlePaymentSuccess(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'order.paid':
        await handleOrderPaid(event);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(event: any) {
  const supabase = createAdminClient();
  const payment = event.payload.payment.entity;
  const orderId = payment.notes?.order_id || payment.order_id;

  if (!orderId) {
    console.error('Order ID not found in payment event');
    return;
  }

  // Validate orderId format (UUID or order number format)
  if (typeof orderId !== 'string' || orderId.length > 100) {
    console.error('Invalid order ID format:', orderId);
    return;
  }

  // Find order by Razorpay order ID first, then by order ID
  // Supabase uses parameterized queries, but we validate inputs
  let order = null;
  
  if (payment.order_id) {
    const { data } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('razorpay_order_id', payment.order_id)
      .single();
    order = data;
  }
  
  if (!order && orderId) {
    const { data } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('id', orderId)
      .single();
    order = data;
  }

  if (!order) {
    console.error('Order not found for payment:', payment.id, 'orderId:', orderId);
    return;
  }

  // Update order if not already paid
  if (order.payment_status !== 'paid') {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        razorpay_payment_id: payment.id,
        razorpay_order_id: payment.order_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order payment status:', updateError);
    }
  }
}

async function handlePaymentFailed(event: any) {
  const supabase = createAdminClient();
  const payment = event.payload.payment.entity;
  const orderId = payment.notes?.order_id || payment.order_id;

  if (!orderId) {
    console.error('Order ID not found in payment event');
    return;
  }

  // Validate orderId format
  if (typeof orderId !== 'string' || orderId.length > 100) {
    console.error('Invalid order ID format:', orderId);
    return;
  }

  // Find order by razorpay_order_id first, then by id
  let existingOrder = null;
  
  if (payment.order_id) {
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_order_id', payment.order_id)
      .single();
    existingOrder = data;
  }
  
  if (!existingOrder && orderId) {
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single();
    existingOrder = data;
  }

  if (existingOrder) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingOrder.id);

    if (updateError) {
      console.error('Error updating order payment status:', updateError);
    }
  }
}

async function handleOrderPaid(event: any) {
  const supabase = createAdminClient();
  const order = event.payload.order.entity;
  const orderId = order.notes?.order_id || order.receipt;

  if (!orderId) {
    console.error('Order ID not found in order event');
    return;
  }

  // Validate orderId format
  if (typeof orderId !== 'string' || orderId.length > 100) {
    console.error('Invalid order ID format:', orderId);
    return;
  }

  // Find order by razorpay_order_id first, then by id
  let existingOrder = null;
  
  if (order.id) {
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_order_id', order.id)
      .single();
    existingOrder = data;
  }
  
  if (!existingOrder && orderId) {
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single();
    existingOrder = data;
  }

  if (existingOrder) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        razorpay_order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingOrder.id);

    if (updateError) {
      console.error('Error updating order payment status:', updateError);
    }
  }
}
