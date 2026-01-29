"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, AlertCircle, Check, Truck, Zap, Package } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { useCartStore } from "@/src/lib/cart-store";
import { useI18n } from "@/src/components/providers/i18n-provider";
import { useAuth } from "@/src/lib/auth-context";

import {
  paymentMethods,
  validatePromoCode,
  getCurrencyByCountry,
  countryCodes,
  type ShippingAddress,
} from "@/src/lib/checkout";
import {
  calculateShippingCost,
  fetchPincodeDetails,
  getAvailableShippingOptions,
  FREE_SHIPPING_THRESHOLD,
  type ShippingCalculationResult,
} from "@/src/lib/shipping";
import { toast } from "sonner";
import { loadRazorpayScript, openRazorpayCheckout, verifyRazorpayPayment } from "@/src/lib/razorpay";

export function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until client-side hydration is complete
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return <CheckoutPageContent />;
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatCurrency } = useI18n();
  const { items, getTotalPrice, clearCart, addItem } = useCartStore();
  const { user } = useAuth();


  // Handle product from Buy Now button
  useEffect(() => {
    const productId = searchParams.get('product');
    const variantId = searchParams.get('variant');

    if (productId && items.length === 0) {
      const fetchProduct = async () => {
        try {
          // Dynamic import to avoid circular dependencies
          const { getSupabaseClient } = await import("@/src/lib/supabase/client");
          const supabase = getSupabaseClient();
          const { data: product, error } = await supabase
            .from('products')
            .select('*, variants:product_variants(*)')
            .eq('id', productId)
            .single();

          if (product && !error) {
            let selectedVariant: any = null;
            if (variantId && product.variants) {
                selectedVariant = product.variants.find((v: any) => v.id === variantId);
            }

            if (selectedVariant) {
                 addItem({
                  id: `${product.id}-${selectedVariant.id}`,
                  productId: product.id,
                  variantId: selectedVariant.id,
                  name: `${product.name} - ${selectedVariant.size || selectedVariant.weight}`,
                  price: selectedVariant.price,
                  image: product.images?.[0] || '/images/placeholder.png',
                  packageSize: selectedVariant.size || selectedVariant.weight || 'Standard',
                }, false);
            } else {
                addItem({
                  id: product.id,
                  productId: product.id,
                  name: product.name,
                  price: product.base_price || 0,
                  image: product.images?.[0] || '/images/placeholder.png',
                  packageSize: 'Standard',
                }, false);
            }
          }
        } catch (error) {
          console.error("Error fetching product for buy now:", error);
        }
      };

      fetchProduct();
    }
  }, [searchParams, items.length, addItem]);

  // Checkout State
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [shippingAddress, setShippingAddress] = useState<Partial<ShippingAddress>>({});
  const [billingAddress, setBillingAddress] = useState<Partial<ShippingAddress>>({});
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethodId, setPaymentMethodId] = useState('card');

  // Get currency based on selected country
  const selectedCurrency = getCurrencyByCountry(shippingAddress.country || 'IN');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  } | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(5);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingOptionId, setShippingOptionId] = useState<string>("standard");
  const [shippingDetails, setShippingDetails] = useState<ShippingCalculationResult | null>(null);
  const [fetchingPincode, setFetchingPincode] = useState(false);

  // Calculate totals
  const subtotal = getTotalPrice();

  let discountAmount = 0;
  if (appliedPromo) {
    discountAmount =
      appliedPromo.type === 'percentage'
        ? (subtotal * appliedPromo.discount) / 100
        : appliedPromo.discount;
  }

  const subtotalAfterDiscount = subtotal - discountAmount;
  const total = subtotalAfterDiscount + shippingCost;

  // Handle promo code
  const handleApplyPromo = async () => {
    setPromoError('');
    setIsProcessing(true);
    try {
      const validation = await validatePromoCode(promoCode);
      if (!validation.valid) {
        setPromoError(t('checkout.invalidPromo'));
        return;
      }
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        discount: validation.discount!,
        type: validation.type!,
      });
      setPromoCode('');
      toast(t('checkout.couponApplied'));
    } catch (error) {
      setPromoError(t('checkout.errorPromo'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Validate shipping address
  const isShippingAddressValid = useMemo(() => {
    return (
      shippingAddress.firstName &&
      shippingAddress.lastName &&
      shippingAddress.email &&
      shippingAddress.phone &&
      shippingAddress.streetAddress &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.postalCode &&
      shippingAddress.country
    );
  }, [shippingAddress]);

  // Calculate shipping cost when address changes
  useEffect(() => {
    if (!shippingAddress.country) {
      setShippingCost(0);
      setShippingDetails(null);
      return;
    }

    // Calculate total item count and weight
    const totalItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalWeight = items.reduce((sum, item) => sum + (item.quantity || 1) * 0.5, 0) || 0.5;

    if (totalItemCount <= 0) {
      setShippingCost(0);
      setShippingDetails(null);
      return;
    }

    setCalculatingShipping(true);

    // Use the new zone-based shipping calculation
    const result = calculateShippingCost(
      shippingAddress.country || 'IN',
      shippingAddress.state || '',
      totalItemCount,
      totalWeight,
      subtotal,
      selectedCurrency,
      shippingOptionId
    );

    setShippingDetails(result);
    setShippingCost(result.totalShippingCost);
    setCalculatingShipping(false);
  }, [
    shippingAddress.country,
    shippingAddress.state,
    items,
    subtotal,
    selectedCurrency,
    shippingOptionId,
  ]);

  // Auto-fetch city and state from pincode
  useEffect(() => {
    const fetchData = async () => {
      const pincode = shippingAddress.postalCode;
      // Use selected country or default to 'IN'
      const countryCode = shippingAddress.country || 'IN';

      if (pincode && pincode.length >= 3) {
        setFetchingPincode(true);
        try {
          const details = await fetchPincodeDetails(pincode, countryCode);
          if (details) {
            setShippingAddress((prev) => ({
              ...prev,
              city: details.city,
              state: details.state,
              // If API returns country, we could update it,
              // but usually we queried BY country so it matches.
              // If we want to support auto-detecting country from ZIP alone,
              // we'd need to try multiple endpoints which is slow.
              // For now, trust the API mapping.
            }));
          }
        } catch (error) {
          console.error('Error fetching pincode details:', error);
        } finally {
          setFetchingPincode(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchData, 800);
    return () => clearTimeout(timeoutId);
  }, [shippingAddress.postalCode, shippingAddress.country]);

  // Auto-redirect countdown effect - MUST be before any conditional returns
  useEffect(() => {
    if (orderNumber) {
      // Reset countdown when order is placed
      setRedirectCountdown(5);

      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [orderNumber, router]);

  // Handle proceed
  const handleProceed = () => {
    if (step === 'shipping' && !isShippingAddressValid) {
      alert('Please fill all shipping fields');
      return;
    }
    if (step === 'payment') {
      setStep('review');
      return;
    }
    if (step === 'review') {
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          email: shippingAddress.email,
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          address: shippingAddress,
          phone: shippingAddress.countryCode ? `${shippingAddress.countryCode} ${shippingAddress.phone}` : shippingAddress.phone,
          paymentMethod: paymentMethodId,
          userId: user?.id,
          giftMessage,
          subscription: subscribe ? { enabled: true, frequency: 'monthly' } : null,
          promoCode: appliedPromo?.code,
          currency: selectedCurrency,
          shippingCost: shippingCost, // Include calculated shipping cost
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to place order: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle Razorpay Payment
      if (data.payment && data.payment.gateway === 'razorpay') {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error('Razorpay SDK failed to load');
          setIsProcessing(false);
          return;
        }

        openRazorpayCheckout({
          key: data.payment.razorpayKeyId,
          amount: data.payment.amount,
          currency: data.payment.currency,
          name: "Alfajer",
          description: `Order #${data.orderNumber}`,
          order_id: data.payment.razorpayOrderId,
          prefill: {
            name: shippingAddress.firstName ? `${shippingAddress.firstName} ${shippingAddress.lastName || ''}`.trim() : undefined,
            email: shippingAddress.email || undefined,
            contact: shippingAddress.phone || undefined,
          },
          handler: async (response) => {
            try {
              toast.loading('Verifying payment...');
              const result = await verifyRazorpayPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                data.orderId
              );

              if (result.success) {
                toast.dismiss();
                toast.success('Payment successful!');
                setOrderNumber(data.orderNumber);
                clearCart();
                setIsProcessing(false);
              } else {
                toast.dismiss();
                toast.error(result.error || 'Payment verification failed. Please contact support if payment was deducted.');
                setIsProcessing(false);
              }
            } catch (error: any) {
              toast.dismiss();
              console.error('Payment handler error:', error);
              toast.error('An error occurred during payment verification. Please contact support.');
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              toast.error("Payment cancelled");
            }
          }
        });
        return;
      }

      // If non-Razorpay or Mock
      const newOrderNumber = data.orderNumber || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setOrderNumber(newOrderNumber);

      // Clear cart
      clearCart();
      setIsProcessing(false);

    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error placing your order. Please try again.');
      setIsProcessing(false);
    } finally {
      // Only stop processing if NOT waiting for razorpay
      // We handle setIsProcessing(false) in Razorpay flow separately, but if error/mock we do it here
      // To be safe, we check if logic fell through
      if (paymentMethodId !== 'razorpay' && paymentMethodId !== 'card' && paymentMethodId !== 'upi') {
          setIsProcessing(false);
      } else {
          // Check if we hit error block, then we must stop.
          // Since we are in finally, we can't easily know if we returned early.
          // But 'razorpay' flow returns. 'finally' runs BEFORE return?
          // No, 'finally' runs after try block finishes or throws.
          // If we returned in try, usually finally runs.
          // So this setIsProcessing(false) might clobber the loading state during Razorpay modal.

          // Actually, in `openRazorpayCheckout`, the modal opens, then execution continues?
          // No, `open` is sync-ish UI, but handler is async callback.
          // The function returns.
          // So `finally` runs immediately after `openRazorpayCheckout` call?
          // Yes.
          // So `isProcessing` will explicitly turn false.
          // But I want it to stay true until modal closes?
          // I didn't store `isRazorpayOpen` state.
          // I added `ondismiss` to modal.

          // Simpler: Move `setIsProcessing(false)` only to error/success paths inside non-razorpay flow.
          // But `finally` forces it.
          // I'll rely on the fact that if I return, finally runs.

          // I should remove `finally` block logic and put `setIsProcessing(false)` explicitly where needed.
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 xs:px-3 sm:px-4 bg-white dark:bg-white">
        <Card className="w-full max-w-sm bg-white dark:bg-white border-gray-200">
          <CardContent className="pt-6 text-center bg-white dark:bg-white">
            <p className="text-base xs:text-lg sm:text-xl font-semibold mb-4 text-gray-900">{t('cart.empty')}</p>
            <Button className="w-full bg-[#009744] hover:bg-[#2E763B] text-white" onClick={() => router.push('/')}>{t('checkout.continueShopping')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Order Confirmation Screen
  if (orderNumber) {
    return (
      <div className="min-h-screen bg-white py-8 xs:py-10 sm:py-12 md:py-16 px-2 xs:px-3 sm:px-4 dark:bg-white text-gray-900">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-4 xs:mb-5 sm:mb-6">
            <div className="mx-auto w-12 xs:w-14 sm:w-16 h-12 xs:h-14 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 xs:w-7 sm:w-8 h-6 xs:h-7 sm:h-8 text-[#009744]" />
            </div>
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-1 xs:mb-2 sm:mb-2">{t('checkout.placedSuccessfully')}</h1>
          <p className="text-sm xs:text-base sm:text-lg text-gray-700 mb-4 xs:mb-5 sm:mb-6">{t('checkout.thankYou')}</p>

          <Card className="bg-gray-50 border-gray-200 mb-4 xs:mb-5 sm:mb-6">
            <CardContent className="pt-4 xs:pt-5 sm:pt-6">
              <div className="text-center">
                <p className="text-xs xs:text-sm text-gray-700 mb-1.5 xs:mb-2">{t('checkout.orderNumber')}</p>
                <p className="text-xl xs:text-2xl sm:text-3xl font-bold text-[#009744]">{orderNumber}</p>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs xs:text-sm text-gray-700 mb-2 xs:mb-3">
            {t('checkout.confirmationEmail')}
          </p>

          <p className="text-xs xs:text-sm text-gray-600 mb-4 xs:mb-5 sm:mb-6">
            Redirecting to home page in <span className="font-bold text-[#009744]">{redirectCountdown}</span> {redirectCountdown === 1 ? 'second' : 'seconds'}...
          </p>

          <Button
            size="lg"
            className="w-full bg-[#009744] hover:bg-[#2E763B] text-white font-bold rounded-full text-xs xs:text-sm sm:text-base py-5 xs:py-6 sm:py-7"
            onClick={() => router.push('/')}
          >
            {t('checkout.continueShopping')} {redirectCountdown > 0 && `(${redirectCountdown}s)`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-6 xs:py-7 sm:py-8 md:py-10 dark:bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
        <h1 className="col-span-full text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 xs:mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-gray-900">
          <span className="text-[#009744]">{t('checkout.security') || 'Secure'}</span> <span className="text-[#AB1F23]">{t('checkout.title')}</span>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-[#009744] to-[#AB1F23] w-full sm:ml-4 sm:w-auto"></div>
        </h1>
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="space-y-4 xs:space-y-5 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-0.5 xs:p-1 rounded-lg">
              <TabsTrigger value="shipping" disabled={step !== 'shipping' && !isShippingAddressValid} className="text-xs xs:text-sm sm:text-sm data-[state=active]:bg-[#009744] data-[state=active]:text-white">
                {t('checkout.shippingTab')}
              </TabsTrigger>
              <TabsTrigger value="payment" disabled={step === 'shipping'} className="text-xs xs:text-sm sm:text-sm data-[state=active]:bg-[#009744] data-[state=active]:text-white">
                {t('checkout.paymentTab')}
              </TabsTrigger>
              <TabsTrigger value="review" disabled={step !== 'review'} className="text-xs xs:text-sm sm:text-sm data-[state=active]:bg-[#009744] data-[state=active]:text-white">
                {t('checkout.reviewTab')}
              </TabsTrigger>
            </TabsList>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="space-y-4 xs:space-y-5 sm:space-y-6 text-gray-900">
              <Card className="bg-white dark:bg-white border-gray-200">
                <CardHeader className="bg-white dark:bg-white border-b border-gray-200 p-3 xs:p-4 sm:p-5">
                  <CardTitle className="text-sm xs:text-base sm:text-lg text-gray-800">{t('checkout.shippingAddress')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 xs:space-y-3.5 sm:space-y-4 bg-white dark:bg-white p-3 xs:p-4 sm:p-5">
                  <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                    <div>
                      <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">{t('checkout.firstName')}</Label>
                      <Input
                        placeholder={t('checkout.placeholderFirstName')}
                        className="text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                        value={shippingAddress.firstName || ''}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">{t('checkout.lastName')}</Label>
                      <Input
                        placeholder={t('checkout.placeholderLastName')}
                        className="text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            lastName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">{t('checkout.email')}</Label>
                    <Input
                      placeholder={t('checkout.placeholderEmail')}
                      className="text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                      type="email"
                      value={shippingAddress.email || ''}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">{t('checkout.phone')}</Label>
                    <div className="flex gap-2">
                      <select
                        value={shippingAddress.countryCode || (countryCodes.find(c => c.code === shippingAddress.country)?.dialCode) || '+91'}
                        onChange={(e) => {
                          const selectedCountry = countryCodes.find(c => c.dialCode === e.target.value);
                          setShippingAddress({
                            ...shippingAddress,
                            countryCode: e.target.value,
                            country: selectedCountry?.code || shippingAddress.country || 'IN',
                          });
                        }}
                        className="w-24 xs:w-28 sm:w-32 px-2 xs:px-2.5 sm:px-3 py-2 xs:py-2 sm:py-2 border border-gray-300 rounded-md focus:border-[#009744] focus:ring-[#009744] bg-white text-gray-800 font-medium text-xs xs:text-xs sm:text-sm h-9 xs:h-9 sm:h-10"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.dialCode} className="bg-white text-gray-800">
                            {country.dialCode}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder={t('checkout.placeholderPhone')}
                        className="flex-1 text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                        value={shippingAddress.phone || ''}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">Full Address</Label>
                    <Input
                      placeholder="Enter your complete address"
                      className="text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                      value={shippingAddress.streetAddress || ''}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          streetAddress: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">Landmark</Label>
                    <Input
                      placeholder="Near landmark (optional)"
                      className="text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                      value={shippingAddress.apartment || ''}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          apartment: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                    <div>
                      <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">{t('checkout.postal')} (PIN Code)</Label>
                      <div className="relative">
                        <Input
                          placeholder="Enter PIN/Zip code"
                          className="text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                          value={shippingAddress.postalCode || ''}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              postalCode: e.target.value.replace(/[^a-zA-Z0-9\s-]/g, ''),
                            })
                          }
                        />
                        {fetchingPincode && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[#009744] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">{t('checkout.city')}</Label>
                      <Input
                        placeholder={fetchingPincode ? 'Loading...' : t('checkout.placeholderCity')}
                        className="text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                        value={shippingAddress.city || ''}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                    <div>
                      <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">{t('checkout.state')}</Label>
                      <Input
                        placeholder={fetchingPincode ? 'Loading...' : t('checkout.placeholderState')}
                        className="text-xs xs:text-xs sm:text-sm border-gray-300 focus:border-[#009744] focus:ring-[#009744] h-9 xs:h-9 sm:h-10 px-2.5 xs:px-3 sm:px-3"
                        value={shippingAddress.state || ''}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-sm">{t('checkout.country')}</Label>
                      <select
                        value={shippingAddress.country || ''}
                        onChange={(e) => {
                          const selectedCountry = countryCodes.find(c => c.code === e.target.value);
                          setShippingAddress({
                            ...shippingAddress,
                            country: e.target.value,
                            countryCode: selectedCountry?.dialCode || '+91',
                          });
                        }}
                        className="w-full px-2.5 xs:px-3 sm:px-3 py-2 xs:py-2 sm:py-2 border border-gray-300 rounded-md focus:border-[#009744] focus:ring-[#009744] bg-white text-gray-800 font-medium text-xs xs:text-xs sm:text-sm h-9 xs:h-9 sm:h-10"
                      >
                        <option value="" className="bg-white text-gray-800">{t('checkout.selectCountry')}</option>
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code} className="bg-white text-gray-800">
                            {country.name} ({country.currency})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Options */}
              {shippingAddress.country && (
                <Card className="bg-white dark:bg-white border-gray-200">
                  <CardHeader className="bg-white dark:bg-white border-b border-gray-200 p-3 xs:p-4 sm:p-5">
                    <CardTitle className="text-sm xs:text-base sm:text-lg text-gray-800 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#009744]" />
                      Shipping Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 bg-white dark:bg-white p-3 xs:p-4 sm:p-5">
                    {/* Shipping Zone Info */}
                    {shippingDetails && (
                      <div className="p-3 bg-[#009744]/5 border border-[#009744]/20 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-[#009744]" />
                          <span className="text-sm font-medium text-[#009744]">
                            {shippingDetails.zone.name}
                          </span>
                        </div>
                        <p className="text-xs text-[#009744]/80">
                          {shippingDetails.rateDisplay}
                        </p>
                      </div>
                    )}

                    {/* Shipping Speed Options */}
                    {getAvailableShippingOptions(shippingAddress.country || 'IN').map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                          shippingOptionId === option.id
                            ? 'border-[#009744] bg-[#009744]/5'
                            : 'border-gray-200 hover:border-[#009744]/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingOption"
                            value={option.id}
                            checked={shippingOptionId === option.id}
                            onChange={(e) => setShippingOptionId(e.target.value)}
                            className="accent-[#009744]"
                          />
                          <div className="flex items-center gap-2">
                            {option.id === 'overnight' ? (
                              <Zap className="h-4 w-4 text-[#AB1F23]" />
                            ) : (
                              <Truck className="h-4 w-4 text-[#009744]" />
                            )}
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{option.name}</p>
                              <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {option.extraCostPerPiece > 0 ? (
                            <p className="text-sm font-semibold text-[#AB1F23]">+₹{option.extraCostPerPiece}/piece</p>
                          ) : (
                            <p className="text-sm font-semibold text-[#009744]">Included</p>
                          )}
                        </div>
                      </label>
                    ))}

                    {/* Free Shipping Progress */}
                    {shippingDetails && !shippingDetails.isFreeShipping && shippingDetails.amountForFreeShipping > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-800 mb-2">
                          Add <span className="font-bold text-[#AB1F23]">₹{Math.ceil(shippingDetails.amountForFreeShipping)}</span> more to unlock <span className="font-bold text-[#009744]">FREE Shipping!</span>
                        </p>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#009744] transition-all duration-500 ease-out"
                            style={{ width: `${Math.min((subtotal / shippingDetails.freeShippingThreshold) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {shippingDetails?.isFreeShipping && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-800 flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <span>🎉 You qualify for <span className="font-bold">FREE shipping!</span></span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button
                size="lg"
                className="w-full bg-[#009744] hover:bg-[#2E763B] text-white text-xs xs:text-sm sm:text-base py-5 xs:py-6 sm:py-7"
                onClick={() => setStep('payment')}
                disabled={!isShippingAddressValid}
              >
                {t('checkout.continueToPayment')}
              </Button>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6 text-gray-900">
              <Card className="bg-white dark:bg-white border-gray-200">
                <CardHeader className="bg-white dark:bg-white border-b border-gray-200">
                  <CardTitle className="text-gray-800">{t('checkout.paymentMethod')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 bg-white dark:bg-white">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#009744]"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethodId === method.id}
                        onChange={(e) => setPaymentMethodId(e.target.value)}
                        className="mr-3 accent-[#009744]"
                      />
                      <p className="font-semibold text-gray-800">{method.name}</p>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card className="bg-white dark:bg-white border-gray-200">
                <CardHeader className="bg-white dark:bg-white border-b border-gray-200">
                  <CardTitle className="text-gray-800">{t('checkout.promoCode')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 bg-white dark:bg-white">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check size={20} className="text-green-600" />
                        <p className="font-semibold text-gray-900">{appliedPromo.code}</p>
                      </div>
                      <button
                        onClick={() => setAppliedPromo(null)}
                        className="text-sm text-gray-900 hover:text-gray-700 font-medium"
                      >
                        {t('checkout.remove')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('checkout.enterPromoPlaceholder')}
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError('');
                        }}
                        className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={!promoCode}
                        className="border-[#009744] text-[#009744] hover:bg-[#009744]/10"
                      >
                        {t('checkout.applyCode')}
                      </Button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {promoError}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Gift Message & Subscription */}
              <Card className="bg-white dark:bg-white border-gray-200">
                <CardHeader className="bg-white dark:bg-white border-b border-gray-200">
                  <CardTitle className="text-gray-800">Additional Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white dark:bg-white">
                  <div>
                    <Label className="text-gray-800 font-semibold">{t('checkout.giftMessage')}</Label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder={t('checkout.giftPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#009744] focus:ring-[#009744]"
                      rows={3}
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#009744]">
                    <input
                      type="checkbox"
                      checked={subscribe}
                      onChange={(e) => setSubscribe(e.target.checked)}
                      className="accent-[#009744]"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{t('checkout.subscribe')}</p>
                      <p className="text-sm text-gray-600">{t('checkout.getDiscount')}</p>
                    </div>
                  </label>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full bg-[#009744] hover:bg-[#2E763B] text-white font-bold"
                onClick={() => setStep('review')}
              >
                Review Order
              </Button>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="space-y-6 text-gray-900">
              <Card className="border border-gray-200 bg-white dark:bg-white">
                <CardHeader className="bg-gray-50 dark:bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-gray-800">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white dark:bg-white">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-700">
                      {shippingAddress.firstName} {shippingAddress.lastName}
                      <br />
                      {shippingAddress.streetAddress}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                      <br />
                      {shippingAddress.country}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">{t('checkout.paymentMethod')}</h4>
                    <p className="text-sm text-gray-700">
                      {paymentMethods.find((m) => m.id === paymentMethodId)?.name}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full bg-[#009744] hover:bg-[#2E763B] text-white font-bold text-lg py-6"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : t('checkout.placeOrder')}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-8 border-2 border-[#009744] shadow-lg bg-white dark:bg-white">
            <CardHeader className="bg-gradient-to-r from-[#009744] to-[#2E763B] text-white rounded-t-lg">
              <CardTitle className="text-white">{t('checkout.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white dark:bg-white">
              {/* Items */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto text-gray-900">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm pb-2 border-b text-gray-900"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{t(item.name)}</p>
                      <p className="text-gray-700">{t('checkout.qty')}: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t pt-4 text-gray-900">
                <div className="flex justify-between text-gray-900">
                  <span className="text-gray-900">{t('checkout.subtotal')}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-[#009744] font-semibold">
                    <span>{t('checkout.discount')} ({appliedPromo.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-900">
                  <span className="text-gray-900">{t('cart.shipping') || 'Shipping'}</span>
                  <span className="font-semibold text-gray-900">
                    {calculatingShipping ? (
                      <span className="text-xs">Calculating...</span>
                    ) : shippingCost === 0 ? (
                      t('checkout.free') || 'Free'
                    ) : (
                      formatCurrency(shippingCost)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-2 text-gray-900">
                  <span className="text-gray-900">{t('cart.total')}</span>
                  <span className="text-[#009744] font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
