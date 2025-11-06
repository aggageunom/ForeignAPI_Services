import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      // 한국관광공사 API 이미지 도메인
      { hostname: "www.visitkorea.or.kr" },
      { hostname: "tong.visitkorea.or.kr" },
      { hostname: "api.visitkorea.or.kr" },
      { hostname: "data.visitkorea.or.kr" },
      { hostname: "korean.visitkorea.or.kr" },
    ],
    // HTTP 프로토콜 허용 (한국관광공사 API 이미지가 http인 경우 대비)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
