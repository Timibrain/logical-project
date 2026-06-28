import { NextRequest, NextResponse } from 'next/server';

// Auth is handled client-side in each page via Supabase localStorage session.
// Middleware simply passes all requests through.
export function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/activity/:path*', '/cards/:path*', '/profile/:path*'],
};
