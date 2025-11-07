/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드의 요약 정보를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 전체 관광지 수 표시
 * 2. Top 3 지역 표시
 * 3. Top 3 타입 표시
 * 4. 마지막 업데이트 시간 표시
 *
 * @dependencies
 * - lib/types/stats.ts: StatsSummary
 * - components/ui/card: Card 컴포넌트
 * - components/ui/skeleton: Skeleton UI
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatsSummary } from "@/lib/types/stats";
import { MapPin, Tag, Calendar, BarChart3 } from "lucide-react";

interface StatsSummaryProps {
  summary?: StatsSummary;
  isLoading?: boolean;
}

export function StatsSummary({
  summary,
  isLoading = false,
}: StatsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-2">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 전체 관광지 수 */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">전체 관광지</CardTitle>
          <BarChart3 className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {summary.totalCount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">전국 관광지 수</p>
        </CardContent>
      </Card>

      {/* Top 1 지역 */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">인기 지역 1위</CardTitle>
          <MapPin className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {summary.topRegions.length > 0 ? (
            <>
              <div className="text-2xl font-bold">
                {summary.topRegions[0].name}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.topRegions[0].count.toLocaleString()}개 관광지
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">데이터 없음</div>
          )}
        </CardContent>
      </Card>

      {/* Top 1 타입 */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">인기 타입 1위</CardTitle>
          <Tag className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {summary.topTypes.length > 0 ? (
            <>
              <div className="text-2xl font-bold">
                {summary.topTypes[0].typeName}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.topTypes[0].count.toLocaleString()}개 관광지
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">데이터 없음</div>
          )}
        </CardContent>
      </Card>

      {/* 마지막 업데이트 */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">마지막 업데이트</CardTitle>
          <Calendar className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-semibold">
            {formatDate(summary.lastUpdated)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            통계 데이터 갱신 시간
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
