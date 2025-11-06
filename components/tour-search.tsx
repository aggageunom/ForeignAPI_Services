/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드 검색 기능을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 검색창 UI
 * 2. 엔터 또는 검색 버튼 클릭으로 검색 실행
 * 3. URL Query를 통한 검색 상태 관리
 * 4. 검색 중 로딩 상태 표시
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - lucide-react: 검색 아이콘
 * - components/ui/button: 검색 버튼
 * - components/ui/input: 검색 입력창
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TourSearchProps {
  className?: string;
}

export function TourSearch({ className }: TourSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");

  // URL 파라미터가 변경되면 입력값도 업데이트
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    setKeyword(urlKeyword);
  }, [searchParams]);

  /**
   * 검색 실행
   */
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (keyword.trim() === "") {
      params.delete("keyword");
    } else {
      params.set("keyword", keyword.trim());
    }

    // 페이지는 1로 리셋
    params.delete("page");

    router.push(`/?${params.toString()}`);
  };

  /**
   * 검색 초기화
   */
  const handleClear = () => {
    setKeyword("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("keyword");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  /**
   * 엔터 키 처리
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hasKeyword = keyword.trim() !== "";

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="관광지명, 주소, 설명으로 검색..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9"
        />
        {hasKeyword && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="검색어 지우기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button onClick={handleSearch} className="shrink-0">
        <Search className="h-4 w-4" />
        검색
      </Button>
    </div>
  );
}
