import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const PROTECTED = ['/dashboard', '/activity', '/cards', '/profile'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route is protected
    const isProtected = PROTECTED.some(p => pathname.startsWith(p));
    if (!isProtected) return NextResponse.next();

    // Supabase stores the session in a cookie named sb-<project-ref>-auth-token
    // Check for any Supabase auth cookie presence
    const hasCookie = [...request.cookies.getAll()].some(
        c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );

    if (!hasCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/activity/:path*', '/cards/:path*', '/profile/:path*'],
};
