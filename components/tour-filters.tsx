/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 반려동물 동반, 주차 가능 필터를 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 선택)
 * 2. 시/군/구 필터 (시/도 선택 시 활성화)
 * 3. 관광 타입 필터 (12, 14, 15, 25, 28, 32, 38, 39)
 * 4. 반려동물 동반 가능 필터 (토글)
 * 5. 주차 가능 필터 (토글)
 * 6. URL Query를 통한 필터 상태 관리
 * 7. "전체" 옵션 제공
 *
 * @dependencies
 * - lib/types/tour.ts: CONTENT_TYPE, CONTENT_TYPE_NAME
 * - actions/tour-actions.ts: getSigunguCodes (Server Action)
 * - next/navigation: useRouter, useSearchParams
 * - components/ui/button: 필터 초기화 버튼
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  CONTENT_TYPE,
  CONTENT_TYPE_NAME,
  type AreaCode,
} from "@/lib/types/tour";
import { getSigunguCodes } from "@/actions/tour-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const currentSigunguCode = searchParams.get("sigunguCode") || "";
  const currentContentTypeId = searchParams.get("contentTypeId") || "";
  const petFriendly = searchParams.get("petFriendly") === "true";
  const parkingAvailable = searchParams.get("parkingAvailable") === "true";

  // 시/군/구 코드 목록 상태
  const [sigunguCodes, setSigunguCodes] = useState<AreaCode[]>([]);
  const [loadingSigungu, setLoadingSigungu] = useState(false);

  // 실제 지역코드가 있으면 사용, 없으면 기본값 사용
  const availableAreaCodes =
    areaCodes.length > 0 ? areaCodes : DEFAULT_AREA_CODES;

  /**
   * 시/도 선택 시 해당 시/도의 시/군/구 목록 로드
   */
  useEffect(() => {
    console.group("[TourFilters] 시/군/구 목록 로드");
    console.log("현재 선택된 시/도 코드:", currentAreaCode);

    if (currentAreaCode) {
      setLoadingSigungu(true);
      getSigunguCodes(currentAreaCode)
        .then((codes) => {
          if (codes) {
            console.log(`시/군/구 목록 로드 완료:`, codes.length, "개");
            setSigunguCodes(codes);
          } else {
            console.warn("시/군/구 목록 로드 결과 없음");
            setSigunguCodes([]);
          }
        })
        .catch((error) => {
          console.error("시/군/구 목록 로드 실패:", error);
          setSigunguCodes([]);
        })
        .finally(() => {
          setLoadingSigungu(false);
        });
    } else {
      console.log("시/도가 선택되지 않아 시/군/구 목록 초기화");
      setSigunguCodes([]);
    }

    console.groupEnd();
  }, [currentAreaCode]);

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

    // 시/도 변경 시 시/군/구 필터 초기화
    if (key === "areaCode") {
      params.delete("sigunguCode");
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
    currentSigunguCode !== "" ||
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

      {/* 선택 필터 영역 (지역, 시/군/구, 관광 타입) */}
      <div className="space-y-4 rounded-md border bg-muted/30 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* 지역 필터 (시/도) */}
          <div className="space-y-2">
            <Label htmlFor="area-filter">지역 (시/도)</Label>
            <Select
              value={currentAreaCode || "all"}
              onValueChange={(value) =>
                handleFilterChange("areaCode", value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="area-filter" className="w-full">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">전체</SelectItem>
                {availableAreaCodes.map((area) => (
                  <SelectItem key={area.code} value={area.code}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 시/군/구 필터 */}
          <div className="space-y-2">
            <Label htmlFor="sigungu-filter">
              시/군/구
              {loadingSigungu && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (로딩 중...)
                </span>
              )}
            </Label>
            <Select
              value={currentSigunguCode || "all"}
              onValueChange={(value) =>
                handleFilterChange("sigunguCode", value === "all" ? "" : value)
              }
              disabled={!currentAreaCode || loadingSigungu}
            >
              <SelectTrigger id="sigungu-filter" className="w-full">
                <SelectValue
                  placeholder={
                    !currentAreaCode ? "시/도를 먼저 선택하세요" : "전체"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {currentAreaCode && <SelectItem value="all">전체</SelectItem>}
                {sigunguCodes.map((sigungu) => (
                  <SelectItem key={sigungu.code} value={sigungu.code}>
                    {sigungu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 관광 타입 필터 */}
          <div className="space-y-2">
            <Label htmlFor="content-type-filter">관광 타입</Label>
            <Select
              value={currentContentTypeId || "all"}
              onValueChange={(value) =>
                handleFilterChange(
                  "contentTypeId",
                  value === "all" ? "" : value,
                )
              }
            >
              <SelectTrigger id="content-type-filter" className="w-full">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">전체</SelectItem>
                {Object.values(CONTENT_TYPE).map((value) => (
                  <SelectItem key={value} value={value}>
                    {CONTENT_TYPE_NAME[value as keyof typeof CONTENT_TYPE_NAME]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 활성 필터 표시 */}
        {hasActiveFilters &&
          (currentAreaCode || currentSigunguCode || currentContentTypeId) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {currentAreaCode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  시/도:{" "}
                  {
                    availableAreaCodes.find((a) => a.code === currentAreaCode)
                      ?.name
                  }
                  <button
                    onClick={() => handleFilterChange("areaCode", "")}
                    className="ml-1 hover:text-primary/80"
                    aria-label="지역 필터 제거"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {currentSigunguCode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  시/군/구:{" "}
                  {
                    sigunguCodes.find((s) => s.code === currentSigunguCode)
                      ?.name
                  }
                  <button
                    onClick={() => handleFilterChange("sigunguCode", "")}
                    className="ml-1 hover:text-primary/80"
                    aria-label="시/군/구 필터 제거"
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

      {/* 토글 필터 영역 (반려동물, 주차) */}
      <div className="space-y-4 rounded-md border bg-muted/30 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* 반려동물 동반 가능 필터 */}
          <div className="space-y-2">
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
          <div className="space-y-2">
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
        </div>

        {/* 활성 토글 필터 표시 */}
        {(petFriendly || parkingAvailable) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
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
    </div>
  );
}
