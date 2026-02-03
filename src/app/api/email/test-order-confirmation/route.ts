import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail, sendEmail } from '@/src/lib/email'
import { orderConfirmationEmail, type OrderEmailData } from '@/src/lib/email/templates'

const TEST_RECIPIENT = 'tabrezkhangnt@gmail.com'

/**
 * GET /api/email/test-order-confirmation
 * Returns instructions to test the order confirmation email.
 */
export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to this URL to send a test order confirmation email.',
    recipient: TEST_RECIPIENT,
    postUrl: '/api/email/test-order-confirmation',
    example: 'curl -X POST http://localhost:3000/api/email/test-order-confirmation -H "Content-Type: application/json" -d "{}"',
  })
}

/**
 * POST /api/email/test-order-confirmation
 * Sends a sample order confirmation email to the test recipient.
 * FROM address uses EMAIL_FROM env (e.g. Al Fajer <orders.alfajer@gmail.com>).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const recipient = (body.to || TEST_RECIPIENT) as string
    const to = typeof recipient === 'string' && recipient.includes('@') ? recipient : TEST_RECIPIENT

    const mockOrderId = 'ORD-TEST-' + Date.now()
    const mockProductId1 = 'prod_test_saffron_001'
    const mockProductId2 = 'prod_test_shilajit_002'
    // Use Resend sandbox sender by default so the test delivers even if EMAIL_FROM is Gmail (unverified)
    const useTestFrom = body.useTestFrom !== false

    const emailData: OrderEmailData = {
      orderNumber: mockOrderId,
      customerName: 'Test Customer',
      customerEmail: to,
      items: [
        { name: `Premium Saffron 1g (Product ID: ${mockProductId1})`, quantity: 2, price: 599 },
        { name: `Pure Shilajit 20g (Product ID: ${mockProductId2})`, quantity: 1, price: 899 },
      ],
      subtotal: 2097,
      shippingCost: 99,
      tax: 0,
      discount: 100,
      total: 2096,
      currency: 'INR',
      shippingAddress: {
        name: 'Test Customer',
        address: '123 Test Street, Block A',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
        phone: '+91 9876543210',
      },
      estimatedDelivery: 'Mon, Jan 27 – Tue, Jan 28',
      orderDate: new Date().toISOString(),
      status: 'confirmed',
    }

    const result = useTestFrom
      ? await (async () => {
          const template = orderConfirmationEmail(emailData)
          return sendEmail(
            emailData.customerEmail,
            template.subject,
            template.html,
            'Al Fajer <orders.alfajer@gmail.com>',
            'Al Fajer <onboarding@resend.dev>'
          )
        })()
      : await sendOrderConfirmationEmail(emailData)

    if (!result.success) {
      const isResendDomainError =
        result.error?.toLowerCase().includes('domain') ||
        result.error?.toLowerCase().includes('not verified')
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          ...(isResendDomainError && {
            fix: 'Resend cannot send from @gmail.com. Use a verified domain in Resend (e.g. orders@yourdomain.com) or for testing set EMAIL_FROM to "Al Fajer <onboarding@resend.dev>" in .env',
          }),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to,
      orderId: mockOrderId,
      productIds: [mockProductId1, mockProductId2],
      message: 'Order confirmation test email sent. Check inbox (and spam) for ' + to,
    })
  } catch (error) {
    console.error('Test order confirmation email error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send test email',
      },
      { status: 500 }
    )
  }
}
