/**
 * @file robots.ts
 * @description robots.txt 생성 (SEO 최적화)
 *
 * 검색 엔진 크롤러에게 사이트 크롤링 규칙을 제공합니다.
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth-test/", "/storage-test/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
