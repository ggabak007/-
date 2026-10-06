# 🏠 두근두근타운 도감 (Doki Doki Town Dictionary)

> 힐링 게임 **'두근두근타운'** 플레이어를 위한 낚시 및 요리 정보 통합 도감 웹 애플리케이션입니다.  
> 획득 장소, 날씨 조건, 시간대별 출현 정보 및 요리 별점별 판매 가격과 재료 필터링 기능을 제공합니다.

---

## 🎨 주요 기능 (Key Features)

### 🎣 낚시 도감
* **레벨별 해금 정보:** 어류별 해금 레벨 및 이름 검색 기능
* **조건별 필터링:** 
  * **지역 대분류/소분류:** 강(거목강, 천수강 등), 바다(잔잔한 바다, 구해, 동해 등), 호수(근교 호수, 온천 산수 등)
  * **시간대:** `0~6시`, `6~12시`, `12~18시`, `18~24시`
  * **날씨:** 맑음, 눈/비, 무지개
* **정렬:** 해금 레벨 오름차순 / 내림차순 정렬

### 🍳 요리 도감
* **재료 기반 태그 검색:** 보유한 재료(예: 밀, 달걀, 사과 등)를 선택하여 제작 가능한 요리 필터링
* **별점별 판매가 제공:** ★1부터 ★5까지의 등급별 판매 가격(G) 한눈에 확인
* **특별 노트 표시:** 최고 상급 요리 및 실패작 구분 가이드

---

## 🛠 기술 스택 (Tech Stack)

* **Frontend:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS, Radix UI, Lucide Icons
* **State & Data Handling:** React Query (@tanstack/react-query)

---

## 📁 프로젝트 구조 (Project Structure)

```text
├── App.tsx             # 낚시/요리 도감 메인 UI 및 필터링 로직
├── data.ts             # 낚시(FISH_DATA) 및 요리(COOKING_DATA) 원본 데이터
├── main.tsx            # React 루트 엔트리 포인트
├── index.css           # Tailwind CSS 및 글로벌 스타일 정의
├── package.json        # 프로젝트 의존성 및 스크립트 설정
└── postcss.config.js   # PostCSS 및 Tailwind 설정