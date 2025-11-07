/**
 * @file stats-api.ts
 * @description 통계 대시보드 데이터 수집 함수들
 *
 * 한국관광공사 API를 활용하여 통계 데이터를 수집하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 집계
 * 2. 타입별 관광지 개수 집계
 * 3. 통계 요약 정보 생성
 *
 * @dependencies
 * - lib/api/tour-api.ts: getAreaCode, getAreaBasedList
 * - lib/types/stats.ts: RegionStats, TypeStats, StatsSummary
 * - lib/types/tour.ts: CONTENT_TYPE, CONTENT_TYPE_NAME
 */

import { getAreaCode } from "./tour-api";
import type { RegionStats, TypeStats, StatsSummary } from "@/lib/types/stats";
import {
  CONTENT_TYPE,
  CONTENT_TYPE_NAME,
  type ContentTypeId,
  type ApiResponse,
  type TourItem,
} from "@/lib/types/tour";

/**
 * 지역별 관광지 개수 집계
 * @returns 지역별 통계 배열
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  console.group("[Stats API] 지역별 통계 수집 시작");

  try {
    // 시/도 단위 지역코드 조회
    const areaCodes = await getAreaCode();
    console.log(`[Stats API] 지역코드 ${areaCodes.length}개 조회 완료`);

    // 각 지역별로 관광지 개수 조회 (병렬 처리)
    // 성능을 위해 제한적으로 처리 (상위 10개 지역만 상세 조회)
    const statsPromises = areaCodes.slice(0, 10).map(async (area) => {
      try {
        // API 직접 호출하여 totalCount 가져오기
        const response = await fetch(
          `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${
            process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY
          }&MobileOS=ETC&MobileApp=MyTrip&_type=json&areaCode=${
            area.code
          }&pageNo=1&numOfRows=1`,
        );
        const jsonData: ApiResponse<TourItem[]> = await response.json();
        const totalCount = jsonData.response.body.totalCount || 0;

        return {
          code: area.code,
          name: area.name,
          count: totalCount,
        };
      } catch (error) {
        console.warn(`[Stats API] 지역 ${area.name} 통계 조회 실패:`, error);
        return {
          code: area.code,
          name: area.name,
          count: 0,
        };
      }
    });

    const stats = await Promise.all(statsPromises);

    // 개수 기준 내림차순 정렬
    const sortedStats = stats.sort((a, b) => b.count - a.count);

    console.log(
      `[Stats API] 지역별 통계 수집 완료: ${sortedStats.length}개 지역`,
    );
    console.groupEnd();

    return sortedStats;
  } catch (error) {
    console.error("[Stats API] 지역별 통계 수집 실패:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 타입별 관광지 개수 집계
 * @returns 타입별 통계 배열
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  console.group("[Stats API] 타입별 통계 수집 시작");

  try {
    // 모든 관광 타입에 대해 개수 조회 (병렬 처리)
    const typeIds = Object.values(CONTENT_TYPE) as ContentTypeId[];
    const apiKey =
      process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

    if (!apiKey) {
      throw new Error("API 키가 설정되지 않았습니다.");
    }

    const statsPromises = typeIds.map(async (typeId) => {
      try {
        // API 직접 호출하여 totalCount 가져오기
        const response = await fetch(
          `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${apiKey}&MobileOS=ETC&MobileApp=MyTrip&_type=json&contentTypeId=${typeId}&pageNo=1&numOfRows=1`,
        );
        const jsonData: ApiResponse<TourItem[]> = await response.json();
        const totalCount = jsonData.response.body.totalCount || 0;

        return {
          typeId,
          typeName: CONTENT_TYPE_NAME[typeId],
          count: totalCount,
          percentage: 0, // 나중에 계산
        };
      } catch (error) {
        console.warn(
          `[Stats API] 타입 ${CONTENT_TYPE_NAME[typeId]} 통계 조회 실패:`,
          error,
        );
        return {
          typeId,
          typeName: CONTENT_TYPE_NAME[typeId],
          count: 0,
          percentage: 0,
        };
      }
    });

    const stats = await Promise.all(statsPromises);

    // 전체 개수 계산
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);

    // 비율 계산
    const statsWithPercentage = stats.map((stat) => ({
      ...stat,
      percentage: totalCount > 0 ? (stat.count / totalCount) * 100 : 0,
    }));

    // 개수 기준 내림차순 정렬
    const sortedStats = statsWithPercentage.sort((a, b) => b.count - a.count);

    console.log(
      `[Stats API] 타입별 통계 수집 완료: ${sortedStats.length}개 타입`,
    );
    console.groupEnd();

    return sortedStats;
  } catch (error) {
    console.error("[Stats API] 타입별 통계 수집 실패:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 통계 요약 정보 생성
 * @returns 통계 요약 정보
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  console.group("[Stats API] 통계 요약 정보 생성 시작");

  try {
    // 지역별 및 타입별 통계 병렬 조회
    const [regionStats, typeStats] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 전체 관광지 수 계산 (지역별 합계 또는 타입별 합계 중 큰 값)
    const totalFromRegions = regionStats.reduce(
      (sum, stat) => sum + stat.count,
      0,
    );
    const totalFromTypes = typeStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalCount = Math.max(totalFromRegions, totalFromTypes);

    // Top 3 지역
    const topRegions = regionStats.slice(0, 3).map((stat) => ({
      code: stat.code,
      name: stat.name,
      count: stat.count,
    }));

    // Top 3 타입
    const topTypes = typeStats.slice(0, 3).map((stat) => ({
      typeId: stat.typeId,
      typeName: stat.typeName,
      count: stat.count,
    }));

    const summary: StatsSummary = {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated: new Date(),
    };

    console.log("[Stats API] 통계 요약 정보 생성 완료");
    console.groupEnd();

    return summary;
  } catch (error) {
    console.error("[Stats API] 통계 요약 정보 생성 실패:", error);
    console.groupEnd();
    throw error;
  }
}
