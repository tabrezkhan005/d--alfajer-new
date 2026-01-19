import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/server';
import { calculateTax, shippingMethods, validatePromoCode } from '@/src/lib/checkout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      shippingAddress,
      address,
      email,
      name,
      phone,
      shippingMethod,
      paymentMethodId,
      paymentMethod,
      promoCode,
      userId,
      giftMessage,
      subscription
    } = body;

    // Handle both naming conventions for address
    const finalAddress = shippingAddress || address;
    const finalPaymentMethod = paymentMethodId || paymentMethod || 'card';
    const finalShippingMethod = shippingMethod || 'standard';

    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!finalAddress) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to validate products' }, { status: 500 });
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
      image?: string;
    }) => {
      const productId = (item.productId || item.id) as string;
      const productData = priceMap.get(productId || '');
      const validatedPrice = productData?.price || item.price;
      subtotal += validatedPrice * item.quantity;

      return {
        product_id: productId,
        variant_id: item.variantId || null,
        name: productData?.name || item.name,
        quantity: item.quantity,
        price: validatedPrice,
        total: validatedPrice * item.quantity,
        image_url: item.image || null,
      };
    });

    // Get shipping cost
    const selectedShipping = shippingMethods.find(m => m.id === finalShippingMethod) || shippingMethods[0];
    const shippingCost = selectedShipping?.price || 0;

    // Calculate discount from promo code
    let discount = 0;
    if (promoCode) {
      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      // Cast to any to work with actual database schema (types may be out of sync)
      const coupon = couponData as any;
      if (coupon) {
        const now = new Date();
        const startDate = coupon.valid_from ? new Date(coupon.valid_from) : null;
        const endDate = coupon.valid_until ? new Date(coupon.valid_until) : null;

        const isValidDate = (!startDate || now >= startDate) && (!endDate || now <= endDate);
        const isUnderLimit = !coupon.usage_limit || (coupon.used_count || 0) < coupon.usage_limit;
        const meetsMinimum = !coupon.min_order_value || subtotal >= coupon.min_order_value;

        if (isValidDate && isUnderLimit && meetsMinimum) {
          if (coupon.discount_type === 'percentage') {
            discount = Math.round((subtotal * coupon.discount_value) / 100 * 100) / 100;
            // Apply max_discount limit if set
            if (coupon.max_discount && discount > coupon.max_discount) {
              discount = coupon.max_discount;
            }
          } else {
            discount = coupon.discount_value;
          }

          // Increment usage count
          await supabase
            .from('coupons')
            .update({ used_count: (coupon.used_count || 0) + 1 } as any)
            .eq('id', coupon.id);
        }
      }
    }

    // Calculate tax
    const country = finalAddress.country || 'IN';
    const taxAmount = calculateTax(subtotal - discount, country);

    // Calculate total
    const totalAmount = subtotal - discount + shippingCost + taxAmount;

    // Create the order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        status: 'pending',
        order_number: orderNumber,
        email: email || finalAddress.email,
        subtotal: subtotal,
        total: totalAmount,
        currency: 'INR',
        shipping_address: finalAddress,
        billing_address: finalAddress,
        shipping_method: finalShippingMethod,
        shipping_cost: shippingCost,
        tax: taxAmount,
        discount: discount,
        promo_code: promoCode || null,
        payment_status: 'pending',
        payment_method: finalPaymentMethod,
        gift_message: giftMessage || null,
      } as any)
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItems = validatedItems.map((item: any) => ({
      ...item,
      order_id: order.id,
      sku: item.sku || item.product_id || 'SKU-UNKNOWN', // Ensure SKU is populated
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
    }

    // Handle Razorpay payment if selected
    let paymentResult: any = { success: true };

    if (finalPaymentMethod === 'razorpay' || finalPaymentMethod === 'card' || finalPaymentMethod === 'upi') {
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

      if (razorpayKeyId && razorpayKeySecret) {
        try {
          const rpResp = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64'),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: Math.round(totalAmount * 100), // in paise
              currency: 'INR',
              receipt: order.id,
              payment_capture: 1,
            }),
          });

          const rpData = await rpResp.json();

          if (rpData.id) {
            paymentResult = {
              gateway: 'razorpay',
              razorpayOrderId: rpData.id,
              razorpayKeyId: razorpayKeyId,
              amount: rpData.amount,
              currency: rpData.currency,
            };
          } else {
            console.error('Razorpay order creation failed:', rpData);
            paymentResult = { success: false, error: 'razorpay_error', message: rpData.error?.description };
          }
        } catch (e) {
          console.error('Razorpay order creation failed', e);
          paymentResult = { success: false, error: 'razorpay_error' };
        }
      } else {
        // No Razorpay keys configured - mark as COD or mock payment
        paymentResult = { success: true, gateway: 'mock', message: 'Payment gateway not configured - using mock payment' };

        // Update order as paid for demo
        await supabase.from('orders').update({
          payment_status: 'paid',
          status: 'processing'
        }).eq('id', order.id);
      }
    }

    // Create Subscription if requested
    if (subscription?.enabled && userId) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_name: `Monthly Subscription - ${order.id}`,
          amount: totalAmount,
          currency: 'INR',
          frequency: subscription.frequency || 'monthly',
          status: 'active',
          start_date: new Date().toISOString(),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (subError) {
        console.error('Error creating subscription:', subError);
      }
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
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          });
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.id,
      payment: paymentResult,
      order: {
        id: order.id,
        email: finalAddress.email,
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
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout failed' }, { status: 500 });
  }
}
