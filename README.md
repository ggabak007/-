# 🏠 두근두근타운 도감 (Doki Doki Town Dictionary)

> 힐링 모바일 게임 **'두근두근타운'** 플레이어를 위한 낚시 및 요리 정보 통합 도감 웹 애플리케이션입니다.  
> 어류 출현 조건(장소·시간·날씨) 검색부터 요리 재료별 레시피 및 별점(★1~★5) 판매 가격 계산 기능까지 한눈에 확인할 수 있습니다.

🌐 **실체 배포 사이트:** [https://unrivaled-piroshki-647729.netlify.app/](https://unrivaled-piroshki-647729.netlify.app/)

---

## 🎨 주요 기능 (Key Features)

### 🎣 낚시 도감 (Fishing Book)
* **레벨 및 이름 실시간 검색:** 키워드 검색 및 해금 레벨별 오름차순/내림차순 정렬
* **상세 필터링 시스템:**
  * **장소 (대분류/세부):** 강(거목강, 노을강, 고요한 강 등), 호수(근교 호수, 온천 산수, 숲속 호수 등), 바다(잔잔한 바다, 구해, 동해, 고래 바다, 배낚시 등)
  * **시간대:** 6시간 단위 (`0~6시`, `6~12시`, `12~18시`, `18~24시`) 선택
  * **날씨 조건:** `맑음`, `눈/비`, `무지개` 특수 날씨 필터링 지원

### 🍳 요리 도감 (Cooking Book)
* **재료 태그 멀티 필터:** 보유한 재료(밀, 달걀, 원두, 버섯 등)를 다중 선택하여 제작 가능한 요리 조율
* **별점별 판매 가격 표 (★1 ~ ★5):** 등급 상승에 따른 골드(G) 수익률 한눈에 비교
* **특수 뱃지 및 상태 표기:** '최고 💎' 아이템, '실패작' 등 가이드 라벨 제공

### 🔮 확장 예정 기능 (Coming Soon)
* 🌿 **채집 도감:** 버섯, 과일, 식물 등 맵별 채집 아이템 위치 정보
* 📸 **새 사진 (조류) 도감:** 조류 출현 장소 및 촬영 조건 가이드

---

## 🛠 기술 스택 (Tech Stack)

* **Core:** React 18, TypeScript, Vite
* **UI Components & Styling:** Tailwind CSS, Radix UI Primitives, Lucide Icons, Framer Motion
* **State Management & Query:** TanStack React Query v5
* **Deployment:** Netlify

---

## 📁 프로젝트 구조 (Project Structure)

```text
.
├── public/                 # 정적 리소스 파일
├── shared/                 # 공통 모듈 및 상수
├── src/                    # 메인 소스 코드
│   ├── components/         # 리액트 컴포넌트
│   │   └── ui/             # Radix UI / 공통 UI 컴포넌트 (Toast, Tooltip 등)
│   ├── hooks/              # 커스텀 리액트 훅 (use-mobile, use-toast 등)
│   ├── lib/                # 유틸리티 및 라이브러리 설정 (queryClient 등)
│   ├── pages/              # 라우트 페이지 컴포넌트 (not-found 등)
│   ├── App.tsx             # 도감 메인 페이지 UI 및 데이터 필터링 로직
│   ├── data.ts             # 어류(FISH_DATA) 및 요리(COOKING_DATA) 원본 데이터
│   ├── index.css           # Tailwind CSS 및 글로벌 스타일 정의
│   └── main.tsx            # React root 엔트리 포인트
├── index.html              # HTML 템플릿
├── package.json            # 의존성 패키지 및 빌드 스크립트
├── postcss.config.js       # PostCSS 설정
├── README.md               # 프로젝트 안내 문서
├── tailwind.config.ts      # Tailwind CSS 설정
├── tsconfig.json           # TypeScript 설정
└── vite.config.ts          # Vite 번들러 설정
