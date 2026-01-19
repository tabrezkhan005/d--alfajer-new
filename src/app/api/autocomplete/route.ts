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

    // Search products from database
    const { data: products, error } = await supabase
      .from('products')
      .select('name, short_description, category:categories(name)')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,short_description.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Autocomplete search error:', error);
      return NextResponse.json({ suggestions: [] });
    }

    // Get matching product names
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

    // Combine and deduplicate
    const allSuggestions = [
      ...new Set([
        ...productMatches,
        ...categoryMatches,
        ...synonymMatches.slice(0, Math.ceil(limit / 3)),
      ]),
    ].slice(0, limit);

    return NextResponse.json({
      query,
      suggestions: allSuggestions,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      { error: 'Autocomplete failed' },
      { status: 500 }
    );
  }
}
