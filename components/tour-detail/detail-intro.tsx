/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 섹션 컴포넌트
 *
 * 관광지의 운영 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 운영시간/개장시간 표시
 * 2. 휴무일 표시
 * 3. 이용요금 표시
 * 4. 주차 가능 여부 표시
 * 5. 수용인원 표시
 * 6. 체험 프로그램 표시
 * 7. 유모차/반려동물 동반 가능 여부 표시
 *
 * @dependencies
 * - lib/types/tour.ts: TourIntro 타입
 * - lucide-react: 아이콘
 */

"use client";

import {
  Clock,
  Calendar,
  DollarSign,
  Car,
  Users,
  Baby,
  Dog,
  Info,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface DetailIntroProps {
  intro: TourIntro;
  className?: string;
}

/**
 * 정보 항목을 표시하는 헬퍼 컴포넌트
 */
function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string | undefined | null;
}) {
  if (!value || value.trim() === "") {
    return null;
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="mb-1 text-sm font-semibold text-foreground">
          {label}
        </div>
        <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {value.trim()}
        </div>
      </div>
    </div>
  );
}

/**
 * 불리언 값 표시 헬퍼 컴포넌트
 */
function BooleanInfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string | undefined | null;
}) {
  if (!value || value.trim() === "") {
    return null;
  }

  // "Y", "y", "가능", "있음" 등의 값을 true로 간주
  const isPositive = /^(y|yes|가능|있음|있습니다|ok|o)$/i.test(value.trim());

  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div
          className={cn(
            "mt-1 text-sm",
            isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-foreground/80",
          )}
        >
          {isPositive ? "가능" : value.trim()}
        </div>
      </div>
    </div>
  );
}

export function DetailIntro({ intro, className }: DetailIntroProps) {
  console.group("[DetailIntro] 운영 정보 렌더링");
  console.log("Intro data:", intro);

  // 표시할 정보가 있는지 확인
  const hasInfo =
    intro.usetime ||
    intro.restdate ||
    intro.parking ||
    intro.chkpet ||
    intro.expguide ||
    intro.expagerange ||
    intro.eventstartdate ||
    intro.eventenddate ||
    intro.eventplace ||
    intro.openperiod ||
    intro.checkintime ||
    intro.checkouttime ||
    intro.opentimefood ||
    intro.reservationfood ||
    intro.infocenter;

  if (!hasInfo) {
    console.log("표시할 운영 정보 없음");
    console.groupEnd();
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-6 shadow-sm",
          className,
        )}
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          <Info className="h-5 w-5" />
          <p className="text-sm">운영 정보가 제공되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  console.log("운영 정보 표시 중");
  console.groupEnd();

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-semibold text-foreground">운영 정보</h2>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          {/* 운영시간/개장시간 */}
          <InfoItem
            icon={Clock}
            label="운영시간 / 개장시간"
            value={intro.usetime || intro.opentimefood}
          />

          {/* 체크인/체크아웃 시간 (숙박) */}
          {intro.checkintime && intro.checkouttime && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-sm font-semibold text-foreground">
                  체크인/체크아웃
                </div>
                <div className="text-sm leading-relaxed text-foreground/80">
                  체크인: {intro.checkintime}
                  <br />
                  체크아웃: {intro.checkouttime}
                </div>
              </div>
            </div>
          )}

          {/* 휴무일 */}
          <InfoItem icon={Calendar} label="휴무일" value={intro.restdate} />

          {/* 이용요금 */}
          <InfoItem
            icon={DollarSign}
            label="이용요금"
            value={intro.expguide} // 일부 타입에서는 이용요금이 expguide에 포함될 수 있음
          />

          {/* 주차 가능 여부 */}
          <BooleanInfoItem icon={Car} label="주차 가능" value={intro.parking} />

          {/* 수용인원 (있는 경우) */}
          {intro.eventplace && (
            <InfoItem icon={Users} label="행사 장소" value={intro.eventplace} />
          )}

          {/* 체험 프로그램 */}
          <InfoItem icon={Info} label="체험 안내" value={intro.expguide} />

          {/* 체험 가능 연령 */}
          <InfoItem
            icon={Baby}
            label="체험 가능 연령"
            value={intro.expagerange}
          />

          {/* 유모차/반려동물 동반 가능 */}
          <BooleanInfoItem
            icon={Dog}
            label="반려동물 동반"
            value={intro.chkpet}
          />

          {/* 행사 기간 (축제/행사) */}
          {intro.eventstartdate && intro.eventenddate && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-sm font-semibold text-foreground">
                  행사 기간
                </div>
                <div className="text-sm leading-relaxed text-foreground/80">
                  {intro.eventstartdate} ~ {intro.eventenddate}
                </div>
              </div>
            </div>
          )}

          {/* 운영 기간 (레포츠) */}
          <InfoItem
            icon={Calendar}
            label="운영 기간"
            value={intro.openperiod}
          />

          {/* 예약 안내 (음식점) */}
          <InfoItem
            icon={Info}
            label="예약 안내"
            value={intro.reservationfood}
          />

          {/* 문의처 */}
          <InfoItem icon={Info} label="문의처" value={intro.infocenter} />
        </div>
      </div>
    </div>
  );
}
