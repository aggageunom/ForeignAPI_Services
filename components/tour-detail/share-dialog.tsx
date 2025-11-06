/**
 * @file share-dialog.tsx
 * @description 공유 다이얼로그 컴포넌트
 *
 * 다양한 공유 옵션을 제공하는 다이얼로그입니다.
 *
 * 주요 기능:
 * 1. Web Share API 지원 (네이티브 공유)
 * 2. URL 복사
 * 3. 이메일 공유
 * 4. 소셜 미디어 공유 (Twitter, Facebook, LinkedIn 등)
 * 5. 카카오톡 공유 (한국)
 *
 * @dependencies
 * - components/ui/dialog: 다이얼로그 컴포넌트
 * - lucide-react: 아이콘들
 */

"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  QrCode,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  url,
  title,
  description,
  imageUrl,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [supportsWebShare, setSupportsWebShare] = useState(false);

  useEffect(() => {
    // Web Share API 지원 여부 확인
    setSupportsWebShare(
      typeof navigator !== "undefined" && "share" in navigator,
    );
  }, []);

  /**
   * URL 복사
   */
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("URL 복사 실패:", error);
      alert("URL 복사에 실패했습니다.");
    }
  };

  /**
   * Web Share API 사용 (네이티브 공유)
   */
  const handleNativeShare = async () => {
    if (!supportsWebShare) return;

    try {
      const shareData = {
        title,
        text: description || title,
        url,
      } as ShareData;

      await navigator.share(shareData);
      onOpenChange(false);
    } catch (error) {
      // 사용자가 공유를 취소한 경우
      if ((error as Error).name !== "AbortError") {
        console.error("공유 실패:", error);
      }
    }
  };

  /**
   * 이메일 공유
   */
  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description || title}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onOpenChange(false);
  };

  /**
   * Twitter 공유
   */
  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${title} - ${description || ""}`);
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url,
      )}&text=${text}`,
      "_blank",
      "width=550,height=420",
    );
    onOpenChange(false);
  };

  /**
   * Facebook 공유
   */
  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "width=550,height=420",
    );
    onOpenChange(false);
  };

  /**
   * LinkedIn 공유
   */
  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
      "_blank",
      "width=550,height=420",
    );
    onOpenChange(false);
  };

  /**
   * 카카오톡 공유 (한국)
   */
  const handleKakaoShare = () => {
    // 카카오톡 웹 링크 공유 (간단한 방식)
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(
      url,
    )}`;
    window.open(kakaoUrl, "_blank");
    onOpenChange(false);
  };

  /**
   * QR 코드 생성 (외부 서비스 사용)
   */
  const handleQrCode = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      url,
    )}`;
    window.open(qrCodeUrl, "_blank");
  };

  const shareOptions: ShareOption[] = [
    ...(supportsWebShare
      ? [
          {
            id: "native",
            name: "시스템 공유",
            icon: <Share2 className="h-5 w-5" />,
            color: "bg-blue-500 hover:bg-blue-600",
            onClick: handleNativeShare,
          },
        ]
      : []),
    {
      id: "copy",
      name: "링크 복사",
      icon: copied ? (
        <Check className="h-5 w-5" />
      ) : (
        <Copy className="h-5 w-5" />
      ),
      color: "bg-gray-500 hover:bg-gray-600",
      onClick: handleCopyUrl,
    },
    {
      id: "email",
      name: "이메일",
      icon: <Mail className="h-5 w-5" />,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: handleEmailShare,
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      color: "bg-black hover:bg-gray-900",
      onClick: handleTwitterShare,
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      color: "bg-blue-700 hover:bg-blue-800",
      onClick: handleFacebookShare,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      color: "bg-blue-800 hover:bg-blue-900",
      onClick: handleLinkedInShare,
    },
    {
      id: "kakao",
      name: "카카오톡",
      icon: <MessageCircle className="h-5 w-5" />,
      color: "bg-yellow-400 hover:bg-yellow-500 text-black",
      onClick: handleKakaoShare,
    },
    {
      id: "qr",
      name: "QR 코드",
      icon: <QrCode className="h-5 w-5" />,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: handleQrCode,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>링크 공유</DialogTitle>
          <DialogDescription>관광지 정보를 공유하세요</DialogDescription>
        </DialogHeader>

        {/* 공유할 콘텐츠 미리보기 */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          {imageUrl && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold">{title}</h4>
            {description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <LinkIcon className="h-3 w-3 text-muted-foreground" />
              <p className="truncate text-xs text-muted-foreground">{url}</p>
            </div>
          </div>
        </div>

        {/* 공유 옵션 그리드 */}
        <div className="grid grid-cols-4 gap-3">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg p-4 text-white transition-colors",
                option.color,
                option.id === "copy" &&
                  copied &&
                  "bg-green-600 hover:bg-green-700",
              )}
              aria-label={option.name}
            >
              {option.icon}
              <span className="text-xs font-medium">{option.name}</span>
            </button>
          ))}
        </div>

        {/* 추가 정보 */}
        <p className="text-center text-xs text-muted-foreground">
          공유할 방법을 선택하세요
        </p>
      </DialogContent>
    </Dialog>
  );
}
