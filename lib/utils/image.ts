/**
 * @file image.ts
 * @description 이미지 URL 유틸리티 함수
 *
 * 한국관광공사 API에서 받은 이미지 URL을 처리하는 유틸리티 함수들입니다.
 *
 * @exports normalizeImageUrl - 이미지 URL 정규화
 * @exports isValidImageUrl - 이미지 URL 유효성 검사
 */

/**
 * 이미지 URL을 정규화합니다.
 * - http를 https로 변환 (가능한 경우)
 * - 상대 경로를 절대 경로로 변환
 * - 빈 문자열 처리
 * - 다양한 도메인 패턴 처리
 */
export function normalizeImageUrl(
  url: string | undefined | null,
): string | null {
  if (!url || url.trim() === "") {
    return null;
  }

  const trimmedUrl = url.trim();

  // 이미 절대 URL인 경우
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    // http를 https로 변환 시도 (도메인이 visitkorea.or.kr인 경우)
    if (
      trimmedUrl.startsWith("http://") &&
      trimmedUrl.includes("visitkorea.or.kr")
    ) {
      return trimmedUrl.replace("http://", "https://");
    }
    return trimmedUrl;
  }

  // 상대 경로인 경우 절대 경로로 변환
  if (trimmedUrl.startsWith("/")) {
    return `https://tong.visitkorea.or.kr${trimmedUrl}`;
  }

  // 프로토콜이 없는 URL인 경우 (예: "tong.visitkorea.or.kr/...")
  if (trimmedUrl.includes("visitkorea.or.kr")) {
    return `https://${trimmedUrl}`;
  }

  // 기타 경우 (상대 경로로 간주)
  return trimmedUrl;
}

/**
 * 이미지 URL이 유효한지 확인합니다.
 * (기본적인 URL 형식만 확인)
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || url.trim() === "") {
    return false;
  }

  // 기본적인 URL 형식 확인
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 이미지 URL이 실제로 로드 가능한지 확인합니다.
 * (서버 사이드에서만 사용 가능)
 */
export async function checkImageUrl(
  url: string | null | undefined,
): Promise<boolean> {
  if (!url) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000), // 5초 타임아웃
    });

    const contentType = response.headers.get("content-type");
    const isValid =
      response.ok && contentType && contentType.startsWith("image/");

    console.log("[checkImageUrl] 이미지 URL 검증:", {
      url,
      status: response.status,
      contentType,
      isValid,
    });

    return isValid;
  } catch (error) {
    console.warn("[checkImageUrl] 이미지 URL 검증 실패:", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * 대체 이미지 URL을 검색합니다.
 * 장소명과 주소를 기반으로 Unsplash API를 통해 관련 이미지를 검색합니다.
 *
 * @param title 장소명
 * @param address 주소 (선택)
 * @returns 이미지 URL 또는 null
 */
export async function getFallbackImageUrl(
  title: string,
  address?: string,
): Promise<string | null> {
  if (!title || title.trim() === "") {
    return null;
  }

  try {
    // Unsplash API 키 확인
    const unsplashAccessKey =
      process.env.UNSPLASH_ACCESS_KEY ||
      process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

    if (!unsplashAccessKey) {
      console.warn(
        "[getFallbackImageUrl] Unsplash API 키가 설정되지 않았습니다.",
      );
      return null;
    }

    // 검색 쿼리 생성 (장소명 + 한국 + 관광지 키워드)
    const searchQuery = `${title} 한국 관광지`.trim();
    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      searchQuery,
    )}&per_page=1&orientation=landscape&client_id=${unsplashAccessKey}`;

    console.group("[getFallbackImageUrl] 대체 이미지 검색 시작");
    console.log("검색 쿼리:", searchQuery);
    console.log("주소:", address);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // 24시간 캐시
    });

    if (!response.ok) {
      throw new Error(
        `Unsplash API 요청 실패: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const imageUrl =
        data.results[0].urls?.regular || data.results[0].urls?.full;
      console.log("대체 이미지 검색 성공:", imageUrl);
      console.groupEnd();
      return imageUrl;
    }

    console.log("대체 이미지 검색 결과 없음");
    console.groupEnd();
    return null;
  } catch (error) {
    console.error("[getFallbackImageUrl] 대체 이미지 검색 실패:", error);
    console.groupEnd();
    return null;
  }
}
