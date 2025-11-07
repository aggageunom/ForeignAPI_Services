/**
 * @file app/places/[contentId]/page.tsx
 * @description 관광지 상세 페이지
 *
 * 이 페이지는 관광지의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 기본 정보 표시
 * 2. 운영 정보 표시
 * 3. 이미지 갤러리
 * 4. 지도 표시 (향후 구현)
 * 5. 공유 기능
 *
 * @dependencies
 * - lib/api/tour-api.ts: getTourDetail, getTourIntro, getTourImages
 * - components/tour-detail/: 상세페이지 컴포넌트들
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/ui/error";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMap } from "@/components/tour-detail/detail-map";
import { ShareButton } from "@/components/tour-detail/share-button";
import { BookmarkButton } from "@/components/bookmarks/bookmark-button";
import { getTourDetail, getTourIntro, getTourImages } from "@/lib/api/tour-api";
import type { Metadata } from "next";

interface PlacePageProps {
  params: Promise<{
    contentId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlacePageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    const detail = await getTourDetail(contentId);
    const description =
      detail.overview?.substring(0, 100) || "관광지 상세 정보를 확인하세요.";

    return {
      title: `${detail.title} - JLG Trip`,
      description,
      openGraph: {
        title: detail.title,
        description,
        images: detail.firstimage
          ? [
              {
                url: detail.firstimage,
                width: 1200,
                height: 630,
                alt: detail.title,
              },
            ]
          : [],
        url: `/places/${contentId}`,
        type: "website",
      },
    };
  } catch {
    return {
      title: "관광지 상세 - JLG Trip",
      description: "관광지 상세 정보를 확인하세요.",
    };
  }
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { contentId } = await params;

  try {
    console.group("[PlacePage] 관광지 상세 정보 로드 시작");
    console.log("Content ID:", contentId);

    // 병렬로 데이터 로드
    const detailResult = await getTourDetail(contentId);

    const [intro, images] = await Promise.allSettled([
      getTourIntro(detailResult.contentid, detailResult.contenttypeid),
      getTourImages(contentId),
    ]);

    const detailData = detailResult;
    const introData = intro.status === "fulfilled" ? intro.value : null;
    const imagesData = images.status === "fulfilled" ? images.value : [];

    console.log("[PlacePage] 데이터 로드 완료:", {
      contentId,
      title: detailData.title,
      hasIntro: !!introData,
      imagesCount: imagesData.length,
    });
    console.groupEnd();

    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* 뒤로가기 버튼 및 액션 버튼들 */}
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                목록으로
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <BookmarkButton contentId={detailData.contentid} size="sm" />
              <ShareButton
                size="sm"
                title={detailData.title}
                description={detailData.overview?.substring(0, 100)}
                imageUrl={detailData.firstimage || detailData.firstimage2}
              />
            </div>
          </div>

          {/* 기본 정보 섹션 */}
          <section className="mb-8">
            <DetailInfo detail={detailData} />
          </section>

          {/* 운영 정보 섹션 */}
          {introData && (
            <section className="mb-8">
              <DetailIntro intro={introData} />
            </section>
          )}

          {/* 이미지 갤러리 섹션 */}
          <section className="mb-8">
            <DetailGallery
              images={imagesData}
              mainImageUrl={detailData.firstimage || detailData.firstimage2}
              title={detailData.title}
            />
          </section>

          {/* 지도 섹션 */}
          {detailData.mapx && detailData.mapy && (
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">위치</h2>
              <DetailMap detail={detailData} />
            </section>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error("[PlacePage] 오류 발생:", error);

    // 404 처리
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("찾을 수 없습니다")
    ) {
      notFound();
    }

    const errorMessage =
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : "관광지 정보를 불러오는 중 오류가 발생했습니다.";

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              목록으로
            </Link>
          </Button>
        </div>
        <Error message={errorMessage} />
      </main>
    );
  }
}
