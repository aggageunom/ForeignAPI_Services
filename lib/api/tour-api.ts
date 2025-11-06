/**
 * @file tour-api.ts
 * @description 한국관광공사 공공 API 클라이언트 함수들
 *
 * 이 파일은 한국관광공사 공공 API (KorService2)를 호출하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역코드 조회 (areaCode2)
 * 2. 지역 기반 관광정보 조회 (areaBasedList2)
 * 3. 키워드 검색 (searchKeyword2)
 * 4. 관광지 상세 정보 조회 (detailCommon2, detailIntro2, detailImage2)
 *
 * API Base URL: https://apis.data.go.kr/B551011/KorService2
 *
 * 환경변수:
 * - NEXT_PUBLIC_TOUR_API_KEY: 한국관광공사 API 인증키
 * - TOUR_API_KEY: 서버 사이드용 (NEXT_PUBLIC_ 없을 때 대체)
 *
 * @dependencies
 * - lib/types/tour.ts: 타입 정의
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

import type {
  ApiResponse,
  ApiError,
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  AreaCode,
  ContentTypeId,
} from "@/lib/types/tour";

/**
 * API Base URL
 */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * 공통 파라미터
 */
const COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
};

/**
 * API 키 가져오기 (환경변수에서)
 * 클라이언트/서버 모두에서 사용 가능하도록 처리
 */
function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

  if (!key) {
    throw new Error(
      "한국관광공사 API 키가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 환경변수를 설정해주세요.",
    );
  }

  return key;
}

/**
 * API 요청 헬퍼 함수
 */
async function fetchTourApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const apiKey = getApiKey();
  const searchParams = new URLSearchParams({
    serviceKey: apiKey,
    ...COMMON_PARAMS,
    ...Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ) as [string, string | number][],
    ),
  } as Record<string, string>);

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  console.group(`[Tour API] ${endpoint}`);
  console.log("Request URL:", url.replace(apiKey, "***"));

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      // Next.js에서 캐싱 제어 (선택 사항)
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      const statusText = response.statusText || "알 수 없는 오류";
      const error = new Error(
        `API 요청 실패: ${response.status} ${statusText}`,
      ) as Error & { status: number };
      error.status = response.status;
      throw error;
    }

    const data: ApiResponse<T> | ApiError = await response.json();

    // 에러 응답 체크
    if ("response" in data && data.response.header.resultCode !== "0000") {
      const errorMsg = data.response.header.resultMsg;
      console.error("API Error:", errorMsg);
      const error = new Error(`API 에러: ${errorMsg}`) as Error & {
        apiCode: string;
      };
      error.apiCode = data.response.header.resultCode;
      throw error;
    }

    // 성공 응답
    const items = (data as ApiResponse<T>).response.body.items.item;
    const result = Array.isArray(items) ? items : items ? [items] : [];

    console.log(`Success: ${result.length} items`);
    console.groupEnd();

    return result as T;
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    console.groupEnd();

    // 네트워크 에러 처리
    if (error instanceof TypeError && error.message.includes("fetch")) {
      const networkError = new Error(
        "네트워크 연결을 확인해주세요. 인터넷 연결이 끊어졌을 수 있습니다.",
      );
      (networkError as Error & { isNetworkError: boolean }).isNetworkError =
        true;
      throw networkError;
    }

    throw error;
  }
}

/**
 * 지역코드 조회 (areaCode2)
 * @param areaCode 상위 지역코드 (없으면 최상위 지역 목록)
 * @returns 지역코드 목록
 */
export async function getAreaCode(areaCode?: string): Promise<AreaCode[]> {
  const params: Record<string, string | undefined> = {};
  if (areaCode) {
    params.areaCode = areaCode;
  }

  return fetchTourApi<AreaCode>("/areaCode2", params);
}

/**
 * 지역 기반 관광정보 조회 (areaBasedList2)
 * @param areaCode 지역코드
 * @param contentTypeId 관광 타입 ID (선택)
 * @param pageNo 페이지 번호 (기본: 1)
 * @param numOfRows 페이지당 항목 수 (기본: 20)
 * @returns 관광지 목록
 */
export async function getAreaBasedList(
  areaCode?: string,
  contentTypeId?: ContentTypeId,
  pageNo: number = 1,
  numOfRows: number = 20,
): Promise<TourItem[]> {
  const params: Record<string, string | number | undefined> = {
    pageNo,
    numOfRows,
  };

  if (areaCode) {
    params.areaCode = areaCode;
  }

  if (contentTypeId) {
    params.contentTypeId = contentTypeId;
  }

  return fetchTourApi<TourItem>("/areaBasedList2", params);
}

/**
 * 키워드 검색 (searchKeyword2)
 * @param keyword 검색 키워드
 * @param areaCode 지역코드 (선택)
 * @param contentTypeId 관광 타입 ID (선택)
 * @param pageNo 페이지 번호 (기본: 1)
 * @param numOfRows 페이지당 항목 수 (기본: 20)
 * @returns 검색 결과 목록
 */
export async function searchKeyword(
  keyword: string,
  areaCode?: string,
  contentTypeId?: ContentTypeId,
  pageNo: number = 1,
  numOfRows: number = 20,
): Promise<TourItem[]> {
  if (!keyword || keyword.trim() === "") {
    throw new Error("검색 키워드를 입력해주세요.");
  }

  const params: Record<string, string | number | undefined> = {
    keyword: keyword.trim(),
    pageNo,
    numOfRows,
  };

  if (areaCode) {
    params.areaCode = areaCode;
  }

  if (contentTypeId) {
    params.contentTypeId = contentTypeId;
  }

  return fetchTourApi<TourItem>("/searchKeyword2", params);
}

/**
 * 관광지 상세 정보 조회 (detailCommon2)
 * @param contentId 콘텐츠 ID
 * @returns 관광지 상세 정보
 */
export async function getTourDetail(contentId: string): Promise<TourDetail> {
  if (!contentId) {
    throw new Error("콘텐츠 ID가 필요합니다.");
  }

  const results = await fetchTourApi<TourDetail>("/detailCommon2", {
    contentId,
  });

  if (results.length === 0) {
    throw new Error(
      `관광지 정보를 찾을 수 없습니다. (contentId: ${contentId})`,
    );
  }

  return results[0];
}

/**
 * 관광지 소개 정보 조회 (detailIntro2)
 * @param contentId 콘텐츠 ID
 * @param contentTypeId 콘텐츠 타입 ID
 * @returns 관광지 소개 정보
 */
export async function getTourIntro(
  contentId: string,
  contentTypeId: string,
): Promise<TourIntro> {
  if (!contentId || !contentTypeId) {
    throw new Error("콘텐츠 ID와 타입 ID가 필요합니다.");
  }

  const results = await fetchTourApi<TourIntro>("/detailIntro2", {
    contentId,
    contentTypeId,
  });

  if (results.length === 0) {
    throw new Error(
      `관광지 소개 정보를 찾을 수 없습니다. (contentId: ${contentId})`,
    );
  }

  return results[0];
}

/**
 * 관광지 이미지 목록 조회 (detailImage2)
 * @param contentId 콘텐츠 ID
 * @returns 관광지 이미지 목록
 */
export async function getTourImages(contentId: string): Promise<TourImage[]> {
  if (!contentId) {
    throw new Error("콘텐츠 ID가 필요합니다.");
  }

  return fetchTourApi<TourImage>("/detailImage2", {
    contentId,
  });
}
