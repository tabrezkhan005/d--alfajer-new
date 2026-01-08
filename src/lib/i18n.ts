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
    // Announcement Bar
    'announcement.shipping': 'Free shipping on orders above ₹999',
    'announcement.quality': 'Premium quality dry fruits & spices',
    'announcement.worldwide': 'Delivering worldwide',
    'announcement.authentic': '100% authentic products guaranteed',
    
    // Navigation
    'nav.home': 'Home',
    'nav.categories': 'Categories',
    'nav.offers': 'Offers',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.account': 'Account',
    'nav.cart': 'Cart',
    'nav.search': 'Search',
    'nav.contact': 'Contact',
    
    // Products
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.outOfStock': 'Out of Stock',
    'product.inStock': 'In Stock',
    'product.price': 'Price',
    'product.rating': 'Rating',
    'product.reviews': 'Reviews',
    'product.selectVariant': 'Select Size',
    'product.description': 'Description',
    'product.specifications': 'Specifications',
    'product.origin': 'Origin',
    'product.packing': 'Packing',
    'product.premium': 'Premium Dry Fruits',
    'product.allProducts': 'All Products',
    
    // Cart
    'cart.empty': 'Your cart is empty',
    'cart.emptyShopping': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.tax': 'Tax',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.itemCount': 'Items in Cart',
    'cart.removeItem': 'Remove',
    'cart.updateQuantity': 'Update Quantity',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shippingAddress': 'Shipping Address',
    'checkout.billingAddress': 'Billing Address',
    'checkout.shippingMethod': 'Shipping Method',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.promoCode': 'Promo Code',
    'checkout.applyCode': 'Apply Code',
    'checkout.giftMessage': 'Gift Message',
    'checkout.subscribe': 'Subscribe for savings',
    'checkout.placeOrder': 'Place Order',
    'checkout.orderSummary': 'Order Summary',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.email': 'Email',
    'checkout.phone': 'Phone Number',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.state': 'State/Province',
    'checkout.postal': 'Postal Code',
    'checkout.country': 'Country',
    
    // Payment
    'payment.creditCard': 'Credit/Debit Card',
    'payment.upi': 'UPI',
    'payment.wallet': 'Wallet',
    'payment.applePay': 'Apple Pay',
    'payment.googlePay': 'Google Pay',
    'payment.netBanking': 'Net Banking',
    
    // Filters
    'filter.priceRange': 'Price Range',
    'filter.packageSize': 'Package Size',
    'filter.origin': 'Origin',
    'filter.certification': 'Certification',
    'filter.availability': 'Availability',
    'filter.inStockOnly': 'In Stock Only',
    'filter.onSaleOnly': 'On Sale Only',
    'filter.apply': 'Apply Filters',
    'filter.reset': 'Reset',
    'filter.min': 'Min',
    'filter.max': 'Max',
    
    // Sort
    'sort.featured': 'Featured',
    'sort.newest': 'Newest',
    'sort.priceLow': 'Price: Low to High',
    'sort.priceHigh': 'Price: High to Low',
    'sort.popularity': 'Popularity',
    'sort.rating': 'Highest Rated',
    
    // General
    'currency.select': 'Select Currency',
    'language.select': 'Select Language',
    'common.search': 'Search',
    'common.filter': 'Filters',
    'common.sort': 'Sort by',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.showing': 'Showing',
    'common.of': 'of',
    'common.products': 'products',
    
    // Header
    'header.logo': 'Alfajer',
    'header.account': 'Account',
    'header.favorites': 'Favorites',
    'header.support': 'Support',
    'header.about': 'About Us',
    'header.contact': 'Contact Us',
    
    // Hero Section
    'hero.title': 'Premium Dry Fruits & Spices',
    'hero.subtitle': 'Handpicked, organic, and packed with goodness',
    'hero.cta': 'Shop Now',
    
    // Collections
    'collection.exquisite': 'Exquisite Collection',
    'collection.featured': 'Featured Products',
    'collection.bestsellers': 'Best Sellers',
    'collection.newArrivals': 'New Arrivals',
    'collection.specialty': 'Specialty Items',
    
    // Product Details
    'product.ingredients': 'Ingredients',
    'product.nutritionFacts': 'Nutrition Facts',
    'product.servingSize': 'Serving Size',
    'product.calories': 'Calories',
    'product.protein': 'Protein',
    'product.fat': 'Fat',
    'product.carbs': 'Carbohydrates',
    'product.fiber': 'Fiber',
    'product.allergenInfo': 'Allergen Information',
    'product.certifications': 'Certifications',
    'product.relatedProducts': 'Related Products',
    'product.quantity': 'Quantity',
    'product.selectSize': 'Select Size',
    'product.salePrice': 'Sale Price',
    'product.originalPrice': 'Original Price',
    'product.viewDetails': 'View Details',
    
    // Newsletter
    'newsletter.title': 'Subscribe to Our Newsletter',
    'newsletter.subtitle': 'Get exclusive offers and updates',
    'newsletter.placeholder': 'Enter your email',
    'newsletter.subscribe': 'Subscribe',
    'newsletter.success': 'Thank you for subscribing!',
    
    // Footer
    'footer.about': 'About Us',
    'footer.contact': 'Contact Us',
    'footer.terms': 'Terms & Conditions',
    'footer.privacy': 'Privacy Policy',
    'footer.shipping': 'Shipping Policy',
    'footer.returns': 'Returns & Exchanges',
    'footer.faq': 'FAQ',
    'footer.blog': 'Blog',
    'footer.company': 'Company',
    'footer.legal': 'Legal',
    'footer.social': 'Follow Us',
    'footer.copyright': '© 2024 Alfajer. All rights reserved.',
    'footer.address': 'Address',
    'footer.email': 'Email',
    'footer.phone': 'Phone',
    'footer.hours': 'Business Hours',
    
    // Cart Page
    'cart.addToCart': 'Add to Cart',
    'cart.quantity': 'Quantity',
    'cart.price': 'Price',
    'cart.deleteItem': 'Delete Item',
    'cart.continueShopping': 'Continue Shopping',
    'cart.estimateShipping': 'Estimate Shipping',
    'cart.applyPromo': 'Apply Promo Code',
    'cart.proceedCheckout': 'Proceed to Checkout',
    'cart.itemsInCart': 'Item(s) in your cart',
    
    // Checkout Page
    'checkout.orderPlaced': 'Order Placed Successfully',
    'checkout.orderNumber': 'Order Number',
    'checkout.estimatedDelivery': 'Estimated Delivery',
    'checkout.trackOrder': 'Track Order',
    'checkout.continueShoppingBtn': 'Continue Shopping',
    'checkout.expressShipping': 'Express Shipping',
    'checkout.standardShipping': 'Standard Shipping',
    'checkout.storePickup': 'Store Pickup',
  },
  ar: {
    // Announcement Bar
    'announcement.shipping': 'شحن مجاني للطلبات فوق 999 روبية',
    'announcement.quality': 'الفواكه الجافة والتوابل عالية الجودة',
    'announcement.worldwide': 'التسليم في جميع أنحاء العالم',
    'announcement.authentic': '100٪ منتجات أصلية مضمونة',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.categories': 'الفئات',
    'nav.offers': 'العروض',
    'nav.about': 'حول',
    'nav.blog': 'مدونة',
    'nav.account': 'حسابي',
    'nav.cart': 'السلة',
    'nav.search': 'البحث',
    'nav.contact': 'اتصل',
    
    // Products
    'product.addToCart': 'أضف إلى السلة',
    'product.buyNow': 'اشتر الآن',
    'product.outOfStock': 'غير متوفر',
    'product.inStock': 'متوفر',
    'product.price': 'السعر',
    'product.rating': 'التقييم',
    'product.reviews': 'التقييمات',
    'product.selectVariant': 'اختر الحجم',
    'product.description': 'الوصف',
    'product.specifications': 'المواصفات',
    'product.origin': 'الأصل',
    'product.packing': 'التعبئة',
    'product.premium': 'الفواكه الجافة الممتازة',
    'product.allProducts': 'جميع المنتجات',
    
    // Cart
    'cart.empty': 'سلتك فارغة',
    'cart.emptyShopping': 'متابعة التسوق',
    'cart.subtotal': 'المجموع الجزئي',
    'cart.shipping': 'الشحن',
    'cart.tax': 'الضريبة',
    'cart.total': 'الإجمالي',
    'cart.checkout': 'الذهاب إلى الدفع',
    'cart.itemCount': 'عدد العناصر في السلة',
    'cart.removeItem': 'إزالة',
    'cart.updateQuantity': 'تحديث الكمية',
    
    // Checkout
    'checkout.title': 'الدفع',
    'checkout.shippingAddress': 'عنوان الشحن',
    'checkout.billingAddress': 'عنوان الفاتورة',
    'checkout.shippingMethod': 'طريقة الشحن',
    'checkout.paymentMethod': 'طريقة الدفع',
    'checkout.promoCode': 'رمز العرض',
    'checkout.applyCode': 'تطبيق الكود',
    'checkout.giftMessage': 'رسالة هدية',
    'checkout.subscribe': 'الاشتراك للحصول على الخصم',
    'checkout.placeOrder': 'تأكيد الطلب',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.firstName': 'الاسم الأول',
    'checkout.lastName': 'الاسم الأخير',
    'checkout.email': 'البريد الإلكتروني',
    'checkout.phone': 'رقم الهاتف',
    'checkout.address': 'العنوان',
    'checkout.city': 'المدينة',
    'checkout.state': 'الولاية/المقاطعة',
    'checkout.postal': 'الرمز البريدي',
    'checkout.country': 'الدولة',
    
    // Payment
    'payment.creditCard': 'بطاقة ائتمان',
    'payment.upi': 'يوبي آي',
    'payment.wallet': 'المحفظة',
    'payment.applePay': 'Apple Pay',
    'payment.googlePay': 'Google Pay',
    'payment.netBanking': 'الخدمات البنكية عبر الإنترنت',
    
    // Filters
    'filter.priceRange': 'نطاق السعر',
    'filter.packageSize': 'حجم الحزمة',
    'filter.origin': 'الأصل',
    'filter.certification': 'الشهادة',
    'filter.availability': 'التوفر',
    'filter.inStockOnly': 'المتوفر فقط',
    'filter.onSaleOnly': 'العروض فقط',
    'filter.apply': 'تطبيق الفلاتر',
    'filter.reset': 'إعادة تعيين',
    'filter.min': 'الحد الأدنى',
    'filter.max': 'الحد الأقصى',
    
    // Sort
    'sort.featured': 'مختار',
    'sort.newest': 'الأحدث',
    'sort.priceLow': 'السعر: من الأقل إلى الأعلى',
    'sort.priceHigh': 'السعر: من الأعلى إلى الأقل',
    'sort.popularity': 'الشهرة',
    'sort.rating': 'الأعلى تقييماً',
    
    // General
    'currency.select': 'اختر العملة',
    'language.select': 'اختر اللغة',
    'common.search': 'بحث',
    'common.filter': 'فلاتر',
    'common.sort': 'ترتيب حسب',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.showing': 'عرض',
    'common.of': 'من',
    'common.products': 'منتجات',
    
    // Header
    'header.logo': 'ألفاجر',
    'header.account': 'حسابي',
    'header.favorites': 'المفضلة',
    'header.support': 'الدعم',
    'header.about': 'حول',
    'header.contact': 'تواصل معنا',
    
    // Hero Section
    'hero.title': 'الفواكه الجافة والتوابل الممتازة',
    'hero.subtitle': 'مختار بعناية وعضوي وممتلئ بالصحة',
    'hero.cta': 'تسوق الآن',
    
    // Collections
    'collection.exquisite': 'المجموعة الرائعة',
    'collection.featured': 'المنتجات المميزة',
    'collection.bestsellers': 'الأكثر مبيعاً',
    'collection.newArrivals': 'الوصول الجديد',
    'collection.specialty': 'عناصر متخصصة',
    
    // Product Details
    'product.ingredients': 'المكونات',
    'product.nutritionFacts': 'معلومات التغذية',
    'product.servingSize': 'حجم الحصة',
    'product.calories': 'السعرات الحرارية',
    'product.protein': 'البروتين',
    'product.fat': 'الدهن',
    'product.carbs': 'الكربوهيدرات',
    'product.fiber': 'الألياف',
    'product.allergenInfo': 'معلومات الحساسية',
    'product.certifications': 'الشهادات',
    'product.relatedProducts': 'المنتجات ذات الصلة',
    'product.quantity': 'الكمية',
    'product.selectSize': 'اختر الحجم',
    'product.salePrice': 'سعر البيع',
    'product.originalPrice': 'السعر الأصلي',
    'product.viewDetails': 'عرض التفاصيل',
    
    // Newsletter
    'newsletter.title': 'اشترك في نشرتنا الإخبارية',
    'newsletter.subtitle': 'احصل على عروض حصرية وتحديثات',
    'newsletter.placeholder': 'أدخل بريدك الإلكتروني',
    'newsletter.subscribe': 'اشترك',
    'newsletter.success': 'شكراً لاشتراكك!',
    
    // Footer
    'footer.about': 'حول',
    'footer.contact': 'تواصل معنا',
    'footer.terms': 'الشروط والأحكام',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.shipping': 'سياسة الشحن',
    'footer.returns': 'الإرجاع والاستبدال',
    'footer.faq': 'أسئلة شائعة',
    'footer.blog': 'مدونة',
    'footer.company': 'الشركة',
    'footer.legal': 'قانوني',
    'footer.social': 'تابعنا',
    'footer.copyright': '© 2024 ألفاجر. جميع الحقوق محفوظة.',
    'footer.address': 'العنوان',
    'footer.email': 'البريد الإلكتروني',
    'footer.phone': 'الهاتف',
    'footer.hours': 'ساعات العمل',
    
    // Cart Page
    'cart.addToCart': 'أضف إلى السلة',
    'cart.quantity': 'الكمية',
    'cart.price': 'السعر',
    'cart.deleteItem': 'حذف العنصر',
    'cart.continueShopping': 'متابعة التسوق',
    'cart.estimateShipping': 'تقدير الشحن',
    'cart.applyPromo': 'تطبيق رمز العرض',
    'cart.proceedCheckout': 'الذهاب إلى الدفع',
    'cart.itemsInCart': 'عنصر (عناصر) في سلتك',
    
    // Checkout Page
    'checkout.orderPlaced': 'تم تأكيد الطلب بنجاح',
    'checkout.orderNumber': 'رقم الطلب',
    'checkout.estimatedDelivery': 'التسليم المتوقع',
    'checkout.trackOrder': 'تتبع الطلب',
    'checkout.continueShoppingBtn': 'متابعة التسوق',
    'checkout.expressShipping': 'الشحن السريع',
    'checkout.standardShipping': 'الشحن القياسي',
    'checkout.storePickup': 'الاستلام من المتجر',
  },
  hi: {
    // Announcement Bar
    'announcement.shipping': '999 रुपये से ऊपर के ऑर्डर पर निःशुल्क शिपिंग',
    'announcement.quality': 'प्रीमियम गुणवत्ता सूखे फल और मसाले',
    'announcement.worldwide': 'दुनिया भर में डिलीवरी',
    'announcement.authentic': '100% प्रामाणिक उत्पाद गारंटीकृत',
    
    // Navigation
    'nav.home': 'होम',
    'nav.categories': 'श्रेणियां',
    'nav.offers': 'ऑफर्स',
    'nav.about': 'परिचय',
    'nav.blog': 'ब्लॉग',
    'nav.account': 'खाता',
    'nav.cart': 'कार्ट',
    'nav.search': 'खोज',
    'nav.contact': 'संपर्क करें',
    
    // Products
    'product.addToCart': 'कार्ट में जोड़ें',
    'product.buyNow': 'अभी खरीदें',
    'product.outOfStock': 'स्टॉक से बाहर',
    'product.inStock': 'स्टॉक में',
    'product.price': 'कीमत',
    'product.rating': 'रेटिंग',
    'product.reviews': 'समीक्षाएं',
    'product.selectVariant': 'आकार चुनें',
    'product.description': 'विवरण',
    'product.specifications': 'विशेषताएं',
    'product.origin': 'मूल',
    'product.packing': 'पैकिंग',
    'product.premium': 'प्रीमियम सूखे फल',
    'product.allProducts': 'सभी उत्पाद',
    
    // Cart
    'cart.empty': 'आपकी कार्ट खाली है',
    'cart.emptyShopping': 'खरीदारी जारी रखें',
    'cart.subtotal': 'उप कुल',
    'cart.shipping': 'शिपिंग',
    'cart.tax': 'कर',
    'cart.total': 'कुल',
    'cart.checkout': 'चेकआउट पर जाएं',
    'cart.itemCount': 'कार्ट में वस्तुएं',
    'cart.removeItem': 'हटाएं',
    'cart.updateQuantity': 'मात्रा अपडेट करें',
    
    // Checkout
    'checkout.title': 'चेकआउट',
    'checkout.shippingAddress': 'शिपिंग पता',
    'checkout.billingAddress': 'बिलिंग पता',
    'checkout.shippingMethod': 'शिपिंग विधि',
    'checkout.paymentMethod': 'भुगतान विधि',
    'checkout.promoCode': 'प्रचार कोड',
    'checkout.applyCode': 'कोड लागू करें',
    'checkout.giftMessage': 'उपहार संदेश',
    'checkout.subscribe': 'बचत के लिए सदस्यता लें',
    'checkout.placeOrder': 'ऑर्डर रखें',
    'checkout.orderSummary': 'ऑर्डर सारांश',
    'checkout.firstName': 'पहला नाम',
    'checkout.lastName': 'अंतिम नाम',
    'checkout.email': 'ईमेल',
    'checkout.phone': 'फोन नंबर',
    'checkout.address': 'पता',
    'checkout.city': 'शहर',
    'checkout.state': 'राज्य/प्रांत',
    'checkout.postal': 'डाक कोड',
    'checkout.country': 'देश',
    
    // Payment
    'payment.creditCard': 'क्रेडिट/डेबिट कार्ड',
    'payment.upi': 'यूपीआई',
    'payment.wallet': 'वॉलेट',
    'payment.applePay': 'Apple Pay',
    'payment.googlePay': 'Google Pay',
    'payment.netBanking': 'नेट बैंकिंग',
    
    // Filters
    'filter.priceRange': 'मूल्य श्रेणी',
    'filter.packageSize': 'पैकेज आकार',
    'filter.origin': 'मूल',
    'filter.certification': 'प्रमाणन',
    'filter.availability': 'उपलब्धता',
    'filter.inStockOnly': 'केवल उपलब्ध',
    'filter.onSaleOnly': 'केवल बिक्री पर',
    'filter.apply': 'फिल्टर लागू करें',
    'filter.reset': 'रीसेट',
    'filter.min': 'न्यूनतम',
    'filter.max': 'अधिकतम',
    
    // Sort
    'sort.featured': 'विशेष',
    'sort.newest': 'नवीनतम',
    'sort.priceLow': 'कीमत: कम से अधिक',
    'sort.priceHigh': 'कीमत: अधिक से कम',
    'sort.popularity': 'लोकप्रियता',
    'sort.rating': 'सर्वोच्च रेटिंग',
    
    // General
    'currency.select': 'मुद्रा चुनें',
    'language.select': 'भाषा चुनें',
    'common.search': 'खोज',
    'common.filter': 'फिल्टर',
    'common.sort': 'ये क्रम दें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफल',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'दृश्य',
    'common.showing': 'दिखा रहा है',
    'common.of': 'का',
    'common.products': 'उत्पाद',
    
    // Header
    'header.logo': 'अलफाजर',
    'header.account': 'खाता',
    'header.favorites': 'पसंदीदा',
    'header.support': 'समर्थन',
    'header.about': 'परिचय',
    'header.contact': 'संपर्क करें',
    
    // Hero Section
    'hero.title': 'प्रीमियम सूखे फल और मसाले',
    'hero.subtitle': 'हाथ से चुने हुए, जैविक और स्वास्थ्य से भरे',
    'hero.cta': 'अभी खरीदें',
    
    // Collections
    'collection.exquisite': 'विशिष्ट संग्रह',
    'collection.featured': 'विशेषता उत्पाद',
    'collection.bestsellers': 'बेस्टसेलर',
    'collection.newArrivals': 'नए आगमन',
    'collection.specialty': 'विशेष आइटम',
    
    // Product Details
    'product.ingredients': 'सामग्री',
    'product.nutritionFacts': 'पोषण तथ्य',
    'product.servingSize': 'सेवारत आकार',
    'product.calories': 'कैलोरी',
    'product.protein': 'प्रोटीन',
    'product.fat': 'वसा',
    'product.carbs': 'कार्बोहाइड्रेट',
    'product.fiber': 'फाइबर',
    'product.allergenInfo': 'एलर्जी सूचना',
    'product.certifications': 'प्रमाणपत्र',
    'product.relatedProducts': 'संबंधित उत्पाद',
    'product.quantity': 'मात्रा',
    'product.selectSize': 'आकार चुनें',
    'product.salePrice': 'विक्रय मूल्य',
    'product.originalPrice': 'मूल मूल्य',
    'product.viewDetails': 'विवरण देखें',
    
    // Newsletter
    'newsletter.title': 'हमारे न्यूजलेटर की सदस्यता लें',
    'newsletter.subtitle': 'विशेष ऑफर और अपडेट प्राप्त करें',
    'newsletter.placeholder': 'अपना ईमेल दर्ज करें',
    'newsletter.subscribe': 'सदस्यता लें',
    'newsletter.success': 'सदस्यता के लिए धन्यवाद!',
    
    // Footer
    'footer.about': 'परिचय',
    'footer.contact': 'संपर्क करें',
    'footer.terms': 'नियम और शर्तें',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.shipping': 'शिपिंग नीति',
    'footer.returns': 'रिटर्न और विनिमय',
    'footer.faq': 'अक्सर पूछे जाने वाले प्रश्न',
    'footer.blog': 'ब्लॉग',
    'footer.company': 'कंपनी',
    'footer.legal': 'कानूनी',
    'footer.social': 'हमें फॉलो करें',
    'footer.copyright': '© 2024 अलफाजर। सर्वाधिकार सुरक्षित।',
    'footer.address': 'पता',
    'footer.email': 'ईमेल',
    'footer.phone': 'फोन',
    'footer.hours': 'व्यावसायिक घंटे',
    
    // Cart Page
    'cart.addToCart': 'कार्ट में जोड़ें',
    'cart.quantity': 'मात्रा',
    'cart.price': 'कीमत',
    'cart.deleteItem': 'आइटम हटाएं',
    'cart.continueShopping': 'खरीदारी जारी रखें',
    'cart.estimateShipping': 'शिपिंग का अनुमान लगाएं',
    'cart.applyPromo': 'प्रचार कोड लागू करें',
    'cart.proceedCheckout': 'चेकआउट पर जाएं',
    'cart.itemsInCart': 'आपकी कार्ट में आइटम',
    
    // Checkout Page
    'checkout.orderPlaced': 'ऑर्डर सफलतापूर्वक रखा गया',
    'checkout.orderNumber': 'ऑर्डर संख्या',
    'checkout.estimatedDelivery': 'अनुमानित डिलीवरी',
    'checkout.trackOrder': 'ऑर्डर ट्रैक करें',
    'checkout.continueShoppingBtn': 'खरीदारी जारी रखें',
    'checkout.expressShipping': 'एक्सप्रेस शिपिंग',
    'checkout.standardShipping': 'मानक शिपिंग',
    'checkout.storePickup': 'स्टोर से पिकअप',
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
