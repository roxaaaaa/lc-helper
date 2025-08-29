import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTService } from './lib/jwt';

// Routes that require authentication
const protectedRoutes = ['/main', '/dashboard', '/profile', '/payment'];
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
  
  console.log('Middleware - Path:', pathname, 'Token:', token ? 'Present' : 'Missing');
  
  try {
    if (token) {
      console.log('Middleware - Token found, verifying...');
      // Verify JWT token
      const payload = await JWTService.verifyToken(token);
      console.log('Middleware - Token verified successfully for user:', payload.email);
      
      // If user is authenticated and trying to access auth routes, redirect to main
      if (isAuthRoute) {
        console.log('Middleware - Redirecting authenticated user from auth route to main');
        return NextResponse.redirect(new URL('/main', request.url));
      }
      
      // If user is authenticated and accessing protected route, allow access
      if (isProtectedRoute) {
        console.log('Middleware - Allowing access to protected route');
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
    console.log('Middleware - Token verification failed:', error);
    // If token is invalid and trying to access protected route, redirect to login
    if (isProtectedRoute) {
      console.log('Middleware - Redirecting to login due to invalid token');
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