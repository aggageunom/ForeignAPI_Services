/**
 * @file error.tsx
 * @description Next.js App Router 에러 페이지
 *
 * Next.js가 자동으로 이 파일을 사용하여 에러를 처리합니다.
 * 이 파일은 반드시 "use client" 지시어를 사용해야 합니다.
 */

"use client";

import { useEffect } from "react";
import { Error } from "@/components/ui/error";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatApiError, logError } from "@/lib/utils/error-handler";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 에러 로깅 (개발 환경 또는 프로덕션 에러 로깅 서비스)
    logError(error, "ErrorPage");
  }, [error]);

  const errorMessage = formatApiError(error);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <Error message={errorMessage} onRetry={reset} retryText="다시 시도" />
      <div className="mt-6 flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/" className="gap-2">
            <Home className="h-4 w-4" />
            홈으로 이동
          </Link>
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          새로고침
        </Button>
      </div>
      {process.env.NODE_ENV === "development" && error.digest && (
        <div className="mt-4 rounded-md bg-muted p-4 text-sm">
          <p className="font-mono text-xs">Error Digest: {error.digest}</p>
        </div>
      )}
    </div>
  );
}
