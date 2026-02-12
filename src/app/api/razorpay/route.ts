import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/server';
import { sendOrderStatusEmail, prepareOrderEmailData } from '@/src/lib/email';
import { automateShiprocketShipment } from '@/src/lib/shiprocket-automation';
import crypto from 'crypto';

// Increase serverless function timeout for Shiprocket + email operations
export const maxDuration = 60;
// POST: Create Razorpay order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount } = body;

    // Validate input
    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order ID or amount' },
        { status: 400 }
      );
    }

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Validate amount (minimum 1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: 'Minimum order amount is ₹1' },
        { status: 400 }
      );
    }

    // Create Razorpay order with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: orderId.substring(0, 40), // Razorpay receipt max 40 chars
          payment_capture: 1, // Auto-capture payment
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.description || errorData.error?.message || `Razorpay API error (${response.status})`;

        console.error('Razorpay order creation failed:', {
          status: response.status,
          error: errorData,
        });

        return NextResponse.json(
          { error: errorMessage },
          { status: response.status >= 500 ? 500 : 400 }
        );
      }

      const data = await response.json();

      if (data.error) {
        return NextResponse.json(
          { error: data.error.description || data.error.message || 'Failed to create payment order' },
          { status: 400 }
        );
      }

      if (!data.id) {
        console.error('Invalid Razorpay response:', data);
        return NextResponse.json(
          { error: 'Invalid response from payment gateway' },
          { status: 500 }
        );
      }

      // Store Razorpay order ID in database for tracking
      const supabase = createAdminClient();
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          razorpay_order_id: data.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Failed to update order with Razorpay order ID:', updateError);
        // Don't fail the request if this update fails
      }

      return NextResponse.json({
        success: true,
        razorpayOrderId: data.id,
        razorpayKeyId: razorpayKeyId,
        amount: data.amount,
        currency: data.currency || 'INR',
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Payment gateway request timeout. Please try again.' },
          { status: 504 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT: Verify Razorpay payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeySecret) {
      console.error('Razorpay secret key not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Verify signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    )) {
      console.error('Invalid payment signature detected', {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
      });
      return NextResponse.json(
        { error: 'Invalid payment signature. Payment verification failed.' },
        { status: 400 }
      );
    }

    // Update order status in database
    const supabase = createAdminClient();

    // First check if order exists and get current status
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, payment_status, status')
      .eq('id', orderId)
      .single();

    if (fetchError || !existingOrder) {
      console.error('Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prevent duplicate payment processing
    if (existingOrder.payment_status === 'paid') {
      console.warn('Order already marked as paid:', orderId);
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        paymentId: razorpay_payment_id,
      });
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status. Please contact support.' },
        { status: 500 }
      );
    }

    // Send order confirmation email on successful payment (only if customer email present)
    try {
      const { data: completedOrder } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId)
        .single();

      if (completedOrder) {
        const emailData = prepareOrderEmailData(completedOrder as any);
        if (emailData.customerEmail && emailData.customerEmail.trim()) {
          const result = await sendOrderStatusEmail('confirmed', emailData);
          if (result.success) console.log('✅ Payment success email sent:', result.messageId);
          else console.error('❌ Failed to send payment success email:', result.error);
        } else {
          console.warn('Order confirmation not sent: no customer email for order', orderId);
        }
      }
    } catch (emailError) {
      console.error('Error in payment success email flow:', emailError);
    }

    // AUTOMATE SHIPROCKET SHIPMENT for prepaid orders
    try {
        console.log(`🚀 Triggering auto-ship for PREPAID order ${orderId}`);
        // We await it for reliability
        await automateShiprocketShipment(orderId);
    } catch (shipError) {
        console.error("❌ Auto-shipping failed:", shipError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}
