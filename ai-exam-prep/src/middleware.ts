import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Routes that require authentication
const protectedRoutes = ['/main', '/dashboard', '/profile'];
// Routes that should redirect to main if already authenticated
const authRoutes = ['/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Get token from cookies or headers
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  try {
    if (token) {
      // Verify JWT token
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      
      // If user is authenticated and trying to access auth routes, redirect to main
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/main', request.url));
      }
      
      // If user is authenticated and accessing protected route, allow access
      if (isProtectedRoute) {
        return NextResponse.next();
      }
    } else {
      // If no token and trying to access protected route, redirect to login
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    // If token is invalid and trying to access protected route, redirect to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 