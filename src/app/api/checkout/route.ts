import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethodId, promoCode, userId } = body;

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

    const supabase = createAdminClient();

    // Validate product prices from database
    const productIds = items.map((item: { productId?: string; id?: string }) => item.productId || item.id);
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, base_price, name')
      .in('id', productIds);

    if (productError) {
      console.error('Error fetching products:', productError);
      return NextResponse.json(
        { error: 'Failed to validate products' },
        { status: 500 }
      );
    }

    // Create a price map for validation
    const priceMap = new Map(products?.map(p => [p.id, { price: p.base_price, name: p.name }]) || []);

    // Calculate totals with validated prices
    let subtotal = 0;
    const validatedItems = items.map((item: {
      productId?: string;
      id?: string;
      quantity: number;
      price: number;
      name: string;
      variantId?: string;
      packageSize?: string;
    }) => {
      const productId = item.productId || item.id;
      const productData = priceMap.get(productId);
      // Use database price if available, otherwise use submitted price
      const validatedPrice = productData?.price || item.price;
      subtotal += validatedPrice * item.quantity;

      return {
        product_id: productId,
        variant_id: item.variantId || null,
        product_name: productData?.name || item.name,
        variant_weight: item.packageSize || null,
        quantity: item.quantity,
        price: validatedPrice,
      };
    });

    // Calculate discount from promo code
    let discount = 0;
    if (promoCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (coupon) {
        const now = new Date();
        const startDate = coupon.start_date ? new Date(coupon.start_date) : null;
        const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

        const isValidDate = (!startDate || now >= startDate) && (!endDate || now <= endDate);
        const isUnderLimit = !coupon.usage_limit || (coupon.usage_count || 0) < coupon.usage_limit;
        const meetsMinimum = !coupon.min_cart_value || subtotal >= coupon.min_cart_value;

        if (isValidDate && isUnderLimit && meetsMinimum) {
          if (coupon.discount_type === 'percentage') {
            discount = Math.round((subtotal * coupon.discount_value) / 100 * 100) / 100;
          } else {
            discount = coupon.discount_value;
          }

          // Increment usage count
          await supabase
            .from('coupons')
            .update({ usage_count: (coupon.usage_count || 0) + 1 })
            .eq('id', coupon.id);
        }
      }
    }

    // Calculate tax (simplified - use country-based rates)
    const country = shippingAddress.country || 'IN';
    const taxRates: Record<string, number> = {
      'US': 0.08,
      'GB': 0.20,
      'IN': 0.05,
      'AE': 0,
      'EU': 0.19,
    };
    const taxRate = taxRates[country] || 0.05;
    const taxAmount = Math.round((subtotal - discount) * taxRate * 100) / 100;

    // Shipping cost (free for now, can be dynamic later)
    const shippingCost = 0;

    // Calculate total
    const totalAmount = subtotal - discount + shippingCost + taxAmount;

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        status: 'pending',
        total_amount: totalAmount,
        currency: 'INR',
        shipping_address: shippingAddress,
        billing_address: shippingAddress, // Use same as shipping for now
        shipping_method: 'standard',
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        discount_amount: discount,
        coupon_code: promoCode || null,
        payment_status: 'pending',
        payment_method: paymentMethodId || 'card',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = validatedItems.map((item: {
      product_id: string | undefined;
      variant_id: string | null;
      product_name: string;
      variant_weight: string | null;
      quantity: number;
      price: number;
    }) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems as {
        product_id: string | undefined;
        variant_id: string | null;
        product_name: string;
        variant_weight: string | null;
        quantity: number;
        price: number;
        order_id: string;
      }[]);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Don't fail the order, just log the error
    }

    // Award loyalty points (1 point per 10 INR spent)
    if (userId) {
      const pointsEarned = Math.floor(totalAmount / 10);
      if (pointsEarned > 0) {
        await supabase
          .from('loyalty_points')
          .insert({
            customer_id: userId,
            points: pointsEarned,
            type: 'earn',
            description: `Points earned for order ${order.id}`,
            order_id: order.id,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 1 year
          });
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order: {
        id: order.id,
        orderNumber: order.id,
        email: shippingAddress.email,
        status: order.status,
        subtotal,
        discount,
        shippingCost,
        tax: taxAmount,
        total: totalAmount,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
