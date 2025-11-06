/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크하거나 북마크를 해제하는 버튼입니다.
 *
 * 주요 기능:
 * 1. 별 아이콘 (채워짐/비어있음)
 * 2. 클릭 시 북마크 추가/제거
 * 3. 로그인하지 않은 경우 로그인 유도
 *
 * @dependencies
 * - lib/api/bookmark-api.ts: 북마크 API 함수들
 * - @clerk/nextjs: useAuth, SignInButton
 * - lucide-react: Star 아이콘
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "@/lib/api/bookmark-api";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  contentId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookmarkButton({
  contentId,
  className,
  size = "default",
}: BookmarkButtonProps) {
  const { isSignedIn } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 북마크 상태 확인
  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const checkBookmark = async () => {
      try {
        const result = await isBookmarked(contentId);
        setBookmarked(result);
      } catch (error) {
        console.error("[BookmarkButton] 북마크 상태 확인 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    checkBookmark();
  }, [contentId, isSignedIn]);

  /**
   * 북마크 토글 핸들러
   */
  const handleToggle = async () => {
    if (!isSignedIn) {
      return;
    }

    setIsUpdating(true);
    try {
      if (bookmarked) {
        const result = await removeBookmark(contentId);
        if (result.success) {
          setBookmarked(false);
          console.log("[BookmarkButton] 북마크 제거 성공");
        } else {
          console.error("[BookmarkButton] 북마크 제거 실패:", result.error);
        }
      } else {
        const result = await addBookmark(contentId);
        if (result.success) {
          setBookmarked(true);
          console.log("[BookmarkButton] 북마크 추가 성공");
        } else {
          console.error("[BookmarkButton] 북마크 추가 실패:", result.error);
        }
      }
    } catch (error) {
      console.error("[BookmarkButton] 북마크 토글 오류:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 로그인하지 않은 경우
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button
          variant="outline"
          size={size}
          className={cn("gap-2", className)}
          aria-label="북마크하려면 로그인하세요"
        >
          <Star className="h-4 w-4" />
          북마크
        </Button>
      </SignInButton>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn("gap-2", className)}
      >
        <Star className="h-4 w-4" />
        북마크
      </Button>
    );
  }

  return (
    <Button
      variant={bookmarked ? "default" : "outline"}
      size={size}
      onClick={handleToggle}
      disabled={isUpdating}
      className={cn("gap-2", className)}
      aria-label={bookmarked ? "북마크 제거" : "북마크 추가"}
    >
      <Star
        className={cn(
          "h-4 w-4",
          bookmarked && "fill-current",
          isUpdating && "animate-pulse",
        )}
      />
      {bookmarked ? "북마크됨" : "북마크"}
    </Button>
  );
}
