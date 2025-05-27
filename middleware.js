
import { NextResponse } from 'next/server';
// Removed 'import type { NextRequest } from 'next/server';' as it's TypeScript syntax.
// The 'request' parameter will implicitly be of type NextRequest by Next.js.
// For explicit type hinting in a .js file, JSDoc can be used if desired.

// This function can be marked `async` if using `await` inside
export function middleware(request) { // Removed ': NextRequest' type annotation
  // Example: You could add logic here, like redirecting or setting headers.
  // For instance, to log the path being accessed:
  // console.log('Middleware triggered for path:', request.nextUrl.pathname);

  // If you want to modify the request or response, you can do so here.
  // For now, we'll just let the request proceed.
  return NextResponse.next();
}

// See "Matching Paths" in Next.js documentation to learn more
export const config = {
  // matcher: '/about/:path*', // Example: Run middleware only on /about/* paths
  // matcher: ['/admin/:path*', '/dashboard/:path*'], // Example: Run on multiple paths
};
