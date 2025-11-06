/**
 * @file tour-sort.tsx
 * @description 관광지 정렬 컴포넌트
 *
 * 관광지 목록 정렬 옵션을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 정렬 옵션 선택 (최신순, 이름순)
 * 2. URL Query를 통한 정렬 상태 관리
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - lucide-react: 정렬 아이콘
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SortOption = "latest" | "name-asc" | "name-desc";

interface TourSortProps {
  className?: string;
}

export function TourSort({ className }: TourSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortParam = searchParams.get("sort") || "latest";
  const currentSort = sortParam as SortOption;

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());

    if (sort === "latest") {
      params.delete("sort");
    } else if (sort === "name-asc") {
      // 이름순 클릭 시 오름차순/내림차순 토글
      if (currentSort === "name-asc") {
        params.set("sort", "name-desc");
      } else {
        params.set("sort", "name-asc");
      }
    } else {
      // name-desc인 경우 다시 name-asc로
      params.set("sort", "name-asc");
    }

    // 페이지는 1로 리셋
    params.delete("page");

    router.push(`/?${params.toString()}`);
  };

  // 이름순 버튼의 아이콘과 라벨 결정
  const getNameSortButton = () => {
    const isNameSort =
      currentSort === "name-asc" || currentSort === "name-desc";
    const isDesc = currentSort === "name-desc";
    const label = isDesc ? "이름순 (내림차순)" : "이름순 (오름차순)";
    const icon = isDesc ? (
      <ArrowDownAZ className="h-4 w-4" />
    ) : (
      <ArrowUpAZ className="h-4 w-4" />
    );

    return { label, icon, isActive: isNameSort };
  };

  const nameSortButton = getNameSortButton();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">정렬:</span>
      <div className="flex gap-1 rounded-md border bg-background p-1">
        {/* 최신순 버튼 */}
        <Button
          variant={currentSort === "latest" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSortChange("latest")}
          className={cn(
            "h-8 gap-1.5 text-xs",
            currentSort === "latest" && "bg-primary text-primary-foreground",
          )}
        >
          <Calendar className="h-4 w-4" />
          최신순
        </Button>

        {/* 이름순 버튼 (토글) */}
        <Button
          variant={nameSortButton.isActive ? "default" : "ghost"}
          size="sm"
          onClick={() => handleSortChange("name-asc")}
          className={cn(
            "h-8 gap-1.5 text-xs",
            nameSortButton.isActive && "bg-primary text-primary-foreground",
          )}
        >
          {nameSortButton.icon}
          {nameSortButton.label}
        </Button>
      </div>
    </div>
  );
}
