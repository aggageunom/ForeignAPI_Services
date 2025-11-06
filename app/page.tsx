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

import { TourList } from "@/components/tour-list";
import { Error } from "@/components/ui/error";
import { getAreaBasedList } from "@/lib/api/tour-api";

interface HomePageProps {
  searchParams: Promise<{
    areaCode?: string;
    contentTypeId?: string;
    keyword?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const areaCode = params.areaCode;
  const contentTypeId = params.contentTypeId;
  const page = parseInt(params.page || "1", 10);

  try {
    // 기본값: 서울 지역 (areaCode: 1) 또는 전체
    const tours = await getAreaBasedList(
      areaCode || undefined,
      contentTypeId as any,
      page,
      20,
    );

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">관광지 목록</h1>
          <p className="mt-2 text-muted-foreground">
            전국의 관광지 정보를 검색하고 확인하세요.
          </p>
        </div>

        <TourList tours={tours} />
      </main>
    );
  } catch (error) {
    console.error("[HomePage] API 호출 오류:", error);
    return (
      <main className="container mx-auto px-4 py-8">
        <Error
          message={
            error instanceof Error
              ? error.message
              : "관광지 목록을 불러오는 중 오류가 발생했습니다."
          }
        />
      </main>
    );
  }
}
