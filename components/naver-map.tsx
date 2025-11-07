/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트 (홈페이지용)
 *
 * 이 컴포넌트는 홈페이지에서 관광지 목록과 함께 지도를 표시합니다.
 *
 * 주요 기능:
 * 1. 여러 관광지를 마커로 표시
 * 2. 마커 클릭 시 인포윈도우 표시
 * 3. 리스트 항목 클릭 시 해당 마커로 지도 이동
 * 4. 반응형 레이아웃 지원
 *
 * @dependencies
 * - Naver Maps JavaScript API v3 (NCP)
 * - lib/types/tour.ts: TourItem, convertCoordinates
 *
 * 환경변수:
 * - NEXT_PUBLIC_NAVER_MAP_CLIENT_ID: 네이버 지도 API 클라이언트 ID
 */

"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import type { TourItem } from "@/lib/types/tour";
import { convertCoordinates } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

// Naver Maps API 타입 정의
declare global {
  interface Window {
    naver: any;
    navermap_authFailure?: () => void;
  }
}

interface NaverMapProps {
  tours: TourItem[];
  selectedTourId?: string;
  highlightedTourId?: string;
  onMarkerClick?: (tour: TourItem) => void;
  className?: string;
  height?: string;
}

interface MarkerInfo {
  marker: any;
  tour: TourItem;
  infoWindow?: any;
}

function NaverMapComponent({
  tours,
  selectedTourId,
  highlightedTourId,
  onMarkerClick,
  className,
  height = "600px",
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<MarkerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);

  // 네이버 지도 스크립트 로드
  const loadNaverMapScript = useCallback(() => {
    if (scriptLoadedRef.current) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      // 인증 실패 감지 함수 설정 (공식 문서 권장)
      if (!window.navermap_authFailure) {
        window.navermap_authFailure = () => {
          const currentUrl = typeof window !== 'undefined' ? window.location.origin : '알 수 없음';
          const errorMsg =
            `네이버 지도 API 인증에 실패했습니다.\n\n현재 도메인: ${currentUrl}\n\nNCP 콘솔에서 다음 URL을 Web 서비스 URL에 추가해주세요:\n- ${currentUrl}\n- ${currentUrl}/\n\n또는 와일드카드 사용: ${currentUrl.replace(/^https?:\/\//, '*://').replace(/\/$/, '')}/*`;
          console.error("[NaverMap]", errorMsg, {
            currentUrl,
            clientId: clientId || 'NOT_SET',
          });
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
        console.error("[NaverMap]", errorMsg);
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
        console.log("[NaverMap] 네이버 지도 스크립트 로드 완료");
        // 스크립트가 완전히 초기화될 때까지 약간의 지연
        setTimeout(() => {
          if (window.naver && window.naver.maps) {
            console.log("[NaverMap] 네이버 지도 API 준비 완료");
            scriptLoadedRef.current = true;
            resolve();
          } else {
            const errorMsg = "네이버 지도 API가 제대로 로드되지 않았습니다.";
            console.error("[NaverMap]", errorMsg);
            setError(errorMsg);
            reject(new Error(errorMsg));
          }
        }, 100);
      };

      script.onerror = () => {
        const errorMsg = "네이버 지도 스크립트를 로드할 수 없습니다.";
        console.error("[NaverMap]", errorMsg);
        setError(errorMsg);
        reject(new Error(errorMsg));
      };

      document.head.appendChild(script);
    });
  }, []);

  // 지도 초기화
  const initializeMap = useCallback(() => {
    if (!mapRef.current) {
      console.error("[NaverMap] mapRef.current가 없습니다.");
      return;
    }

    if (!window.naver || !window.naver.maps) {
      console.error("[NaverMap] window.naver.maps가 없습니다.", {
        hasNaver: !!window.naver,
        hasMaps: !!window.naver?.maps,
      });
      throw new Error("네이버 지도 API가 로드되지 않았습니다.");
    }

    console.group("[NaverMap] 지도 초기화 시작");

    // 기본 중심 좌표 (서울 시청)
    const defaultCenter = new window.naver.maps.LatLng(37.5665, 126.978);

    // 관광지가 있으면 첫 번째 관광지의 좌표를 중심으로 설정
    let center = defaultCenter;
    let zoom = 10;

    if (tours.length > 0) {
      const firstTour = tours[0];
      if (firstTour.mapx && firstTour.mapy) {
        const coords = convertCoordinates(firstTour.mapx, firstTour.mapy);
        center = new window.naver.maps.LatLng(coords.lat, coords.lng);
        console.log("[NaverMap] 첫 번째 관광지 좌표로 중심 설정:", {
          title: firstTour.title,
          lat: coords.lat,
          lng: coords.lng,
        });
      }

      // 관광지 개수에 따라 줌 레벨 조정
      if (tours.length === 1) {
        zoom = 15;
      } else if (tours.length < 5) {
        zoom = 12;
      } else {
        zoom = 10;
      }
    }

    // 지도 생성
    const map = new window.naver.maps.Map(mapRef.current, {
      center,
      zoom,
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
        console.log("[NaverMap] 지도 타일 로드 완료");
      });

      window.naver.maps.Event.addListener(map, "init", () => {
        console.log("[NaverMap] 지도 초기화 완료");
      });
    }

    console.log("[NaverMap] 지도 인스턴스 생성:", {
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

    console.log("[NaverMap] 지도 생성 완료");
    console.groupEnd();

    return map;
  }, [tours]);

  // 마커 생성 및 표시
  const createMarkers = useCallback(
    (map: any) => {
      if (!window.naver?.maps) {
        return;
      }

      console.group("[NaverMap] 마커 생성 시작");
      console.log("관광지 개수:", tours.length);

      // 기존 마커 제거
      markersRef.current.forEach((markerInfo) => {
        markerInfo.marker.setMap(null);
        if (markerInfo.infoWindow) {
          markerInfo.infoWindow.close();
        }
      });
      markersRef.current = [];

      // 새 마커 생성
      tours.forEach((tour) => {
        if (!tour.mapx || !tour.mapy) {
          console.warn("[NaverMap] 좌표 정보 없음:", tour.title);
          return;
        }

        const coords = convertCoordinates(tour.mapx, tour.mapy);
        const position = new window.naver.maps.LatLng(coords.lat, coords.lng);

        // 마커 생성 (기본 스타일)
        const marker = new window.naver.maps.Marker({
          position,
          map,
          title: tour.title,
          icon: {
            content: `
              <div style="
                background-color: #4F46E5;
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
              ">
                <div style="
                  transform: rotate(45deg);
                  color: white;
                  font-size: 12px;
                  font-weight: bold;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100%;
                ">📍</div>
              </div>
            `,
            anchor: new window.naver.maps.Point(15, 15),
          },
        });

        // 인포윈도우 생성
        const infoWindow = new window.naver.maps.InfoWindow({
          content: `
            <div style="
              padding: 12px;
              min-width: 200px;
              max-width: 300px;
            ">
              <h3 style="
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #1f2937;
              ">${tour.title}</h3>
              <p style="
                font-size: 14px;
                color: #6b7280;
                margin-bottom: 8px;
              ">${tour.addr1}</p>
              <a href="/places/${tour.contentid}" style="
                display: inline-block;
                padding: 6px 12px;
                background-color: #4F46E5;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-size: 14px;
                margin-top: 8px;
              ">상세보기</a>
            </div>
          `,
        });

        // 마커 클릭 이벤트
        window.naver.maps.Event.addListener(marker, "click", () => {
          console.log("[NaverMap] 마커 클릭:", tour.title);
          infoWindow.open(map, marker);
          if (onMarkerClick) {
            onMarkerClick(tour);
          }
        });

        markersRef.current.push({ marker, tour, infoWindow });
      });

      console.log(`[NaverMap] 마커 ${markersRef.current.length}개 생성 완료`);
      console.groupEnd();
    },
    [tours, onMarkerClick],
  );

  // 마커 강조 업데이트
  useEffect(() => {
    if (!window.naver?.maps) {
      return;
    }

    markersRef.current.forEach((markerInfo) => {
      const isHighlighted = markerInfo.tour.contentid === highlightedTourId;
      const isSelected = markerInfo.tour.contentid === selectedTourId;

      // 강조된 마커는 더 크고 밝은 색상으로 표시
      const backgroundColor = isHighlighted
        ? "#EF4444"
        : isSelected
        ? "#10B981"
        : "#4F46E5";
      const size = isHighlighted ? 40 : isSelected ? 35 : 30;
      const borderWidth = isHighlighted ? 3 : isSelected ? 2.5 : 2;
      const zIndex = isHighlighted ? 1000 : isSelected ? 500 : 100;

      // 마커 아이콘 업데이트
      markerInfo.marker.setIcon({
        content: `
          <div style="
            background-color: ${backgroundColor};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: ${borderWidth}px solid white;
            box-shadow: 0 ${
              isHighlighted ? "4px 8px" : "2px 4px"
            } rgba(0,0,0,0.${isHighlighted ? "4" : "3"});
            transition: all 0.3s ease;
            z-index: ${zIndex};
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: ${isHighlighted ? "16px" : "12px"};
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
            ">📍</div>
          </div>
        `,
        anchor: new window.naver.maps.Point(size / 2, size / 2),
      });

      // z-index 설정 (마커 순서)
      markerInfo.marker.setZIndex(zIndex);
    });

    if (highlightedTourId) {
      console.log("[NaverMap] 마커 강조:", highlightedTourId);
    }
  }, [highlightedTourId, selectedTourId]);

  // 선택된 관광지로 지도 이동
  useEffect(() => {
    if (!selectedTourId || !mapInstanceRef.current) {
      return;
    }

    const markerInfo = markersRef.current.find(
      (m) => m.tour.contentid === selectedTourId,
    );

    if (markerInfo) {
      const coords = convertCoordinates(
        markerInfo.tour.mapx,
        markerInfo.tour.mapy,
      );
      const position = new window.naver.maps.LatLng(coords.lat, coords.lng);

      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(15);

      // 인포윈도우 열기
      if (markerInfo.infoWindow) {
        markerInfo.infoWindow.open(mapInstanceRef.current, markerInfo.marker);
      }

      console.log("[NaverMap] 선택된 관광지로 이동:", markerInfo.tour.title);
    }
  }, [selectedTourId]);

  // 윈도우 resize 이벤트 리스너 추가
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current && window.naver?.maps?.Event) {
        console.log("[NaverMap] 윈도우 resize 이벤트 - 지도 resize 트리거");
        window.naver.maps.Event.trigger(mapInstanceRef.current, "resize");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 지도 초기화 및 마커 생성
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 타임아웃 설정 (10초 후에도 로드되지 않으면 에러 표시)
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.error("[NaverMap] 지도 로드 타임아웃");
            setError(
              "지도를 불러오는 데 시간이 오래 걸립니다. 네이버 지도 API 설정을 확인해주세요.",
            );
            setIsLoading(false);
          }
        }, 10000);

        // 스크립트 로드
        await loadNaverMapScript();

        if (!mounted) return;

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
            if (map) break;
          } catch (err) {
            console.warn(
              `[NaverMap] 지도 초기화 시도 ${
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

          console.log("[NaverMap] 지도 컨테이너 크기:", { width, height });

          // 컨테이너 크기가 0이면 에러
          if (width === 0 || height === 0) {
            console.warn(
              "[NaverMap] 지도 컨테이너 크기가 0입니다. CSS를 확인해주세요.",
            );
          }
        }

        // 지도가 완전히 렌더링될 때까지 약간의 지연
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 마커 생성
        createMarkers(map);

        // 마커 생성 후 추가 지연 및 resize
        await new Promise((resolve) => setTimeout(resolve, 200));

        // 최종 resize 트리거
        if (map && window.naver?.maps?.Event) {
          window.naver.maps.Event.trigger(map, "resize");
        }

        // 타임아웃 클리어
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[NaverMap] 초기화 오류:", err);
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
  }, [loadNaverMapScript, initializeMap, createMarkers]);

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border overflow-hidden",
        className,
      )}
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
  );
}

// React.memo로 불필요한 리렌더링 방지
export const NaverMap = memo(NaverMapComponent);
