/**
 * @file navigation-dialog.tsx
 * @description 네비게이션 앱 선택 다이얼로그
 *
 * 이 컴포넌트는 사용자가 길찾기를 위해 원하는 네비게이션 앱을 선택할 수 있도록 합니다.
 *
 * 주요 기능:
 * 1. 네이버 지도/네비, Tmap, 카카오네비 등 여러 앱 선택
 * 2. 각 앱의 URL 스킴을 통해 길찾기 실행
 * 3. 모바일/데스크톱 환경 자동 감지
 *
 * @dependencies
 * - components/ui/dialog: Dialog 컴포넌트
 * - lucide-react: 아이콘
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navigation, MapPin, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: {
    lat: number;
    lng: number;
    name: string;
    address?: string;
  };
  origin?: {
    lat: number;
    lng: number;
    name?: string;
  };
}

interface NavigationOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (
    destination: NavigationDialogProps["destination"],
    origin?: NavigationDialogProps["origin"],
  ) => {
    appUrl?: string;
    webUrl?: string;
  };
}

export function NavigationDialog({
  open,
  onOpenChange,
  destination,
  origin,
}: NavigationDialogProps) {
  const [clickedApp, setClickedApp] = useState<string | null>(null);

  /**
   * appname 파라미터 생성 (네이버 지도 URL Scheme 필수 파라미터)
   * 모바일 웹의 경우 웹 페이지 URL 사용
   * 문서: https://guide.ncloud-docs.com/docs/maps-url-scheme
   */
  const getAppName = useCallback(() => {
    if (typeof window !== "undefined") {
      return encodeURIComponent(window.location.href);
    }
    return encodeURIComponent("https://jlg-trip.com");
  }, []);

  /**
   * 네비게이션 앱 열기
   */
  const handleOpenNavigation = (option: NavigationOption) => {
    console.group("[NavigationDialog] 네비게이션 앱 열기");
    console.log("선택한 앱:", option.name);
    console.log("목적지:", destination);
    console.log("출발지:", origin || "현재 위치");

    const urls = option.getUrl(destination, origin);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    console.log("환경:", { isMobile, urls });
    console.log("생성된 URL:", {
      appUrl: urls.appUrl,
      webUrl: urls.webUrl,
    });

    // 모바일 환경에서는 앱 URL 우선 시도, 없으면 웹 URL
    if (isMobile && urls.appUrl) {
      console.log("모바일 앱 URL 시도:", urls.appUrl);

      // 앱이 설치되어 있지 않을 경우를 대비해 fallback URL 설정
      const fallbackUrl =
        urls.webUrl ||
        `https://map.naver.com/v5/search/${encodeURIComponent(
          destination.name,
        )}`;

      console.log("Fallback URL 준비:", fallbackUrl);

      // 앱 열기 시도
      try {
        window.location.href = urls.appUrl;
        console.log("앱 URL 호출 성공");
      } catch (error) {
        console.error("앱 URL 호출 실패:", error);
        window.open(fallbackUrl, "_blank");
      }

      // 앱이 열리지 않으면 웹으로 fallback (약간의 지연 후)
      setTimeout(() => {
        if (urls.webUrl) {
          console.log("앱 열기 실패 가능성, 웹 URL로 fallback:", urls.webUrl);
          // 이미 앱이 열렸다면 이 코드는 실행되지 않음
        }
      }, 1500);
    } else if (urls.webUrl) {
      console.log("웹 URL 열기:", urls.webUrl);
      window.open(urls.webUrl, "_blank");
    } else if (urls.appUrl) {
      console.log("앱 URL 열기 (데스크톱):", urls.appUrl);
      window.location.href = urls.appUrl;
    }

    setClickedApp(option.id);
    setTimeout(() => {
      setClickedApp(null);
      onOpenChange(false);
    }, 300);

    console.groupEnd();
  };

  /**
   * 네비게이션 옵션 목록
   * getAppName을 클로저로 접근 가능하도록 useMemo 사용
   */
  const navigationOptions: NavigationOption[] = useMemo(
    () => [
      {
        id: "naver-map",
        name: "네이버 지도",
        description: "웹 브라우저에서 길찾기",
        icon: <MapPin className="h-5 w-5" />,
        color: "bg-green-500",
        getUrl: (dest, orig) => {
          const destName = encodeURIComponent(dest.name);
          const destAddress = dest.address
            ? encodeURIComponent(dest.address)
            : destName;
          const appname = getAppName();

          // 네이버 지도 웹 URL
          // 좌표 기반 지도 표시 + 마커 표시
          // 형식: https://map.naver.com/v5/?c={경도},{위도},{줌레벨},0,0,0,dh
          // 추가로 검색 쿼리를 통해 장소명도 함께 전달
          const webUrl = `https://map.naver.com/v5/search/${destName}?c=${dest.lng},${dest.lat},15,0,0,0,dh`;

          // 네이버 지도 앱 URL (자동차 길찾기: /route/car, appname 필수)
          // 문서: https://guide.ncloud-docs.com/docs/maps-url-scheme
          let appUrl: string;
          if (orig) {
            const origName = encodeURIComponent(orig.name || "출발지");
            appUrl = `nmap://route/car?slat=${orig.lat}&slng=${orig.lng}&sname=${origName}&dlat=${dest.lat}&dlng=${dest.lng}&dname=${destAddress}&appname=${appname}`;
          } else {
            // 출발지가 없으면 도착지만 설정 (현재 위치에서 출발)
            appUrl = `nmap://route/car?dlat=${dest.lat}&dlng=${dest.lng}&dname=${destAddress}&appname=${appname}`;
          }

          return { appUrl, webUrl };
        },
      },
      {
        id: "naver-navi",
        name: "네이버 네비",
        description: "네이버 네비 앱에서 길찾기",
        icon: <Navigation className="h-5 w-5" />,
        color: "bg-green-600",
        getUrl: (dest, orig) => {
          const destName = encodeURIComponent(dest.name);
          const destAddress = dest.address
            ? encodeURIComponent(dest.address)
            : destName;

          // 출발지가 있으면 출발지 포함, 없으면 현재 위치 사용
          if (orig) {
            const origName = encodeURIComponent(orig.name || "출발지");
            const appUrl = `nnaver://route?slat=${orig.lat}&slng=${orig.lng}&sname=${origName}&dlat=${dest.lat}&dlng=${dest.lng}&dname=${destAddress}`;
            return { appUrl };
          } else {
            // 출발지가 없으면 도착지만 설정
            const appUrl = `nnaver://route?dlat=${dest.lat}&dlng=${dest.lng}&dname=${destAddress}`;
            return { appUrl };
          }
        },
      },
      {
        id: "tmap",
        name: "Tmap",
        description: "Tmap 앱에서 길찾기",
        icon: <Navigation className="h-5 w-5" />,
        color: "bg-blue-500",
        getUrl: (dest, orig) => {
          const destName = encodeURIComponent(dest.name);
          const destAddress = dest.address
            ? encodeURIComponent(dest.address)
            : destName;

          // Tmap URL 스킴 (출발지가 있으면 출발지 포함)
          if (orig) {
            const origName = encodeURIComponent(orig.name || "출발지");
            const appUrl = `tmap://route?startx=${orig.lng}&starty=${orig.lat}&endx=${dest.lng}&endy=${dest.lat}&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&startName=${origName}&endName=${destAddress}`;
            return { appUrl };
          } else {
            // 출발지가 없으면 도착지만 설정
            const appUrl = `tmap://route?endx=${dest.lng}&endy=${dest.lat}&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&endName=${destAddress}`;
            return { appUrl };
          }
        },
      },
      {
        id: "kakao-navi",
        name: "카카오네비",
        description: "카카오네비 앱에서 길찾기",
        icon: <Navigation className="h-5 w-5" />,
        color: "bg-yellow-500",
        getUrl: (dest, orig) => {
          // 카카오네비 URL 스킴 (출발지가 있으면 출발지 포함)
          if (orig) {
            const appUrl = `kakaonavi://route?sp=${orig.lat},${orig.lng}&ep=${dest.lat},${dest.lng}&by=CAR`;
            return { appUrl };
          } else {
            // 출발지가 없으면 도착지만 설정
            const appUrl = `kakaonavi://route?ep=${dest.lat},${dest.lng}&by=CAR`;
            return { appUrl };
          }
        },
      },
    ],
    [getAppName],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            길찾기 앱 선택
          </DialogTitle>
          <DialogDescription>
            원하는 네비게이션 앱을 선택하여 길찾기를 시작하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {navigationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOpenNavigation(option)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:bg-accent hover:shadow-md",
                clickedApp === option.id && "ring-2 ring-primary",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-white",
                  option.color,
                )}
              >
                {option.icon}
              </div>
              <div className="text-center">
                <div className="font-semibold">{option.name}</div>
                <div className="text-xs text-muted-foreground">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <p>
            목적지: <span className="font-medium">{destination.name}</span>
          </p>
          {destination.address && <p className="mt-1">{destination.address}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
