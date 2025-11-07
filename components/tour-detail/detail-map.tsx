/**
 * @file detail-map.tsx
 * @description 관광지 상세페이지 지도 컴포넌트
 *
 * 이 컴포넌트는 상세페이지에서 해당 관광지의 위치를 지도에 표시합니다.
 *
 * 주요 기능:
 * 1. 해당 관광지 위치를 마커로 표시
 * 2. 길찾기 버튼 (네이버 지도 앱/웹 연동)
 * 3. 좌표 정보 표시
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - lib/types/tour.ts: TourDetail, convertCoordinates
 *
 * 환경변수:
 * - NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: 네이버 지도 API 클라이언트 ID
 */

"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { convertCoordinates } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

// Naver Maps API 타입 정의
declare global {
  interface Window {
    naver: any;
    navermap_authFailure?: () => void;
  }
}

interface DetailMapProps {
  detail: TourDetail;
  className?: string;
  height?: string;
}

function DetailMap({ detail, className, height = "400px" }: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);
  const initializedRef = useRef(false);

  // 좌표 변환 (메모이제이션하여 불필요한 재생성 방지)
  const coordinates = useMemo(() => {
    if (detail.mapx && detail.mapy) {
      return convertCoordinates(detail.mapx, detail.mapy);
    }
    return null;
  }, [detail.mapx, detail.mapy]);

  // 네이버 지도 스크립트 로드
  const loadNaverMapScript = useCallback(() => {
    if (scriptLoadedRef.current) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      // 인증 실패 감지 함수 설정 (공식 문서 권장)
      if (!window.navermap_authFailure) {
        window.navermap_authFailure = () => {
          const errorMsg =
            "네이버 지도 API 인증에 실패했습니다. NCP 콘솔에서 Web 서비스 URL 설정을 확인해주세요.";
          console.error("[DetailMap]", errorMsg);
          setError(errorMsg);
          setIsLoading(false);
          reject(new Error(errorMsg));
        };
      }

      // 이미 스크립트가 로드되어 있는지 확인
      if (window.naver && window.naver.maps) {
        scriptLoadedRef.current = true;
        resolve();
        return;
      }

      const clientId =
        process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ||
        process.env.NEXT_PUBLIC_NAVER_MAP_NCP_KEY_ID;

      if (!clientId) {
        const errorMsg =
          "네이버 지도 API 키가 설정되지 않았습니다. NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수를 설정해주세요.";
        console.error("[DetailMap]", errorMsg);
        setError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      // 스크립트가 이미 로드 중인지 확인
      const existingScript = document.querySelector(
        'script[src^="https://oapi.map.naver.com/openapi/v3/maps.js"]',
      ) as HTMLScriptElement;

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          scriptLoadedRef.current = true;
          resolve();
        });
        existingScript.addEventListener("error", reject);
        return;
      }

      // 스크립트 동적 로드
      const script = document.createElement("script");
      // Naver Maps JS v3는 ncpKeyId 파라미터를 사용합니다 (2025년 업데이트)
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("[DetailMap] 네이버 지도 스크립트 로드 완료");
        // 스크립트가 완전히 초기화될 때까지 약간의 지연
        setTimeout(() => {
          if (window.naver && window.naver.maps) {
            console.log("[DetailMap] 네이버 지도 API 준비 완료");
            scriptLoadedRef.current = true;
            resolve();
          } else {
            const errorMsg = "네이버 지도 API가 제대로 로드되지 않았습니다.";
            console.error("[DetailMap]", errorMsg);
            setError(errorMsg);
            reject(new Error(errorMsg));
          }
        }, 100);
      };

      script.onerror = () => {
        const errorMsg = "네이버 지도 스크립트를 로드할 수 없습니다.";
        console.error("[DetailMap]", errorMsg);
        setError(errorMsg);
        reject(new Error(errorMsg));
      };

      document.head.appendChild(script);
    });
  }, []);

  // 지도 초기화
  const initializeMap = useCallback(() => {
    if (!mapRef.current) {
      console.error("[DetailMap] mapRef.current가 없습니다.");
      return;
    }

    if (!coordinates) {
      console.error("[DetailMap] coordinates가 없습니다.");
      return;
    }

    if (!window.naver || !window.naver.maps) {
      console.error("[DetailMap] window.naver.maps가 없습니다.", {
        hasNaver: !!window.naver,
        hasMaps: !!window.naver?.maps,
      });
      throw new Error("네이버 지도 API가 로드되지 않았습니다.");
    }

    console.group("[DetailMap] 지도 초기화 시작");
    console.log("관광지:", detail.title);
    console.log("좌표:", coordinates);

    const position = new window.naver.maps.LatLng(
      coordinates.lat,
      coordinates.lng,
    );

    // 지도 생성
    const map = new window.naver.maps.Map(mapRef.current, {
      center: position,
      zoom: 15,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
      // 인터랙션 명시적 활성화
      scrollWheel: true,
      pinchZoom: true,
      draggable: true,
      disableDoubleClickZoom: false,
      keyboardShortcuts: true,
      mapTypeControl: true,
      // 추가 옵션
      useStyleMap: false,
      logoControl: true,
      mapDataControl: true,
      scaleControl: true,
    });

    mapInstanceRef.current = map;

    // 지도 타일 로드 이벤트 리스너 추가
    if (window.naver?.maps?.Event) {
      window.naver.maps.Event.addListener(map, "tilesloaded", () => {
        console.log("[DetailMap] 지도 타일 로드 완료");
      });

      window.naver.maps.Event.addListener(map, "init", () => {
        console.log("[DetailMap] 지도 초기화 완료");
      });
    }

    console.log("[DetailMap] 지도 인스턴스 생성:", {
      center: map.getCenter(),
      zoom: map.getZoom(),
      mapTypeId: map.getMapTypeId(),
      size: map.getSize(),
    });

    // 지도가 제대로 렌더링되도록 resize 이벤트 트리거
    // 여러 번 트리거하여 지도 타일이 제대로 로드되도록 함
    const triggerResize = () => {
      if (window.naver?.maps?.Event && map) {
        window.naver.maps.Event.trigger(map, "resize");
      }
    };

    // 즉시 resize 트리거
    triggerResize();

    // 지도 타일이 로드될 때까지 여러 번 resize 트리거
    setTimeout(triggerResize, 100);
    setTimeout(triggerResize, 300);
    setTimeout(triggerResize, 500);

    // 지도가 완전히 로드된 후 최종 resize
    // 지도 타일 로드 이벤트 리스너 추가
    if (map && window.naver?.maps?.Event) {
      window.naver.maps.Event.addListener(map, "idle", () => {
        // 지도가 완전히 로드되고 유휴 상태가 되면 resize 트리거
        triggerResize();
      });
    }

    // 마커 생성
    const marker = new window.naver.maps.Marker({
      position,
      map,
      title: detail.title,
      icon: {
        content: `
          <div style="
            background-color: #4F46E5;
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 16px;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
            ">📍</div>
          </div>
        `,
        anchor: new window.naver.maps.Point(20, 20),
      },
    });

    // 인포윈도우 생성
    const infoWindow = new window.naver.maps.InfoWindow({
      content: `
        <div style="
          padding: 12px;
          min-width: 200px;
        ">
          <h3 style="
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #1f2937;
          ">${detail.title}</h3>
          <p style="
            font-size: 14px;
            color: #6b7280;
          ">${detail.addr1}${detail.addr2 ? ` ${detail.addr2}` : ""}</p>
        </div>
      `,
    });

    // 마커 클릭 시 인포윈도우 열기
    window.naver.maps.Event.addListener(marker, "click", () => {
      infoWindow.open(map, marker);
    });

    // 초기 인포윈도우 열기
    infoWindow.open(map, marker);

    mapInstanceRef.current = map;
    markerRef.current = marker;

    console.log("[DetailMap] 지도 및 마커 생성 완료");
    console.groupEnd();

    return map;
  }, [coordinates, detail.title, detail.addr1, detail.addr2]);

  // 지도 초기화
  useEffect(() => {
    // 이미 초기화되었거나 좌표가 없으면 스킵
    if (initializedRef.current || !coordinates) {
      if (!coordinates) {
        setIsLoading(false);
        setError("좌표 정보가 없습니다.");
      }
      return;
    }

    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 타임아웃 설정 (10초 후에도 로드되지 않으면 에러 표시)
        timeoutId = setTimeout(() => {
          if (mounted && !initializedRef.current) {
            console.error("[DetailMap] 지도 로드 타임아웃");
            setError(
              "지도를 불러오는 데 시간이 오래 걸립니다. 네이버 지도 API 설정을 확인해주세요.",
            );
            setIsLoading(false);
          }
        }, 10000);

        // 스크립트 로드
        await loadNaverMapScript();

        if (!mounted || initializedRef.current) return;

        // mapRef가 준비될 때까지 대기
        let retries = 0;
        const maxRetries = 10;
        while (!mapRef.current && retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }

        if (!mapRef.current) {
          throw new Error("지도 컨테이너를 찾을 수 없습니다.");
        }

        // window.naver.maps가 실제로 사용 가능한지 확인
        if (!window.naver || !window.naver.maps) {
          throw new Error(
            "네이버 지도 API 인증에 실패했습니다. NCP 콘솔에서 Web 서비스 URL 설정을 확인해주세요.",
          );
        }

        // 지도 초기화 (약간의 지연을 두고 재시도)
        let map: any = null;
        retries = 0;
        const maxInitRetries = 5;

        while (!map && retries < maxInitRetries) {
          try {
            map = initializeMap();
            if (map) {
              initializedRef.current = true;
              break;
            }
          } catch (err) {
            console.warn(
              `[DetailMap] 지도 초기화 시도 ${
                retries + 1
              }/${maxInitRetries} 실패:`,
              err,
            );
            if (retries < maxInitRetries - 1) {
              await new Promise((resolve) => setTimeout(resolve, 200));
            }
          }
          retries++;
        }

        if (!map) {
          throw new Error(
            "지도를 초기화할 수 없습니다. 네이버 지도 API 인증을 확인해주세요.",
          );
        }

        // 지도 컨테이너 크기 확인 및 설정
        if (mapRef.current) {
          const container = mapRef.current;
          const width = container.offsetWidth || container.clientWidth;
          const height = container.offsetHeight || container.clientHeight;

          console.log("[DetailMap] 지도 컨테이너 크기:", { width, height });

          // 컨테이너 크기가 0이면 에러
          if (width === 0 || height === 0) {
            console.warn(
              "[DetailMap] 지도 컨테이너 크기가 0입니다. CSS를 확인해주세요.",
            );
          }
        }

        // 지도가 완전히 렌더링될 때까지 약간의 지연
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 최종 resize 트리거
        if (map && window.naver?.maps?.Event) {
          window.naver.maps.Event.trigger(map, "resize");
        }

        // 추가 지연
        await new Promise((resolve) => setTimeout(resolve, 200));

        // 타임아웃 클리어
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (mounted && initializedRef.current) {
          console.log("[DetailMap] 지도 초기화 완료 - 로딩 상태 해제");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[DetailMap] 초기화 오류:", err);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "지도를 불러올 수 없습니다. 네이버 지도 API 설정을 확인해주세요.",
          );
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadNaverMapScript, initializeMap, coordinates]);

  // 윈도우 resize 이벤트 리스너 추가
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current && window.naver?.maps?.Event) {
        console.log("[DetailMap] 윈도우 resize 이벤트 - 지도 resize 트리거");
        window.naver.maps.Event.trigger(mapInstanceRef.current, "resize");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 길찾기 URL 생성
  const getDirectionsUrl = () => {
    if (!coordinates) return null;

    // 네이버 지도 길찾기 URL (웹)
    const lat = coordinates.lat;
    const lng = coordinates.lng;
    const address = encodeURIComponent(detail.addr1 + (detail.addr2 || ""));

    // 네이버 지도 앱 URL (모바일)
    const appUrl = `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${address}`;

    // 네이버 지도 웹 URL (데스크톱)
    const webUrl = `https://map.naver.com/v5/directions/-/${lng},${lat},,place/${address}`;

    return { appUrl, webUrl };
  };

  const directionsUrl = getDirectionsUrl();

  if (!coordinates) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-border bg-card p-8",
          className,
        )}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground">위치 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 지도 */}
      <div
        className="relative rounded-xl border border-border overflow-hidden"
        style={{ height, minHeight: "400px" }}
      >
        {/* 지도 컨테이너 - 항상 렌더링 */}
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ height, minHeight: "400px" }}
        />

        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-sm text-muted-foreground">
                지도를 불러오는 중...
              </p>
            </div>
          </div>
        )}

        {/* 에러 오버레이 */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10">
            <div className="text-center p-4">
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                네이버 지도 API 키를 확인해주세요.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 길찾기 버튼 및 좌표 정보 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {directionsUrl && (
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              console.log("[DetailMap] 길찾기 버튼 클릭:", {
                title: detail.title,
                coordinates,
              });
            }}
          >
            <a
              href={directionsUrl.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              네이버 지도에서 길찾기
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}

        {/* 좌표 정보 */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">좌표:</span>{" "}
          <span className="font-mono">
            {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </span>
        </div>
      </div>
    </div>
  );
}

export { DetailMap };
