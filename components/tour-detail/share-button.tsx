/**
 * @file share-button.tsx
 * @description 공유 버튼 컴포넌트
 *
 * URL 복사 기능을 제공하는 공유 버튼입니다.
 *
 * 주요 기능:
 * 1. URL 복사 기능 (클립보드 API)
 * 2. 복사 완료 토스트 메시지
 * 3. 공유 아이콘 표시
 *
 * @dependencies
 * - lucide-react: Share, Check 아이콘
 * - components/ui/button: 버튼 컴포넌트
 */

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ShareButton({
  className,
  variant = "outline",
  size = "default",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  /**
   * URL 복사 기능
   */
  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("URL 복사 실패:", error);
      // Fallback: 알림창 표시
      alert("URL 복사에 실패했습니다. 수동으로 복사해주세요.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={cn("gap-2", className)}
      aria-label="URL 공유"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          복사됨
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          공유하기
        </>
      )}
    </Button>
  );
}
