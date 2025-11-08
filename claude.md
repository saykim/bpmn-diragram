# 식품 제조 공정 BPMN 웹 서비스 - 기술 청사진

---

## 1. 제품 설계 요구사항 (PDR)

### 1.1 프로젝트 비전
식품 제조업체를 위한 직관적이고 강력한 BPMN(Business Process Model and Notation) 프로세스 관리 웹 애플리케이션을 구축합니다. 식품 제조 공정의 복잡한 워크플로우를 시각화하고, 관리하며, 최적화할 수 있는 플랫폼을 제공합니다.

### 1.2 대상 사용자
- **주요 사용자**: 식품 제조업체의 공정 관리자, 품질 관리 담당자
- **보조 사용자**: 생산 라인 감독자, 경영진
- **기술 수준**: 기본적인 웹 브라우저 사용 능력

### 1.3 핵심 기능

#### 필수 기능
1. **BPMN 다이어그램 생성**
   - 드래그 앤 드롭으로 프로세스 요소 추가
   - 식품 제조 공정에 특화된 템플릿 제공
   - 실시간 시각적 피드백

2. **다이어그램 수정**
   - 노드 위치 이동 및 크기 조정
   - 연결선(flow) 수정 및 재배치
   - 속성 편집 (이름, 설명, 책임자 등)

3. **프로세스 추가**
   - 새로운 프로세스 단계 삽입
   - 조건부 분기 추가
   - 병렬 처리 경로 생성

4. **프로세스 삭제**
   - 개별 노드 삭제
   - 연관된 연결선 자동 정리
   - 삭제 전 확인 다이얼로그

5. **저장 및 버전 관리**
   - 자동 저장 기능
   - 버전 히스토리 추적
   - 이전 버전으로 롤백

6. **내보내기/가져오기**
   - BPMN 2.0 XML 형식 지원
   - PNG/SVG 이미지 내보내기
   - 기존 BPMN 파일 가져오기

#### 부가 기능
- 협업 기능 (멀티 유저 편집)
- 댓글 및 주석
- 프로세스 실행 시뮬레이션
- 모바일 반응형 뷰어

### 1.4 기능 요구사항

#### 기능적 요구사항
- **FR-001**: 사용자는 3번의 클릭 이내에 새 다이어그램을 생성할 수 있어야 함
- **FR-002**: 모든 변경사항은 3초 이내에 자동 저장되어야 함
- **FR-003**: 다이어그램은 BPMN 2.0 표준을 준수해야 함
- **FR-004**: 사용자는 실시간으로 변경사항을 미리볼 수 있어야 함
- **FR-005**: 최소 10개의 식품 제조 공정 템플릿 제공

#### 비기능적 요구사항
- **NFR-001 성능**: 페이지 로드 시간 < 2초
- **NFR-002 확장성**: 1,000개 이상의 노드를 가진 다이어그램 처리 가능
- **NFR-003 가용성**: 99.5% 업타임 보장
- **NFR-004 접근성**: WCAG 2.1 AA 레벨 준수
- **NFR-005 브라우저 호환성**: Chrome, Firefox, Safari, Edge 최신 2개 버전

### 1.5 문제 해결
- **문제**: 기존 BPMN 도구는 복잡하고 식품 제조업에 특화되지 않음
- **해결**: 식품 제조 공정에 최적화된 템플릿과 직관적인 UI 제공
- **가치**: 공정 설계 시간 50% 단축, 표준화를 통한 품질 향상

---

## 2. 기술 스택

### 2.1 프론트엔드

#### 코어 프레임워크
```
Next.js 14+ (App Router)
- 이유: 서버 컴포넌트와 클라이언트 컴포넌트의 최적화된 분리
- 장점: SSR, SSG, ISR을 통한 성능 최적화
- 장점: API Routes로 백엔드 로직 통합
```

#### UI 라이브러리
```
shadcn/ui
- 이유: Tailwind CSS 기반의 커스터마이징 가능한 컴포넌트
- 장점: 복사-붙여넣기 방식으로 프로젝트 내 완전한 제어
- 장점: Radix UI 기반으로 접근성 보장
```

#### BPMN 렌더링
```
bpmn-js (bpmn.io)
- 이유: BPMN 2.0 표준의 사실상 표준 라이브러리
- 장점: 강력한 모델링 및 렌더링 기능
- 장점: 확장 가능한 플러그인 시스템
```

#### 스타일링
```
Tailwind CSS 3+
- 이유: 유틸리티 우선 방식으로 빠른 개발
- 장점: shadcn/ui와 완벽한 통합
- 장점: 작은 번들 사이즈 (PurgeCSS)
```

#### 상태 관리
```
Zustand
- 이유: 간단하고 보일러플레이트가 적은 상태 관리
- 장점: React Server Components와 호환
- 장점: TypeScript 완벽 지원
```

#### 폼 관리
```
React Hook Form + Zod
- 이유: 성능 최적화된 폼 처리
- 장점: Zod를 통한 타입 안전 유효성 검사
```

### 2.2 백엔드

#### 데이터베이스
```
Vercel Postgres (Neon)
- 이유: Vercel 플랫폼과 네이티브 통합
- 장점: 서버리스 확장, 자동 백업
- 장점: Connection pooling 내장
```

#### ORM
```
Drizzle ORM
- 이유: TypeScript 우선, Next.js와 최적 호환
- 장점: 타입 안전 쿼리
- 장점: 마이그레이션 관리 간편
```

#### 인증
```
Clerk
- 이유: 배틀 테스트된 인증 솔루션
- 장점: 소셜 로그인, MFA 지원
- 장점: Next.js 미들웨어와 완벽 통합
- 보안: 세션 관리, 토큰 자동 갱신
```

#### API
```
Next.js API Routes (App Router)
- 이유: 별도 백엔드 서버 불필요
- 장점: Edge Runtime 지원
- 장점: 타입 공유 용이
```

### 2.3 배포 및 인프라

#### 호스팅
```
Vercel
- 이유: Next.js 최적화 플랫폼
- 장점: 자동 HTTPS, CDN, DDoS 보호
- 장점: Git 기반 자동 배포
- 보안: 환경변수 암호화 저장
```

#### 파일 스토리지
```
Vercel Blob
- 이유: 다이어그램 이미지 저장
- 장점: CDN 통합, 자동 최적화
```

### 2.4 개발 도구

```
- TypeScript: 타입 안전성
- ESLint + Prettier: 코드 품질
- Husky + lint-staged: Pre-commit 훅
- Jest + React Testing Library: 단위 테스트
- Playwright: E2E 테스트
```

### 2.5 모니터링 및 분석

```
- Vercel Analytics: 성능 모니터링
- Sentry: 에러 트래킹
```

---

## 3. 앱 플로우차트

### 3.1 사용자 플로우

```
[사용자] 
   |
   v
[랜딩 페이지] --> [로그인/회원가입 (Clerk)]
   |                        |
   v                        v
[대시보드]            [이메일 인증]
   |                        |
   |<-----------------------+
   |
   +---> [새 다이어그램 생성]
   |        |
   |        v
   |     [BPMN 에디터]
   |        |
   |        +---> [요소 추가/삭제]
   |        +---> [속성 편집]
   |        +---> [연결선 그리기]
   |        +---> [자동 저장] --> [DB 저장]
   |        +---> [내보내기] --> [파일 다운로드]
   |
   +---> [기존 다이어그램 열기]
   |        |
   |        v
   |     [다이어그램 목록]
   |        |
   |        v
   |     [BPMN 에디터]
   |
   +---> [템플릿 갤러리]
            |
            v
         [템플릿 선택] --> [BPMN 에디터]
```

### 3.2 시스템 아키텍처

```
[클라이언트]
    |
    | HTTPS
    |
    v
[Vercel Edge Network]
    |
    +---> [정적 자산] --> [CDN]
    |
    +---> [Next.js App]
            |
            +---> [Server Components]
            |        |
            |        v
            |     [데이터 페칭]
            |        |
            |        v
            |     [Vercel Postgres]
            |
            +---> [Client Components]
            |        |
            |        v
            |     [bpmn-js 렌더링]
            |
            +---> [API Routes]
                   |
                   +---> [인증 미들웨어 (Clerk)]
                   |
                   +---> [비즈니스 로직]
                   |        |
                   |        v
                   |     [Drizzle ORM]
                   |        |
                   |        v
                   |     [Vercel Postgres]
                   |
                   +---> [파일 처리]
                            |
                            v
                         [Vercel Blob]
```

### 3.3 데이터 플로우

```
[사용자 액션]
    |
    v
[React 이벤트 핸들러]
    |
    v
[Zustand 상태 업데이트]
    |
    +---> [UI 즉시 업데이트]
    |
    +---> [Debounced API 호출]
            |
            v
         [API Route]
            |
            +---> [인증 검증]
            |        |
            |        | (실패)
            |        v
            |     [401 Unauthorized]
            |
            | (성공)
            v
         [요청 유효성 검사 (Zod)]
            |
            | (실패)
            v
         [400 Bad Request]
            |
            | (성공)
            v
         [DB 트랜잭션]
            |
            v
         [응답 반환]
            |
            v
         [클라이언트 상태 동기화]
```

---

## 4. 프로젝트 규칙

### 4.1 개발 best practices

#### 코드 스타일
- **Prettier** 설정 사용 (자동 포맷팅)
- **ESLint** 규칙 엄격히 준수
- 변수명: `camelCase` (함수, 변수), `PascalCase` (컴포넌트, 타입)
- 상수: `UPPER_SNAKE_CASE`
- 파일명: `kebab-case.tsx` (컴포넌트), `camelCase.ts` (유틸)

#### TypeScript 규칙
```typescript
// ✅ 명시적 타입 정의
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ 타입 가드 사용
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

// ❌ any 사용 금지
// const data: any = fetchData(); // 절대 안됨

// ✅ unknown 사용 후 타입 가드
const data: unknown = fetchData();
if (isUser(data)) {
  console.log(data.name);
}
```

#### 컴포넌트 작성 규칙
```typescript
// ✅ 파일 구조
// 1. imports
// 2. types/interfaces
// 3. constants
// 4. component
// 5. exports

// ✅ Props 타입 정의
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

// ✅ 컴포넌트는 명확한 단일 책임
export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

### 4.2 버전 관리 전략

#### Git 브랜치 전략 (Git Flow 간소화 버전)
```
main (production)
  |
  +-- develop (development)
        |
        +-- feature/bpmn-editor
        +-- feature/dashboard
        +-- fix/save-bug
        +-- refactor/api-routes
```

#### 브랜치 명명 규칙
- `feature/기능명`: 새 기능 개발
- `fix/버그명`: 버그 수정
- `refactor/대상`: 리팩토링
- `docs/문서명`: 문서 작업
- `test/테스트명`: 테스트 추가/수정

#### 커밋 메시지 규칙 (Conventional Commits)
```
feat: BPMN 에디터 드래그 앤 드롭 기능 추가
fix: 자동 저장 타이밍 버그 수정
refactor: API 라우트 구조 개선
docs: README에 설치 가이드 추가
test: 다이어그램 생성 E2E 테스트 추가
chore: 의존성 업데이트
```

#### PR(Pull Request) 규칙
1. **PR 전 체크리스트**
   - [ ] 모든 테스트 통과
   - [ ] ESLint 경고 없음
   - [ ] 타입 에러 없음
   - [ ] 변경사항 문서화

2. **PR 템플릿**
   ```markdown
   ## 변경사항
   - 구체적인 변경 내용 나열
   
   ## 테스트
   - 어떻게 테스트했는지 설명
   
   ## 스크린샷 (UI 변경 시)
   - Before/After 이미지
   ```

3. **리뷰 규칙**
   - 최소 1명의 승인 필요
   - 리뷰 요청 후 24시간 이내 응답

### 4.3 테스트 전략

#### 테스트 피라미드
```
      E2E (10%)
    /          \
   Integration (30%)
  /                \
Unit Tests (60%)
```

#### 단위 테스트 (Jest + RTL)
```typescript
// 모든 유틸 함수와 훅은 테스트 필수
describe('parseBpmnXml', () => {
  it('should parse valid BPMN XML', () => {
    const xml = '<bpmn:definitions>...</bpmn:definitions>';
    const result = parseBpmnXml(xml);
    expect(result).toBeDefined();
  });

  it('should throw error for invalid XML', () => {
    expect(() => parseBpmnXml('invalid')).toThrow();
  });
});
```

#### E2E 테스트 (Playwright)
```typescript
// 핵심 사용자 플로우 테스트
test('user can create and save diagram', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('button:has-text("새 다이어그램")');
  // ... 다이어그램 생성 로직
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### 4.4 코드 리뷰 가이드라인

#### 리뷰어 체크리스트
- [ ] 코드가 요구사항을 충족하는가?
- [ ] 보안 취약점은 없는가?
- [ ] 성능 이슈는 없는가?
- [ ] 테스트가 충분한가?
- [ ] 가독성이 좋은가?
- [ ] 중복 코드는 없는가?

#### 리뷰 코멘트 규칙
- **필수 변경**: `[MUST]` 태그 사용
- **제안**: `[SUGGESTION]` 태그 사용
- **질문**: `[QUESTION]` 태그 사용

### 4.5 성능 최적화 가이드라인

#### 번들 사이즈 관리
```typescript
// ✅ 동적 import 사용
const BpmnEditor = dynamic(() => import('@/components/bpmn-editor'), {
  loading: () => <Skeleton />,
  ssr: false, // bpmn-js는 브라우저 전용
});

// ❌ 전체 import 금지
// import * as bpmn from 'bpmn-js'; // 큰 번들 사이즈
```

#### 이미지 최적화
```typescript
// ✅ Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src="/template-thumb.png"
  alt="템플릿"
  width={300}
  height={200}
  loading="lazy"
/>
```

### 4.6 접근성 (a11y) 기준

- **키보드 네비게이션**: 모든 기능 키보드로 접근 가능
- **스크린 리더**: ARIA 속성 적절히 사용
- **색상 대비**: 최소 4.5:1 비율
- **포커스 표시**: 명확한 포커스 링

```typescript
// ✅ 접근성 좋은 버튼
<button
  aria-label="다이어그램 저장"
  onClick={handleSave}
  className="focus:ring-2 focus:ring-offset-2"
>
  <SaveIcon aria-hidden="true" />
  저장
</button>
```

---

## 5. 구현 계획

### 5.1 프로젝트 단계 (총 8주)

#### Phase 1: 프로젝트 초기 설정 (1주)
**목표**: 개발 환경 구축 및 기본 구조 설정

**태스크**:
1. **프로젝트 생성 및 설정** (1일)
   ```bash
   npx create-next-app@latest bpmn-flow --typescript --tailwind --app
   cd bpmn-flow
   ```
   - Next.js 14 + TypeScript + Tailwind CSS 설정
   - shadcn/ui 초기화
   - 폴더 구조 생성

2. **의존성 설치** (1일)
   ```bash
   npm install bpmn-js zustand drizzle-orm @clerk/nextjs
   npm install -D @types/bpmn-js drizzle-kit
   ```

3. **Vercel 프로젝트 연결** (1일)
   - Vercel 프로젝트 생성
   - Vercel Postgres 데이터베이스 생성
   - 환경변수 설정

4. **Clerk 인증 설정** (1일)
   - Clerk 앱 생성
   - 환경변수 설정
   - 미들웨어 구성

5. **데이터베이스 스키마 설계** (1일)
   ```typescript
   // schema.ts
   export const diagrams = pgTable('diagrams', {
     id: uuid('id').defaultRandom().primaryKey(),
     userId: text('user_id').notNull(),
     title: text('title').notNull(),
     description: text('description'),
     bpmnXml: text('bpmn_xml').notNull(),
     thumbnail: text('thumbnail'),
     createdAt: timestamp('created_at').defaultNow(),
     updatedAt: timestamp('updated_at').defaultNow(),
   });
   ```

6. **Git 저장소 설정** (1일)
   - .gitignore 설정
   - 초기 커밋
   - develop 브랜치 생성

**완료 기준**: `npm run dev`로 로컬 서버 실행 가능, Clerk 로그인 동작

---

#### Phase 2: 인증 및 대시보드 (1주)
**목표**: 사용자 인증 및 다이어그램 목록 화면

**태스크**:
1. **랜딩 페이지** (1일)
   - 히어로 섹션
   - 주요 기능 소개
   - CTA 버튼

2. **인증 플로우** (2일)
   - 로그인/회원가입 페이지
   - 미들웨어 보호된 라우트
   - 사용자 프로필 페이지

3. **대시보드 레이아웃** (2일)
   - 사이드바 네비게이션
   - 상단 헤더 (사용자 메뉴)
   - 반응형 레이아웃

4. **다이어그램 목록** (2일)
   - 그리드/리스트 뷰
   - 검색 기능
   - 정렬 (최신순, 이름순)
   - 페이지네이션

**의존성**: Phase 1 완료
**완료 기준**: 로그인 후 빈 대시보드 접근 가능

---

#### Phase 3: BPMN 에디터 코어 (2주)
**목표**: 기본 BPMN 다이어그램 생성 및 편집

**태스크**:
1. **bpmn-js 통합** (3일)
   ```typescript
   // components/bpmn-editor.tsx
   'use client';
   
   import BpmnModeler from 'bpmn-js/lib/Modeler';
   import { useEffect, useRef } from 'react';
   
   export function BpmnEditor() {
     const containerRef = useRef<HTMLDivElement>(null);
     const modelerRef = useRef<BpmnModeler | null>(null);
     
     useEffect(() => {
       if (containerRef.current && !modelerRef.current) {
         modelerRef.current = new BpmnModeler({
           container: containerRef.current,
         });
         
         modelerRef.current.createDiagram();
       }
     }, []);
     
     return <div ref={containerRef} className="h-full" />;
   }
   ```

2. **에디터 UI 구성** (2일)
   - 상단 툴바 (저장, 내보내기, 되돌리기)
   - 왼쪽 팔레트 (요소 선택)
   - 오른쪽 속성 패널
   - 캔버스 영역

3. **드래그 앤 드롭** (2일)
   - 팔레트에서 캔버스로 요소 드래그
   - 요소 이동 및 크기 조정
   - 연결선 그리기

4. **요소 추가/삭제** (2일)
   - 태스크, 게이트웨이, 이벤트 추가
   - 컨텍스트 메뉴
   - 키보드 단축키 (Delete 키)

5. **속성 편집** (2일)
   - 속성 패널 UI
   - 이름, 설명 편집
   - 실시간 동기화

6. **캔버스 조작** (1일)
   - 줌 인/아웃
   - 패닝 (드래그로 이동)
   - 미니맵 (선택사항)

**의존성**: Phase 2 완료
**완료 기준**: 기본 BPMN 다이어그램 생성 및 편집 가능

---

#### Phase 4: 저장 및 불러오기 (1주)
**목표**: 다이어그램 영구 저장 및 관리

**태스크**:
1. **자동 저장 기능** (2일)
   ```typescript
   // hooks/use-auto-save.ts
   import { useEffect, useRef } from 'react';
   import { debounce } from 'lodash-es';
   
   export function useAutoSave(
     xml: string,
     diagramId: string,
     onSave: (xml: string) => Promise<void>
   ) {
     const debouncedSave = useRef(
       debounce(async (xmlContent: string) => {
         await onSave(xmlContent);
       }, 3000)
     ).current;
     
     useEffect(() => {
       if (xml) {
         debouncedSave(xml);
       }
     }, [xml, debouncedSave]);
   }
   ```

2. **API 라우트 구현** (2일)
   ```typescript
   // app/api/diagrams/route.ts
   export async function POST(req: Request) {
     const { userId } = auth();
     if (!userId) return new Response('Unauthorized', { status: 401 });
     
     const body = await req.json();
     const validated = diagramSchema.parse(body);
     
     const diagram = await db.insert(diagrams).values({
       userId,
       ...validated,
     }).returning();
     
     return Response.json(diagram);
   }
   ```

3. **다이어그램 열기** (2일)
   - DB에서 불러오기
   - bpmn-js에 로드
   - 에러 처리

4. **버전 히스토리 (선택사항)** (1일)
   - 변경 히스토리 테이블
   - 타임라인 UI
   - 롤백 기능

**의존성**: Phase 3 완료
**완료 기준**: 다이어그램 저장 후 새로고침해도 유지됨

---

#### Phase 5: 내보내기/가져오기 (1주)
**목표**: 다이어그램 파일 처리

**태스크**:
1. **BPMN XML 내보내기** (1일)
   ```typescript
   async function exportBpmn() {
     const { xml } = await modeler.saveXML({ format: true });
     const blob = new Blob([xml], { type: 'application/xml' });
     downloadFile(blob, 'diagram.bpmn');
   }
   ```

2. **이미지 내보내기** (2일)
   ```typescript
   async function exportPng() {
     const { svg } = await modeler.saveSVG();
     const canvas = await svgToCanvas(svg);
     const blob = await canvasToBlob(canvas);
     downloadFile(blob, 'diagram.png');
   }
   ```

3. **BPMN 파일 가져오기** (2일)
   - 파일 업로드 UI
   - XML 파싱
   - 유효성 검사

4. **템플릿 시스템** (2일)
   - 사전 정의 템플릿 (식품 제조 공정)
   - 템플릿 갤러리 UI
   - 템플릿에서 새 다이어그램 생성

**의존성**: Phase 4 완료
**완료 기준**: BPMN 파일 및 이미지 내보내기/가져오기 가능

---

#### Phase 6: UI/UX 개선 (1주)
**목표**: 사용자 경험 최적화

**태스크**:
1. **로딩 상태** (1일)
   - Skeleton UI
   - 스피너
   - 프로그레스 바

2. **에러 처리** (1일)
   - 사용자 친화적 에러 메시지
   - 에러 바운더리
   - 재시도 로직

3. **토스트 알림** (1일)
   - 성공/실패 메시지
   - shadcn/ui Toast 컴포넌트

4. **키보드 단축키** (1일)
   - Ctrl+S: 저장
   - Ctrl+Z: 되돌리기
   - Delete: 삭제

5. **다크 모드** (1일)
   - 테마 토글
   - 시스템 설정 감지

6. **반응형 디자인** (2일)
   - 모바일 레이아웃
   - 태블릿 최적화

**의존성**: Phase 5 완료
**완료 기준**: 모든 디바이스에서 원활한 사용 경험

---

#### Phase 7: 테스트 및 최적화 (1주)
**목표**: 품질 보증 및 성능 개선

**태스크**:
1. **단위 테스트** (2일)
   - 유틸 함수 테스트
   - 커스텀 훅 테스트
   - 최소 80% 커버리지

2. **E2E 테스트** (2일)
   - 주요 사용자 플로우
   - 회원가입 → 다이어그램 생성 → 저장

3. **성능 최적화** (2일)
   - Lighthouse 점수 90+ 목표
   - 번들 사이즈 분석
   - 코드 스플리팅

4. **접근성 검사** (1일)
   - axe DevTools 검사
   - 키보드 네비게이션 테스트
   - 스크린 리더 테스트

**의존성**: Phase 6 완료
**완료 기준**: 모든 테스트 통과, Lighthouse 점수 90+

---

#### Phase 8: 배포 및 모니터링 (1주)
**목표**: 프로덕션 배포 및 안정화

**태스크**:
1. **프로덕션 환경변수** (1일)
   - Vercel 환경변수 설정
   - 시크릿 키 로테이션

2. **프로덕션 배포** (1일)
   - Vercel에 배포
   - 도메인 연결 (선택사항)

3. **모니터링 설정** (1일)
   - Vercel Analytics
   - Sentry 에러 트래킹

4. **문서화** (2일)
   - README 작성
   - 사용자 가이드
   - API 문서

5. **베타 테스트** (2일)
   - 실제 사용자 피드백
   - 버그 수정

**의존성**: Phase 7 완료
**완료 기준**: 프로덕션 환경에서 안정적으로 동작

---

## 6. 프론트엔드 가이드라인

### 6.1 디자인 원칙

#### 일관성
- 모든 페이지에서 동일한 컴포넌트와 스타일 사용
- shadcn/ui 컴포넌트를 기본으로 사용
- 색상 팔레트 일관성 유지

#### 반응성
```typescript
// Tailwind breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>
```

#### 접근성
- 모든 인터랙티브 요소는 키보드로 접근 가능
- 충분한 색상 대비 (4.5:1)
- ARIA 속성 적절히 사용

#### 성능
- 이미지 lazy loading
- 코드 스플리팅
- 불필요한 리렌더링 방지

### 6.2 컴포넌트 아키텍처

#### 폴더 구조
```
app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
├── (dashboard)/
│   ├── dashboard/
│   ├── editor/[id]/
│   └── templates/
├── api/
│   └── diagrams/
└── layout.tsx

components/
├── ui/              # shadcn/ui 컴포넌트
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
├── bpmn/            # BPMN 관련 컴포넌트
│   ├── bpmn-editor.tsx
│   ├── bpmn-palette.tsx
│   └── bpmn-properties.tsx
├── dashboard/       # 대시보드 컴포넌트
│   ├── diagram-card.tsx
│   └── diagram-grid.tsx
└── layout/          # 레이아웃 컴포넌트
    ├── header.tsx
    └── sidebar.tsx

lib/
├── db/              # 데이터베이스
│   ├── schema.ts
│   └── queries.ts
├── utils/           # 유틸리티
│   └── bpmn.ts
└── hooks/           # 커스텀 훅
    └── use-auto-save.ts
```

#### 컴포넌트 패턴

**1. Server Components (기본값)**
```typescript
// app/dashboard/page.tsx
// 데이터 페칭은 서버에서
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export default async function DashboardPage() {
  const { userId } = auth();
  const diagrams = await db.query.diagrams.findMany({
    where: eq(diagrams.userId, userId!),
  });
  
  return <DiagramGrid diagrams={diagrams} />;
}
```

**2. Client Components**
```typescript
// components/bpmn/bpmn-editor.tsx
'use client';

import { useState, useEffect } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';

export function BpmnEditor({ initialXml }: { initialXml?: string }) {
  const [modeler, setModeler] = useState<BpmnModeler | null>(null);
  
  // 클라이언트 전용 로직
  useEffect(() => {
    // bpmn-js 초기화
  }, []);
  
  return <div id="canvas" />;
}
```

**3. 컴포넌트 분리 원칙**
- 한 컴포넌트는 하나의 책임만
- 200줄 이상이면 분리 고려
- props는 5개 이하로 유지

### 6.3 상태 관리

#### Zustand Store
```typescript
// lib/stores/editor-store.ts
import { create } from 'zustand';

interface EditorState {
  isDirty: boolean;
  currentDiagram: Diagram | null;
  setDirty: (dirty: boolean) => void;
  setCurrentDiagram: (diagram: Diagram) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isDirty: false,
  currentDiagram: null,
  setDirty: (dirty) => set({ isDirty: dirty }),
  setCurrentDiagram: (diagram) => set({ currentDiagram: diagram }),
}));
```

#### 사용 예시
```typescript
'use client';

import { useEditorStore } from '@/lib/stores/editor-store';

export function SaveButton() {
  const isDirty = useEditorStore((state) => state.isDirty);
  
  return (
    <Button disabled={!isDirty}>
      저장
    </Button>
  );
}
```

### 6.4 스타일링

#### Tailwind CSS 활용
```typescript
// ✅ 재사용 가능한 스타일
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### CSS 변수 (테마)
```css
/* app/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... */
  }
}
```

### 6.5 성능 최적화

#### 동적 Import
```typescript
// 큰 라이브러리는 동적 로드
const BpmnEditor = dynamic(
  () => import('@/components/bpmn/bpmn-editor'),
  { 
    ssr: false,
    loading: () => <EditorSkeleton />
  }
);
```

#### 이미지 최적화
```typescript
import Image from 'next/image';

<Image
  src={diagram.thumbnail}
  alt={diagram.title}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL={diagram.blurHash}
/>
```

#### 메모이제이션 (다음 섹션에서 자세히)

---

## 7. 백엔드 가이드라인

### 7.1 서버 아키텍처

#### API Routes 구조
```
app/api/
├── diagrams/
│   ├── route.ts              # GET, POST /api/diagrams
│   ├── [id]/
│   │   ├── route.ts          # GET, PATCH, DELETE /api/diagrams/[id]
│   │   └── versions/
│   │       └── route.ts      # GET /api/diagrams/[id]/versions
│   └── export/
│       └── route.ts          # POST /api/diagrams/export
├── templates/
│   └── route.ts              # GET /api/templates
└── upload/
    └── route.ts              # POST /api/upload
```

### 7.2 데이터베이스 설계

#### Drizzle ORM 스키마
```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// 다이어그램 테이블
export const diagrams = pgTable('diagrams', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  bpmnXml: text('bpmn_xml').notNull(), // BPMN XML 전체 저장
  thumbnail: text('thumbnail'), // 썸네일 이미지 URL (Vercel Blob)
  tags: text('tags').array(), // 태그 배열
  isTemplate: boolean('is_template').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 버전 히스토리 테이블 (선택사항)
export const diagramVersions = pgTable('diagram_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  diagramId: uuid('diagram_id').references(() => diagrams.id, { onDelete: 'cascade' }),
  bpmnXml: text('bpmn_xml').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  changeDescription: text('change_description'),
});

// 공유 설정 테이블 (미래 기능)
export const diagramShares = pgTable('diagram_shares', {
  id: uuid('id').defaultRandom().primaryKey(),
  diagramId: uuid('diagram_id').references(() => diagrams.id, { onDelete: 'cascade' }),
  sharedWithUserId: text('shared_with_user_id').notNull(),
  permission: text('permission').notNull(), // 'view' | 'edit'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

#### 마이그레이션
```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
} satisfies Config;
```

```bash
# 마이그레이션 생성
npx drizzle-kit generate:pg

# 마이그레이션 실행
npx drizzle-kit push:pg
```

### 7.3 API 설계

#### RESTful API 규칙
```
GET     /api/diagrams          # 목록 조회
POST    /api/diagrams          # 새 다이어그램 생성
GET     /api/diagrams/[id]     # 단일 조회
PATCH   /api/diagrams/[id]     # 수정
DELETE  /api/diagrams/[id]     # 삭제
```

#### API Route 구현 예시
```typescript
// app/api/diagrams/route.ts
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { diagrams } from '@/lib/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// 요청 검증 스키마
const createDiagramSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  bpmnXml: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

// GET /api/diagrams - 목록 조회
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    // 🔒 인증 체크
    if (!userId) {
      return Response.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // DB 쿼리
    const userDiagrams = await db.query.diagrams.findMany({
      where: (diagrams, { eq, and, ilike }) => and(
        eq(diagrams.userId, userId),
        search ? ilike(diagrams.title, `%${search}%`) : undefined
      ),
      limit,
      offset: (page - 1) * limit,
      orderBy: (diagrams, { desc }) => [desc(diagrams.updatedAt)],
    });
    
    return Response.json({
      data: userDiagrams,
      pagination: {
        page,
        limit,
        total: userDiagrams.length,
      },
    });
    
  } catch (error) {
    // 🔒 에러 메시지 안전하게 처리
    console.error('GET /api/diagrams error:', error);
    return Response.json(
      { error: '다이어그램을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/diagrams - 새 다이어그램 생성
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    // 🔒 인증 체크
    if (!userId) {
      return Response.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 요청 바디 파싱
    const body = await req.json();
    
    // 🔒 입력 검증
    const validated = createDiagramSchema.safeParse(body);
    if (!validated.success) {
      return Response.json(
        { error: '잘못된 요청입니다.', details: validated.error.errors },
        { status: 400 }
      );
    }
    
    // DB에 저장
    const [newDiagram] = await db.insert(diagrams).values({
      userId,
      title: validated.data.title,
      description: validated.data.description,
      bpmnXml: validated.data.bpmnXml,
      tags: validated.data.tags,
    }).returning();
    
    return Response.json(newDiagram, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/diagrams error:', error);
    return Response.json(
      { error: '다이어그램 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

#### PATCH 구현 (부분 업데이트)
```typescript
// app/api/diagrams/[id]/route.ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    const { id } = params;
    const body = await req.json();
    
    // 다이어그램 소유권 확인
    const diagram = await db.query.diagrams.findFirst({
      where: (diagrams, { eq, and }) => and(
        eq(diagrams.id, id),
        eq(diagrams.userId, userId)
      ),
    });
    
    if (!diagram) {
      return Response.json(
        { error: '다이어그램을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 업데이트
    const [updated] = await db.update(diagrams)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(diagrams.id, id))
      .returning();
    
    return Response.json(updated);
    
  } catch (error) {
    console.error('PATCH /api/diagrams/[id] error:', error);
    return Response.json(
      { error: '다이어그램 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

### 7.4 인증 및 권한

#### Clerk 미들웨어
```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // 공개 라우트
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
  ],
  
  // API 라우트 보호
  apiRoutes: ['/api(.*)'],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### 권한 체크 헬퍼
```typescript
// lib/auth/permissions.ts
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { diagrams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function canAccessDiagram(diagramId: string) {
  const { userId } = auth();
  if (!userId) return false;
  
  const diagram = await db.query.diagrams.findFirst({
    where: eq(diagrams.id, diagramId),
  });
  
  if (!diagram) return false;
  
  // 소유자이거나 공유받은 경우
  return diagram.userId === userId;
  // 추후: || await isSharedWith(diagramId, userId);
}
```

### 7.5 보안 조치

#### 🔒 필수 보안 체크리스트

**1. 환경변수 관리**
```bash
# .env.local (절대 커밋하지 않음!)
POSTGRES_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."  # 🔒 절대 NEXT_PUBLIC_ 접두사 사용 금지

BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

```bash
# .env.example (커밋 가능)
POSTGRES_URL=your_postgres_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

**2. 입력 검증 (Zod)**
```typescript
// 모든 사용자 입력은 검증 필수
const schema = z.object({
  title: z.string().min(1).max(100),
  bpmnXml: z.string().min(1).max(1000000), // 1MB 제한
});

const result = schema.safeParse(input);
if (!result.success) {
  return Response.json(
    { error: '잘못된 입력입니다.' },
    { status: 400 }
  );
}
```

**3. SQL Injection 방지 (ORM 사용)**
```typescript
// ✅ Drizzle ORM 사용 (안전)
const diagrams = await db.query.diagrams.findMany({
  where: eq(diagrams.userId, userId),
});

// ❌ 절대 직접 SQL 문자열 조합 금지
// const query = `SELECT * FROM diagrams WHERE user_id = '${userId}'`; // 위험!
```

**4. Rate Limiting (선택사항)**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10초에 10개 요청
});

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId);
  return success;
}
```

**5. CORS 설정**
```typescript
// Next.js API에서 CORS 헤더 설정
export async function GET(req: Request) {
  const response = Response.json({ data: '...' });
  
  // Vercel 배포 환경에서는 자동으로 처리되지만 명시적으로 설정 가능
  response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  
  return response;
}
```

### 7.6 캐싱 전략

#### Next.js 캐싱
```typescript
// 정적 데이터 캐싱 (템플릿)
export const revalidate = 3600; // 1시간

export async function GET() {
  const templates = await db.query.diagrams.findMany({
    where: eq(diagrams.isTemplate, true),
  });
  
  return Response.json(templates);
}
```

#### 데이터베이스 쿼리 최적화
```typescript
// 필요한 필드만 선택
const diagrams = await db.select({
  id: diagrams.id,
  title: diagrams.title,
  thumbnail: diagrams.thumbnail,
  updatedAt: diagrams.updatedAt,
}).from(diagrams)
  .where(eq(diagrams.userId, userId));
```

---

## 8. 최적화된 React 코드 가이드라인

### 8.1 일반적인 성능 함정

#### ❌ 문제 1: 인라인 객체/함수로 인한 불필요한 리렌더
```typescript
// ❌ 나쁜 예: 매 렌더마다 새로운 객체/함수 생성
function DiagramCard({ diagram }) {
  return (
    <Card
      style={{ padding: 16, margin: 8 }}  // 매번 새 객체
      onClick={() => navigateToDiagram(diagram.id)}  // 매번 새 함수
    >
      {diagram.title}
    </Card>
  );
}
```

```typescript
// ✅ 좋은 예: 메모이제이션 활용
const cardStyle = { padding: 16, margin: 8 }; // 컴포넌트 외부

function DiagramCard({ diagram }) {
  const handleClick = useCallback(() => {
    navigateToDiagram(diagram.id);
  }, [diagram.id]);
  
  return (
    <Card style={cardStyle} onClick={handleClick}>
      {diagram.title}
    </Card>
  );
}
```

#### ❌ 문제 2: Props로 인라인 함수 전달
```typescript
// ❌ 나쁜 예: 자식 컴포넌트가 매번 리렌더됨
function DiagramList({ diagrams }) {
  return diagrams.map(diagram => (
    <DiagramCard
      key={diagram.id}
      diagram={diagram}
      onDelete={() => handleDelete(diagram.id)}  // 매번 새 함수
    />
  ));
}
```

```typescript
// ✅ 좋은 예: 자식 컴포넌트에서 처리
const DiagramCard = memo(function DiagramCard({ diagram, onDelete }) {
  const handleDelete = useCallback(() => {
    onDelete(diagram.id);
  }, [diagram.id, onDelete]);
  
  return (
    <Card>
      {diagram.title}
      <Button onClick={handleDelete}>삭제</Button>
    </Card>
  );
});
```

### 8.2 React.memo 활용

#### 언제 사용하나?
- props가 자주 변하지 않는 컴포넌트
- 렌더링 비용이 큰 컴포넌트
- 리스트의 아이템 컴포넌트

```typescript
// ✅ React.memo로 불필요한 리렌더 방지
export const DiagramCard = memo(function DiagramCard({
  diagram,
  onSelect,
}: DiagramCardProps) {
  return (
    <div onClick={() => onSelect(diagram.id)}>
      <Image src={diagram.thumbnail} alt={diagram.title} />
      <h3>{diagram.title}</h3>
    </div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수 (선택사항)
  return prevProps.diagram.id === nextProps.diagram.id &&
         prevProps.diagram.updatedAt === nextProps.diagram.updatedAt;
});
```

### 8.3 useCallback 훅

#### 언제 사용하나?
- 자식 컴포넌트에 함수를 prop으로 전달할 때
- useEffect의 의존성 배열에 함수가 들어갈 때

```typescript
function DiagramEditor({ diagramId }) {
  const [xml, setXml] = useState('');
  
  // ✅ useCallback으로 함수 메모이제이션
  const handleSave = useCallback(async () => {
    await saveDiagram(diagramId, xml);
  }, [diagramId, xml]); // 의존성이 변할 때만 새 함수 생성
  
  // ✅ 자식 컴포넌트에 안전하게 전달
  return (
    <div>
      <BpmnCanvas onXmlChange={setXml} />
      <SaveButton onClick={handleSave} />
    </div>
  );
}
```

### 8.4 useMemo 훅

#### 언제 사용하나?
- 계산 비용이 큰 연산 결과를 캐싱
- 객체나 배열을 의존성으로 사용할 때

```typescript
function DiagramList({ diagrams, searchTerm }) {
  // ✅ 필터링 결과 메모이제이션
  const filteredDiagrams = useMemo(() => {
    return diagrams.filter(d => 
      d.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [diagrams, searchTerm]); // diagrams나 searchTerm이 변할 때만 재계산
  
  // ✅ 복잡한 통계 계산 메모이제이션
  const stats = useMemo(() => {
    return {
      total: diagrams.length,
      recent: diagrams.filter(d => isRecent(d.createdAt)).length,
      byTag: groupBy(diagrams, 'tags'),
    };
  }, [diagrams]);
  
  return (
    <div>
      <Stats data={stats} />
      {filteredDiagrams.map(d => <DiagramCard key={d.id} diagram={d} />)}
    </div>
  );
}
```

### 8.5 실전 예제: BPMN 에디터 최적화

#### ❌ 최적화 전 (문제 많음)
```typescript
function BpmnEditor({ diagramId }) {
  const [xml, setXml] = useState('');
  const [modeler, setModeler] = useState(null);
  
  // ❌ 매 렌더마다 새 함수 생성
  const handleElementClick = (event) => {
    const element = event.element;
    showPropertiesPanel(element);
  };
  
  // ❌ 매 렌더마다 새 설정 객체
  const editorConfig = {
    container: '#canvas',
    keyboard: { bindTo: window },
  };
  
  useEffect(() => {
    const modeler = new BpmnModeler(editorConfig); // ❌ 의존성 문제
    modeler.on('element.click', handleElementClick); // ❌ 의존성 문제
    setModeler(modeler);
  }, []); // ❌ 의존성 누락
  
  return <div id="canvas" />;
}
```

#### ✅ 최적화 후 (올바른 패턴)
```typescript
function BpmnEditor({ diagramId }) {
  const [xml, setXml] = useState('');
  const [modeler, setModeler] = useState<BpmnModeler | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ✅ 설정 객체 메모이제이션
  const editorConfig = useMemo(() => ({
    container: containerRef.current,
    keyboard: { bindTo: window },
  }), []); // 한 번만 생성
  
  // ✅ 이벤트 핸들러 메모이제이션
  const handleElementClick = useCallback((event: any) => {
    const element = event.element;
    showPropertiesPanel(element);
  }, []); // 의존성 없으면 한 번만 생성
  
  // ✅ 모든 의존성 명시
  useEffect(() => {
    if (!containerRef.current || modeler) return;
    
    const newModeler = new BpmnModeler(editorConfig);
    newModeler.on('element.click', handleElementClick);
    setModeler(newModeler);
    
    return () => {
      newModeler.destroy(); // ✅ 클린업
    };
  }, [editorConfig, handleElementClick, modeler]);
  
  // ✅ XML 로드 로직 분리
  useEffect(() => {
    if (!modeler || !xml) return;
    
    modeler.importXML(xml).catch(err => {
      console.error('Failed to load BPMN:', err);
    });
  }, [modeler, xml]);
  
  return <div ref={containerRef} className="h-full" />;
}
```

### 8.6 리스트 렌더링 최적화

#### ❌ 비효율적인 리스트
```typescript
function DiagramGrid({ diagrams }) {
  return (
    <div className="grid">
      {diagrams.map((diagram, index) => (
        // ❌ key로 index 사용 (안정적이지 않음)
        // ❌ 인라인 함수로 prop 전달
        <DiagramCard
          key={index}
          diagram={diagram}
          onEdit={() => editDiagram(diagram.id)}
          onDelete={() => deleteDiagram(diagram.id)}
        />
      ))}
    </div>
  );
}
```

#### ✅ 최적화된 리스트
```typescript
// DiagramCard를 메모이제이션
const DiagramCard = memo(function DiagramCard({
  diagram,
  onEdit,
  onDelete,
}: DiagramCardProps) {
  // ✅ 내부에서 ID를 사용하도록 처리
  const handleEdit = useCallback(() => {
    onEdit(diagram.id);
  }, [diagram.id, onEdit]);
  
  const handleDelete = useCallback(() => {
    onDelete(diagram.id);
  }, [diagram.id, onDelete]);
  
  return (
    <Card>
      <Image src={diagram.thumbnail} alt={diagram.title} />
      <h3>{diagram.title}</h3>
      <Button onClick={handleEdit}>편집</Button>
      <Button onClick={handleDelete}>삭제</Button>
    </Card>
  );
});

function DiagramGrid({ diagrams }) {
  // ✅ 핸들러를 상위에서 메모이제이션
  const handleEdit = useCallback((id: string) => {
    router.push(`/editor/${id}`);
  }, [router]);
  
  const handleDelete = useCallback(async (id: string) => {
    await deleteDiagram(id);
    mutate(); // SWR 재검증
  }, [mutate]);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {diagrams.map(diagram => (
        <DiagramCard
          key={diagram.id} // ✅ 안정적인 고유 ID 사용
          diagram={diagram}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### 8.7 상태 업데이트 최적화

#### ❌ 불필요한 상태 분리
```typescript
// ❌ 너무 많은 개별 상태
function DiagramForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  // ... 10개 이상의 상태
  
  // 매 상태 변경마다 리렌더
}
```

#### ✅ 관련 상태 그룹화
```typescript
// ✅ useReducer나 단일 객체로 관리
function DiagramForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    isPublic: false,
  });
  
  // ✅ 단일 업데이트 함수
  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  return (
    <form>
      <Input
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
      />
      {/* ... */}
    </form>
  );
}
```

### 8.8 컴포넌트 구조 가이드

#### 올바른 컴포넌트 분리
```typescript
// ✅ 작고 집중된 컴포넌트
function DiagramEditor({ diagramId }: { diagramId: string }) {
  return (
    <div className="flex h-screen">
      <EditorSidebar />
      <EditorCanvas diagramId={diagramId} />
      <PropertiesPanel />
    </div>
  );
}

// ✅ 각 부분은 독립적으로 최적화 가능
const EditorSidebar = memo(function EditorSidebar() {
  return <aside>{/* 팔레트 */}</aside>;
});

const EditorCanvas = memo(function EditorCanvas({ diagramId }) {
  // BPMN 에디터 로직
  return <div id="canvas" />;
});

const PropertiesPanel = memo(function PropertiesPanel() {
  // 속성 편집 UI
  return <aside>{/* 속성 */}</aside>;
});
```

---

## 9. 보안 체크리스트 (전체 스택 필수 적용)

### 🔒 1. 배틀 테스트된 인증 라이브러리 사용

#### ✅ Clerk 사용
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**왜 중요한가?**
- ❌ 직접 구현: 비밀번호 해싱, 세션 관리, 토큰 갱신 등 구현 복잡
- ✅ Clerk 사용: MFA, 소셜 로그인, 세션 관리 자동 처리
- ✅ 보안 업데이트 자동 적용

---

### 🔒 2. 보호된 엔드포인트 잠금

#### ✅ 모든 API에 인증 체크
```typescript
// app/api/diagrams/route.ts
import { auth } from '@clerk/nextjs';

export async function GET(req: Request) {
  // 🔒 첫 번째 줄: 인증 체크
  const { userId } = auth();
  
  if (!userId) {
    return Response.json(
      { error: '인증이 필요합니다.' },
      { status: 401 }
    );
  }
  
  // 인증된 사용자만 여기 도달
  const diagrams = await db.query.diagrams.findMany({
    where: eq(diagrams.userId, userId),
  });
  
  return Response.json(diagrams);
}
```

**왜 중요한가?**
- ❌ 인증 없으면: 누구나 API 호출 → DDoS 공격, 데이터 유출
- ✅ 인증 있으면: 식별된 사용자만 접근 → 남용 방지

---

### 🔒 3. 프론트엔드에 시크릿 노출 금지

#### ❌ 절대 안됨
```typescript
// ❌ 위험: 클라이언트에 시크릿 노출
const API_KEY = 'sk_live_abc123...'; // 누구나 볼 수 있음!

// ❌ 환경변수도 NEXT_PUBLIC_ 접두사 있으면 노출됨
const SECRET = process.env.NEXT_PUBLIC_SECRET_KEY; // 위험!
```

#### ✅ 올바른 방법
```typescript
// ✅ 서버 컴포넌트나 API Route에서만 사용
// app/api/external/route.ts
const API_KEY = process.env.SECRET_API_KEY; // NEXT_PUBLIC_ 없음 = 안전

export async function GET() {
  const response = await fetch('https://api.example.com', {
    headers: {
      'Authorization': `Bearer ${API_KEY}`, // 서버에서만 실행
    },
  });
  
  return Response.json(await response.json());
}
```

**환경변수 규칙**
```bash
# .env.local

# ✅ 서버 전용 (안전)
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...

# ✅ 클라이언트 노출 허용 (공개 키만)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

### 🔒 4. Git에 민감한 파일 절대 커밋 금지

#### ✅ .gitignore 필수 설정
```bash
# .gitignore
.env
.env.local
.env.*.local
.vercelignore
```

#### ✅ 실수로 커밋한 경우
```bash
# 히스토리에서 완전히 제거 (주의!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 모든 시크릿 즉시 로테이션
# - Clerk 키 재발급
# - DB 비밀번호 변경
```

---

### 🔒 5. 안전한 에러 메시지

#### ❌ 위험한 에러 노출
```typescript
// ❌ 내부 구조 노출
catch (error) {
  return Response.json({
    error: error.message, // "Cannot connect to postgres at 10.0.0.5:5432"
    stack: error.stack,
  }, { status: 500 });
}
```

#### ✅ 안전한 에러 처리
```typescript
// ✅ 사용자 친화적 메시지만 노출
catch (error) {
  // 서버 로그에는 자세히 (Sentry 등)
  console.error('DB Error:', error);
  Sentry.captureException(error);
  
  // 클라이언트에는 일반적 메시지만
  return Response.json({
    error: '요청 처리 중 오류가 발생했습니다.',
  }, { status: 500 });
}
```

---

### 🔒 6. 미들웨어로 인증 게이트키퍼

#### ✅ Next.js 미들웨어
```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // 🔒 공개 라우트만 명시
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
  
  // 나머지는 모두 인증 필요
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**효과**
- 인증 안된 사용자는 자동으로 `/sign-in`으로 리다이렉트
- API 라우트도 자동 보호

---

### 🔒 7. 역할 기반 접근 제어 (RBAC)

#### ✅ 역할 정의
```typescript
// lib/auth/roles.ts
export type Role = 'admin' | 'user' | 'guest';

export function hasPermission(userRole: Role, requiredRole: Role) {
  const hierarchy: Record<Role, number> = {
    admin: 3,
    user: 2,
    guest: 1,
  };
  
  return hierarchy[userRole] >= hierarchy[requiredRole];
}
```

#### ✅ API에서 역할 체크
```typescript
// app/api/admin/diagrams/route.ts
export async function DELETE(req: Request) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 🔒 역할 체크
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  
  if (user?.role !== 'admin') {
    return Response.json(
      { error: '관리자 권한이 필요합니다.' },
      { status: 403 }
    );
  }
  
  // 관리자만 여기 도달
  await db.delete(diagrams).where(eq(diagrams.id, req.body.id));
  
  return Response.json({ success: true });
}
```

---

### 🔒 8. 보안 DB 라이브러리/플랫폼 사용

#### ✅ Drizzle ORM + Vercel Postgres
```typescript
// ✅ ORM으로 SQL Injection 자동 방지
const diagrams = await db.query.diagrams.findMany({
  where: eq(diagrams.userId, userId), // 파라미터화된 쿼리
});

// ❌ 절대 안됨: Raw SQL 문자열 조합
// const query = `SELECT * FROM diagrams WHERE user_id = '${userId}'`; // SQL Injection 위험!
```

**Vercel Postgres 장점**
- Row-Level Security (RLS) 지원
- 자동 백업
- Connection pooling
- SSL 강제

---

### 🔒 9. 보안 호스팅 플랫폼 (Vercel)

#### ✅ Vercel 보안 기능
- **자동 HTTPS**: SSL 인증서 자동 갱신
- **DDoS 보호**: Edge Network에서 차단
- **WAF**: 웹 애플리케이션 방화벽
- **환경변수 암호화**: 빌드 시에만 복호화

```bash
# Vercel 배포
vercel --prod

# 환경변수는 Vercel Dashboard에서 관리
# Settings → Environment Variables
```

---

### 🔒 10. HTTPS 강제

#### ✅ Vercel은 자동으로 HTTPS 강제
```typescript
// next.config.js (추가 보안 헤더)
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

### 🔒 11. 파일 업로드 보안

#### ✅ 안전한 파일 업로드
```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/xml'];

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  // 🔒 파일 크기 체크
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: '파일 크기는 5MB를 초과할 수 없습니다.' },
      { status: 400 }
    );
  }
  
  // 🔒 파일 타입 체크
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: '허용되지 않는 파일 형식입니다.' },
      { status: 400 }
    );
  }
  
  // 🔒 파일명 안전하게 처리
  const safeFileName = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  
  // Vercel Blob에 업로드
  const blob = await put(safeFileName, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  
  return Response.json({ url: blob.url });
}
```

---

### 🔒 보안 체크리스트 요약

프로덕션 배포 전 필수 확인:

- [ ] ✅ Clerk 인증 설정 완료
- [ ] ✅ 모든 API 라우트에 `auth()` 체크 추가
- [ ] ✅ 환경변수에 `NEXT_PUBLIC_` 접두사 올바르게 사용
- [ ] ✅ `.env.local`이 `.gitignore`에 포함됨
- [ ] ✅ 에러 메시지에 내부 정보 노출 안됨
- [ ] ✅ 미들웨어로 보호된 라우트 설정
- [ ] ✅ 역할 기반 권한 체크 구현 (필요 시)
- [ ] ✅ Drizzle ORM 사용 (Raw SQL 금지)
- [ ] ✅ Vercel HTTPS 자동 적용 확인
- [ ] ✅ 보안 헤더 설정 (`next.config.js`)
- [ ] ✅ 파일 업로드 검증 (크기, 타입, 스캔)

---

## 10. 배포 체크리스트

### 배포 전 확인사항

```bash
# 1. 환경변수 확인
vercel env pull .env.local

# 2. 타입 체크
npm run type-check

# 3. 린트
npm run lint

# 4. 빌드 테스트
npm run build

# 5. 프로덕션 모드 로컬 테스트
npm run start

# 6. E2E 테스트
npm run test:e2e

# 7. Lighthouse 점수 확인
```

### 배포 명령
```bash
# 프로덕션 배포
vercel --prod

# 특정 브랜치 프리뷰
git push origin feature/new-feature
# Vercel이 자동으로 프리뷰 URL 생성
```

---

## 결론

이 청사진을 따라 구현하면:

✅ **보안**: Clerk + 미들웨어 + 환경변수 관리로 엔터프라이즈급 보안  
✅ **성능**: React 최적화 + Next.js SSR + Vercel CDN으로 빠른 로딩  
✅ **확장성**: Drizzle ORM + Vercel Postgres로 손쉬운 확장  
✅ **유지보수성**: TypeScript + 명확한 폴더 구조 + 테스트로 장기 관리 용이  
✅ **사용자 경험**: shadcn/ui + 반응형 디자인 + 접근성으로 모든 사용자 만족  

**다음 단계**: Phase 1부터 순차적으로 구현을 시작하세요! 🚀

