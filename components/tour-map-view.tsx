/**
 * @file tour-map-view.tsx
 * @description 관광지 목록과 지도를 함께 표시하는 컴포넌트
 *
 * 이 컴포넌트는 홈페이지에서 관광지 목록과 지도를 함께 표시합니다.
 *
 * 주요 기능:
 * 1. 데스크톱: 리스트(좌측) + 지도(우측) 분할 레이아웃
 * 2. 모바일: 탭 형태로 리스트/지도 전환
 * 3. 리스트 항목 클릭 시 해당 마커로 지도 이동
 *
 * @dependencies
 * - components/tour-list.tsx: 관광지 목록
 * - components/naver-map.tsx: 네이버 지도
 * - lib/types/tour.ts: TourItem
 */

"use client";

import { useState, useCallback } from "react";
import { Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourList } from "@/components/tour-list";
import { NaverMap } from "@/components/naver-map";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourMapViewProps {
  tours: TourItem[];
  className?: string;
}

type ViewMode = "list" | "map" | "both";

export function TourMapView({ tours, className }: TourMapViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [highlightedTourId, setHighlightedTourId] = useState<
    string | undefined
  >();

  // 리스트 항목 클릭 핸들러
  const handleTourClick = useCallback((tour: TourItem) => {
    console.log("[TourMapView] 관광지 클릭:", tour.title);
    setSelectedTourId(tour.contentid);
  }, []);

  // 리스트 항목 호버 핸들러
  const handleTourHover = useCallback((tour: TourItem | null) => {
    if (tour) {
      console.log("[TourMapView] 관광지 호버:", tour.title);
      setHighlightedTourId(tour.contentid);
    } else {
      setHighlightedTourId(undefined);
    }
  }, []);

  // 마커 클릭 핸들러
  const handleMarkerClick = useCallback((tour: TourItem) => {
    console.log("[TourMapView] 마커 클릭:", tour.title);
    setSelectedTourId(tour.contentid);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* 모바일: 뷰 모드 전환 버튼 */}
      <div className="flex gap-2 md:hidden">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="flex-1"
        >
          <List className="mr-2 h-4 w-4" />
          목록
        </Button>
        <Button
          variant={viewMode === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("map")}
          className="flex-1"
        >
          <Map className="mr-2 h-4 w-4" />
          지도
        </Button>
      </div>

      {/* 데스크톱: 분할 레이아웃, 모바일: 탭 전환 */}
      <div
        className={cn(
          "grid gap-4",
          viewMode === "both"
            ? "md:grid-cols-2"
            : viewMode === "list"
            ? "grid-cols-1"
            : "grid-cols-1",
        )}
      >
        {/* 관광지 목록 */}
        <div
          className={cn(
            viewMode === "map" && "hidden md:block",
            viewMode === "list" && "block",
            viewMode === "both" && "block",
          )}
        >
          <TourListWithClick
            tours={tours}
            onTourClick={handleTourClick}
            onTourHover={handleTourHover}
          />
        </div>

        {/* 지도 */}
        <div
          className={cn(
            viewMode === "list" && "hidden md:block",
            viewMode === "map" && "block",
            viewMode === "both" && "block",
          )}
        >
          <NaverMap
            tours={tours}
            selectedTourId={selectedTourId}
            highlightedTourId={highlightedTourId}
            onMarkerClick={handleMarkerClick}
            height="600px"
          />
        </div>
      </div>
    </div>
  );
}

// TourList 래퍼 컴포넌트
interface TourListWithClickProps {
  tours: TourItem[];
  onTourClick: (tour: TourItem) => void;
  onTourHover: (tour: TourItem | null) => void;
}

function TourListWithClick({
  tours,
  onTourClick,
  onTourHover,
}: TourListWithClickProps) {
  return (
    <TourList
      tours={tours}
      onTourClick={onTourClick}
      onTourHover={onTourHover}
    />
  );
}
