import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JLG Trip - 한국 관광지 정보 서비스",
    template: "%s | JLG Trip",
  },
  description:
    "전국의 관광지 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
  keywords: [
    "한국 관광지",
    "여행 정보",
    "관광지 검색",
    "한국 여행",
    "관광 명소",
    "여행 코스",
  ],
  authors: [{ name: "JLG Trip" }],
  creator: "JLG Trip",
  publisher: "JLG Trip",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000",
    siteName: "JLG Trip",
    title: "JLG Trip - 한국 관광지 정보 서비스",
    description:
      "전국의 관광지 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JLG Trip - 한국 관광지 정보 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JLG Trip - 한국 관광지 정보 서비스",
    description:
      "전국의 관광지 정보를 쉽게 검색하고, 지도에서 확인하며, 상세 정보를 조회할 수 있는 웹 서비스",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 등록 시 사용
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <SyncUserProvider>
            <Navbar />
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
