/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 섹션 컴포넌트
 *
 * 관광지의 기본 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 관광지명 표시
 * 2. 대표 이미지 표시
 * 3. 주소 표시 및 복사 기능
 * 4. 전화번호 표시 및 클릭 시 전화 연결
 * 5. 홈페이지 링크 표시
 * 6. 개요 (긴 설명문) 표시
 * 7. 관광 타입 및 카테고리 표시
 *
 * @dependencies
 * - lib/types/tour.ts: TourDetail 타입
 * - lucide-react: 아이콘
 * - next/image: 이미지 최적화
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Globe,
  Copy,
  Check,
  MapPin as MapPinIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { CONTENT_TYPE_NAME } from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/utils/image";

interface DetailInfoProps {
  detail: TourDetail;
  className?: string;
}

export function DetailInfo({ detail, className }: DetailInfoProps) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rawImageUrl = detail.firstimage || detail.firstimage2;
  const imageUrl = normalizeImageUrl(rawImageUrl);
  const contentTypeName =
    CONTENT_TYPE_NAME[detail.contenttypeid as keyof typeof CONTENT_TYPE_NAME] ||
    "관광지";

  const fullAddress = `${detail.addr1}${
    detail.addr2 ? ` ${detail.addr2}` : ""
  }`;

  /**
   * 홈페이지 URL 정규화
   * - HTML 태그 제거 및 URL 추출
   * - 빈 문자열 체크
   * - 프로토콜 추가 (없는 경우)
   * - 공백 제거
   */
  const normalizeHomepageUrl = (
    url: string | undefined | null,
  ): { url: string; displayText: string } | null => {
    if (!url || url.trim() === "") {
      return null;
    }

    let extractedUrl = url.trim();
    let displayText = extractedUrl;

    // HTML 태그가 포함된 경우 처리
    if (extractedUrl.includes("<a") || extractedUrl.includes("</a>")) {
      // href 속성에서 URL 추출
      const hrefMatch = extractedUrl.match(/href=["']([^"']+)["']/i);
      if (hrefMatch && hrefMatch[1]) {
        extractedUrl = hrefMatch[1];
      }

      // 표시 텍스트 추출 (태그 사이의 텍스트)
      const textMatch = url.match(/<a[^>]*>([^<]+)<\/a>/i);
      if (textMatch && textMatch[1]) {
        displayText = textMatch[1].trim();
      } else {
        // 태그 사이에 텍스트가 없으면 URL 사용
        displayText = extractedUrl;
      }
    } else {
      // HTML 태그가 없는 경우 HTML 태그 제거만 수행
      extractedUrl = extractedUrl.replace(/<[^>]*>/g, "").trim();
      displayText = displayText.replace(/<[^>]*>/g, "").trim();
    }

    if (!extractedUrl || extractedUrl === "") {
      return null;
    }

    // 이미 절대 URL인 경우
    if (
      extractedUrl.startsWith("http://") ||
      extractedUrl.startsWith("https://")
    ) {
      return {
        url: extractedUrl,
        displayText: displayText || extractedUrl,
      };
    }

    // 프로토콜이 없는 경우 https:// 추가
    return {
      url: `https://${extractedUrl}`,
      displayText: displayText || extractedUrl,
    };
  };

  const homepageData = normalizeHomepageUrl(detail.homepage);

  // 디버깅: 홈페이지 URL 로깅
  if (process.env.NODE_ENV === "development") {
    if (detail.homepage) {
      console.log("[DetailInfo] 홈페이지 URL:", {
        original: detail.homepage,
        normalized: homepageData,
        isEmpty: !detail.homepage.trim(),
      });
    }
  }

  /**
   * 주소 복사 기능
   */
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("주소 복사 실패:", error);
    }
  };

  /**
   * 전화번호 정규화
   * - 빈 문자열 체크
   * - 공백 및 하이픈 제거
   * - 전화번호 형식 정리
   */
  const normalizePhoneNumber = (
    tel: string | undefined | null,
  ): string | null => {
    if (!tel || tel.trim() === "") {
      return null;
    }

    // HTML 태그 제거
    let cleaned = tel.replace(/<[^>]*>/g, "").trim();

    // 공백, 하이픈, 괄호 등 제거 (선택사항 - 실제 전화번호 형식 유지)
    // cleaned = cleaned.replace(/[\s\-\(\)]/g, "");

    if (!cleaned || cleaned === "") {
      return null;
    }

    return cleaned;
  };

  const phoneNumber = normalizePhoneNumber(detail.tel);

  /**
   * 전화번호 클릭 핸들러
   */
  const handlePhoneClick = (tel: string) => {
    // 전화번호 형식 정리 (공백 제거)
    const cleanTel = tel.replace(/\s/g, "");
    window.location.href = `tel:${cleanTel}`;
  };

  // 디버깅: 전화번호 로깅
  if (process.env.NODE_ENV === "development") {
    if (detail.tel) {
      console.log("[DetailInfo] 전화번호:", {
        original: detail.tel,
        normalized: phoneNumber,
        isEmpty: !detail.tel.trim(),
      });
    }
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* 대표 이미지 - 히어로 섹션 */}
      {imageUrl && !imageError ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-lg">
          <Image
            src={imageUrl}
            alt={detail.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
            unoptimized={imageUrl.includes("visitkorea.or.kr")}
            onError={() => {
              console.warn("[DetailInfo] 이미지 로딩 실패:", {
                url: imageUrl,
                title: detail.title,
                contentId: detail.contentid,
              });
              setImageError(true);
            }}
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-lg">
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <MapPin className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* 관광지명 및 타입 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="mb-3 text-3xl md:text-4xl font-bold leading-tight">
            {detail.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
              {contentTypeName}
            </span>
            {detail.addr1 && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPinIcon className="h-4 w-4" />
                <span>{detail.addr1.split(" ")[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 주소 */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPinIcon className="h-4 w-4 text-primary" />
              주소
            </div>
            <p className="text-base leading-relaxed">{fullAddress}</p>
            {detail.zipcode && (
              <p className="mt-2 text-sm text-muted-foreground">
                우편번호: {detail.zipcode}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="shrink-0 gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                복사
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 전화번호 */}
        {phoneNumber && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Phone className="h-4 w-4 text-primary" />
              전화번호
            </div>
            <a
              href={`tel:${phoneNumber.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 text-base font-medium text-primary hover:text-primary/80 transition-colors group"
            >
              <Phone className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="break-all">{phoneNumber}</span>
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              클릭하여 전화 연결
            </p>
          </div>
        )}

        {/* 홈페이지 */}
        {homepageData && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Globe className="h-4 w-4 text-primary" />
              홈페이지
            </div>
            <a
              href={homepageData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-base text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              {homepageData.displayText}
            </a>
          </div>
        )}
      </div>

      {/* 개요 */}
      {detail.overview && (
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">개요</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground/90">
              {detail.overview}
            </p>
          </div>
        </div>
      )}

      {/* 카테고리 정보 (있는 경우) */}
      {(detail.cat1 || detail.cat2 || detail.cat3) && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-foreground">
            카테고리
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.cat1 && (
              <span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground/80">
                {detail.cat1}
              </span>
            )}
            {detail.cat2 && (
              <span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground/80">
                {detail.cat2}
              </span>
            )}
            {detail.cat3 && (
              <span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground/80">
                {detail.cat3}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
