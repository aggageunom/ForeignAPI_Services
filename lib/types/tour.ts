/**
 * @file tour.ts
 * @description 한국관광공사 API 관련 TypeScript 타입 정의
 *
 * 이 파일은 한국관광공사 공공 API (KorService2)의 응답 데이터 구조를 정의합니다.
 *
 * 주요 타입:
 * - TourItem: 관광지 목록 항목
 * - TourDetail: 관광지 상세 정보 (공통)
 * - TourIntro: 관광지 소개 정보 (타입별 상세)
 * - TourImage: 관광지 이미지 정보
 * - API 응답 래퍼 타입들
 *
 * @see {@link https://www.data.go.kr/data/15101578/openapi.do} - 한국관광공사 API 문서
 */

/**
 * 관광 타입 ID (Content Type ID)
 */
export const CONTENT_TYPE = {
  TOURIST_SPOT: "12", // 관광지
  CULTURAL_FACILITY: "14", // 문화시설
  FESTIVAL: "15", // 축제/행사
  TOUR_COURSE: "25", // 여행코스
  LEISURE_SPORTS: "28", // 레포츠
  ACCOMMODATION: "32", // 숙박
  SHOPPING: "38", // 쇼핑
  RESTAURANT: "39", // 음식점
} as const;

export type ContentTypeId =
  | typeof CONTENT_TYPE.TOURIST_SPOT
  | typeof CONTENT_TYPE.CULTURAL_FACILITY
  | typeof CONTENT_TYPE.FESTIVAL
  | typeof CONTENT_TYPE.TOUR_COURSE
  | typeof CONTENT_TYPE.LEISURE_SPORTS
  | typeof CONTENT_TYPE.ACCOMMODATION
  | typeof CONTENT_TYPE.SHOPPING
  | typeof CONTENT_TYPE.RESTAURANT;

/**
 * 관광 타입 이름 매핑
 */
export const CONTENT_TYPE_NAME: Record<ContentTypeId, string> = {
  [CONTENT_TYPE.TOURIST_SPOT]: "관광지",
  [CONTENT_TYPE.CULTURAL_FACILITY]: "문화시설",
  [CONTENT_TYPE.FESTIVAL]: "축제/행사",
  [CONTENT_TYPE.TOUR_COURSE]: "여행코스",
  [CONTENT_TYPE.LEISURE_SPORTS]: "레포츠",
  [CONTENT_TYPE.ACCOMMODATION]: "숙박",
  [CONTENT_TYPE.SHOPPING]: "쇼핑",
  [CONTENT_TYPE.RESTAURANT]: "음식점",
};

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 */
export interface TourItem {
  addr1: string; // 주소
  addr2?: string; // 상세주소
  areacode: string; // 지역코드
  contentid: string; // 콘텐츠ID
  contenttypeid: string; // 콘텐츠타입ID
  title: string; // 제목
  mapx: string; // 경도 (KATEC 좌표계, 정수형)
  mapy: string; // 위도 (KATEC 좌표계, 정수형)
  firstimage?: string; // 대표이미지1
  firstimage2?: string; // 대표이미지2
  tel?: string; // 전화번호
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  modifiedtime: string; // 수정일
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 */
export interface TourDetail {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  homepage?: string;
  overview?: string; // 개요 (긴 설명)
  firstimage?: string;
  firstimage2?: string;
  mapx: string;
  mapy: string;
  cat1?: string; // 대분류
  cat2?: string; // 중분류
  cat3?: string; // 소분류
  createdtime?: string;
  modifiedtime?: string;
}

/**
 * 관광지 소개 정보 (detailIntro2 응답)
 * 타입별로 필드가 다르므로 공통 필드만 정의
 */
export interface TourIntro {
  contentid: string;
  contenttypeid: string;
  // 공통 필드
  infocenter?: string; // 문의처
  restdate?: string; // 휴무일
  usetime?: string; // 이용시간/개장시간
  parking?: string; // 주차 가능
  chkpet?: string; // 반려동물 동반 가능 여부
  // 관광지(12), 문화시설(14) 공통
  expguide?: string; // 체험 안내
  // 관광지(12) 전용
  expagerange?: string; // 체험 가능 연령
  // 축제/행사(15) 전용
  eventstartdate?: string; // 행사 시작일
  eventenddate?: string; // 행사 종료일
  eventplace?: string; // 행사 장소
  // 레포츠(28) 전용
  openperiod?: string; // 운영 기간
  // 숙박(32) 전용
  checkintime?: string; // 체크인 시간
  checkouttime?: string; // 체크아웃 시간
  // 음식점(39) 전용
  opentimefood?: string; // 영업시간
  reservationfood?: string; // 예약안내
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  contentid: string;
  imagename?: string; // 이미지명
  originimgurl?: string; // 원본 이미지 URL
  smallimageurl?: string; // 썸네일 이미지 URL
  serialnum?: string; // 일련번호
}

/**
 * 지역코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  code: string; // 지역코드
  name: string; // 지역명
  rnum?: string; // 순번
}

/**
 * API 응답 래퍼 (공공 API 표준 응답 형식)
 */
export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * API 에러 응답
 */
export interface ApiError {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
  };
}

/**
 * 좌표 변환 유틸리티 타입
 * KATEC 좌표계 정수형을 WGS84 좌표계로 변환
 */
export interface Coordinates {
  lng: number; // 경도 (WGS84)
  lat: number; // 위도 (WGS84)
}

/**
 * 좌표 변환 함수
 * 한국관광공사 API는 WGS84 좌표계를 사용하며, 이미 올바른 경도/위도 값을 제공합니다.
 * @param mapx WGS84 경도 (문자열 또는 숫자)
 * @param mapy WGS84 위도 (문자열 또는 숫자)
 * @returns WGS84 좌표계 좌표
 */
export function convertCoordinates(
  mapx: string | number,
  mapy: string | number,
): Coordinates {
  const x = typeof mapx === "string" ? parseFloat(mapx) : mapx;
  const y = typeof mapy === "string" ? parseFloat(mapy) : mapy;

  // 한국관광공사 API는 이미 WGS84 좌표계를 사용하므로 변환 불필요
  return {
    lng: x,
    lat: y,
  };
}
