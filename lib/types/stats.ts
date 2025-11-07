/**
 * @file stats.ts
 * @description 통계 대시보드 관련 TypeScript 타입 정의
 *
 * 통계 대시보드 페이지에서 사용하는 데이터 구조를 정의합니다.
 *
 * 주요 타입:
 * - RegionStats: 지역별 관광지 통계
 * - TypeStats: 타입별 관광지 통계
 * - StatsSummary: 통계 요약 정보
 */

import type { ContentTypeId } from "./tour";

/**
 * 지역별 관광지 통계
 */
export interface RegionStats {
  code: string; // 지역 코드
  name: string; // 지역명
  count: number; // 관광지 개수
}

/**
 * 타입별 관광지 통계
 */
export interface TypeStats {
  typeId: ContentTypeId; // 관광 타입 ID
  typeName: string; // 관광 타입명
  count: number; // 관광지 개수
  percentage: number; // 비율 (백분율)
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  totalCount: number; // 전체 관광지 수
  topRegions: Array<{
    code: string;
    name: string;
    count: number;
  }>; // Top 3 지역
  topTypes: Array<{
    typeId: ContentTypeId;
    typeName: string;
    count: number;
  }>; // Top 3 타입
  lastUpdated: Date; // 마지막 업데이트 시간
}
