"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 훅
 *
 * 사용자가 로그인한 상태에서 이 훅을 사용하면
 * 자동으로 /api/sync-user를 호출하여 Supabase users 테이블에 사용자 정보를 저장합니다.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useSyncUser } from '@/hooks/use-sync-user';
 *
 * export default function Layout({ children }) {
 *   useSyncUser();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useSyncUser() {
  const { isLoaded, userId } = useAuth();
  const syncedRef = useRef(false);

  useEffect(() => {
    // 이미 동기화했거나, 로딩 중이거나, 로그인하지 않은 경우 무시
    if (syncedRef.current || !isLoaded || !userId) {
      return;
    }

    // 동기화 실행
    const syncUser = async () => {
      try {
        const response = await fetch("/api/sync-user", {
          method: "POST",
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }

          console.error("Failed to sync user:", errorData);

          // 테이블이 없는 경우 사용자에게 안내
          if (
            errorData.details?.includes("테이블") ||
            errorData.details?.includes("마이그레이션")
          ) {
            console.warn(
              "⚠️ 데이터베이스 마이그레이션이 필요합니다.\n" +
                "Supabase Dashboard → SQL Editor에서 다음 파일을 실행하세요:\n" +
                "supabase/migrations/setup_schema.sql",
            );
          }
          return;
        }

        syncedRef.current = true;
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [isLoaded, userId]);
}
