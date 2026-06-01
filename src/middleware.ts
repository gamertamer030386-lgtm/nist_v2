import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assessments/:path*",
    "/compare/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/tasks/:path*",
    "/notifications/:path*",
    "/api/export/:path*",
  ],
};
