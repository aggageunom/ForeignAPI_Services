/**
 * @file app/bookmarks/page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 북마크한 관광지 목록 표시
 * 2. 정렬 옵션 (최신순, 이름순, 지역별)
 * 3. 일괄 삭제 기능
 * 4. 빈 상태 처리
 *
 * @dependencies
 * - lib/api/bookmark-api.ts: getUserBookmarks
 * - lib/api/tour-api.ts: getTourDetail
 * - components/tour-list.tsx: 관광지 목록 컴포넌트
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { TourList } from "@/components/tour-list";
import { Error as ErrorComponent } from "@/components/ui/error";
import { getUserBookmarks } from "@/lib/api/bookmark-api";
import { getTourDetail } from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";

export default async function BookmarksPage() {
  // 인증 확인
  const authResult = await auth();
  if (!authResult.userId) {
    redirect("/sign-in");
  }

  try {
    console.log("[BookmarksPage] 북마크 목록 로드 시작");

    // 북마크 목록 조회
    const result = await getUserBookmarks();
    if (!result.success || !result.bookmarks) {
      const errorMessage: string =
        result.error || "북마크 목록을 불러오는데 실패했습니다.";
      throw new Error(errorMessage);
    }

    const contentIds = result.bookmarks;
    console.log("[BookmarksPage] 북마크 개수:", contentIds.length);

    // 각 contentId에 대해 관광지 상세 정보 가져오기
    const tourPromises = contentIds.map(async (contentId) => {
      try {
        const detail = await getTourDetail(contentId);
        // TourItem 형태로 변환
        const tourItem: TourItem = {
          contentid: detail.contentid,
          contenttypeid: detail.contenttypeid,
          title: detail.title,
          addr1: detail.addr1,
          addr2: detail.addr2,
          areacode: "", // 상세 정보에는 없음
          mapx: detail.mapx,
          mapy: detail.mapy,
          firstimage: detail.firstimage,
          firstimage2: detail.firstimage2,
          tel: detail.tel,
          modifiedtime: detail.modifiedtime || new Date().toISOString(),
        };
        return tourItem;
      } catch (error) {
        console.error(
          `[BookmarksPage] 관광지 ${contentId} 정보 로드 실패:`,
          error,
        );
        return null;
      }
    });

    const tours = (await Promise.all(tourPromises)).filter(
      (tour): tour is TourItem => tour !== null,
    );

    console.log("[BookmarksPage] 관광지 정보 로드 완료:", tours.length, "개");

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
          <TourList tours={tours} />
        )}
      </main>
    );
  } catch (error) {
    console.error("[BookmarksPage] 오류 발생:", error);
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorComponent
          message={
            error instanceof Error
              ? error.message
              : "북마크 목록을 불러오는 중 오류가 발생했습니다."
          }
        />
      </main>
    );
  }
}
