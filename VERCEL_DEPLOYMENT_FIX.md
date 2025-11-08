# Vercel 404 문제 해결 가이드

## 🔧 적용된 수정사항

### 1. ✅ next.config.ts 업데이트
- 서버 사이드 리다이렉트 설정 추가 (`redirects()`)
- 웹팩 설정 추가 (bpmn-js 등 클라이언트 전용 라이브러리 지원)
- Vercel 배포 최적화 설정

### 2. ✅ app/page.tsx 수정
- 클라이언트 사이드 리다이렉트 (`useRouter`) → 서버 사이드 리다이렉트 (`redirect()`)
- SSR에서 404 방지

### 3. ✅ vercel.json 생성
- Next.js 프레임워크 명시
- 빌드 명령어 설정

---

## 🚀 배포 전 체크리스트

### Step 1: 로컬 빌드 테스트
```bash
# 1. 의존성 설치 확인
npm install

# 2. 타입 체크
npx tsc --noEmit

# 3. 빌드 테스트 (가장 중요!)
npm run build

# 4. 프로덕션 모드 로컬 실행
npm run start
# 브라우저에서 http://localhost:3000 접속
# → /dashboard로 자동 리다이렉트 되는지 확인
```

### Step 2: Vercel 배포
```bash
# 방법 1: Vercel CLI 사용
vercel --prod

# 방법 2: Git Push (권장)
git add .
git commit -m "fix: Vercel 404 문제 해결"
git push origin main
# Vercel이 자동으로 배포 시작
```

### Step 3: 배포 후 확인
1. **Vercel Dashboard** → **Deployments** 탭 확인
   - 빌드가 성공했는지 확인
   - 빌드 로그에서 에러 확인

2. **배포된 URL 접속**
   - `https://your-project.vercel.app` 접속
   - `/dashboard`로 자동 리다이렉트 되는지 확인
   - `/editor` 페이지 접속 가능한지 확인

---

## 🐛 여전히 404가 발생한다면?

### 문제 1: 빌드 실패
**증상**: Vercel Dashboard에서 빌드 실패

**해결**:
```bash
# 로컬에서 빌드 에러 확인
npm run build

# 에러 메시지 확인 후 수정
# 일반적인 에러:
# - 타입 에러: tsconfig.json 확인
# - 모듈 없음: package.json 의존성 확인
# - 환경변수: Vercel Dashboard → Settings → Environment Variables 확인
```

### 문제 2: 특정 라우트만 404
**증상**: `/dashboard`는 되는데 `/editor`가 404

**해결**:
```bash
# app 폴더 구조 확인
ls -la app/

# 필요한 파일들이 있는지 확인:
# ✅ app/dashboard/page.tsx
# ✅ app/editor/page.tsx
```

### 문제 3: 환경변수 문제
**증상**: 빌드는 성공하지만 런타임 에러

**해결**:
1. Vercel Dashboard → Settings → Environment Variables
2. 필요한 환경변수 모두 추가:
   - `NEXT_PUBLIC_*` 접두사 있는 변수들
   - 빌드 시 필요한 변수들
3. 재배포

### 문제 4: 캐시 문제
**증상**: 배포했는데 이전 버전이 보임

**해결**:
```bash
# Vercel Dashboard에서
# Deployments → 최신 배포 → "Redeploy" 클릭

# 또는 강제 재배포
vercel --prod --force
```

---

## 📋 추가 디버깅 방법

### 1. Vercel 빌드 로그 확인
```bash
# Vercel CLI로 로그 확인
vercel logs

# 또는 Dashboard에서
# Deployments → 최신 배포 → "View Build Logs" 클릭
```

### 2. 로컬 프로덕션 모드 테스트
```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 브라우저에서 http://localhost:3000 접속
# 모든 라우트 테스트:
# - http://localhost:3000/ (→ /dashboard 리다이렉트)
# - http://localhost:3000/dashboard
# - http://localhost:3000/editor
```

### 3. Next.js 라우트 확인
```bash
# .next 폴더 확인 (빌드 후)
ls -la .next/server/app/

# 라우트 파일들이 생성되었는지 확인:
# - .next/server/app/dashboard/page.js
# - .next/server/app/editor/page.js
```

---

## ✅ 성공 확인 방법

배포가 성공했다면:

1. ✅ 루트 URL (`/`) 접속 시 `/dashboard`로 리다이렉트
2. ✅ `/dashboard` 페이지 정상 로드
3. ✅ `/editor` 페이지 정상 로드
4. ✅ 브라우저 콘솔에 에러 없음
5. ✅ 네트워크 탭에서 404 응답 없음

---

## 🔗 유용한 링크

- [Vercel Next.js 문서](https://vercel.com/docs/frameworks/nextjs)
- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [Vercel 배포 가이드](https://vercel.com/docs/deployments/overview)

---

## 💡 참고사항

### 왜 클라이언트 리다이렉트가 문제였나?
- 클라이언트 사이드 리다이렉트 (`useRouter`)는 JavaScript가 실행된 후에만 작동
- Vercel의 초기 요청 시 서버에서 라우트를 찾지 못해 404 발생
- 서버 사이드 리다이렉트 (`redirect()`)는 서버에서 즉시 처리되어 404 방지

### next.config.ts의 redirects() vs app/page.tsx의 redirect()
- `next.config.ts`의 `redirects()`: 모든 요청에 대해 서버 레벨에서 리다이렉트
- `app/page.tsx`의 `redirect()`: 해당 페이지 컴포넌트에서 리다이렉트
- 둘 다 사용해도 되지만, `next.config.ts`가 더 효율적

---

**문제가 계속되면**: Vercel Dashboard의 빌드 로그를 확인하고, 에러 메시지를 공유해주세요!

