/**
 * @file detail-pet-tour.tsx
 * @description 반려동물 동반 여행 정보 컴포넌트
 *
 * 관광지의 반려동물 동반 여행 정보를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 반려동물 동반 가능 여부 표시
 * 2. 반려동물 크기 제한 정보 표시
 * 3. 반려동물 입장 가능 장소 (실내/실외) 표시
 * 4. 반려동물 동반 추가 요금 표시
 * 5. 반려동물 전용 시설 정보 표시
 *
 * @dependencies
 * - lib/types/tour.ts: PetTourInfo 타입
 * - lucide-react: 아이콘
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PetTourInfo } from "@/lib/types/tour";
import {
  Heart,
  Ruler,
  MapPin,
  DollarSign,
  Info,
  Car,
  Footprints,
  Droplets,
} from "lucide-react";

interface DetailPetTourProps {
  petInfo: PetTourInfo | null;
}

export function DetailPetTour({ petInfo }: DetailPetTourProps) {
  console.group("[DetailPetTour] 반려동물 정보 렌더링 시작");
  console.log("Pet Info:", petInfo);

  // 반려동물 동반 가능 여부 확인
  const isPetAllowed = petInfo
    ? petInfo.chkpetleash === "가능" ||
      petInfo.chkpetleash === "Y" ||
      petInfo.chkpetleash === "가능함"
    : false;

  const hasPetInfo = !!petInfo;
  const hasDetailedInfo =
    petInfo &&
    (petInfo.chkpetsize ||
      petInfo.chkpetplace ||
      petInfo.chkpetfee ||
      petInfo.petinfo ||
      petInfo.parking);

  console.log("반려동물 동반 가능 여부:", isPetAllowed);
  console.log("반려동물 정보 존재:", hasPetInfo);
  console.log("상세 정보 존재:", hasDetailedInfo);
  console.groupEnd();

  return (
    <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="text-2xl">🐾</span>
          반려동물 동반 여행 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 반려동물 동반 가능 여부 - 항상 표시 */}
        <div className="flex items-start gap-3 rounded-lg bg-background p-3">
          <Heart className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-sm text-muted-foreground mb-1">
              반려동물 동반 여부
            </div>
            <div className="text-base font-medium">
              {hasPetInfo && petInfo.chkpetleash ? (
                isPetAllowed ? (
                  <span className="text-green-600 dark:text-green-400">
                    반려동물 동반 가능
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">
                    {petInfo.chkpetleash}
                  </span>
                )
              ) : (
                <span className="text-amber-600 dark:text-amber-400 italic">
                  해당 업체에 직접 확인 필요함
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 반려동물 크기 제한 */}
        {petInfo?.chkpetsize && (
          <div className="flex items-start gap-3 rounded-lg bg-background p-3">
            <Ruler className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <div className="font-semibold text-sm text-muted-foreground mb-1">
                크기 제한
              </div>
              <div className="text-base">{petInfo.chkpetsize}</div>
            </div>
          </div>
        )}

        {/* 입장 가능 장소 */}
        {petInfo?.chkpetplace && (
          <div className="flex items-start gap-3 rounded-lg bg-background p-3">
            <MapPin className="mt-0.5 h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <div className="font-semibold text-sm text-muted-foreground mb-1">
                입장 가능 장소
              </div>
              <div className="text-base">{petInfo.chkpetplace}</div>
            </div>
          </div>
        )}

        {/* 추가 요금 */}
        {petInfo?.chkpetfee && (
          <div className="flex items-start gap-3 rounded-lg bg-background p-3">
            <DollarSign className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="font-semibold text-sm text-muted-foreground mb-1">
                추가 요금
              </div>
              <div className="text-base">{petInfo.chkpetfee}</div>
            </div>
          </div>
        )}

        {/* 주차장 정보 */}
        {petInfo?.parking && (
          <div className="flex items-start gap-3 rounded-lg bg-background p-3">
            <Car className="mt-0.5 h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <div className="font-semibold text-sm text-muted-foreground mb-1">
                주차장 정보
              </div>
              <div className="text-base">{petInfo.parking}</div>
            </div>
          </div>
        )}

        {/* 기타 반려동물 정보 */}
        {petInfo?.petinfo && (
          <div className="flex items-start gap-3 rounded-lg bg-background p-3">
            <Info className="mt-0.5 h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
            <div>
              <div className="font-semibold text-sm text-muted-foreground mb-1">
                추가 정보
              </div>
              <div className="text-base whitespace-pre-line">
                {petInfo.petinfo}
              </div>
            </div>
          </div>
        )}

        {/* 주의사항 */}
        {isPetAllowed && (
          <div className="mt-4 rounded-lg border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4">
            <div className="flex items-start gap-2">
              <Footprints className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-amber-800 dark:text-amber-200 mb-1">
                  주의사항
                </div>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>반려동물을 동반할 때는 반드시 리드를 착용해주세요.</li>
                  <li>다른 방문객을 배려하여 배변 봉투를 준비해주세요.</li>
                  <li>시설 내 규칙을 준수해주세요.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
