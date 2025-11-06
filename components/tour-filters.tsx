/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역 및 관광 타입 필터를 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 선택)
 * 2. 관광 타입 필터 (12, 14, 15, 25, 28, 32, 38, 39)
 * 3. URL Query를 통한 필터 상태 관리
 * 4. "전체" 옵션 제공
 *
 * @dependencies
 * - lib/types/tour.ts: CONTENT_TYPE, CONTENT_TYPE_NAME
 * - next/navigation: useRouter, useSearchParams
 * - components/ui/button: 필터 초기화 버튼
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  CONTENT_TYPE,
  CONTENT_TYPE_NAME,
  type AreaCode,
} from "@/lib/types/tour";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TourFiltersProps {
  areaCodes: AreaCode[];
  className?: string;
}

/**
 * 지역코드 기본 목록 (한국관광공사 API 표준)
 * 실제로는 API에서 가져오지만, 초기값으로 사용
 */
const DEFAULT_AREA_CODES: AreaCode[] = [
  { code: "1", name: "서울" },
  { code: "2", name: "인천" },
  { code: "3", name: "대전" },
  { code: "4", name: "대구" },
  { code: "5", name: "광주" },
  { code: "6", name: "부산" },
  { code: "7", name: "울산" },
  { code: "8", name: "세종" },
  { code: "31", name: "경기" },
  { code: "32", name: "강원" },
  { code: "33", name: "충북" },
  { code: "34", name: "충남" },
  { code: "35", name: "경북" },
  { code: "36", name: "경남" },
  { code: "37", name: "전북" },
  { code: "38", name: "전남" },
  { code: "39", name: "제주" },
];

export function TourFilters({ areaCodes, className }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentAreaCode = searchParams.get("areaCode") || "";
  const currentContentTypeId = searchParams.get("contentTypeId") || "";

  // 실제 지역코드가 있으면 사용, 없으면 기본값 사용
  const availableAreaCodes =
    areaCodes.length > 0 ? areaCodes : DEFAULT_AREA_CODES;

  /**
   * 필터 값 변경 핸들러
   */
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // 페이지는 1로 리셋
    params.delete("page");

    router.push(`/?${params.toString()}`);
  };

  /**
   * 필터 초기화
   */
  const handleReset = () => {
    router.push("/");
  };

  /**
   * 필터가 적용되어 있는지 확인
   */
  const hasActiveFilters =
    currentAreaCode !== "" || currentContentTypeId !== "";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">필터</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-1 text-xs"
          >
            <X className="h-3 w-3" />
            초기화
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 지역 필터 */}
        <div className="space-y-2">
          <Label htmlFor="area-filter">지역</Label>
          <select
            id="area-filter"
            value={currentAreaCode}
            onChange={(e) => handleFilterChange("areaCode", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">전체</option>
            {availableAreaCodes.map((area) => (
              <option key={area.code} value={area.code}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* 관광 타입 필터 */}
        <div className="space-y-2">
          <Label htmlFor="content-type-filter">관광 타입</Label>
          <select
            id="content-type-filter"
            value={currentContentTypeId}
            onChange={(e) =>
              handleFilterChange("contentTypeId", e.target.value)
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">전체</option>
            {Object.entries(CONTENT_TYPE).map(([key, value]) => (
              <option key={value} value={value}>
                {CONTENT_TYPE_NAME[value as keyof typeof CONTENT_TYPE_NAME]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {currentAreaCode && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
              지역:{" "}
              {availableAreaCodes.find((a) => a.code === currentAreaCode)?.name}
              <button
                onClick={() => handleFilterChange("areaCode", "")}
                className="ml-1 hover:text-primary/80"
                aria-label="지역 필터 제거"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {currentContentTypeId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
              타입:{" "}
              {
                CONTENT_TYPE_NAME[
                  currentContentTypeId as keyof typeof CONTENT_TYPE_NAME
                ]
              }
              <button
                onClick={() => handleFilterChange("contentTypeId", "")}
                className="ml-1 hover:text-primary/80"
                aria-label="타입 필터 제거"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
