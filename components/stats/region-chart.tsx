/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 차트 컴포넌트 (Bar Chart)
 *
 * 지역별 관광지 개수를 Bar Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 표시 (Bar Chart)
 * 2. 바 클릭 시 해당 지역 목록 페이지로 이동
 * 3. 호버 시 정확한 개수 표시
 * 4. 다크/라이트 모드 지원
 * 5. 반응형 디자인
 *
 * @dependencies
 * - lib/types/stats.ts: RegionStats
 * - components/ui/card: Card 컴포넌트
 * - components/ui/chart: Chart 컴포넌트
 * - recharts: BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { RegionStats } from "@/lib/types/stats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MapPin } from "lucide-react";

interface RegionChartProps {
  data?: RegionStats[];
  isLoading?: boolean;
}

/**
 * 지역별 색상 매핑
 * 각 지역에 고유한 색상을 할당하여 시각적으로 구분
 */
const REGION_COLORS: Record<string, string> = {
  "1": "hsl(220, 80%, 55%)", // 서울 - 진한 파란색
  "2": "hsl(200, 75%, 50%)", // 인천 - 하늘색
  "3": "hsl(180, 70%, 45%)", // 대전 - 청록색
  "4": "hsl(280, 75%, 55%)", // 대구 - 보라색
  "5": "hsl(300, 80%, 50%)", // 광주 - 자주색
  "6": "hsl(10, 85%, 55%)", // 부산 - 빨간색
  "7": "hsl(40, 90%, 55%)", // 울산 - 주황색
  "8": "hsl(160, 75%, 50%)", // 세종 - 청록색
  "31": "hsl(140, 70%, 50%)", // 경기도 - 초록색
  "32": "hsl(200, 80%, 60%)", // 강원도 - 밝은 하늘색
  "33": "hsl(100, 70%, 45%)", // 충청북도 - 연두색
  "34": "hsl(120, 75%, 50%)", // 충청남도 - 초록색
  "35": "hsl(60, 80%, 50%)", // 경상북도 - 노란색
  "36": "hsl(20, 85%, 55%)", // 경상남도 - 주황빨강
  "37": "hsl(80, 75%, 50%)", // 전라북도 - 연두색
  "38": "hsl(160, 80%, 55%)", // 전라남도 - 청록색
  "39": "hsl(190, 75%, 55%)", // 제주도 - 푸른색
};

/**
 * 지역 코드에 해당하는 색상 반환
 * 매핑에 없으면 기본 색상 팔레트에서 선택
 */
function getRegionColor(regionCode: string, index: number): string {
  return REGION_COLORS[regionCode] || getDefaultRegionColor(index);
}

/**
 * 기본 지역 색상 팔레트 (지역 매핑에 없는 경우 사용)
 */
function getDefaultRegionColor(index: number): string {
  const defaultColors = [
    "hsl(220, 70%, 50%)",
    "hsl(200, 70%, 50%)",
    "hsl(180, 70%, 50%)",
    "hsl(160, 70%, 50%)",
    "hsl(140, 70%, 50%)",
    "hsl(120, 70%, 50%)",
    "hsl(100, 70%, 50%)",
    "hsl(80, 70%, 50%)",
    "hsl(60, 70%, 50%)",
    "hsl(40, 70%, 50%)",
  ];
  return defaultColors[index % defaultColors.length];
}

export function RegionChart({ data, isLoading = false }: RegionChartProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            지역별 관광지 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            지역별 관광지 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            데이터가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 상위 10개 지역만 표시
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.name,
    count: item.count,
    code: item.code,
  }));

  // 각 지역별로 색상 매핑
  const chartDataWithColors = chartData.map((item, index) => ({
    ...item,
    color: getRegionColor(item.code, index),
  }));

  const chartConfig = {
    count: {
      label: "관광지 수",
      color: "hsl(var(--chart-1))",
    },
  };

  const handleBarClick = (data: { code: string }) => {
    if (data?.code) {
      router.push(`/?areaCode=${data.code}`);
    }
  };

  return (
    <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          지역별 관광지 분포
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          상위 10개 지역의 관광지 개수 (바를 클릭하면 해당 지역 목록으로 이동)
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            data={chartDataWithColors}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--muted))"
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              label={{
                value: "관광지 수",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "hsl(var(--muted-foreground))",
                },
              }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="font-semibold text-base mb-1">
                        {data.name}
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          관광지 수:
                        </span>
                        <span className="font-bold text-lg text-primary">
                          {data.count.toLocaleString()}개
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              radius={[8, 8, 0, 0]}
              onClick={handleBarClick}
              style={{ cursor: "pointer" }}
              shape={(props: unknown) => {
                const barProps = props as {
                  x?: number;
                  y?: number;
                  width?: number;
                  height?: number;
                  payload?: { color?: string; [key: string]: unknown };
                };
                const {
                  x = 0,
                  y = 0,
                  width = 0,
                  height = 0,
                  payload,
                } = barProps;
                const fillColor = payload?.color || "hsl(var(--chart-1))";
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={fillColor}
                    rx={8}
                    ry={8}
                    style={{ cursor: "pointer" }}
                  />
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
