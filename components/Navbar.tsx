/**
 * @file Navbar.tsx
 * @description 메인 네비게이션 바 컴포넌트
 *
 * Design.md 기준으로 디자인 개선된 헤더 컴포넌트입니다.
 * 검색창이 헤더에 통합되어 있습니다.
 */

import { Suspense } from "react";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Bookmark, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourSearch } from "@/components/tour-search";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            JLG Trip
          </span>
        </Link>

        {/* 검색창 (데스크톱) */}
        <div className="hidden flex-1 max-w-md mx-8 lg:block">
          <Suspense
            fallback={
              <div
                className="h-10 w-full animate-pulse rounded-md bg-muted"
                aria-hidden
              />
            }
          >
            <TourSearch />
          </Suspense>
        </div>

        {/* 우측 네비게이션 */}
        <div className="flex items-center gap-2">
          <SignedIn>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href="/bookmarks" className="gap-2">
                <Bookmark className="h-4 w-4" />
                <span className="hidden md:inline">북마크</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href="/stats" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">통계</span>
              </Link>
            </Button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" variant="ghost" className="hidden sm:flex">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* 모바일 검색창 */}
      <div className="border-t lg:hidden">
        <div className="container px-4 py-3">
          <Suspense
            fallback={
              <div
                className="h-10 w-full animate-pulse rounded-md bg-muted"
                aria-hidden
              />
            }
          >
            <TourSearch />
          </Suspense>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
