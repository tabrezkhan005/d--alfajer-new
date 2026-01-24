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
    const { orderId, status, customSubject, customHtml } = body;

    // Validate request
    if (!orderId && !customHtml) {
      return NextResponse.json(
        { error: 'Either orderId or customHtml is required' },
        { status: 400 }
      );
    }

    // If custom email is provided, send it directly
    if (customHtml && body.to && body.subject) {
      const result = await sendEmail(body.to, body.subject, customHtml);
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
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare email data
    const emailData = prepareOrderEmailData(order as any);

    // Use provided status or order's current status
    const emailStatus = status || order.status || 'pending';

    // Send the email
    const result = await sendOrderStatusEmail(emailStatus, emailData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      status: emailStatus,
      sentTo: emailData.customerEmail,
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if email service is configured
export async function GET() {
  const isConfigured = !!process.env.RESEND_API_KEY;

  return NextResponse.json({
    configured: isConfigured,
    from: process.env.EMAIL_FROM || 'Not configured',
  });
}
