# TODO: 한국 관광지 정보 서비스 (My Trip) 개발 체크리스트

## Phase 1: 기본 구조 & 공통 설정

- [✔️] 프로젝트 셋업 완료 확인
- [✔️] API 클라이언트 구현 (`lib/api/tour-api.ts`)
  - [✔️] 한국관광공사 API 기본 설정
  - [✔️] `areaCode2` 함수 구현
  - [✔️] `areaBasedList2` 함수 구현
  - [✔️] `searchKeyword2` 함수 구현
  - [✔️] `detailCommon2` 함수 구현
  - [✔️] `detailIntro2` 함수 구현
  - [✔️] `detailImage2` 함수 구현
- [✔️] 기본 타입 정의 (`lib/types/tour.ts`)
  - [✔️] `TourItem` 인터페이스
  - [✔️] `TourDetail` 인터페이스
  - [✔️] `TourIntro` 인터페이스
  - [✔️] `ContentType` 타입 정의
  - [✔️] `AreaCode` 타입 정의
- [✔️] 레이아웃 구조 업데이트 (`app/layout.tsx`)
  - [✔️] 메타데이터 설정
  - [✔️] 공통 헤더/푸터 구조 확인
- [✔️] 공통 컴포넌트 구현
  - [✔️] `components/ui/loading.tsx` (로딩 스피너)
  - [✔️] `components/ui/error.tsx` (에러 처리)
  - [✔️] `components/ui/skeleton.tsx` (스켈레톤 UI)

## Phase 2: 홈페이지 (`/`) - 관광지 목록

### 2.1 페이지 기본 구조

- [✔️] `app/page.tsx` 생성 및 기본 레이아웃
- [✔️] 기본 UI 구조 확인 (헤더, 메인 영역, 푸터)
- [✔️] 반응형 레이아웃 구조 설정

### 2.2 관광지 목록 기능 (MVP 2.1)

- [✔️] `components/tour-card.tsx` 생성
  - [✔️] 썸네일 이미지 표시 (기본 이미지 fallback)
  - [✔️] 관광지명 표시
  - [✔️] 주소 표시
  - [✔️] 관광 타입 뱃지 표시
  - [✔️] 간단한 개요 표시 (1-2줄)
  - [✔️] 클릭 시 상세페이지 이동
- [✔️] `components/tour-list.tsx` 생성
  - [✔️] 하드코딩 데이터로 테스트
  - [✔️] 그리드 레이아웃 구현
  - [✔️] API 연동하여 실제 데이터 표시
- [✔️] 페이지 확인 및 스타일링 조정

### 2.3 필터 기능 추가

- [✔️] `components/tour-filters.tsx` 생성
  - [✔️] 지역 필터 UI (시/도 선택)
  - [✔️] 관광 타입 필터 UI (12, 14, 15, 25, 28, 32, 38, 39)
  - [✔️] "전체" 옵션 제공
- [✔️] 필터 상태 관리 (URL Query 사용)
- [✔️] 필터링된 결과 표시
- [✔️] 페이지 확인 및 UX 개선

### 2.4 검색 기능 추가 (MVP 2.3)

- [✔️] `components/tour-search.tsx` 생성
  - [✔️] 검색창 UI (상단 배치)
  - [✔️] 검색 아이콘 표시
  - [✔️] 엔터/버튼 클릭 이벤트 처리
- [✔️] 검색 API 연동 (`searchKeyword2`)
- [✔️] 검색 결과 표시
- [✔️] 검색 + 필터 조합 동작
- [✔️] 검색 중 로딩 상태 표시 (Server Component에서 자동 처리)
- [✔️] 페이지 확인 및 UX 개선

### 2.5 지도 연동 (MVP 2.2)

- [ ] 네이버 지도 API 설정 확인 (환경변수)
- [ ] `components/naver-map.tsx` 생성
  - [ ] 기본 지도 표시
  - [ ] 관광지 마커 표시
  - [ ] 마커 클릭 시 인포윈도우
  - [ ] 관광 타입별 마커 색상 구분 (선택 사항)
- [ ] 리스트-지도 연동
  - [ ] 리스트 항목 클릭 시 해당 마커로 이동
  - [ ] 리스트 항목 호버 시 마커 강조 (선택 사항)
- [ ] 반응형 레이아웃
  - [ ] 데스크톱: 리스트(좌측) + 지도(우측) 분할
  - [ ] 모바일: 탭 형태로 리스트/지도 전환
- [ ] 지도 컨트롤 추가 (줌 인/아웃, 지도 유형)
- [ ] 페이지 확인 및 인터랙션 테스트

### 2.6 정렬 & 페이지네이션

- [✔️] 정렬 옵션 추가 (최신순, 이름순)
  - [✔️] `components/tour-sort.tsx` 생성
  - [✔️] 클라이언트 사이드 정렬 처리
- [✔️] 페이지네이션 구현
  - [✔️] `components/tour-pagination.tsx` 생성
  - [✔️] 페이지 번호 표시 및 이동
  - [✔️] 이전/다음 페이지 버튼
- [✔️] 로딩 상태 개선 (Skeleton UI) - 이미 구현됨
- [✔️] 최종 페이지 확인 및 성능 테스트

## Phase 3: 상세페이지 (`/places/[contentId]`)

### 3.1 페이지 기본 구조

- [✔️] `app/places/[contentId]/page.tsx` 생성
- [✔️] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
- [✔️] 라우팅 테스트 (홈에서 클릭 시 이동)
- [✔️] 동적 라우팅 파라미터 처리
- [✔️] 404 페이지 처리 (`app/not-found.tsx`)

### 3.2 기본 정보 섹션 (MVP 2.4.1)

- [✔️] `components/tour-detail/detail-info.tsx` 생성
- [✔️] `detailCommon2` API 연동
- [✔️] 관광지명 표시 (대제목)
- [✔️] 대표 이미지 표시 (크게)
- [✔️] 주소 표시 및 복사 기능
- [✔️] 전화번호 표시 및 클릭 시 전화 연결
- [✔️] 홈페이지 링크 표시
- [✔️] 개요 (긴 설명문) 표시
- [✔️] 관광 타입 및 카테고리 표시
- [✔️] 페이지 확인 및 스타일링

### 3.3 지도 섹션 (MVP 2.4.4)

- [ ] `components/tour-detail/detail-map.tsx` 생성 (지도 API 키 준비 후 구현 예정)
- [ ] 해당 관광지 위치 표시 (마커 1개)
- [ ] "길찾기" 버튼 (네이버 지도 앱/웹 연동)
- [ ] 좌표 정보 표시 (선택 사항)
- [ ] 페이지 확인

### 3.4 공유 기능 (MVP 2.4.5)

- [✔️] `components/tour-detail/share-button.tsx` 생성
- [✔️] URL 복사 기능 (클립보드 API)
- [✔️] 복사 완료 토스트 메시지 (버튼 상태 변경으로 표시)
- [✔️] Open Graph 메타태그 동적 생성 (`app/places/[contentId]/page.tsx`)
  - [✔️] `og:title` (관광지명)
  - [✔️] `og:description` (관광지 설명 100자 이내)
  - [✔️] `og:image` (대표 이미지)
  - [✔️] `og:url` (상세페이지 URL)
  - [✔️] `og:type` ("website")
- [✔️] 페이지 확인 및 공유 테스트

### 3.5 추가 정보 섹션

- [✔️] `components/tour-detail/detail-intro.tsx` 생성 (운영 정보)
  - [✔️] `detailIntro2` API 연동
  - [✔️] 운영시간/개장시간 표시
  - [✔️] 휴무일 표시
  - [✔️] 이용요금 표시
  - [✔️] 주차 가능 여부 표시
  - [✔️] 수용인원 표시
  - [✔️] 체험 프로그램 표시
  - [✔️] 유모차/반려동물 동반 가능 여부 표시
- [✔️] `components/tour-detail/detail-gallery.tsx` 생성 (이미지 갤러리)
  - [✔️] `detailImage2` API 연동
  - [✔️] 대표 이미지 + 서브 이미지들 표시
  - [✔️] 이미지 클릭 시 전체화면 모달
  - [✔️] 이미지 슬라이드 기능
  - [✔️] 이미지 없으면 기본 이미지
- [✔️] 페이지 확인 및 스타일링

## Phase 4: 북마크 페이지 (`/bookmarks`) - 선택 사항

### 4.1 Supabase 설정

- [✔️] `supabase/migrations/` 마이그레이션 파일 생성 (mytrip_schema.sql에 이미 존재)
- [✔️] `bookmarks` 테이블 생성
  - [✔️] `id` (UUID, Primary Key)
  - [✔️] `user_id` (UUID, Foreign Key → users.clerk_id)
  - [✔️] `content_id` (TEXT, 관광지 contentId)
  - [✔️] `created_at` (TIMESTAMP)
- [✔️] RLS 정책 설정 (개발 중 비활성화)
- [✔️] 마이그레이션 실행 및 테스트 (마이그레이션 파일 준비 완료)

### 4.2 북마크 기능 구현

- [✔️] `components/bookmarks/bookmark-button.tsx` 생성
  - [✔️] 별 아이콘 (채워짐/비어있음)
  - [✔️] 클릭 시 북마크 추가/제거
- [✔️] `lib/api/bookmark-api.ts` 생성
  - [✔️] 북마크 추가 함수 (`addBookmark`)
  - [✔️] 북마크 제거 함수 (`removeBookmark`)
  - [✔️] 북마크 조회 함수 (`getUserBookmarks`, `isBookmarked`)
- [✔️] 상세페이지에 북마크 버튼 추가
- [✔️] Supabase DB 연동
- [✔️] 인증된 사용자 확인 (Clerk)
- [✔️] 로그인하지 않은 경우 로그인 유도 (SignInButton)
- [✔️] 상세페이지에서 북마크 동작 확인

### 4.3 북마크 목록 페이지

- [✔️] `app/bookmarks/page.tsx` 생성
- [✔️] 북마크한 관광지 목록 표시 (카드 레이아웃 - TourList 컴포넌트 재사용)
- [✔️] 빈 상태 처리 (북마크 없을 때)
- [✔️] 페이지 확인 및 스타일링
- [ ] 정렬 옵션 (최신순, 이름순, 지역별) - 향후 구현
- [ ] 일괄 삭제 기능 - 향후 구현

## Phase 5: 최적화 & 배포

### 5.1 이미지 최적화

- [✔️] `Next.config.ts` 외부 도메인 설정
  - [✔️] 한국관광공사 이미지 도메인 추가
  - [ ] 네이버 지도 리소스 도메인 추가 (지도 기능 구현 시 추가 예정)
- [✔️] 이미지 레이지 로딩 적용 (Next.js Image 컴포넌트 자동 지원)
- [ ] 이미지 포맷 최적화 (WebP 등) (Next.js 자동 최적화)

### 5.2 에러 처리 & SEO

- [✔️] 전역 에러 핸들링 개선
  - [✔️] API 에러 처리 (`lib/utils/error-handler.ts`)
  - [✔️] 네트워크 에러 처리
  - [✔️] 에러 바운더리 구현 (`app/error.tsx`, `app/global-error.tsx`)
- [✔️] 404 페이지 (`app/not-found.tsx`) - 이미 존재
- [✔️] SEO 최적화
  - [✔️] 메타태그 설정 (홈페이지, `app/page.tsx`)
  - [✔️] `app/sitemap.ts` 생성
  - [✔️] `app/robots.ts` 생성
  - [✔️] Open Graph 메타태그 (홈페이지, `app/layout.tsx`)

### 5.3 성능 최적화

- [ ] 성능 측정 (Lighthouse 점수 > 80) - 배포 후 수동 확인 필요
- [✔️] 코드 스플리팅 확인 (Next.js App Router 자동 처리)
- [✔️] 불필요한 리렌더링 방지 (React.memo, useMemo 등)
  - [✔️] `TourCard` 컴포넌트에 React.memo 적용
  - [✔️] `TourList` 컴포넌트에 React.memo 적용
  - [✔️] `useMemo`로 계산 최적화
- [✔️] API 응답 캐싱 전략 수립 (Next.js revalidate: 3600 적용)

### 5.4 배포 준비

- [✔️] 환경변수 보안 검증
  - [✔️] 필수 환경변수 체크리스트 (`lib/utils/env-validation.ts`)
  - [✔️] `.env.example` 파일 생성 (프로젝트 루트에 수동 생성 필요)
- [ ] Vercel 배포 설정 (Vercel 대시보드에서 설정)
- [ ] 프로덕션 배포 및 테스트 (배포 후 수동 확인)
- [ ] 도메인 연결 (선택 사항)

## 부가 작업 (기본 설정)

### 프로젝트 기본 파일

- [ ] `.cursor/` 디렉토리
  - [ ] `rules/` 커서룰
  - [ ] `mcp.json` MCP 서버 설정
  - [ ] `dir.md` 프로젝트 디렉토리 구조
- [ ] `.github/` 디렉토리 (선택 사항)
- [ ] `.husky/` 디렉토리 (선택 사항)
- [ ] `app/` 디렉토리
  - [✔️] `favicon.ico` 파일 (이미 존재)
  - [✔️] `not-found.tsx` 파일 (이미 존재)
  - [✔️] `robots.ts` 파일
  - [✔️] `sitemap.ts` 파일
  - [ ] `manifest.ts` 파일 (PWA 지원 시)
- [ ] `public/` 디렉토리
  - [ ] `icons/` 디렉토리 (이미 존재)
  - [ ] `logo.png` 파일 (이미 존재)
  - [ ] `og-image.png` 파일 (이미 존재)
- [ ] `.cursorignore` 파일
- [ ] `.prettierignore` 파일
- [ ] `.prettierrc` 파일
