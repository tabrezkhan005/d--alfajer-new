import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

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

    const supabase = await createClient();

    // Build the query
    let dbQuery = supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(*),
        category:categories(*)
      `)
      .eq('is_active', true);

    // Full-text search
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,short_description.ilike.%${query}%,long_description.ilike.%${query}%`);
    }

    // Category filter
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (categoryData) {
        dbQuery = dbQuery.eq('category_id', categoryData.id);
      }
    }

    // Price filters
    if (minPrice) {
      dbQuery = dbQuery.gte('base_price', parseFloat(minPrice));
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('base_price', parseFloat(maxPrice));
    }

    // Origin filter
    if (origins.length > 0) {
      dbQuery = dbQuery.in('origin', origins);
    }

    // On sale filter
    if (onSale) {
      dbQuery = dbQuery.eq('is_on_sale', true);
    }

    // Certifications filter (array contains)
    if (certifications.length > 0) {
      dbQuery = dbQuery.contains('certifications', certifications);
    }

    // Execute query
    const { data: products, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    // Filter by stock if needed (post-query since it's on variants)
    let results = products || [];
    if (inStock) {
      results = results.filter((p: any) => {
        const totalStock = (p.variants || []).reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0);
        return totalStock > 0;
      });
    }

    // Get facets for the response
    const { data: allProducts } = await supabase
      .from('products')
      .select('origin, certifications, base_price, category:categories(name)')
      .eq('is_active', true);

    const facets = {
      categories: Array.from(new Set((allProducts || []).map((p: any) => p.category?.name).filter(Boolean))),
      origins: Array.from(new Set((allProducts || []).map((p: any) => p.origin).filter(Boolean))),
      certifications: Array.from(
        new Set((allProducts || []).flatMap((p: any) => p.certifications || []))
      ),
      priceRange: {
        min: Math.min(...(allProducts || []).map((p: any) => p.base_price || 0)),
        max: Math.max(...(allProducts || []).map((p: any) => p.base_price || 0)),
      },
    };

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        total: results.length,
        limit,
        offset,
        pages: Math.ceil(results.length / limit),
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
