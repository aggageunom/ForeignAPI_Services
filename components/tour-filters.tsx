/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 반려동물 동반, 주차 가능 필터를 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 선택)
 * 2. 관광 타입 필터 (12, 14, 15, 25, 28, 32, 38, 39)
 * 3. 반려동물 동반 가능 필터 (토글)
 * 4. 주차 가능 필터 (토글)
 * 5. URL Query를 통한 필터 상태 관리
 * 6. "전체" 옵션 제공
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
  const petFriendly = searchParams.get("petFriendly") === "true";
  const parkingAvailable = searchParams.get("parkingAvailable") === "true";

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
   * 반려동물 필터 토글 핸들러
   */
  const handlePetFriendlyToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (petFriendly) {
      params.delete("petFriendly");
    } else {
      params.set("petFriendly", "true");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  /**
   * 주차 가능 필터 토글 핸들러
   */
  const handleParkingToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (parkingAvailable) {
      params.delete("parkingAvailable");
    } else {
      params.set("parkingAvailable", "true");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  /**
   * 필터가 적용되어 있는지 확인
   */
  const hasActiveFilters =
    currentAreaCode !== "" ||
    currentContentTypeId !== "" ||
    petFriendly ||
    parkingAvailable;

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
            {Object.values(CONTENT_TYPE).map((value) => (
              <option key={value} value={value}>
                {CONTENT_TYPE_NAME[value as keyof typeof CONTENT_TYPE_NAME]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 반려동물 동반 가능 필터 */}
      <div className="space-y-2 border-t pt-4">
        <Label
          htmlFor="pet-friendly-filter"
          className="flex items-center gap-2"
        >
          <span className="text-lg">🐾</span>
          반려동물 동반 가능
        </Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePetFriendlyToggle}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              petFriendly
                ? "bg-green-600 dark:bg-green-500"
                : "bg-gray-200 dark:bg-gray-700",
            )}
            role="switch"
            aria-checked={petFriendly}
            aria-label="반려동물 동반 가능 필터"
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                petFriendly ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
          <span className="text-sm text-muted-foreground">
            {petFriendly
              ? "반려동물 동반 가능한 관광지만 표시"
              : "모든 관광지 표시"}
          </span>
        </div>
        {petFriendly && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            ⚠️ 반려동물 정보는 각 관광지 상세페이지에서 확인할 수 있습니다.
          </p>
        )}
      </div>

      {/* 주차 가능 필터 */}
      <div className="space-y-2 border-t pt-4">
        <Label htmlFor="parking-filter" className="flex items-center gap-2">
          <span className="text-lg">🅿️</span>
          주차 가능
        </Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleParkingToggle}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              parkingAvailable
                ? "bg-blue-600 dark:bg-blue-500"
                : "bg-gray-200 dark:bg-gray-700",
            )}
            role="switch"
            aria-checked={parkingAvailable}
            aria-label="주차 가능 필터"
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                parkingAvailable ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
          <span className="text-sm text-muted-foreground">
            {parkingAvailable
              ? "주차 가능한 관광지만 표시"
              : "모든 관광지 표시"}
          </span>
        </div>
        {parkingAvailable && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            ℹ️ 주차 정보는 각 관광지 상세페이지에서 확인할 수 있습니다.
          </p>
        )}
      </div>

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
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
          {petFriendly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs text-green-700 dark:text-green-400">
              <span>🐾</span>
              반려동물 동반 가능
              <button
                onClick={handlePetFriendlyToggle}
                className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                aria-label="반려동물 필터 제거"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {parkingAvailable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs text-blue-700 dark:text-blue-400">
              <span>🅿️</span>
              주차 가능
              <button
                onClick={handleParkingToggle}
                className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                aria-label="주차 필터 제거"
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
