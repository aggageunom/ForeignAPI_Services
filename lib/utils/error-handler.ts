/**
 * @file error-handler.ts
 * @description 전역 에러 처리 유틸리티 함수들
 *
 * API 에러, 네트워크 에러 등을 일관되게 처리하는 헬퍼 함수들입니다.
 */

/**
 * 에러 객체에서 메시지를 안전하게 추출합니다.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * API 에러인지 확인합니다.
 */
export function isApiError(error: unknown): error is {
  status: number;
  message: string;
  data?: unknown;
} {
  return (
    error !== null &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number" &&
    "message" in error &&
    typeof error.message === "string"
  );
}

/**
 * 네트워크 에러인지 확인합니다.
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    );
  }

  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("timeout")
    );
  }

  return false;
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환합니다.
 */
export function formatApiError(error: unknown): string {
  const message = getErrorMessage(error);

  // 네트워크 에러
  if (isNetworkError(error)) {
    return "네트워크 연결을 확인해주세요. 인터넷 연결이 끊어졌을 수 있습니다.";
  }

  // API 에러
  if (isApiError(error)) {
    switch (error.status) {
      case 400:
        return "잘못된 요청입니다. 입력한 정보를 확인해주세요.";
      case 401:
        return "인증이 필요합니다. 로그인해주세요.";
      case 403:
        return "접근 권한이 없습니다.";
      case 404:
        return "요청한 리소스를 찾을 수 없습니다.";
      case 429:
        return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      case 500:
      case 502:
      case 503:
        return "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      default:
        return message || "API 요청 중 오류가 발생했습니다.";
    }
  }

  return message;
}

/**
 * 에러를 콘솔에 로깅합니다 (개발 환경에서만 상세 정보 표시).
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const prefix = context ? `[${context}]` : "[Error]";

  if (process.env.NODE_ENV === "development") {
    console.error(`${prefix}`, error);
  } else {
    console.error(`${prefix}`, message);
  }

  // 프로덕션 환경에서는 에러 로깅 서비스로 전송
  // if (process.env.NODE_ENV === 'production') {
  //   logErrorToService(error, context);
  // }
}
