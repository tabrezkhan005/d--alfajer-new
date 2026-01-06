"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronDown, AlertCircle, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { useCartStore } from "@/src/lib/cart-store";
import { useI18n } from "@/src/components/providers/i18n-provider";
import {
  shippingMethods,
  paymentMethods,
  validatePromoCode,
  calculateTax,
  type ShippingAddress,
} from "@/src/lib/checkout";

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
  const { t, formatCurrency } = useI18n();
  const { items, getTotalPrice, clearCart } = useCartStore();

  // Checkout State
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [shippingAddress, setShippingAddress] = useState<Partial<ShippingAddress>>({});
  const [billingAddress, setBillingAddress] = useState<Partial<ShippingAddress>>({});
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [shippingMethodId, setShippingMethodId] = useState('standard');
  const [paymentMethodId, setPaymentMethodId] = useState('card');
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

  // Get selected shipping method
  const selectedShippingMethod = shippingMethods.find(
    (m) => m.id === shippingMethodId
  );

  // Calculate totals
  const subtotal = getTotalPrice();
  const shippingCost = selectedShippingMethod?.price || 0;
  
  let discountAmount = 0;
  if (appliedPromo) {
    discountAmount =
      appliedPromo.type === 'percentage'
        ? (subtotal * appliedPromo.discount) / 100
        : appliedPromo.discount;
  }

  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = calculateTax(subtotalAfterDiscount, shippingAddress.country || 'IN');
  const total = subtotalAfterDiscount + shippingCost + tax;

  // Handle promo code
  const handleApplyPromo = () => {
    setPromoError('');
    const validation = validatePromoCode(promoCode);
    if (!validation.valid) {
      setPromoError('Invalid promo code');
      return;
    }
    setAppliedPromo({
      code: promoCode.toUpperCase(),
      discount: validation.discount!,
      type: validation.type!,
    });
    setPromoCode('');
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      alert(`Order placed successfully! Order #${orderNumber}`);
      clearCart();
      // TODO: Redirect to order confirmation
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-white">
        <Card className="w-full max-w-md bg-white dark:bg-white border-gray-200">
          <CardContent className="pt-6 text-center bg-white dark:bg-white">
            <p className="text-lg font-semibold mb-4">{t('cart.empty')}</p>
            <Button className="w-full">Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 dark:bg-white">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <h1 className="col-span-full text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
          <span className="text-[#009744]">Secure</span> <span className="text-[#AB1F23]">Checkout</span>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-[#009744] to-[#AB1F23] ml-4"></div>
        </h1>
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="shipping" disabled={step !== 'shipping' && !isShippingAddressValid} className="data-[state=active]:bg-[#009744] data-[state=active]:text-white">
                Shipping
              </TabsTrigger>
              <TabsTrigger value="payment" disabled={step === 'shipping'} className="data-[state=active]:bg-[#009744] data-[state=active]:text-white">
                Payment
              </TabsTrigger>
              <TabsTrigger value="review" disabled={step !== 'review'} className="data-[state=active]:bg-[#009744] data-[state=active]:text-white">
                Review
              </TabsTrigger>
            </TabsList>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="space-y-6">
              <Card className="bg-white dark:bg-white border-gray-200">
                <CardHeader className="bg-white dark:bg-white border-b border-gray-200">
                  <CardTitle className="text-gray-800">{t('checkout.shippingAddress')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white dark:bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-800 font-semibold">First Name</Label>
                      <Input
                        placeholder="Enter your first name"
                        className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
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
                      <Label className="text-gray-800 font-semibold">Last Name</Label>
                      <Input
                        placeholder="Enter your last name"
                        className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
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
                    <Label className="text-gray-800 font-semibold">Email</Label>
                    <Input
                      placeholder="Enter your email address"
                      className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
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
                    <Label className="text-gray-800 font-semibold">Phone</Label>
                    <Input
                      placeholder="Enter your phone number"
                      className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-gray-800 font-semibold">Street Address</Label>
                    <Input
                      placeholder="Enter your street address"
                      className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          streetAddress: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-gray-800 font-semibold">Apartment, suite, etc. (optional)</Label>
                    <Input
                      placeholder="Apartment, suite, etc. (optional)"
                      className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          apartment: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-800 font-semibold">City</Label>
                      <Input
                        placeholder="Enter your city"
                        className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-gray-800 font-semibold">State/Province</Label>
                      <Input
                        placeholder="Enter your state/province"
                        className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-800 font-semibold">Postal Code</Label>
                      <Input
                        placeholder="Enter your postal code"
                        className="border-gray-300 focus:border-[#009744] focus:ring-[#009744]"
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-gray-800 font-semibold">Country</Label>
                      <select
                        value={shippingAddress.country || ''}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            country: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#009744] focus:ring-[#009744] bg-white text-gray-800 font-medium"
                      >
                        <option value="" className="bg-white text-gray-800">Select Country</option>
                        <option value="IN" className="bg-white text-gray-800">India</option>
                        <option value="US" className="bg-white text-gray-800">United States</option>
                        <option value="GB" className="bg-white text-gray-800">United Kingdom</option>
                        <option value="AE" className="bg-white text-gray-800">UAE</option>
                        <option value="EU" className="bg-white text-gray-800">Europe</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card className="bg-white dark:bg-white border-gray-200">
                <CardHeader className="bg-white dark:bg-white border-b border-gray-200">
                  <CardTitle className="text-gray-800">{t('checkout.shippingMethod')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 bg-white dark:bg-white">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#009744]"
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={shippingMethodId === method.id}
                        onChange={(e) => setShippingMethodId(e.target.value)}
                        className="mr-3 accent-[#009744]"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                      </p>
                    </label>
                  ))}
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full bg-[#009744] hover:bg-[#2E763B] text-white"
                onClick={() => setStep('payment')}
                disabled={!isShippingAddressValid}
              >
                Continue to Payment
              </Button>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
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
                        <p className="font-semibold">{appliedPromo.code}</p>
                      </div>
                      <button
                        onClick={() => setAppliedPromo(null)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
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
                        Apply
                      </Button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
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
                      placeholder="Add a gift message..."
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
                      <p className="text-sm text-gray-600">Get 10% off your next order</p>
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
            <TabsContent value="review" className="space-y-6">
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
                    <h4 className="font-semibold text-gray-800 mb-2">{t('checkout.shippingMethod')}</h4>
                    <p className="text-sm text-gray-700">{selectedShippingMethod?.name}</p>
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
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white dark:bg-white">
              {/* Items */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm pb-2 border-b"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-[#009744] font-semibold">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                {selectedShippingMethod && (
                  <div className="flex justify-between text-gray-700">
                    <span>{t('cart.shipping')}</span>
                    <span className="font-semibold">
                      {selectedShippingMethod.price === 0
                        ? 'Free'
                        : formatCurrency(selectedShippingMethod.price)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>{t('cart.tax')}</span>
                  <span className="font-semibold">{formatCurrency(tax)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-2 text-[#009744]">
                  <span>{t('cart.total')}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
