/**
 * @file sitemap.ts
 * @description 사이트맵 생성 (SEO 최적화)
 *
 * Next.js가 자동으로 /sitemap.xml을 생성합니다.
 * 주요 페이지와 동적 경로를 포함합니다.
 */

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 동적 페이지는 샘플 또는 API에서 가져올 수 있지만,
  // 모든 관광지 상세페이지를 포함하면 sitemap이 너무 커질 수 있습니다.
  // 따라서 주요 페이지만 포함하고, 나머지는 크롤러가 자동으로 발견하도록 합니다.

  return staticPages;
}
