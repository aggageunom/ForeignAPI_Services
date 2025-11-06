/**
 * @file error-boundary.tsx
 * @description 전역 에러 바운더리 컴포넌트
 *
 * React 에러 바운더리를 구현하여 예상치 못한 에러를 처리합니다.
 * 클라이언트 컴포넌트에서만 동작합니다.
 *
 * @dependencies
 * - react-error-boundary: 에러 바운더리 라이브러리 (선택 사항)
 * - components/ui/error: 에러 UI 컴포넌트
 */

"use client";

import { Component, type ReactNode } from "react";
import { Error } from "@/components/ui/error";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("[ErrorBoundary] 에러 발생:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] 에러 상세 정보:", {
      error,
      errorInfo,
    });

    // 여기에 에러 로깅 서비스로 전송 (예: Sentry, LogRocket 등)
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
          <Error
            message={
              this.state.error?.message || "예상치 못한 오류가 발생했습니다."
            }
            onRetry={this.handleReset}
            retryText="다시 시도"
          />
          <div className="mt-6 flex gap-4">
            <Button variant="outline" asChild>
              <Link href="/" className="gap-2">
                <Home className="h-4 w-4" />
                홈으로 이동
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={this.handleReset}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
