import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/server';
import { calculateTax, shippingMethods, validatePromoCode } from '@/src/lib/checkout';
import { sendOrderStatusEmail, prepareOrderEmailData } from '@/src/lib/email';
import { automateShiprocketShipment } from '@/src/lib/shiprocket-automation';
// Note: Shiprocket shipment creation is done manually from admin panel
// Automatic creation disabled for security (requires email/password credentials)

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
      paymentMethodId,
      paymentMethod,
      promoCode,
      userId,
      giftMessage,
      subscription,
      currency,
      shippingCost: providedShippingCost
    } = body;

    // Handle both naming conventions for address
    const finalAddress = shippingAddress || address;
    const finalPaymentMethod = paymentMethodId || paymentMethod || 'card';
    // Get currency from request or derive from country
    const orderCurrency = currency || (finalAddress?.country ?
      (finalAddress.country === 'IN' ? 'INR' :
       finalAddress.country === 'US' ? 'USD' :
       finalAddress.country === 'GB' ? 'GBP' :
       finalAddress.country === 'AE' ? 'AED' :
       finalAddress.country === 'EU' ? 'EUR' : 'INR') : 'INR');

    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!finalAddress) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Validate product prices from database
    // Extract product IDs - handle both productId field and composite IDs (productId-variantId)
    const productIds: string[] = items
      .map((item: { productId?: string; id?: string; variantId?: string }): string | null => {
        // First try productId field (most reliable)
        if (item.productId) {
          return item.productId;
        }
        // If no productId, use id field
        if (item.id) {
          // If id is composite (productId-variantId format), extract the product ID part
          // Format: productId-variantId where both are UUIDs
          // UUID format: 8-4-4-4-12 (5 parts, 36 chars total)
          // Composite format: productId-variantId (would be ~73 chars: 36 + 1 + 36)
          if (item.id.includes('-') && item.id.length > 36) {
            // Split by '-' and check if we have more than 5 parts (a UUID has 5 parts)
            const parts = item.id.split('-');
            // If we have exactly 10 parts (2 UUIDs), take first 5
            // If we have more, it might be a different format
            if (parts.length === 10) {
              // Two UUIDs: take first 5 parts for productId
              return parts.slice(0, 5).join('-');
            } else if (parts.length > 5) {
              // More than one UUID, try to extract first UUID
              // UUID parts: 8, 4, 4, 4, 12
              return parts.slice(0, 5).join('-');
            }
          }
          // If it's exactly 36 chars or less, it's likely just a product ID
          return item.id;
        }
        return null;
      })
      .filter((id: string | null): id is string => id !== null && id !== undefined); // Filter out null/undefined

    if (productIds.length === 0) {
      console.error('No valid product IDs found in items:', JSON.stringify(items, null, 2));
      return NextResponse.json({ error: 'No valid products found in cart' }, { status: 400 });
    }

    // Remove duplicates
    const uniqueProductIds: string[] = Array.from(new Set(productIds));
    console.log('Extracted product IDs:', uniqueProductIds);

    const variantIds: string[] = items
      .map((item: { variantId?: string }) => item.variantId)
      .filter((id: string | undefined): id is string => Boolean(id));

    // Fetch products
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, base_price, name')
      .in('id', uniqueProductIds);

    if (productError) {
      console.error('Error fetching products:', productError);
      console.error('Product IDs attempted:', uniqueProductIds);
      return NextResponse.json({
        error: 'Failed to validate products',
        details: productError.message
      }, { status: 500 });
    }

    if (!products || products.length === 0) {
      console.error('No products found for IDs:', uniqueProductIds);
      console.error('Items sent:', JSON.stringify(items, null, 2));
      return NextResponse.json({
        error: 'One or more products not found in database',
        details: `Products with IDs ${uniqueProductIds.join(', ')} not found. Please refresh your cart and try again.`
      }, { status: 404 });
    }

    // Check if all requested products were found
    const foundProductIds = new Set(products.map(p => p.id));
    const missingProductIds = uniqueProductIds.filter(id => !foundProductIds.has(id));

    if (missingProductIds.length > 0) {
      console.error('Some products not found:', missingProductIds);
      console.error('Found products:', Array.from(foundProductIds));
      return NextResponse.json({
        error: 'One or more products not found in database',
        details: `The following products are no longer available: ${missingProductIds.join(', ')}. Please remove them from your cart and try again.`
      }, { status: 404 });
    }

    // Fetch variants if needed
    let variants: any[] = [];
    if (variantIds.length > 0) {
        const { data: variantsData, error: variantError } = await supabase
            .from('product_variants')
            .select('id, price, product_id, size')
            .in('id', variantIds);

        if (variantError) {
             console.error('Error fetching variants:', variantError);
             // We won't block, but validation might fail if strict
        } else {
            variants = variantsData || [];
        }
    }

    // Create a price map for validation
    // Map: ProductID -> Product Data
    const productMap = new Map(products?.map(p => [p.id, p]) || []);
    // Map: VariantID -> Variant Data
    const variantMap = new Map(variants.map(v => [v.id, v]));

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
      const productData = productMap.get(productId || '');
      const variantData = item.variantId ? variantMap.get(item.variantId) : null;

      // Prioritize variant price, then product base price, then item price (fallback/trust client for custom items if valid)
      // Ideally we trust DB prices.
      let validatedPrice = item.price;
      let name = item.name;

      if (variantData) {
          validatedPrice = variantData.price || 0;
      } else if (productData) {
          validatedPrice = productData.base_price || 0;
          name = productData.name;
      }

      subtotal += validatedPrice * item.quantity;

      return {
        product_id: productId,
        variant_id: item.variantId || null,
        name: name,
        quantity: item.quantity,
        price: validatedPrice,
        total: validatedPrice * item.quantity,
        image_url: item.image || null,
      };
    });

    // Use provided shipping cost or calculate if not provided
    let shippingCost = providedShippingCost || 0;

    // If shipping cost not provided and address is in India, try to calculate
    if (shippingCost === 0 && finalAddress?.country === 'IN' && finalAddress?.postalCode) {
      // Calculate total weight
      const totalWeight = validatedItems.reduce((sum: number, item: { quantity: number }) => {
        return sum + (item.quantity || 1) * 0.5; // Default 0.5kg per item
      }, 0) || 0.5;

      // Try to get Shiprocket token from environment or calculate shipping
      // For now, we'll use the provided shipping cost
      // If not provided, shipping will be 0
    }

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

    // Create the order - short, meaningful order number
    const orderNumber = `ALF-${String(Date.now()).slice(-5)}${Math.floor(Math.random() * 10)}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        status: 'pending',
        order_number: orderNumber,
        email: email || finalAddress.email,
        subtotal: subtotal,
        total_amount: totalAmount, // Use total_amount instead of total
        currency: orderCurrency,
        shipping_address: finalAddress,
        billing_address: finalAddress,
        shipping_method: 'standard', // Default since shipping method is removed
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

    // Create order items - map to correct database schema
    const orderItems = validatedItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      name: item.name,
      sku: item.sku || item.product_id || 'SKU-UNKNOWN',
      image_url: item.image_url || null,
      quantity: item.quantity,
      price: item.price, // Price per unit
      price_at_purchase: item.price, // Also set price_at_purchase for compatibility
      total: item.total, // Total for this line item
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      console.error('Order items data:', JSON.stringify(orderItems, null, 2));
      // If order items fail, we should still return success but log the error
      // The order exists but items might be missing - admin can manually add them
      console.warn('Order created but order items insertion failed. Order ID:', order.id);
      return NextResponse.json({
        error: 'Order created but items failed to save',
        details: itemsError.message,
        orderId: order.id
      }, { status: 500 });
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
              amount: Math.round(totalAmount * 100), // Convert to smallest currency unit (paise for INR, cents for USD, etc.)
              currency: orderCurrency,
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

    // AUTOMATE SHIPROCKET SHIPMENT (Only for COD/Mock orders here)
    // For online payments, automation happens in webhook/verification after payment success
    const isOnlinePayment = finalPaymentMethod === 'razorpay' || finalPaymentMethod === 'card' || finalPaymentMethod === 'upi';

    if (!isOnlinePayment) {
      // Fire-and-forget: don't await so the response is sent immediately
      automateShiprocketShipment(order.id)
        .then(() => console.log(`🚀 Auto-ship completed for order ${order.id}`))
        .catch((shipError) => console.error("❌ Auto-shipping failed:", shipError));
    }

    if (!isOnlinePayment) {
      const customerEmail = email || finalAddress?.email;
      if (customerEmail && String(customerEmail).trim()) {
        try {
          const emailData = prepareOrderEmailData({
            id: order.id,
            order_number: orderNumber,
            email: customerEmail,
            status: 'confirmed',
            subtotal,
            shipping_cost: shippingCost,
            tax: taxAmount,
            discount,
            total_amount: totalAmount,
            currency: orderCurrency,
            shipping_address: finalAddress,
            created_at: order.created_at || new Date().toISOString(),
            items: validatedItems.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image_url: item.image_url,
            })),
          });

          sendOrderStatusEmail('confirmed', emailData)
            .then((result) => {
              if (result.success) console.log('Order confirmation email sent:', result.messageId);
              else console.error('Order confirmation email failed:', result.error);
            })
            .catch((err) => console.error('Order confirmation email error:', err));
        } catch (emailError) {
          console.error('Error preparing order confirmation email:', emailError);
        }
      } else {
        console.warn('Order confirmation not sent: no customer email (COD order)', order.id);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: orderNumber,
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
