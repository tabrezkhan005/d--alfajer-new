import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      error: error,
      count: data,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message,
      stack: err.stack,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }, { status: 500 });
  }
}
