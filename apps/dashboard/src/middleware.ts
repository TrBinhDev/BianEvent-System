import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Chưa đăng nhập mà vào trang khác → redirect login
  if (pathname !== "/login" && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Đã đăng nhập mà vào login → redirect về trang chủ
  if (pathname === "/login" && refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
