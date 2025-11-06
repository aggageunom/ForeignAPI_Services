/**
 * @file share-button.tsx
 * @description 공유 버튼 컴포넌트
 *
 * 다양한 공유 옵션을 제공하는 공유 버튼입니다.
 *
 * 주요 기능:
 * 1. Web Share API 지원 (네이티브 공유)
 * 2. 커스텀 공유 다이얼로그 표시
 * 3. URL 복사 기능
 *
 * @dependencies
 * - components/tour-detail/share-dialog: 공유 다이얼로그
 * - lucide-react: Share 아이콘
 * - components/ui/button: 버튼 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/tour-detail/share-dialog";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  title?: string;
  description?: string;
  imageUrl?: string;
}

export function ShareButton({
  className,
  variant = "outline",
  size = "default",
  title,
  description,
  imageUrl,
}: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareData, setShareData] = useState({
    url: "",
    title: title || "관광지 정보",
    description: description || "",
    imageUrl: imageUrl || "",
  });

  // 클라이언트 사이드에서만 메타데이터 읽기
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentUrl = window.location.href;
    const metaTitle =
      title ||
      document.title ||
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content") ||
      "관광지 정보";
    const metaDescription =
      description ||
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content") ||
      "";
    const metaImage =
      imageUrl ||
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content") ||
      "";

    setShareData({
      url: currentUrl,
      title: metaTitle,
      description: metaDescription,
      imageUrl: metaImage,
    });
  }, [title, description, imageUrl]);

  const handleShare = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={cn("gap-2", className)}
        aria-label="공유하기"
      >
        <Share2 className="h-4 w-4" />
        공유하기
      </Button>

      <ShareDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        url={shareData.url}
        title={shareData.title}
        description={shareData.description}
        imageUrl={shareData.imageUrl}
      />
    </>
  );
}
