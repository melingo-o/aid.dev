# AID Cheongdam Web Structure

이 프로젝트는 화면 템플릿과 실행 로직을 분리한 구조입니다.

## Directory Layout

- `index.html`
  - 앱 셸(공통 head + 템플릿 마운트 포인트)
- `app/templates/`
  - `header.html`: 상단 내비게이션/문의/언어
  - `pages.html`: HOME/COMPANY/SEARCH/PARTNERS/LOCATION/INQUIRY/ADMIN 페이지 섹션
  - `footer.html`: 하단 회사 정보 + ADMIN 링크
  - `admin-auth-modal.html`: 관리자 인증 모달
- `assets/styles/`
  - `main.css`: 전체 스타일
- `assets/scripts/`
  - `bootstrap.js`: 템플릿 로더 + 런타임 스크립트 초기화
  - `cloud-api.js`: 프론트-백엔드 API 어댑터
  - `main.js`: 페이지 라우팅/인터랙션/관리자 기능 핵심 로직
- `config/`
  - `app-config.js`: 실제 실행 설정
  - `app-config.example.js`: 배포용 예시 설정
- `api/`
  - Vercel Serverless API (Firebase Admin SDK 연동)
- `requirements/`
  - 기획/요구사항 산출물
- `backup/`
  - 스냅샷 백업본

## Runtime Flow

1. `index.html` 로드
2. `assets/scripts/bootstrap.js`가 `app/templates/*.html`을 주입
3. `cloud-api.js` 로드
4. `main.js` 로드 및 앱 초기화

## Dev Commands

- 설치: `npm install`
- JS 문법 체크: `npm run check`
- 로컬 정적 실행: `npm run dev`
- Vercel 로컬 API 포함 실행: `npm run vercel:dev`

## 운영 변경 권장 규칙

- 화면 마크업 수정: `app/templates/*`에서 먼저 수정
- 동작 수정: `assets/scripts/main.js`
- 서버/데이터 수정: `api/*`
- 환경값 수정: `config/app-config.js`와 Vercel Environment Variables
