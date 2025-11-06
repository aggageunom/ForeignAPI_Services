/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록을 그리드로 표시
 * 2. 로딩 상태 표시 (스켈레톤 UI)
 * 3. 빈 상태 처리
 * 4. 반응형 레이아웃 (모바일/태블릿/데스크톱)
 *
 * @dependencies
 * - components/tour-card.tsx: TourCard 컴포넌트
 * - components/ui/skeleton.tsx: 스켈레톤 UI
 * - lib/types/tour.ts: TourItem 타입
 */

"use client";

import { TourCard } from "@/components/tour-card";
import { TourListSkeleton } from "@/components/ui/skeleton";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourListProps {
  tours: TourItem[];
  isLoading?: boolean;
  className?: string;
}

export function TourList({ tours, isLoading, className }: TourListProps) {
  if (isLoading) {
    return <TourListSkeleton count={9} />;
  }

  if (tours.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-16",
          className,
        )}
      >
        <p className="text-lg font-semibold text-muted-foreground">
          관광지 정보가 없습니다.
        </p>
        <p className="text-sm text-muted-foreground">
          다른 지역이나 타입을 선택해보세요.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {tours.map((tour) => (
        <TourCard key={tour.contentid} tour={tour} />
      ))}
    </div>
  );
}
