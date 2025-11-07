import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/bookmarks(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // 보호된 라우트만 인증 체크
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // 에러 발생시에도 요청을 통과시킴 (프로덕션에서는 로그만 남기고 계속 진행)
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
