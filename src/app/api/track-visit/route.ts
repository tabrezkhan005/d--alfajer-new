import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/src/lib/supabase/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const visited = cookieStore.get('has_visited');

    if (!visited) {
      const supabase = await createClient();

      // Get current count
      const { data } = await supabase
        .from('store_settings' as any)
        .select('value')
        .eq('key', 'visitors_count')
        .maybeSingle();

      const settingData: any = data;
      const currentCount = settingData?.value || 0;

      // Increment
      await supabase
        .from('store_settings' as any)
        .upsert({
          key: 'visitors_count',
          value: Number(currentCount) + 1,
          description: 'Total unique visitors',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      // Set cookie to prevent counting again for 1 day
      const res = NextResponse.json({ success: true, newVisitor: true });
      res.cookies.set('has_visited', 'true', {
        maxAge: 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      return res;
    }

    return NextResponse.json({ success: true, newVisitor: false });
  } catch (error) {
    console.error('Error tracking visit:', error);
    return NextResponse.json({ success: false, error: 'Failed to track visit' }, { status: 500 });
  }
}
