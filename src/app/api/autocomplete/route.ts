import { NextRequest, NextResponse } from 'next/server';
import { mockProductsWithVariants } from '@/src/lib/products';

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

    // Get matching product names
    const productMatches = mockProductsWithVariants
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.shortDescription.toLowerCase().includes(query) ||
          p.ingredients.some((i) => i.toLowerCase().includes(query))
      )
      .map((p) => p.name)
      .slice(0, limit);

    // Get matching categories
    const categoryMatches = Array.from(
      new Set(
        mockProductsWithVariants
          .filter((p) => p.category.toLowerCase().includes(query))
          .map((p) => p.category)
      )
    ).slice(0, limit / 2);

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
        ...synonymMatches.slice(0, limit / 3),
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
