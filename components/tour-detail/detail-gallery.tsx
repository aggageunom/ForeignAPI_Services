/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 관광지의 이미지들을 갤러리 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 대표 이미지 + 서브 이미지들 표시
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 이미지 슬라이드 기능
 * 4. 이미지 없으면 기본 이미지
 *
 * @dependencies
 * - lib/types/tour.ts: TourImage 타입
 * - components/ui/dialog: 모달 컴포넌트
 * - lucide-react: 아이콘
 * - next/image: 이미지 최적화
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { TourImage } from "@/lib/types/tour";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/utils/image";

interface DetailGalleryProps {
  images: TourImage[];
  mainImageUrl?: string;
  title?: string;
  className?: string;
}

export function DetailGallery({
  images,
  mainImageUrl,
  title,
  className,
}: DetailGalleryProps) {
  console.group("[DetailGallery] 이미지 갤러리 렌더링");
  console.log("Images count:", images.length);
  console.log("Main image URL:", mainImageUrl);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // 모든 이미지 URL 수집 (대표 이미지 + 갤러리 이미지)
  const allImages: Array<{ url: string; name?: string }> = [];

  // 대표 이미지가 있고 갤러리에 없으면 첫 번째로 추가
  if (mainImageUrl) {
    const normalizedMainUrl = normalizeImageUrl(mainImageUrl);
    if (normalizedMainUrl) {
      allImages.push({ url: normalizedMainUrl, name: "대표 이미지" });
    }
  }

  // 갤러리 이미지 추가
  images.forEach((image) => {
    const imageUrl = normalizeImageUrl(
      image.originimgurl || image.smallimageurl,
    );
    if (imageUrl && !allImages.some((img) => img.url === imageUrl)) {
      allImages.push({
        url: imageUrl,
        name: image.imagename,
      });
    }
  });

  console.log("All images:", allImages.length);
  console.groupEnd();

  // 이미지가 없는 경우
  if (allImages.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <h2 className="text-2xl font-semibold text-foreground">
          이미지 갤러리
        </h2>
        <div className="rounded-xl border border-border bg-card p-12 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ImageIcon className="h-12 w-12" />
            <p className="text-sm">이미지가 제공되지 않았습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1,
      );
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0,
      );
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  // 대표 이미지와 썸네일 이미지 분리
  const mainImage = allImages[0];
  const thumbnailImages = allImages.slice(1);

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-semibold text-foreground">이미지 갤러리</h2>

      <div className="space-y-4">
        {/* 대표 이미지 */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
          {!imageErrors.has(0) ? (
            <button
              type="button"
              className="relative h-full w-full cursor-pointer"
              onClick={() => handleImageClick(0)}
            >
              <Image
                src={mainImage.url}
                alt={title || mainImage.name || "대표 이미지"}
                fill
                className="object-cover transition-transform hover:scale-105"
                sizes="100vw"
                unoptimized={mainImage.url.includes("visitkorea.or.kr")}
                onError={() => handleImageError(0)}
              />
            </button>
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* 썸네일 이미지 그리드 */}
        {thumbnailImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {thumbnailImages.map((image, index) => {
              const actualIndex = index + 1;
              const hasError = imageErrors.has(actualIndex);

              return (
                <button
                  key={actualIndex}
                  type="button"
                  className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition-transform hover:scale-105"
                  onClick={() => handleImageClick(actualIndex)}
                >
                  {!hasError ? (
                    <Image
                      src={image.url}
                      alt={image.name || `이미지 ${actualIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      unoptimized={image.url.includes("visitkorea.or.kr")}
                      onError={() => handleImageError(actualIndex)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 이미지 모달 (전체화면) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl p-0">
          <DialogTitle className="sr-only">
            {selectedImageIndex !== null
              ? `${title || "관광지"} 이미지 ${selectedImageIndex + 1} / ${
                  allImages.length
                }`
              : "이미지 갤러리"}
          </DialogTitle>
          {selectedImageIndex !== null && (
            <div className="relative aspect-video w-full bg-black">
              {/* 현재 이미지 */}
              {!imageErrors.has(selectedImageIndex) ? (
                <Image
                  src={allImages[selectedImageIndex].url}
                  alt={
                    allImages[selectedImageIndex].name ||
                    `이미지 ${selectedImageIndex + 1}`
                  }
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized={allImages[selectedImageIndex].url.includes(
                    "visitkorea.or.kr",
                  )}
                  onError={() => handleImageError(selectedImageIndex)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white">
                  <ImageIcon className="h-16 w-16" />
                </div>
              )}

              {/* 이전 버튼 */}
              {allImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* 다음 버튼 */}
              {allImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* 이미지 인덱스 표시 */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
