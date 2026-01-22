import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { isAdmin: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get user session to verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || user.id !== userId) {
      return NextResponse.json(
        { isAdmin: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin role in metadata
    // Option 1: Check user_metadata for admin flag
    const isAdminFromMetadata = user.user_metadata?.role === 'admin' || 
                                user.user_metadata?.isAdmin === true ||
                                user.user_metadata?.admin === true;

    if (isAdminFromMetadata) {
      return NextResponse.json({ isAdmin: true });
    }

    // Option 2: Check if user email is in admin emails list
    // You can configure this via environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ isAdmin: true });
    }

    // Option 3: Check database for admin role (if you have a roles table)
    // Uncomment and modify if you have a roles/users table
    /*
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (!roleError && userRole?.role === 'admin') {
      return NextResponse.json({ isAdmin: true });
    }
    */

    return NextResponse.json({ isAdmin: false });
  } catch (error: any) {
    console.error('Admin access check error:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
