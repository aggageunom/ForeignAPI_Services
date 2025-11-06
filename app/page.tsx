/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 이 페이지는 관광지 목록을 표시하는 메인 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 목록 표시 (기본: 전체 목록 또는 서울 지역)
 * 2. 필터 기능 (지역, 관광 타입)
 * 3. 검색 기능
 * 4. 지도 연동 (향후 구현)
 *
 * @dependencies
 * - components/tour-list.tsx: 관광지 목록 컴포넌트
 * - lib/api/tour-api.ts: 한국관광공사 API 함수들
 */

import type { Metadata } from "next";
import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { TourSort } from "@/components/tour-sort";
import { TourPagination } from "@/components/tour-pagination";
import { Error } from "@/components/ui/error";
import {
  getAreaBasedList,
  getAreaCode,
  searchKeyword,
} from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";

export const metadata: Metadata = {
  title: "한국 관광지 검색",
  description:
    "전국의 관광지 정보를 지역별, 타입별로 검색하고 상세 정보를 확인하세요. 한국관광공사 공공 API 기반의 신뢰할 수 있는 관광지 정보 서비스입니다.",
  openGraph: {
    title: "My Trip - 한국 관광지 정보 서비스",
    description:
      "전국의 관광지 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    images: ["/og-image.png"],
  },
};

/**
 * 날짜 문자열을 파싱하여 Date 객체로 변환합니다.
 * 유효하지 않은 날짜 형식도 처리합니다.
 */
function parseDate(dateString: string): Date {
  if (!dateString || dateString.trim() === "") {
    return new Date(NaN);
  }

  // 일반적인 날짜 형식 시도
  const date = new Date(dateString);

  // 유효하지 않은 경우 다른 형식 시도
  if (isNaN(date.getTime())) {
    // YYYYMMDD 형식인 경우
    if (/^\d{8}$/.test(dateString)) {
      const year = parseInt(dateString.substring(0, 4), 10);
      const month = parseInt(dateString.substring(4, 6), 10) - 1;
      const day = parseInt(dateString.substring(6, 8), 10);
      return new Date(year, month, day);
    }
  }

  return date;
}

interface HomePageProps {
  searchParams: Promise<{
    areaCode?: string;
    contentTypeId?: string;
    keyword?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const areaCode = params.areaCode;
  const contentTypeId = params.contentTypeId;
  const keyword = params.keyword;
  const page = parseInt(params.page || "1", 10);
  const sort = (params.sort || "latest") as "latest" | "name-asc" | "name-desc";
  const numOfRows = 20;

  try {
    // 지역코드 목록 가져오기 (필터 컴포넌트용)
    let areaCodes: Awaited<ReturnType<typeof getAreaCode>> = [];
    try {
      areaCodes = await getAreaCode();
      console.log("[HomePage] 지역코드 로드 완료:", areaCodes.length, "개");
    } catch (error) {
      console.warn("[HomePage] 지역코드 로드 실패, 기본값 사용:", error);
      // 기본값은 TourFilters 컴포넌트에서 처리
    }

    // 관광지 목록 가져오기 (키워드가 있으면 검색, 없으면 지역 기반)
    let tours: TourItem[];
    if (keyword && keyword.trim() !== "") {
      console.log("[HomePage] 키워드 검색 실행:", keyword);
      tours = await searchKeyword(
        keyword,
        areaCode || undefined,
        contentTypeId as any,
        page,
        numOfRows,
      );
    } else {
      console.log("[HomePage] 지역 기반 목록 조회");
      tours = await getAreaBasedList(
        areaCode || undefined,
        contentTypeId as any,
        page,
        numOfRows,
      );
    }

    // 정렬 처리 (클라이언트 사이드)
    if (sort === "name-asc") {
      tours = [...tours].sort((a, b) => a.title.localeCompare(b.title, "ko"));
    } else if (sort === "name-desc") {
      tours = [...tours].sort((a, b) => b.title.localeCompare(a.title, "ko"));
    } else {
      // 최신순 (modifiedtime 기준 내림차순)
      tours = [...tours].sort((a, b) => {
        const dateA = parseDate(a.modifiedtime);
        const dateB = parseDate(b.modifiedtime);
        // 유효하지 않은 날짜는 뒤로
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
      });
    }

    // 페이지네이션 계산
    // 현재 페이지의 데이터 개수가 numOfRows보다 적으면 마지막 페이지로 간주
    const hasMore = tours.length >= numOfRows;
    const totalPages = hasMore ? page + 1 : page; // 정확하지 않지만 대략적인 값

    console.log("[HomePage] 관광지 목록 로드:", {
      areaCode,
      contentTypeId,
      keyword,
      page,
      sort,
      count: tours.length,
      totalPages,
      method: keyword ? "searchKeyword" : "areaBasedList",
    });

    return (
      <main className="min-h-screen">
        {/* 히어로 섹션 (선택 사항) */}
        {!keyword && !areaCode && !contentTypeId && (
          <section className="bg-gradient-to-br from-primary/10 via-background to-background py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  제이엘글로벌과 함께 한국의 아름다운 관광지를 탐험하세요
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  전국의 관광지 정보를 검색하고 확인하세요
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* 필터 컴포넌트 */}
          <div className="mb-6 sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4 -mx-4 px-4">
            <TourFilters areaCodes={areaCodes} />
          </div>

          {/* 정렬 및 결과 개수 */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {(areaCode || contentTypeId || keyword) && (
                <>
                  <span className="font-medium text-foreground">
                    {tours.length}개
                  </span>
                  의 관광지가 검색되었습니다.
                  {keyword && (
                    <span className="ml-2">
                      검색어: &quot;
                      <span className="font-medium text-foreground">
                        {keyword}
                      </span>
                      &quot;
                    </span>
                  )}
                </>
              )}
              {!areaCode && !contentTypeId && !keyword && (
                <span>전국의 관광지를 둘러보세요</span>
              )}
            </div>
            <TourSort />
          </div>

          {/* 관광지 목록 */}
          <TourList tours={tours} />

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-8">
              <TourPagination currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </div>
      </main>
    );
  } catch (error: unknown) {
    console.error("[HomePage] API 호출 오류:", error);
    let errorMessage = "관광지 목록을 불러오는 중 오류가 발생했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === "object") {
      const errorObj = error as { message?: string };
      if (typeof errorObj.message === "string") {
        errorMessage = errorObj.message;
      }
    }
    return (
      <main className="container mx-auto px-4 py-8">
        <Error message={errorMessage} />
      </main>
    );
  }
}
