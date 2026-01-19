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
