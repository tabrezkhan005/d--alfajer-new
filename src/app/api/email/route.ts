import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/server';
import {
  sendOrderStatusEmail,
  prepareOrderEmailData,
  sendEmail,
} from '@/src/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, customSubject, customHtml, trackingNumber, trackingUrl } = body;

    console.log('📧 Email API called:', { orderId, status, hasCustomHtml: !!customHtml });

    // Validate request
    if (!orderId && !customHtml) {
      return NextResponse.json(
        { error: 'Either orderId or customHtml is required' },
        { status: 400 }
      );
    }

    // If custom email is provided, send it directly
    if (customHtml && body.to && body.subject) {
      console.log('📧 Sending custom email to:', body.to);
      const result = await sendEmail(body.to, body.subject, customHtml);
      console.log('📧 Custom email result:', result);
      return NextResponse.json(result);
    }

    // Fetch order from database
    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = order as any;

    // Allow overriding tracking for shipped emails (e.g. when admin just assigned AWB)
    if (trackingNumber != null && String(trackingNumber).trim() !== '') {
      orderData.tracking_number = String(trackingNumber).trim();
    }
    if (trackingUrl != null && String(trackingUrl).trim() !== '') {
      orderData.tracking_url = String(trackingUrl).trim();
    }

    console.log('📧 Order found:', {
      id: orderData.id,
      order_number: orderData.order_number,
      email: orderData.email,
      status: orderData.status,
      itemCount: orderData.items?.length || 0,
      total: orderData.total_amount || orderData.total,
    });

    // Prepare email data
    const emailData = prepareOrderEmailData(orderData);

    console.log('📧 Email data prepared:', {
      orderNumber: emailData.orderNumber,
      customerName: emailData.customerName,
      customerEmail: emailData.customerEmail,
      itemCount: emailData.items?.length || 0,
      total: emailData.total,
    });

    // Validate customer email
    if (!emailData.customerEmail || emailData.customerEmail.trim() === '') {
      console.error('❌ No customer email found for order:', orderId);
      return NextResponse.json(
        { error: 'No customer email found for this order' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.customerEmail)) {
      console.error('❌ Invalid customer email format:', emailData.customerEmail);
      return NextResponse.json(
        { error: `Invalid email format: ${emailData.customerEmail}` },
        { status: 400 }
      );
    }

    // Use provided status or order's current status
    const emailStatus = status || orderData.status || 'pending';

    console.log('📧 Sending order status email:', {
      status: emailStatus,
      to: emailData.customerEmail,
    });

    // Send the email
    const result = await sendOrderStatusEmail(emailStatus, emailData);

    console.log('📧 Email send result:', result);

    if (!result.success) {
      console.error('❌ Failed to send email:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('✅ Email sent successfully to:', emailData.customerEmail, 'MessageID:', result.messageId);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      status: emailStatus,
      sentTo: emailData.customerEmail,
      orderNumber: emailData.orderNumber,
      itemCount: emailData.items?.length || 0,
    });
  } catch (error) {
    console.error('❌ Email API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if email service is configured (SMTP)
export async function GET() {
  const isConfigured = !!process.env.SMTP_HOST;

  return NextResponse.json({
    configured: isConfigured,
    from: process.env.EMAIL_FROM || "Not configured",
    replyTo: process.env.EMAIL_REPLY_TO || "Not configured",
    smtpHost: process.env.SMTP_HOST ? `${process.env.SMTP_HOST}:${process.env.SMTP_PORT || "587"}` : "Not set",
  });
}
