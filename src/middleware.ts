import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow access to admin login page
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get user session
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no user or error, redirect to login
  if (error || !user) {
    const redirectUrl = new URL('/admin/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if user is admin
  const isAdmin = await checkAdminAccess(user);

  if (!isAdmin) {
    // User is authenticated but not admin - redirect to login
    const redirectUrl = new URL('/admin/login', request.url);
    redirectUrl.searchParams.set('error', 'access_denied');
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

async function checkAdminAccess(user: any): Promise<boolean> {
  // Check user metadata for admin role
  const isAdminFromMetadata = user.user_metadata?.role === 'admin' || 
                              user.user_metadata?.isAdmin === true ||
                              user.user_metadata?.admin === true;

  if (isAdminFromMetadata) {
    return true;
  }

  // Check if user email is in admin emails list
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e: string) => e.trim()) || [];
  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return true;
  }

  // Add database check here if you have a roles table
  // For now, we'll rely on metadata or email list

  return false;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
