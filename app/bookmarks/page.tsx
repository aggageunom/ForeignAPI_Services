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
 * - lib/api/bookmark-api.ts: getUserBookmarks, removeBookmark
 * - lib/api/tour-api.ts: getTourDetail
 * - components/tour-list.tsx: 관광지 목록 컴포넌트
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BookmarksClient } from "./bookmarks-client";
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

    const bookmarks = result.bookmarks;
    console.log("[BookmarksPage] 북마크 개수:", bookmarks.length);

    // 각 contentId에 대해 관광지 상세 정보 가져오기
    const tourPromises = bookmarks.map(async (bookmark) => {
      const contentId = bookmark.contentId;
      try {
        const detail = await getTourDetail(contentId);
        // TourItem 형태로 변환 (북마크 생성일을 modifiedtime으로 사용)
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
          modifiedtime: bookmark.createdAt || new Date().toISOString(),
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

    return <BookmarksClient initialTours={tours} />;
  } catch (error) {
    console.error("[BookmarksPage] 오류 발생:", error);
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-lg font-semibold text-destructive">
            {error instanceof Error
              ? error.message
              : "북마크 목록을 불러오는 중 오류가 발생했습니다."}
          </p>
        </div>
      </main>
    );
  }
}
