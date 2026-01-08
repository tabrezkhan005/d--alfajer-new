// Product data models with full variant support

export interface ProductVariant {
  id: string;
  weight: string;
  size: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  image: string;
  images: string[];
  videos?: string[];
  price: number; // Base price for primary variant
  originalPrice?: number;
  rating: number;
  reviews: number;
  variants: ProductVariant[];
  
  // Nutritional & Product Info
  nutritionFacts: {
    servingSize: string;
    calories: number;
    protein: string;
    fat: string;
    carbs: string;
    fiber: string;
  };
  ingredients: string[];
  origin: string;
  certifications: string[];
  allergenInfo: string[];
  batchNumber?: string;
  bestBeforeDate?: string;
  
  // Stock & Availability
  inStock: boolean;
  onSale?: boolean;
  badge?: 'SALE' | 'HOT' | 'NEW';
  
  // SEO & Meta
  slug: string;
  metaDescription: string;
  
  // Relations
  relatedProducts?: string[]; // Product IDs
  crossSellProducts?: string[];
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

export interface SearchFilters {
  priceRange: [number, number];
  categories: string[];
  certifications: string[];
  origins: string[];
  weights: string[];
  ratings: number[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

// Mock product data
export const mockProductsWithVariants: Product[] = [
  {
    id: '1',
    name: 'productName.kashmirilRedChilliPowder',
    shortDescription: 'Premium grade Kashmiri red chilli powder with perfect color and heat.',
    longDescription: 'Kashmiri red chilli powder made from carefully selected red chillies. Rich in flavor and perfect heat level for all your culinary needs. Naturally processed without any additives or preservatives. Sourced directly from Kashmiri farmers.',
    category: 'Spices',
    image: '/images/products/chillipowder/chillipowder_main.jpeg',
    images: [
      '/images/products/chillipowder/chillipowder_main.jpeg',
      '/images/products/chillipowder/chillipowder_1.jpeg',
      '/images/products/chillipowder/chillipowder_2.jpeg',
    ],
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.8,
    reviews: 156,
    variants: [
      {
        id: 'var-1-1',
        weight: '250g',
        size: '250g',
        price: 24.99,
        originalPrice: 29.99,
        stock: 100,
        sku: 'CHILLI-250-001',
      },
      {
        id: 'var-1-2',
        weight: '500g',
        size: '500g',
        price: 44.99,
        originalPrice: 54.99,
        stock: 75,
        sku: 'CHILLI-500-001',
      },
      {
        id: 'var-1-3',
        weight: '1kg',
        size: '1kg',
        price: 84.99,
        originalPrice: 99.99,
        stock: 50,
        sku: 'CHILLI-1KG-001',
      },
    ],
    nutritionFacts: {
      servingSize: '1 tsp (3g)',
      calories: 8,
      protein: '0.3g',
      fat: '0.1g',
      carbs: '1.6g',
      fiber: '0.3g',
    },
    ingredients: ['100% Kashmiri Red Chillies'],
    origin: 'Kashmir, India',
    certifications: ['Organic', 'Non-GMO', 'Gluten-Free'],
    allergenInfo: [],
    inStock: true,
    onSale: true,
    badge: 'SALE',
    slug: 'kashmiri-red-chilli-powder',
    metaDescription: 'Premium Kashmiri red chilli powder with authentic flavor',
    relatedProducts: ['2', '3'],
  },
  {
    id: '2',
    name: 'productName.kashmirilPureWhiteHoney',
    shortDescription: '100% pure natural honey sourced directly from local beekeepers.',
    longDescription: '100% pure natural honey sourced directly from local beekeepers. Unprocessed and unfiltered to preserve all natural enzymes and health benefits. Rich, golden color with authentic floral taste. No added sugars or preservatives.',
    category: 'Honey & Spreads',
    image: '/images/products/honey/honey_main.jpeg',
    images: [
      '/images/products/honey/honey_main.jpeg',
      '/images/products/honey/honey1.jpeg',
      '/images/products/honey/honey2.jpeg',
    ],
    price: 34.99,
    rating: 4.9,
    reviews: 243,
    variants: [
      {
        id: 'var-2-1',
        weight: '250ml',
        size: '250ml',
        price: 34.99,
        stock: 120,
        sku: 'HONEY-250-001',
      },
      {
        id: 'var-2-2',
        weight: '500ml',
        size: '500ml',
        price: 59.99,
        stock: 100,
        sku: 'HONEY-500-001',
      },
      {
        id: 'var-2-3',
        weight: '1L',
        size: '1L',
        price: 109.99,
        stock: 60,
        sku: 'HONEY-1L-001',
      },
    ],
    nutritionFacts: {
      servingSize: '1 tbsp (21g)',
      calories: 64,
      protein: '0.1g',
      fat: '0g',
      carbs: '17.2g',
      fiber: '0g',
    },
    ingredients: ['100% Pure Honey'],
    origin: 'Kashmir, India',
    certifications: ['Organic', 'Raw', 'Unfiltered'],
    allergenInfo: [],
    inStock: true,
    slug: 'kashmiri-pure-white-honey',
    metaDescription: 'Raw unfiltered Kashmiri honey with natural enzymes',
    relatedProducts: ['1', '3'],
  },
];

// Search utilities
export function searchProducts(query: string, products: Product[]): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.shortDescription.toLowerCase().includes(lowerQuery) ||
    p.longDescription.toLowerCase().includes(lowerQuery) ||
    p.ingredients.some(i => i.toLowerCase().includes(lowerQuery))
  );
}

export function filterProducts(products: Product[], filters: Partial<SearchFilters>): Product[] {
  return products.filter(product => {
    // Price filter
    if (filters.priceRange) {
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(product.category)) {
        return false;
      }
    }

    // Certification filter
    if (filters.certifications && filters.certifications.length > 0) {
      if (!filters.certifications.some(cert => product.certifications.includes(cert))) {
        return false;
      }
    }

    // Origin filter
    if (filters.origins && filters.origins.length > 0) {
      if (!filters.origins.includes(product.origin)) {
        return false;
      }
    }

    // Stock filter
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }

    // Sale filter
    if (filters.onSaleOnly && !product.onSale) {
      return false;
    }

    // Rating filter
    if (filters.ratings && filters.ratings.length > 0) {
      const minRating = Math.min(...filters.ratings);
      if (product.rating < minRating) {
        return false;
      }
    }

    return true;
  });
}
