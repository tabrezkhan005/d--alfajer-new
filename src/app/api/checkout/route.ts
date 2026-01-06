import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethodId, promoCode } = body;

    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Calculate totals
    const subtotal = items.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );

    const discount = promoCode ? calculatePromoDiscount(promoCode, subtotal) : 0;
    const shippingCost = 0; // Free shipping
    const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100;
    const total = subtotal - discount + shippingCost + tax;

    // Create order object
    const order = {
      id: orderNumber,
      orderNumber,
      email: shippingAddress.email,
      status: 'pending',
      lineItems: items,
      shippingAddress,
      shippingMethodId: 'standard',
      paymentMethodId,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      promoCode,
      createdAt: new Date().toISOString(),
    };

    // TODO: Save order to database
    // TODO: Process payment
    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      orderId: orderNumber,
      order,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}

function calculatePromoDiscount(code: string, subtotal: number): number {
  const promoCodes: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
    SAVE10: { discount: 10, type: 'percentage' },
    SAVE20: { discount: 20, type: 'percentage' },
    FLAT500: { discount: 500, type: 'fixed' },
    WELCOME5: { discount: 5, type: 'percentage' },
  };

  const promo = promoCodes[code.toUpperCase()];
  if (!promo) return 0;

  return promo.type === 'percentage'
    ? Math.round((subtotal * promo.discount) / 100 * 100) / 100
    : promo.discount;
}
