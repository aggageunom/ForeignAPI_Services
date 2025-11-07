/**
 * @file bookmark-api.ts
 * @description 북마크 관련 Supabase API 함수들
 *
 * 북마크 추가/제거/조회 기능을 제공하는 함수들입니다.
 *
 * 주요 기능:
 * 1. 북마크 추가
 * 2. 북마크 제거
 * 3. 북마크 조회 (사용자별)
 * 4. 북마크 여부 확인
 *
 * @dependencies
 * - lib/supabase/server.ts: 서버 사이드 Supabase 클라이언트
 * - lib/supabase/clerk-client.ts: 클라이언트 사이드 Supabase 클라이언트
 */

"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * 북마크 인터페이스
 */
export interface Bookmark {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

/**
 * 사용자의 북마크 추가
 * @param contentId 관광지 contentId
 * @returns 성공 여부
 */
export async function addBookmark(contentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.group("[Bookmark API] 북마크 추가");
    console.log("contentId:", contentId);

    // 인증 확인
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      console.log("인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 정보 조회 (clerk_id로 users 테이블에서 찾기)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      console.error("사용자 조회 실패:", userError);
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    // 북마크 추가 (중복 체크 포함)
    const { error: insertError } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      content_id: contentId,
    });

    if (insertError) {
      // 중복 북마크인 경우
      if (insertError.code === "23505") {
        console.log("이미 북마크된 관광지");
        console.groupEnd();
        return {
          success: false,
          error: "이미 북마크된 관광지입니다.",
        };
      }
      console.error("북마크 추가 실패:", insertError);
      console.groupEnd();
      return {
        success: false,
        error: insertError.message || "북마크 추가에 실패했습니다.",
      };
    }

    console.log("북마크 추가 성공");
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error("[Bookmark API] 북마크 추가 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자의 북마크 제거
 * @param contentId 관광지 contentId
 * @returns 성공 여부
 */
export async function removeBookmark(contentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.group("[Bookmark API] 북마크 제거");
    console.log("contentId:", contentId);

    // 인증 확인
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      console.log("인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      console.error("사용자 조회 실패:", userError);
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    // 북마크 제거
    const { error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("content_id", contentId);

    if (deleteError) {
      console.error("북마크 제거 실패:", deleteError);
      console.groupEnd();
      return {
        success: false,
        error: deleteError.message || "북마크 제거에 실패했습니다.",
      };
    }

    console.log("북마크 제거 성공");
    console.groupEnd();
    return { success: true };
  } catch (error) {
    console.error("[Bookmark API] 북마크 제거 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자의 북마크 여부 확인
 * @param contentId 관광지 contentId
 * @returns 북마크 여부
 */
export async function isBookmarked(contentId: string): Promise<boolean> {
  try {
    // 인증 확인
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      return false;
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 정보 조회
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return false;
    }

    // 북마크 확인
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error("[Bookmark API] 북마크 확인 오류:", error);
    return false;
  }
}

/**
 * 사용자의 북마크 목록 조회
 * @returns 북마크 목록 (contentId와 created_at 포함)
 */
export async function getUserBookmarks(): Promise<{
  success: boolean;
  bookmarks?: Array<{ contentId: string; createdAt: string }>;
  error?: string;
}> {
  try {
    console.group("[Bookmark API] 북마크 목록 조회");

    // 인증 확인
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      console.log("인증되지 않은 사용자");
      console.groupEnd();
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      console.error("사용자 조회 실패:", userError);
      console.groupEnd();
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    // 북마크 목록 조회
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("content_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (bookmarksError) {
      console.error("북마크 목록 조회 실패:", bookmarksError);
      console.groupEnd();
      return {
        success: false,
        error:
          bookmarksError.message || "북마크 목록을 불러오는데 실패했습니다.",
      };
    }

    const bookmarksWithDate = bookmarks.map((b) => ({
      contentId: b.content_id,
      createdAt: b.created_at,
    }));
    console.log(`북마크 목록 조회 성공: ${bookmarksWithDate.length}개`);
    console.groupEnd();
    return {
      success: true,
      bookmarks: bookmarksWithDate,
    };
  } catch (error) {
    console.error("[Bookmark API] 북마크 목록 조회 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
