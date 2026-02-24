import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStoreSetting, updateStoreSetting } from '@/src/lib/supabase/admin';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const visited = cookieStore.get('has_visited');

    if (!visited) {
      // Get current count
      const currentCount = await getStoreSetting('visitors_count') || 0;
      // Increment
      await updateStoreSetting('visitors_count', Number(currentCount) + 1, 'Total unique visitors');

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
