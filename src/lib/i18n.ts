// Internationalization configuration
export type Language = 'en' | 'ar' | 'hi';
export type Currency = 'INR' | 'USD' | 'AED' | 'GBP' | 'EUR';

export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
} as const;

export const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 1 },
  USD: { symbol: '$', name: 'US Dollar', rate: 0.012 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', rate: 0.044 },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.0095 },
  EUR: { symbol: '€', name: 'Euro', rate: 0.011 },
} as const;

// Translation strings
export const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.categories': 'Categories',
    'nav.offers': 'Offers',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.account': 'Account',
    'nav.cart': 'Cart',
    'product.addToCart': 'Add to Cart',
    'product.outOfStock': 'Out of Stock',
    'product.inStock': 'In Stock',
    'product.price': 'Price',
    'product.rating': 'Rating',
    'product.reviews': 'Reviews',
    'product.selectVariant': 'Select Size',
    'cart.empty': 'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.tax': 'Tax',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'checkout.shippingAddress': 'Shipping Address',
    'checkout.billingAddress': 'Billing Address',
    'checkout.shippingMethod': 'Shipping Method',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.promoCode': 'Promo Code',
    'checkout.giftMessage': 'Gift Message',
    'checkout.subscribe': 'Subscribe for savings',
    'checkout.placeOrder': 'Place Order',
    'payment.creditCard': 'Credit/Debit Card',
    'payment.upi': 'UPI',
    'payment.wallet': 'Wallet',
    'payment.applePay': 'Apple Pay',
    'payment.googlePay': 'Google Pay',
    'currency.select': 'Select Currency',
    'language.select': 'Select Language',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.categories': 'الفئات',
    'nav.offers': 'العروض',
    'nav.about': 'حول',
    'nav.blog': 'مدونة',
    'nav.account': 'حسابي',
    'nav.cart': 'السلة',
    'product.addToCart': 'أضف إلى السلة',
    'product.outOfStock': 'غير متوفر',
    'product.inStock': 'متوفر',
    'product.price': 'السعر',
    'product.rating': 'التقييم',
    'product.reviews': 'التقييمات',
    'product.selectVariant': 'اختر الحجم',
    'cart.empty': 'سلتك فارغة',
    'cart.subtotal': 'المجموع الجزئي',
    'cart.shipping': 'الشحن',
    'cart.tax': 'الضريبة',
    'cart.total': 'الإجمالي',
    'cart.checkout': 'الذهاب إلى الدفع',
    'checkout.shippingAddress': 'عنوان الشحن',
    'checkout.billingAddress': 'عنوان الفاتورة',
    'checkout.shippingMethod': 'طريقة الشحن',
    'checkout.paymentMethod': 'طريقة الدفع',
    'checkout.promoCode': 'رمز العرض',
    'checkout.giftMessage': 'رسالة هدية',
    'checkout.subscribe': 'الاشتراك للحصول على الخصم',
    'checkout.placeOrder': 'تأكيد الطلب',
    'payment.creditCard': 'بطاقة ائتمان',
    'payment.upi': 'يوبي آي',
    'payment.wallet': 'المحفظة',
    'payment.applePay': 'Apple Pay',
    'payment.googlePay': 'Google Pay',
    'currency.select': 'اختر العملة',
    'language.select': 'اختر اللغة',
  },
  hi: {
    'nav.home': 'होम',
    'nav.categories': 'श्रेणियां',
    'nav.offers': 'ऑफर्स',
    'nav.about': 'परिचय',
    'nav.blog': 'ब्लॉग',
    'nav.account': 'खाता',
    'nav.cart': 'कार्ट',
    'product.addToCart': 'कार्ट में जोड़ें',
    'product.outOfStock': 'स्टॉक से बाहर',
    'product.inStock': 'स्टॉक में',
    'product.price': 'कीमत',
    'product.rating': 'रेटिंग',
    'product.reviews': 'समीक्षाएं',
    'product.selectVariant': 'आकार चुनें',
    'cart.empty': 'आपकी कार्ट खाली है',
    'cart.subtotal': 'उप कुल',
    'cart.shipping': 'शिपिंग',
    'cart.tax': 'कर',
    'cart.total': 'कुल',
    'cart.checkout': 'चेकआउट पर जाएं',
    'checkout.shippingAddress': 'शिपिंग पता',
    'checkout.billingAddress': 'बिलिंग पता',
    'checkout.shippingMethod': 'शिपिंग विधि',
    'checkout.paymentMethod': 'भुगतान विधि',
    'checkout.promoCode': 'प्रचार कोड',
    'checkout.giftMessage': 'उपहार संदेश',
    'checkout.subscribe': 'बचत के लिए सदस्यता लें',
    'checkout.placeOrder': 'ऑर्डर रखें',
    'payment.creditCard': 'क्रेडिट/डेबिट कार्ड',
    'payment.upi': 'यूपीआई',
    'payment.wallet': 'वॉलेट',
    'payment.applePay': 'Apple Pay',
    'payment.googlePay': 'Google Pay',
    'currency.select': 'मुद्रा चुनें',
    'language.select': 'भाषा चुनें',
  },
};

export function t(key: string, lang: Language = 'en'): string {
  return translations[lang][key as keyof typeof translations['en']] || key;
}

export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  const currencyInfo = CURRENCIES[currency];
  return `${currencyInfo.symbol}${amount.toFixed(2)}`;
}

export function convertCurrency(amount: number, fromCurrency: Currency = 'INR', toCurrency: Currency = 'INR'): number {
  const fromRate = CURRENCIES[fromCurrency].rate;
  const toRate = CURRENCIES[toCurrency].rate;
  return (amount * toRate) / fromRate;
}
