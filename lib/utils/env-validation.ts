/**
 * @file env-validation.ts
 * @description 환경변수 검증 유틸리티
 *
 * 애플리케이션 시작 시 필수 환경변수가 설정되어 있는지 확인합니다.
 * 프로덕션 환경에서는 누락된 환경변수가 있으면 에러를 발생시킵니다.
 */

/**
 * 필수 환경변수 목록
 */
const REQUIRED_ENV_VARS = {
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "Clerk Publishable Key",
  CLERK_SECRET_KEY: "Clerk Secret Key",

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: "Supabase URL",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "Supabase Anon Key",
  SUPABASE_SERVICE_ROLE_KEY: "Supabase Service Role Key",

  // 한국관광공사 API (최소 하나는 필수)
  // NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY
} as const;

/**
 * 선택적 환경변수 목록
 */
const OPTIONAL_ENV_VARS = {
  NEXT_PUBLIC_STORAGE_BUCKET: "Supabase Storage Bucket",
  NEXT_PUBLIC_SITE_URL: "Site URL",
  NEXT_PUBLIC_TOUR_API_KEY: "Tour API Key (Public)",
  TOUR_API_KEY: "Tour API Key (Server)",
} as const;

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

/**
 * 환경변수 검증
 * @param strictMode - true면 프로덕션 환경에서 필수 변수 누락 시 에러 발생
 * @returns 검증 결과
 */
export function validateEnvVars(strictMode = false): ValidationResult {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // 필수 환경변수 검증
  for (const [key, name] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
      missingVars.push(key);
      if (strictMode && process.env.NODE_ENV === "production") {
        console.error(`❌ 필수 환경변수가 누락되었습니다: ${key} (${name})`);
      } else {
        warnings.push(`⚠️  환경변수 누락: ${key} (${name})`);
      }
    }
  }

  // 한국관광공사 API 키는 둘 중 하나는 필수
  const hasPublicKey = !!process.env.NEXT_PUBLIC_TOUR_API_KEY;
  const hasServerKey = !!process.env.TOUR_API_KEY;
  if (!hasPublicKey && !hasServerKey) {
    missingVars.push("NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY");
    if (strictMode && process.env.NODE_ENV === "production") {
      console.error(
        "❌ 한국관광공사 API 키가 누락되었습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 중 하나는 필수입니다.",
      );
    } else {
      warnings.push(
        "⚠️  한국관광공사 API 키가 누락되었습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 중 하나를 설정하세요.",
      );
    }
  }

  // 프로덕션 환경에서 strictMode가 켜져있고 필수 변수가 누락되면 에러
  if (
    strictMode &&
    process.env.NODE_ENV === "production" &&
    missingVars.length > 0
  ) {
    throw new Error(
      `필수 환경변수가 누락되었습니다:\n${missingVars
        .map((v) => `  - ${v}`)
        .join("\n")}\n\n.env.example 파일을 참고하여 환경변수를 설정하세요.`,
    );
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

/**
 * 개발 환경에서 환경변수 검증 및 경고 출력
 * 이 함수는 개발 모드에서만 호출되어야 합니다.
 */
export function validateEnvVarsInDev(): void {
  if (process.env.NODE_ENV === "development") {
    const result = validateEnvVars(false);
    if (result.warnings.length > 0) {
      console.group("🔍 환경변수 검증 결과");
      result.warnings.forEach((warning) => console.warn(warning));
      console.log("\n💡 .env.example 파일을 참고하여 환경변수를 설정하세요.\n");
      console.groupEnd();
    }
  }
}
