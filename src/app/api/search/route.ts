import { NextRequest, NextResponse } from 'next/server';
import { mockProductsWithVariants, searchProducts, filterProducts, type SearchFilters } from '@/src/lib/products';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const certifications = searchParams.getAll('certification');
    const origins = searchParams.getAll('origin');
    const inStock = searchParams.get('inStock') === 'true';
    const onSale = searchParams.get('onSale') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let results = mockProductsWithVariants;

    // Full-text search
    if (query) {
      results = searchProducts(query, results);
    }

    // Apply filters
    const filters: Partial<SearchFilters> = {};

    if (minPrice || maxPrice) {
      filters.priceRange = [
        parseFloat(minPrice || '0'),
        parseFloat(maxPrice || '999999'),
      ];
    }

    if (category) {
      filters.categories = [category];
    }

    if (certifications.length > 0) {
      filters.certifications = certifications;
    }

    if (origins.length > 0) {
      filters.origins = origins;
    }

    if (inStock) {
      filters.inStockOnly = true;
    }

    if (onSale) {
      filters.onSaleOnly = true;
    }

    results = filterProducts(results, filters);

    // Pagination
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    // Prepare response with facets
    const facets = {
      categories: Array.from(new Set(results.map((p) => p.category))),
      origins: Array.from(new Set(results.map((p) => p.origin))),
      certifications: Array.from(
        new Set(results.flatMap((p) => p.certifications))
      ),
      priceRange: {
        min: Math.min(...results.map((p) => p.price)),
        max: Math.max(...results.map((p) => p.price)),
      },
    };

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
      facets,
      query,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
