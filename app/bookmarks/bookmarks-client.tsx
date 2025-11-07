/**
 * @file app/bookmarks/bookmarks-client.tsx
 * @description 북마크 목록 클라이언트 컴포넌트
 *
 * 북마크 목록의 정렬 및 일괄 삭제 기능을 제공하는 클라이언트 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 정렬 옵션 (최신순, 이름순, 지역별)
 * 2. 일괄 삭제 기능
 * 3. 체크박스 선택 기능
 *
 * @dependencies
 * - lib/api/bookmark-api.ts: removeBookmark
 * - components/tour-list.tsx: 관광지 목록 컴포넌트
 * - components/tour-card.tsx: 관광지 카드 컴포넌트
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { Trash2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tour-card";
import type { TourItem } from "@/lib/types/tour";
import { removeBookmark } from "@/lib/api/bookmark-api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BookmarksClientProps {
  initialTours: TourItem[];
}

type SortOption = "latest" | "name-asc" | "name-desc" | "area";

export function BookmarksClient({ initialTours }: BookmarksClientProps) {
  const router = useRouter();
  const [tours, setTours] = useState<TourItem[]>(initialTours);
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // 정렬된 관광지 목록
  const sortedTours = useMemo(() => {
    const sorted = [...tours];

    switch (sortOption) {
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
      case "name-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title, "ko"));
      case "area":
        return sorted.sort((a, b) => {
          // 주소의 첫 번째 부분(시/도)으로 정렬
          const areaA = a.addr1.split(" ")[0] || "";
          const areaB = b.addr1.split(" ")[0] || "";
          return areaA.localeCompare(areaB, "ko");
        });
      case "latest":
      default:
        return sorted.sort((a, b) => {
          const dateA = new Date(a.modifiedtime || 0);
          const dateB = new Date(b.modifiedtime || 0);
          return dateB.getTime() - dateA.getTime();
        });
    }
  }, [tours, sortOption]);

  // 체크박스 토글
  const toggleSelect = useCallback((contentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(contentId)) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });
  }, []);

  // 전체 선택/해제
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === sortedTours.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedTours.map((tour) => tour.contentid)));
    }
  }, [selectedIds.size, sortedTours]);

  // 일괄 삭제
  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.size === 0) {
      return;
    }

    if (!confirm(`선택한 ${selectedIds.size}개의 북마크를 삭제하시겠습니까?`)) {
      return;
    }

    setIsDeleting(true);
    console.group("[BookmarksClient] 일괄 삭제 시작");
    console.log("삭제할 북마크 개수:", selectedIds.size);

    try {
      const deletePromises = Array.from(selectedIds).map(async (contentId) => {
        const result = await removeBookmark(contentId);
        if (!result.success) {
          console.error(
            `[BookmarksClient] 북마크 ${contentId} 삭제 실패:`,
            result.error,
          );
        }
        return result.success;
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter((r) => r).length;

      console.log(
        `[BookmarksClient] 일괄 삭제 완료: ${successCount}/${selectedIds.size}개 성공`,
      );
      console.groupEnd();

      // 삭제된 항목 제거
      setTours((prev) =>
        prev.filter((tour) => !selectedIds.has(tour.contentid)),
      );
      setSelectedIds(new Set());

      // 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error("[BookmarksClient] 일괄 삭제 오류:", error);
      console.groupEnd();
      alert("북마크 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, router]);

  // 개별 삭제
  const handleDelete = useCallback(
    async (contentId: string) => {
      if (!confirm("이 북마크를 삭제하시겠습니까?")) {
        return;
      }

      console.log("[BookmarksClient] 개별 삭제:", contentId);
      const result = await removeBookmark(contentId);

      if (result.success) {
        setTours((prev) => prev.filter((tour) => tour.contentid !== contentId));
        router.refresh();
      } else {
        alert(result.error || "북마크 삭제에 실패했습니다.");
      }
    },
    [router],
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">내 북마크</h1>
        <p className="mt-2 text-muted-foreground">
          북마크한 관광지 {tours.length}개
        </p>
      </div>

      {tours.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p className="text-lg font-semibold text-muted-foreground">
            북마크한 관광지가 없습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            관광지를 북마크하면 여기서 확인할 수 있습니다.
          </p>
        </div>
      ) : (
        <>
          {/* 정렬 및 일괄 삭제 컨트롤 */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* 전체 선택 체크박스 */}
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                {selectedIds.size === sortedTours.length ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
                <span>
                  전체 선택 ({selectedIds.size}/{sortedTours.length})
                </span>
              </button>

              {/* 일괄 삭제 버튼 */}
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  선택 삭제 ({selectedIds.size})
                </Button>
              )}
            </div>

            {/* 정렬 옵션 */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">정렬:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="latest">최신순</option>
                <option value="name-asc">이름순 (가나다)</option>
                <option value="name-desc">이름순 (역순)</option>
                <option value="area">지역별</option>
              </select>
            </div>
          </div>

          {/* 관광지 목록 */}
          <TourListWithCheckbox
            tours={sortedTours}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
          />
        </>
      )}
    </main>
  );
}

// 체크박스가 있는 TourList 컴포넌트
interface TourListWithCheckboxProps {
  tours: TourItem[];
  selectedIds: Set<string>;
  onToggleSelect: (contentId: string) => void;
}

function TourListWithCheckbox({
  tours,
  selectedIds,
  onToggleSelect,
}: TourListWithCheckboxProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour) => {
        const isSelected = selectedIds.has(tour.contentid);
        return (
          <div
            key={tour.contentid}
            className={cn(
              "relative rounded-xl border transition-all overflow-hidden",
              isSelected
                ? "border-primary shadow-lg ring-2 ring-primary"
                : "border-border",
            )}
          >
            {/* 체크박스 */}
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSelect(tour.contentid);
                }}
                className={cn(
                  "rounded-md p-1.5 transition-colors shadow-md",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/90 backdrop-blur-sm hover:bg-muted",
                )}
                type="button"
                aria-label={isSelected ? "선택 해제" : "선택"}
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* TourCard */}
            <TourCard tour={tour} />
          </div>
        );
      })}
    </div>
  );
}
