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
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE_NAME } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  tour: TourItem;
  className?: string;
}

export function TourCard({ tour, className }: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2;
  const contentTypeName =
    CONTENT_TYPE_NAME[tour.contenttypeid as keyof typeof CONTENT_TYPE_NAME] ||
    "관광지";

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg",
        className,
      )}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* 카드 내용 */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* 관광지명 */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="line-clamp-1">
            {tour.addr1}
            {tour.addr2 && ` ${tour.addr2}`}
          </span>
        </div>

        {/* 관광 타입 뱃지 및 수정일 */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {contentTypeName}
          </span>
          {tour.modifiedtime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(tour.modifiedtime).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
