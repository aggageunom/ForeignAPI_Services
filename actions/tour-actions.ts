/**
 * @file tour-actions.ts
 * @description 관광지 관련 Server Actions
 *
 * 클라이언트 컴포넌트에서 서버 사이드 API를 호출하기 위한 Server Actions
 *
 * @dependencies
 * - lib/api/tour-api.ts: 실제 API 호출 함수
 */

"use server";

import { getAreaCode as getAreaCodeApi } from "@/lib/api/tour-api";
import type { AreaCode } from "@/lib/types/tour";

/**
 * 시/군/구 코드 조회 Server Action
 * @param areaCode 시/도 코드
 * @returns 시/군/구 코드 목록
 */
export async function getSigunguCodes(
  areaCode: string,
): Promise<AreaCode[] | null> {
  try {
    console.log("[getSigunguCodes] 시/군/구 목록 조회:", areaCode);
    const codes = await getAreaCodeApi(areaCode);
    console.log("[getSigunguCodes] 조회 성공:", codes.length, "개");
    return codes;
  } catch (error) {
    console.error("[getSigunguCodes] 조회 실패:", error);
    return null;
  }
}
