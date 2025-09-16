import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTService } from './lib/jwt';

// Routes that require authentication
const protectedRoutes = ['/main', '/dashboard', '/profile', '/payment'];
// Routes that should redirect to main if already authenticated
const authRoutes = ['/auth/login', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 🔹 DEMO MODE: if running on demo deployment, force everything to /demo
  if (host.includes("demo")) {
    return NextResponse.rewrite(new URL("/demo", request.url));
  }

  // Normal auth logic
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  try {
    if (token) {
      const payload = await JWTService.verifyToken(token);

      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/main', request.url));
      }

      if (isProtectedRoute) {
        return NextResponse.next();
      }
    } else {
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
