/**
 * @file app/stats/page.tsx
 * @description 통계 대시보드 페이지
 *
 * 관광지 데이터를 차트로 시각화하여 전국 관광지 현황을 파악할 수 있는 통계 페이지입니다.
 *
 * 주요 기능:
 * 1. 통계 요약 카드 (전체 개수, Top 3 지역, Top 3 타입, 마지막 업데이트)
 * 2. 지역별 분포 차트 (Bar Chart)
 * 3. 타입별 분포 차트 (Donut Chart)
 *
 * @dependencies
 * - lib/api/stats-api.ts: 통계 데이터 조회 함수들
 * - components/stats/*: 통계 차트 컴포넌트들
 */

import type { Metadata } from "next";
import {
  getRegionStats,
  getTypeStats,
  getStatsSummary,
} from "@/lib/api/stats-api";
import { StatsSummary as StatsSummaryComponent } from "@/components/stats/stats-summary";
import { RegionChart } from "@/components/stats/region-chart";
import { TypeChart } from "@/components/stats/type-chart";
import { Error } from "@/components/ui/error";
import { formatApiError } from "@/lib/utils/error-handler";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "통계 대시보드 | JLG Trip",
  description: "전국 관광지 현황을 차트로 확인하세요.",
};

export const revalidate = 3600; // 1시간마다 재검증

export default async function StatsPage() {
  try {
    console.group("[StatsPage] 통계 데이터 로드 시작");

    // 통계 데이터 병렬 조회
    const [regionStats, typeStats, summary] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
      getStatsSummary(),
    ]);

    console.log("[StatsPage] 통계 데이터 로드 완료");
    console.groupEnd();

    return (
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 헤더 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                통계 대시보드
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-lg ml-14">
            전국 관광지 현황을 차트로 확인하세요.
          </p>
        </div>

        {/* 통계 요약 카드 */}
        <section className="mb-10">
          <StatsSummaryComponent summary={summary} />
        </section>

        {/* 지역별 분포 차트 */}
        <section className="mb-10">
          <RegionChart data={regionStats} />
        </section>

        {/* 타입별 분포 차트 */}
        <section className="mb-10">
          <TypeChart data={typeStats} />
        </section>
      </main>
    );
  } catch (error: unknown) {
    console.error("[StatsPage] 오류 발생:", error);
    const errorMessage = formatApiError(error);

    return (
      <main className="container mx-auto px-4 py-8">
        <Error message={errorMessage} />
      </main>
    );
  }
}
