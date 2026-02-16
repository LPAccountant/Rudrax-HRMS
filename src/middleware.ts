import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/api/auth/login", "/api/auth/logout"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (!token && !isPublicPath && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)"],
};
