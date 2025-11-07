/**
 * @file type-chart.tsx
 * @description 타입별 관광지 분포 차트 컴포넌트 (Donut Chart)
 *
 * 관광 타입별 관광지 개수를 Donut Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 타입별 관광지 개수 및 비율 표시 (Donut Chart)
 * 2. 섹션 클릭 시 해당 타입 목록 페이지로 이동
 * 3. 호버 시 타입명, 개수, 비율 표시
 * 4. 다크/라이트 모드 지원
 * 5. 반응형 디자인
 *
 * @dependencies
 * - lib/types/stats.ts: TypeStats
 * - components/ui/card: Card 컴포넌트
 * - components/ui/chart: Chart 컴포넌트
 * - recharts: PieChart, Pie, Cell, Legend, ResponsiveContainer
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
import type { TypeStats } from "@/lib/types/stats";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { Tag } from "lucide-react";

interface TypeChartProps {
  data?: TypeStats[];
  isLoading?: boolean;
}

/**
 * 관광 타입별 색상 매핑
 * 각 타입에 고유한 색상을 할당하여 시각적으로 구분
 */
const TYPE_COLORS: Record<string, string> = {
  "12": "hsl(220, 70%, 50%)", // 관광지 - 파란색
  "14": "hsl(280, 70%, 50%)", // 문화시설 - 보라색
  "15": "hsl(340, 70%, 50%)", // 축제/행사 - 분홍색
  "25": "hsl(160, 70%, 50%)", // 여행코스 - 청록색
  "28": "hsl(40, 90%, 50%)", // 레포츠 - 주황색
  "32": "hsl(200, 70%, 50%)", // 숙박 - 하늘색
  "38": "hsl(300, 70%, 50%)", // 쇼핑 - 자주색
  "39": "hsl(10, 80%, 50%)", // 음식점 - 빨간색
};

/**
 * 타입 ID에 해당하는 색상 반환
 * 매핑에 없으면 기본 색상 팔레트에서 선택
 */
function getTypeColor(typeId: string, index: number): string {
  return TYPE_COLORS[typeId] || getDefaultColor(index);
}

/**
 * 기본 색상 팔레트 (타입 매핑에 없는 경우 사용)
 */
function getDefaultColor(index: number): string {
  const defaultColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
  ];
  return defaultColors[index % defaultColors.length];
}

export function TypeChart({ data, isLoading = false }: TypeChartProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            타입별 관광지 분포
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
            <Tag className="h-5 w-5 text-primary" />
            타입별 관광지 분포
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

  const chartData = data.map((item) => ({
    name: item.typeName,
    value: item.count,
    percentage: item.percentage,
    typeId: item.typeId,
  }));

  const chartConfig = {
    value: {
      label: "관광지 수",
    },
  };

  const handlePieClick = (data: { typeId: string }) => {
    if (data?.typeId) {
      router.push(`/?contentTypeId=${data.typeId}`);
    }
  };

  return (
    <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          타입별 관광지 분포
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          관광 타입별 관광지 개수 및 비율 (섹션을 클릭하면 해당 타입 목록으로
          이동)
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="font-semibold text-base mb-2">
                        {data.name}
                      </div>
                      <div className="grid gap-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            관광지 수:
                          </span>
                          <span className="font-bold text-lg text-primary">
                            {data.value.toLocaleString()}개
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">비율:</span>
                          <span className="font-semibold">
                            {data.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={2}
              onClick={handlePieClick}
              style={{ cursor: "pointer" }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getTypeColor(entry.typeId, index)}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => {
                const dataEntry = chartData.find((d) => d.name === value);
                const color = dataEntry
                  ? getTypeColor(dataEntry.typeId, chartData.indexOf(dataEntry))
                  : "hsl(var(--muted-foreground))";
                return (
                  <span
                    className="text-xs text-muted-foreground"
                    style={{ color }}
                  >
                    {value}
                  </span>
                );
              }}
              iconType="circle"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
