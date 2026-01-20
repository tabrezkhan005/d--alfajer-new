import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

const SYNONYMS: Record<string, string[]> = {
  spice: ['chilli', 'pepper', 'powder', 'masala'],
  honey: ['bee', 'sweet', 'raw', 'organic'],
  organic: ['natural', 'pure', 'bio', 'chemical-free'],
  kashmir: ['kashmiri', 'kash'],
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = (searchParams.get('q') || '').toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const supabase = await createClient();

    // Search products from database with full product data
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, image_url, base_price, short_description, category:categories(name)')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,short_description.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Autocomplete search error:', error);
      return NextResponse.json({ suggestions: [], products: [] });
    }

    // Get matching product names (for text suggestions)
    const productMatches = products?.map((p: any) => p.name) || [];

    // Get matching categories
    const categoryMatches = Array.from(
      new Set(
        products
          ?.filter((p: any) => p.category?.name?.toLowerCase().includes(query))
          .map((p: any) => p.category?.name)
          .filter(Boolean) || []
      )
    ).slice(0, Math.ceil(limit / 2));

    // Get synonyms
    const synonymMatches: string[] = [];
    Object.entries(SYNONYMS).forEach(([key, values]) => {
      if (key.includes(query) || values.some((v) => v.includes(query))) {
        synonymMatches.push(key, ...values);
      }
    });

    // Combine and deduplicate text suggestions
    const allSuggestions = [
      ...new Set([
        ...productMatches,
        ...categoryMatches,
        ...synonymMatches.slice(0, Math.ceil(limit / 3)),
      ]),
    ].slice(0, limit);

    // Format products for recommendations
    const productRecommendations = (products || []).slice(0, 6).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image_url,
      price: p.base_price,
      category: p.category?.name || '',
    }));

    return NextResponse.json({
      query,
      suggestions: allSuggestions,
      products: productRecommendations,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      { error: 'Autocomplete failed' },
      { status: 500 }
    );
  }
}
