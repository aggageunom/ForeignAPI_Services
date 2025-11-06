/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (기본 이미지 fallback)
 * 2. 관광지명, 주소, 관광 타입 뱃지 표시
 * 3. 간단한 개요 표시 (1-2줄)
 * 4. 클릭 시 상세페이지로 이동
 *
 * @dependencies
 * - lib/types/tour.ts: TourItem 타입
 * - lucide-react: 아이콘
 * - next/link: 라우팅
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";
import { useState, memo, useMemo } from "react";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE_NAME } from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/utils/image";

/**
 * 날짜 문자열을 파싱하여 Date 객체로 변환합니다.
 */
function parseDateString(dateString: string): Date {
  if (!dateString || dateString.trim() === "") {
    return new Date(NaN);
  }

  const date = new Date(dateString);

  // 유효하지 않은 경우 다른 형식 시도
  if (isNaN(date.getTime())) {
    // YYYYMMDD 형식인 경우
    if (/^\d{8}$/.test(dateString)) {
      const year = parseInt(dateString.substring(0, 4), 10);
      const month = parseInt(dateString.substring(4, 6), 10) - 1;
      const day = parseInt(dateString.substring(6, 8), 10);
      return new Date(year, month, day);
    }
    // YYYY-MM-DD 형식인 경우
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString + "T00:00:00");
    }
  }

  return date;
}

interface TourCardProps {
  tour: TourItem;
  className?: string;
}

function TourCardComponent({ tour, className }: TourCardProps) {
  const [imageError, setImageError] = useState(false);

  // 이미지 URL과 콘텐츠 타입명을 useMemo로 최적화
  const { imageUrl, contentTypeName } = useMemo(() => {
    const rawImageUrl = tour.firstimage || tour.firstimage2;
    return {
      imageUrl: normalizeImageUrl(rawImageUrl),
      contentTypeName:
        CONTENT_TYPE_NAME[
          tour.contenttypeid as keyof typeof CONTENT_TYPE_NAME
        ] || "관광지",
    };
  }, [tour.firstimage, tour.firstimage2, tour.contenttypeid]);

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
        className,
      )}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageUrl.includes("visitkorea.or.kr")}
            onError={() => {
              console.warn("[TourCard] 이미지 로딩 실패:", {
                url: imageUrl,
                tourTitle: tour.title,
                contentId: tour.contentid,
              });
              setImageError(true);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* 카드 내용 */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* 관광지명 */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
          <span className="line-clamp-1">
            {tour.addr1}
            {tour.addr2 && ` ${tour.addr2}`}
          </span>
        </div>

        {/* 관광 타입 뱃지 및 수정일 */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {contentTypeName}
          </span>
          {tour.modifiedtime &&
            (() => {
              const date = parseDateString(tour.modifiedtime);
              if (isNaN(date.getTime())) return null;
              return (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {date.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              );
            })()}
        </div>
      </div>
    </Link>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const TourCard = memo(TourCardComponent, (prevProps, nextProps) => {
  // tour 객체의 주요 속성만 비교하여 리렌더링 최적화
  return (
    prevProps.tour.contentid === nextProps.tour.contentid &&
    prevProps.tour.title === nextProps.tour.title &&
    prevProps.tour.firstimage === nextProps.tour.firstimage &&
    prevProps.tour.firstimage2 === nextProps.tour.firstimage2 &&
    prevProps.tour.addr1 === nextProps.tour.addr1 &&
    prevProps.tour.contenttypeid === nextProps.tour.contenttypeid &&
    prevProps.tour.modifiedtime === nextProps.tour.modifiedtime &&
    prevProps.className === nextProps.className
  );
});
