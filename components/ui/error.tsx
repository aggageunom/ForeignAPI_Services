/**
 * @file error.tsx
 * @description 에러 처리 컴포넌트
 *
 * API 에러나 일반적인 에러를 표시하는 컴포넌트입니다.
 *
 * @dependencies
 * - lucide-react: 에러 아이콘
 * - components/ui/button: 재시도 버튼
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  className?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function Error({
  className,
  message = "오류가 발생했습니다.",
  onRetry,
  retryText = "다시 시도",
}: ErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-8",
        className,
      )}
    >
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">{message}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          잠시 후 다시 시도해주세요.
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryText}
        </Button>
      )}
    </div>
  );
}
