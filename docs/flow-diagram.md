# JLG Trip 서비스 전체 흐름도

이 문서는 PRD를 기반으로 작성된 JLG Trip 서비스의 전체 흐름도를 Mermaid 다이어그램으로 표현합니다.

---

## 1. 사용자 플로우 (User Flow)

```mermaid
flowchart TD
    Start([사용자 접속]) --> Home[홈페이지 /]

    Home --> Choice{사용자 선택}

    Choice -->|필터 선택| Filter[지역/타입 필터 적용]
    Choice -->|키워드 입력| Search[키워드 검색]
    Choice -->|목록 항목 클릭| Detail[상세페이지]
    Choice -->|북마크 목록| BookmarkList[북마크 페이지]

    Filter --> List[관광지 목록 표시]
    Search --> List

    List --> Map[네이버 지도 표시<br/>마커 표시]
    List --> DetailClick{항목 클릭}

    DetailClick --> Detail
    Map --> MapClick{마커 클릭}
    MapClick --> Detail

    Detail --> DetailAction{사용자 액션}

    DetailAction -->|북마크 추가| Bookmark[Supabase 북마크 저장]
    DetailAction -->|URL 공유| Share[클립보드 복사]
    DetailAction -->|길찾기| Navigate[네이버 지도 앱 연동]
    DetailAction -->|뒤로가기| Home

    Bookmark --> BookmarkCheck{인증 확인}
    BookmarkCheck -->|로그인됨| BookmarkSave[DB 저장]
    BookmarkCheck -->|미로그인| BookmarkTemp[localStorage 임시 저장]

    BookmarkList --> BookmarkDetail[북마크 항목 클릭]
    BookmarkDetail --> Detail

    style Start fill:#e1f5ff
    style Home fill:#fff4e6
    style Detail fill:#f3e5f5
    style Bookmark fill:#e8f5e9
    style Map fill:#fff9c4
```

---

## 2. 시스템 아키텍처 (System Architecture)

```mermaid
graph TB
    subgraph Client["클라이언트 (Next.js 15)"]
        UI[Next.js App Router]
        Pages[페이지 컴포넌트]
        Components[UI 컴포넌트]
        Hooks[React Hooks]
    end

    subgraph Auth["인증 시스템"]
        Clerk[Clerk Authentication]
        SyncUser[SyncUserProvider<br/>Clerk → Supabase 동기화]
    end

    subgraph API["외부 API"]
        TourAPI[한국관광공사 API<br/>KorService2]
        NaverMap[네이버 지도 API v3<br/>NCP Maps]
    end

    subgraph Database["데이터베이스"]
        Supabase[(Supabase PostgreSQL)]
        Bookmarks[bookmarks 테이블]
        Users[users 테이블]
    end

    UI --> Pages
    Pages --> Components
    Components --> Hooks

    Hooks --> TourAPI
    Hooks --> NaverMap
    Hooks --> Supabase

    Clerk --> SyncUser
    SyncUser --> Users

    Bookmarks --> Supabase
    Users --> Supabase

    Components --> Clerk

    style TourAPI fill:#ffebee
    style NaverMap fill:#e8f5e9
    style Supabase fill:#e3f2fd
    style Clerk fill:#fff3e0
```

---

## 3. 데이터 흐름 (Data Flow)

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as Next.js UI
    participant TourAPI as 한국관광공사 API
    participant NaverMap as 네이버 지도
    participant Supabase as Supabase DB
    participant Clerk as Clerk Auth

    Note over User,Clerk: 홈페이지 - 관광지 목록 조회
    User->>UI: 페이지 접속 (/)
    UI->>TourAPI: areaCode2 (지역코드 조회)
    TourAPI-->>UI: 지역 목록

    UI->>TourAPI: areaBasedList2 (지역/타입 필터)
    TourAPI-->>UI: 관광지 목록 데이터

    UI->>NaverMap: 지도 초기화 + 마커 표시
    NaverMap-->>UI: 지도 렌더링 완료

    Note over User,Clerk: 키워드 검색
    User->>UI: 키워드 입력
    UI->>TourAPI: searchKeyword2
    TourAPI-->>UI: 검색 결과

    Note over User,Clerk: 상세페이지
    User->>UI: 관광지 클릭 (/places/[contentId])
    UI->>TourAPI: detailCommon2 (기본 정보)
    TourAPI-->>UI: 상세 정보
    UI->>TourAPI: detailIntro2 (운영 정보)
    TourAPI-->>UI: 운영 정보
    UI->>TourAPI: detailImage2 (이미지)
    TourAPI-->>UI: 이미지 목록

    UI->>NaverMap: 단일 마커 표시
    NaverMap-->>UI: 지도 표시

    Note over User,Clerk: 북마크 기능
    User->>UI: 북마크 버튼 클릭
    UI->>Clerk: 인증 상태 확인
    Clerk-->>UI: 인증 결과

    alt 로그인됨
        UI->>Supabase: 북마크 저장/삭제
        Supabase-->>UI: 저장 완료
    else 미로그인
        UI->>UI: localStorage 임시 저장
    end

    Note over User,Clerk: 북마크 목록
    User->>UI: 북마크 페이지 접속
    UI->>Supabase: 북마크 목록 조회
    Supabase-->>UI: 북마크 데이터
    UI->>TourAPI: 관광지 상세 정보 조회
    TourAPI-->>UI: 관광지 정보
```

---

## 4. 페이지 구조 및 라우팅 (Page Structure)

```mermaid
graph LR
    subgraph Root["Root Layout"]
        Layout[app/layout.tsx<br/>ClerkProvider + SyncUserProvider]
    end

    subgraph Pages["페이지 라우트"]
        Home[/<br/>홈페이지<br/>목록 + 필터 + 지도]
        Detail[/places/[contentId]<br/>상세페이지]
        Bookmarks[/bookmarks<br/>북마크 목록]
        NotFound[/not-found<br/>404 페이지]
    end

    subgraph Components["공통 컴포넌트"]
        Navbar[Navbar]
        TourList[tour-list]
        TourCard[tour-card]
        TourFilters[tour-filters]
        TourSearch[tour-search]
        NaverMap[naver-map]
        DetailInfo[detail-info]
        DetailMap[detail-map]
        ShareButton[share-button]
        BookmarkButton[bookmark-button]
        BookmarkList[bookmark-list]
    end

    Layout --> Home
    Layout --> Detail
    Layout --> Bookmarks
    Layout --> NotFound

    Home --> Navbar
    Home --> TourFilters
    Home --> TourSearch
    Home --> TourList
    Home --> NaverMap
    TourList --> TourCard

    Detail --> Navbar
    Detail --> DetailInfo
    Detail --> DetailMap
    Detail --> ShareButton
    Detail --> BookmarkButton

    Bookmarks --> Navbar
    Bookmarks --> BookmarkList
    BookmarkList --> TourCard

    style Home fill:#fff4e6
    style Detail fill:#f3e5f5
    style Bookmarks fill:#e8f5e9
```

---

## 5. API 호출 흐름 (API Call Flow)

```mermaid
flowchart TD
    subgraph API["한국관광공사 API"]
        AreaCode[areaCode2<br/>지역코드 조회]
        AreaBased[areaBasedList2<br/>지역 기반 목록]
        SearchKW[searchKeyword2<br/>키워드 검색]
        DetailCommon[detailCommon2<br/>공통 정보]
        DetailIntro[detailIntro2<br/>소개 정보]
        DetailImage[detailImage2<br/>이미지 목록]
    end

    subgraph Client["클라이언트 요청"]
        FilterReq[필터 요청<br/>지역/타입]
        SearchReq[검색 요청<br/>키워드]
        DetailReq[상세 정보 요청<br/>contentId]
    end

    FilterReq --> AreaCode
    FilterReq --> AreaBased
    SearchReq --> SearchKW
    DetailReq --> DetailCommon
    DetailReq --> DetailIntro
    DetailReq --> DetailImage

    AreaCode --> Response1[응답: 지역 목록]
    AreaBased --> Response2[응답: 관광지 목록]
    SearchKW --> Response3[응답: 검색 결과]
    DetailCommon --> Response4[응답: 기본 정보]
    DetailIntro --> Response5[응답: 운영 정보]
    DetailImage --> Response6[응답: 이미지 목록]

    Response1 --> UI1[UI 업데이트]
    Response2 --> UI2[목록 표시 + 지도 마커]
    Response3 --> UI3[검색 결과 표시]
    Response4 --> UI4[상세페이지 기본 정보]
    Response5 --> UI5[상세페이지 운영 정보]
    Response6 --> UI6[이미지 갤러리]

    style AreaCode fill:#ffebee
    style AreaBased fill:#ffebee
    style SearchKW fill:#ffebee
    style DetailCommon fill:#ffebee
    style DetailIntro fill:#ffebee
    style DetailImage fill:#ffebee
```

---

## 6. 북마크 기능 상세 흐름 (Bookmark Flow)

```mermaid
flowchart TD
    Start([사용자 북마크 클릭]) --> CheckAuth{인증 상태 확인}

    CheckAuth -->|로그인됨| GetClerkId[Clerk User ID 가져오기]
    CheckAuth -->|미로그인| LoginPrompt[로그인 유도<br/>또는 localStorage]

    GetClerkId --> CheckBookmark{북마크 존재 확인}

    CheckBookmark -->|존재함| DeleteBookmark[Supabase에서 삭제]
    CheckBookmark -->|없음| CreateBookmark[Supabase에 추가]

    CreateBookmark --> SaveData[(bookmarks 테이블<br/>clerk_id + content_id)]
    DeleteBookmark --> RemoveData[(bookmarks 테이블<br/>레코드 삭제)]

    SaveData --> UpdateUI[UI 업데이트<br/>별 아이콘 채움]
    RemoveData --> UpdateUI2[UI 업데이트<br/>별 아이콘 비움]

    UpdateUI --> Success1[성공 토스트]
    UpdateUI2 --> Success2[성공 토스트]

    LoginPrompt --> LoginPage[Clerk 로그인 페이지]
    LoginPage --> LoginComplete[로그인 완료]
    LoginComplete --> GetClerkId

    style Start fill:#e1f5ff
    style SaveData fill:#e8f5e9
    style RemoveData fill:#ffebee
    style LoginPrompt fill:#fff3e0
```

---

## 7. 지도 연동 흐름 (Map Integration Flow)

```mermaid
flowchart LR
    subgraph MapInit["지도 초기화"]
        LoadAPI[네이버 지도 API 로드<br/>ncpKeyId]
        CreateMap[지도 인스턴스 생성]
        SetCenter[초기 중심 좌표 설정]
    end

    subgraph DataProcess["데이터 처리"]
        GetTourData[관광지 데이터 수신]
        ConvertCoord[좌표 변환<br/>mapx/mapy ÷ 10000000]
        CreateMarkers[마커 생성]
    end

    subgraph Interaction["사용자 인터랙션"]
        MarkerClick[마커 클릭]
        InfoWindow[인포윈도우 표시]
        ListClick[리스트 항목 클릭]
        MapMove[지도 이동/줌]
    end

    LoadAPI --> CreateMap
    CreateMap --> SetCenter
    SetCenter --> GetTourData
    GetTourData --> ConvertCoord
    ConvertCoord --> CreateMarkers

    CreateMarkers --> MarkerClick
    CreateMarkers --> ListClick

    MarkerClick --> InfoWindow
    InfoWindow --> DetailPage[상세페이지 이동]

    ListClick --> MapMove
    MapMove --> HighlightMarker[마커 강조]

    style LoadAPI fill:#e3f2fd
    style CreateMarkers fill:#fff9c4
    style MarkerClick fill:#f3e5f5
    style InfoWindow fill:#e8f5e9
```

---

## 8. 컴포넌트 계층 구조 (Component Hierarchy)

```mermaid
graph TD
    Root[Root Layout]

    Root --> Navbar[Navbar<br/>검색창 + 네비게이션]

    Root --> HomePage[Home Page /]
    Root --> DetailPage[Detail Page /places/[contentId]]
    Root --> BookmarkPage[Bookmark Page /bookmarks]

    HomePage --> Filters[TourFilters<br/>지역/타입 필터]
    HomePage --> Search[TourSearch<br/>키워드 검색]
    HomePage --> Content[Content Area]

    Content --> List[TourList]
    Content --> Map[NaverMap]

    List --> Card1[TourCard]
    List --> Card2[TourCard]
    List --> Card3[TourCard]
    List --> Pagination[TourPagination]

    DetailPage --> DetailInfo[DetailInfo<br/>기본 정보]
    DetailPage --> DetailIntro[DetailIntro<br/>운영 정보]
    DetailPage --> DetailGallery[DetailGallery<br/>이미지 갤러리]
    DetailPage --> DetailMap[DetailMap<br/>지도]
    DetailPage --> ShareButton[ShareButton<br/>URL 복사]
    DetailPage --> BookmarkButton[BookmarkButton<br/>북마크]

    BookmarkPage --> BookmarkList[BookmarkList]
    BookmarkList --> BookmarkCard1[TourCard]
    BookmarkList --> BookmarkCard2[TourCard]

    style Root fill:#e1f5ff
    style HomePage fill:#fff4e6
    style DetailPage fill:#f3e5f5
    style BookmarkPage fill:#e8f5e9
    style Map fill:#fff9c4
```

---

## 다이어그램 설명

### 1. 사용자 플로우

사용자가 서비스를 이용하는 전체 과정을 단계별로 표현합니다.

### 2. 시스템 아키텍처

클라이언트, 인증 시스템, 외부 API, 데이터베이스 간의 관계를 보여줍니다.

### 3. 데이터 흐름

시퀀스 다이어그램으로 각 기능별 API 호출과 데이터 흐름을 시간 순서대로 표현합니다.

### 4. 페이지 구조 및 라우팅

Next.js App Router 기반의 페이지 구조와 컴포넌트 관계를 보여줍니다.

### 5. API 호출 흐름

한국관광공사 API의 각 엔드포인트와 사용 시나리오를 표현합니다.

### 6. 북마크 기능 상세 흐름

북마크 추가/삭제 시 인증 확인부터 데이터 저장까지의 상세 과정을 보여줍니다.

### 7. 지도 연동 흐름

네이버 지도 API 초기화부터 마커 표시, 사용자 인터랙션까지의 흐름을 표현합니다.

### 8. 컴포넌트 계층 구조

React 컴포넌트의 계층적 구조와 부모-자식 관계를 보여줍니다.

---

## 참고사항

- 모든 다이어그램은 Mermaid 문법으로 작성되었습니다
- GitHub, GitLab, Notion, VS Code 등에서 Mermaid를 지원하는 환경에서 렌더링 가능합니다
- 각 다이어그램은 독립적으로 이해할 수 있도록 구성되었습니다
