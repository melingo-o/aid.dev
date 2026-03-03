# Vercel + Firebase (Production)

아래 순서대로 진행하면 고객 전달 가능한 운영 환경이 됩니다.

## 1) GitHub 저장소 준비
1. 프로젝트 루트에서 초기화
   - `git init`
   - `git add .`
   - `git commit -m "chore: production handoff setup"`
2. GitHub 새 저장소 생성 후 연결
   - `git remote add origin <YOUR_GITHUB_REPO_URL>`
   - `git branch -M main`
   - `git push -u origin main`

## 2) Firebase 프로젝트 준비
1. Firebase Console에서 새 프로젝트 생성
2. Firestore Database 생성 (Production mode)
3. 서비스 계정 키 발급
   - Project settings -> Service accounts -> Generate new private key
4. Firestore Rules 배포
   - `npm i -g firebase-tools`
   - `firebase login`
   - `firebase use <YOUR_FIREBASE_PROJECT_ID>`
   - `firebase deploy --only firestore:rules,firestore:indexes`

## 3) Vercel 프로젝트 연결
1. Vercel에서 GitHub 저장소 Import
2. Framework preset: `Other`
3. Build command: 비움 (정적 + API)
4. Output directory: 비움

## 4) Vercel 환경변수 설정
아래 값을 Vercel Project Settings -> Environment Variables에 등록

- `ADMIN_PASSWORD` = 관리자 로그인 비밀번호
- `AID_SITE_ID` = 예: `aid-cheongdam`
- `FIREBASE_PROJECT_ID` = Firebase 프로젝트 ID
- `FIREBASE_CLIENT_EMAIL` = 서비스계정 client_email
- `FIREBASE_PRIVATE_KEY` = 서비스계정 private_key (`\n` 포함 문자열)
- `FIREBASE_STORAGE_BUCKET` = (선택) 버킷명

## 5) 프론트 설정값 반영
`config/app-config.js` 파일 수정

- `adminPassword`: 운영 비밀번호와 동일하게
- `cloud.enabled`: `true`
- `cloud.baseUrl`: `/api`

예:
```js
window.__AID_APP_CONFIG__ = {
  adminPassword: "운영비밀번호",
  alertWebhookUrl: "",
  cloud: {
    enabled: true,
    baseUrl: "/api",
    timeoutMs: 10000
  }
};
```

## 6) 배포 및 점검
1. GitHub push
2. Vercel 자동 배포 확인
3. 체크리스트
   - 홈 진입/상단 메뉴 동작
   - 문의 접수 -> Firestore 저장 확인
   - 관리자 로그인 후 매물 수정/삭제/추가
   - 로고/설정 저장 후 새 브라우저에서도 유지
   - 언어 전환/레이아웃 깨짐 없음

## 7) 고객 전달 패키지
- 운영 URL
- 관리자 비밀번호
- Firebase 프로젝트 소유권/권한
- GitHub 저장소 소유권/권한
- Vercel 프로젝트 소유권/권한
- 유지보수 담당자/비상연락 체계
