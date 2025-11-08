# 식품 제조 공정 BPMN 웹 서비스 - 개발 가이드

> 이 문서는 개발자/에이전트를 위한 실전 가이드입니다.

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [빠른 시작](#2-빠른-시작)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [개발 워크플로우](#4-개발-워크플로우)
5. [코드 작성 규칙](#5-코드-작성-규칙)
6. [디버깅 가이드](#6-디버깅-가이드)
7. [배포 가이드](#7-배포-가이드)
8. [자주 사용하는 명령어](#8-자주-사용하는-명령어)

---

## 1. 프로젝트 개요

### 1.1 핵심 정보
- **프로젝트명**: BPMN Flow - 식품 제조 공정 관리 시스템
- **목적**: 식품 제조업체를 위한 BPMN 다이어그램 생성 및 관리 웹 애플리케이션
- **기술 스택**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui + bpmn-js
- **배포**: Vercel
- **데이터베이스**: Vercel Postgres (Neon)
- **인증**: Clerk

### 1.2 핵심 기능
- ✅ BPMN 다이어그램 생성, 수정, 삭제
- ✅ 드래그 앤 드롭 에디터
- ✅ 자동 저장
- ✅ BPMN 2.0 XML 가져오기/내보내기
- ✅ 이미지 내보내기 (PNG/SVG)
- ✅ 식품 제조 공정 템플릿 제공

---

## 2. 빠른 시작

### 2.1 사전 요구사항
```bash
# Node.js 18 이상 필요
node --version  # v18.0.0 이상 확인

# npm 또는 pnpm 설치 확인
npm --version
```

### 2.2 프로젝트 초기 설정

#### Step 1: 프로젝트 생성
```bash
# Next.js 프로젝트 생성
npx create-next-app@latest bpmn-flow \
  --typescript \
  --tailwind \
  --app \
  --import-alias "@/*"

cd bpmn-flow
```

#### Step 2: 의존성 설치
```bash
# 핵심 의존성
npm install bpmn-js zustand react-hook-form zod @clerk/nextjs
npm install drizzle-orm postgres @vercel/blob

# 개발 의존성
npm install -D @types/bpmn-js drizzle-kit eslint-config-prettier
npm install -D prettier @types/node tsx dotenv-cli
```

#### Step 3: shadcn/ui 초기화
```bash
# shadcn/ui 설정
npx shadcn-ui@latest init

# 필요한 컴포넌트 추가
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add scroll-area
```

#### Step 4: 폴더 구조 생성
```bash
# 기본 폴더 구조 생성
mkdir -p app/{api,\(auth\),\(dashboard\)}
mkdir -p components/{ui,bpmn,dashboard,layout}
mkdir -p lib/{db,utils,hooks,stores,auth}
mkdir -p public/{templates,icons}
mkdir -p tests/{unit,e2e}
```

#### Step 5: 환경변수 설정
```bash
# .env.local 파일 생성
cat > .env.local << 'EOL'
# Database (Vercel Postgres)
POSTGRES_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Vercel Blob (파일 저장)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
EOL

# .env.example 생성 (커밋 가능)
cat > .env.example << 'EOL'
POSTGRES_URL=your_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_connection_string_non_pooling
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
BLOB_READ_WRITE_TOKEN=your_blob_token
EOL
```

#### Step 6: Git 설정
```bash
# .gitignore 확인/추가
cat >> .gitignore << 'EOL'

# Environment
.env
.env.local
.env.*.local

# Database
/drizzle

# IDE
.vscode/
.idea/
*.swp
*.swo
EOL

# Git 초기화 (아직 안했다면)
git init
git add .
git commit -m "feat: 프로젝트 초기 설정"

# 브랜치 전략
git branch develop
git checkout develop
```

### 2.3 Clerk 설정

#### Step 1: Clerk 계정 생성
1. https://clerk.com 방문
2. 계정 생성 및 로그인
3. 새 애플리케이션 생성

#### Step 2: 환경변수 복사
- Dashboard → API Keys에서 키 복사
- `.env.local`에 붙여넣기

#### Step 3: 미들웨어 설정
```typescript
// middleware.ts (프로젝트 루트)
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 2.4 Vercel Postgres 설정

#### Step 1: Vercel에 프로젝트 연결
```bash
# Vercel CLI 설치 (전역)
npm install -g vercel

# 로그인
vercel login

# 프로젝트 연결
vercel link
```

#### Step 2: Postgres 데이터베이스 생성
1. Vercel Dashboard → Storage 탭
2. "Create Database" → "Postgres"
3. 데이터베이스 이름 입력
4. "Create" 클릭

#### Step 3: 환경변수 자동 연결
```bash
# 로컬 환경변수 가져오기
vercel env pull .env.local
```

### 2.5 데이터베이스 스키마 설정

#### Step 1: Drizzle 설정
```typescript
// drizzle.config.ts (프로젝트 루트)
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
} satisfies Config;
```

#### Step 2: 스키마 정의
```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const diagrams = pgTable('diagrams', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  bpmnXml: text('bpmn_xml').notNull(),
  thumbnail: text('thumbnail'),
  tags: text('tags').array(),
  isTemplate: boolean('is_template').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### Step 3: DB 클라이언트 생성
```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.POSTGRES_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

#### Step 4: 마이그레이션 실행
```bash
# 마이그레이션 파일 생성
npx drizzle-kit generate:pg

# 데이터베이스에 적용
npx drizzle-kit push:pg
```

### 2.6 개발 서버 실행
```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

---

## 3. 프로젝트 구조

### 3.1 전체 구조
```
bpmn-flow/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # 인증 관련 라우트 그룹
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   ├── (dashboard)/              # 대시보드 라우트 그룹
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # 다이어그램 목록
│   │   │   └── loading.tsx
│   │   ├── editor/
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # BPMN 에디터
│   │   │       └── loading.tsx
│   │   ├── templates/
│   │   │   └── page.tsx          # 템플릿 갤러리
│   │   └── layout.tsx            # 대시보드 공통 레이아웃
│   ├── api/                      # API Routes
│   │   ├── diagrams/
│   │   │   ├── route.ts          # GET, POST
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # GET, PATCH, DELETE
│   │   │   └── export/
│   │   │       └── route.ts      # POST (이미지 내보내기)
│   │   ├── templates/
│   │   │   └── route.ts          # GET
│   │   └── upload/
│   │       └── route.ts          # POST (파일 업로드)
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 랜딩 페이지
├── components/
│   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── bpmn/                     # BPMN 관련 컴포넌트
│   │   ├── bpmn-editor.tsx       # 메인 에디터
│   │   ├── bpmn-palette.tsx      # 도구 팔레트
│   │   ├── bpmn-properties.tsx   # 속성 패널
│   │   └── bpmn-toolbar.tsx      # 상단 툴바
│   ├── dashboard/                # 대시보드 컴포넌트
│   │   ├── diagram-card.tsx      # 다이어그램 카드
│   │   ├── diagram-grid.tsx      # 그리드 레이아웃
│   │   └── search-bar.tsx        # 검색 바
│   └── layout/                   # 레이아웃 컴포넌트
│       ├── header.tsx            # 상단 헤더
│       ├── sidebar.tsx           # 사이드바
│       └── footer.tsx            # 푸터
├── lib/
│   ├── db/                       # 데이터베이스
│   │   ├── schema.ts             # Drizzle 스키마
│   │   ├── index.ts              # DB 클라이언트
│   │   └── queries.ts            # 재사용 쿼리
│   ├── utils/                    # 유틸리티 함수
│   │   ├── bpmn.ts               # BPMN 관련 유틸
│   │   ├── cn.ts                 # 클래스명 유틸
│   │   └── validation.ts         # Zod 스키마
│   ├── hooks/                    # 커스텀 훅
│   │   ├── use-auto-save.ts      # 자동 저장 훅
│   │   └── use-bpmn-modeler.ts   # BPMN 모델러 훅
│   ├── stores/                   # Zustand 스토어
│   │   └── editor-store.ts       # 에디터 상태
│   └── auth/                     # 인증 관련
│       └── permissions.ts        # 권한 체크
├── public/
│   ├── templates/                # BPMN 템플릿 파일
│   │   ├── basic-flow.bpmn
│   │   ├── food-production.bpmn
│   │   └── quality-control.bpmn
│   └── icons/
│       └── ...
├── tests/
│   ├── unit/                     # 단위 테스트
│   │   └── utils/
│   │       └── bpmn.test.ts
│   └── e2e/                      # E2E 테스트
│       └── diagram-flow.spec.ts
├── drizzle/                      # 마이그레이션 파일 (자동 생성)
├── .env.local                    # 환경변수 (Git 제외)
├── .env.example                  # 환경변수 템플릿
├── .gitignore
├── drizzle.config.ts             # Drizzle 설정
├── middleware.ts                 # Next.js 미들웨어
├── next.config.js                # Next.js 설정
├── package.json
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
└── README.md
```

### 3.2 주요 파일 설명

#### app/layout.tsx
```typescript
// 루트 레이아웃 - 모든 페이지에 적용
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

#### app/(dashboard)/layout.tsx
```typescript
// 대시보드 공통 레이아웃
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 4. 개발 워크플로우

### 4.1 새 기능 개발 프로세스

#### Step 1: 브랜치 생성
```bash
# develop에서 시작
git checkout develop
git pull origin develop

# 기능 브랜치 생성
git checkout -b feature/diagram-export
```

#### Step 2: 개발
```typescript
// 1. 타입 정의
interface ExportOptions {
  format: 'png' | 'svg' | 'xml';
  quality?: number;
}

// 2. 유틸 함수 작성
export async function exportDiagram(
  modeler: BpmnModeler,
  options: ExportOptions
): Promise<Blob> {
  // 구현...
}

// 3. 컴포넌트 작성
export function ExportButton() {
  // 구현...
}

// 4. API 라우트 작성
// app/api/diagrams/export/route.ts
export async function POST(req: Request) {
  // 구현...
}
```

#### Step 3: 테스트 작성
```typescript
// tests/unit/utils/export.test.ts
import { exportDiagram } from '@/lib/utils/bpmn';

describe('exportDiagram', () => {
  it('should export as PNG', async () => {
    // 테스트...
  });
});
```

#### Step 4: 로컬 테스트
```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check

# 린트
npm run lint

# 테스트
npm run test
```

#### Step 5: 커밋
```bash
git add .
git commit -m "feat: PNG/SVG 다이어그램 내보내기 기능 추가"
```

#### Step 6: Push 및 PR
```bash
# 원격에 푸시
git push origin feature/diagram-export

# GitHub에서 PR 생성
# develop <- feature/diagram-export
```

### 4.2 코드 리뷰 프로세스

#### 리뷰어 체크리스트
- [ ] 타입 안전성 확인
- [ ] 에러 처리 적절한가?
- [ ] 성능 이슈 없는가?
- [ ] 보안 취약점 없는가?
- [ ] 테스트 충분한가?
- [ ] 문서화 되었는가?

#### PR 승인 후
```bash
# develop에 머지
git checkout develop
git pull origin develop

# 기능 브랜치 삭제
git branch -d feature/diagram-export
```

### 4.3 일상적인 개발 작업

#### 새 shadcn/ui 컴포넌트 추가
```bash
npx shadcn-ui@latest add alert-dialog
```

#### 새 API 라우트 추가
```typescript
// app/api/diagrams/duplicate/route.ts
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { diagramId } = await req.json();
  
  // 복제 로직...
  
  return Response.json({ success: true });
}
```

#### 데이터베이스 스키마 변경
```typescript
// 1. lib/db/schema.ts 수정
export const diagrams = pgTable('diagrams', {
  // ... 기존 컬럼
  category: text('category'), // 새 컬럼 추가
});

// 2. 마이그레이션 생성
// npx drizzle-kit generate:pg

// 3. 적용
// npx drizzle-kit push:pg
```

---

## 5. 코드 작성 규칙

### 5.1 TypeScript 규칙

#### 타입 우선, any 금지
```typescript
// ❌ 절대 안됨
const data: any = fetchData();

// ✅ 올바른 방법
interface DiagramData {
  id: string;
  title: string;
}

const data: DiagramData = await fetchData();

// ✅ unknown 사용 후 타입 가드
const data: unknown = await fetchData();
if (isDiagramData(data)) {
  console.log(data.title);
}
```

#### Props 인터페이스 명확히
```typescript
// ✅ Props는 항상 interface로 정의
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  // ...
}
```

### 5.2 React 컴포넌트 규칙

#### 파일 구조 순서
```typescript
// 1. Imports
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Constants
const MAX_ITEMS = 10;

// 4. Component
export function MyComponent({ prop1, prop2 }: ComponentProps) {
  // 4-1. State
  const [count, setCount] = useState(0);
  
  // 4-2. Hooks
  const handleClick = useCallback(() => {
    // ...
  }, []);
  
  // 4-3. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 4-4. Render helpers
  const renderItems = () => {
    // ...
  };
  
  // 4-5. Return
  return <div>{/* JSX */}</div>;
}

// 5. Exports
export default MyComponent;
```

#### 메모이제이션 활용
```typescript
// React.memo로 래핑
export const DiagramCard = memo(function DiagramCard({ diagram }) {
  // useCallback으로 함수 메모이제이션
  const handleClick = useCallback(() => {
    // ...
  }, [/* 의존성 */]);
  
  // useMemo로 계산 메모이제이션
  const formattedDate = useMemo(() => {
    return formatDate(diagram.createdAt);
  }, [diagram.createdAt]);
  
  return <Card>{/* ... */}</Card>;
});
```

### 5.3 API 라우트 규칙

#### 표준 구조
```typescript
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { z } from 'zod';

// 1. 요청 검증 스키마
const requestSchema = z.object({
  title: z.string().min(1).max(100),
  // ...
});

// 2. 핸들러
export async function POST(req: Request) {
  try {
    // 2-1. 인증 체크
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2-2. 요청 파싱 및 검증
    const body = await req.json();
    const validated = requestSchema.safeParse(body);
    
    if (!validated.success) {
      return Response.json(
        { error: 'Invalid request', details: validated.error },
        { status: 400 }
      );
    }
    
    // 2-3. 비즈니스 로직
    const result = await db.insert(diagrams).values({
      userId,
      ...validated.data,
    }).returning();
    
    // 2-4. 성공 응답
    return Response.json(result, { status: 201 });
    
  } catch (error) {
    // 2-5. 에러 처리
    console.error('POST /api/diagrams error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 5.4 스타일링 규칙

#### Tailwind 클래스 순서
```typescript
// 1. Layout (display, position)
// 2. Box model (width, height, padding, margin)
// 3. Typography
// 4. Visual (background, border)
// 5. Misc (cursor, transition)

<div className="
  flex items-center justify-between
  w-full h-16 px-4 py-2
  text-lg font-semibold
  bg-white border border-gray-200 rounded-lg
  hover:bg-gray-50 transition-colors
">
```

#### 조건부 클래스
```typescript
import { cn } from '@/lib/utils';

<Button
  className={cn(
    "base-class",
    variant === 'primary' && "primary-class",
    isDisabled && "disabled-class",
    className // props로 받은 추가 클래스
  )}
/>
```

---

## 6. 디버깅 가이드

### 6.1 일반적인 문제 해결

#### 문제: "Module not found: Can't resolve 'bpmn-js'"
```bash
# 해결: bpmn-js는 클라이언트 전용이므로 동적 import 사용
# components/bpmn/bpmn-editor.tsx
import dynamic from 'next/dynamic';

const BpmnEditor = dynamic(
  () => import('./bpmn-editor-client'),
  { ssr: false }
);
```

#### 문제: "Error: Hydration failed"
```typescript
// 해결: 서버와 클라이언트 렌더링 불일치
// 클라이언트 전용 렌더링 사용
'use client';

import { useEffect, useState } from 'react';

export function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <div>{/* 클라이언트 전용 내용 */}</div>;
}
```

#### 문제: "Clerk: Unable to verify request"
```bash
# 해결: 환경변수 확인
# 1. .env.local에 CLERK_SECRET_KEY 있는지 확인
# 2. middleware.ts에 publicRoutes 올바른지 확인
# 3. 개발 서버 재시작
npm run dev
```

### 6.2 디버깅 도구

#### React DevTools
```bash
# Chrome 확장 프로그램 설치
# Components 탭에서 props/state 확인
```

#### Next.js DevTools
```typescript
// next.config.js
module.exports = {
  reactStrictMode: true, // 개발 모드에서 이중 렌더링으로 버그 찾기
};
```

#### 콘솔 로깅
```typescript
// ✅ 개발 환경에서만 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data);
}

// ✅ 더 나은 방법: debug 유틸
// lib/utils/debug.ts
export function debug(label: string, data: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${label}]`, data);
  }
}
```

### 6.3 성능 디버깅

#### React Profiler
```typescript
import { Profiler } from 'react';

<Profiler
  id="DiagramEditor"
  onRender={(id, phase, actualDuration) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  }}
>
  <DiagramEditor />
</Profiler>
```

#### Lighthouse 점수 확인
```bash
# Chrome DevTools → Lighthouse 탭
# "Generate report" 클릭
# 목표: Performance 90+, Accessibility 90+
```

---

## 7. 배포 가이드

### 7.1 프로덕션 배포 체크리스트

#### 배포 전 필수 확인
```bash
# ✅ 1. 환경변수 확인
vercel env pull .env.local

# ✅ 2. 타입 체크
npm run type-check

# ✅ 3. 린트
npm run lint

# ✅ 4. 테스트
npm run test

# ✅ 5. 빌드 테스트
npm run build

# ✅ 6. 로컬 프로덕션 모드 테스트
npm run start

# ✅ 7. Lighthouse 점수 확인 (90+ 목표)
```

#### 보안 체크리스트
- [ ] `.env.local`이 `.gitignore`에 포함됨
- [ ] 모든 API 라우트에 인증 체크
- [ ] `NEXT_PUBLIC_` 접두사 올바르게 사용
- [ ] 에러 메시지에 내부 정보 노출 안됨
- [ ] HTTPS 강제 (Vercel 자동)
- [ ] 보안 헤더 설정 (`next.config.js`)

### 7.2 Vercel 배포

#### 첫 배포
```bash
# Vercel CLI로 배포
vercel --prod

# 또는 Git 연동 (권장)
git push origin main  # Vercel이 자동으로 배포
```

#### 환경변수 설정
```bash
# Vercel Dashboard → Settings → Environment Variables
# 또는 CLI로 설정
vercel env add CLERK_SECRET_KEY production
vercel env add POSTGRES_URL production
```

#### 도메인 연결 (선택사항)
```bash
# Vercel Dashboard → Settings → Domains
# 커스텀 도메인 추가 (예: bpmn-flow.com)
```

### 7.3 배포 후 모니터링

#### Vercel Analytics
```bash
# package.json에 추가
npm install @vercel/analytics

# app/layout.tsx에 추가
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Sentry 에러 트래킹
```bash
# Sentry 설정
npm install @sentry/nextjs

# next.config.js 자동 수정
npx @sentry/wizard@latest -i nextjs

# 환경변수 추가
SENTRY_DSN=your_sentry_dsn
```

---

## 8. 자주 사용하는 명령어

### 8.1 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 타입 체크
npm run type-check
# 또는
tsc --noEmit

# 린트
npm run lint

# 린트 자동 수정
npm run lint --fix

# 포맷팅
npx prettier --write .

# 테스트
npm run test

# 테스트 (watch 모드)
npm run test:watch

# E2E 테스트
npm run test:e2e
```

### 8.2 데이터베이스 명령어

```bash
# 마이그레이션 생성
npx drizzle-kit generate:pg

# 마이그레이션 적용
npx drizzle-kit push:pg

# Drizzle Studio (GUI)
npx drizzle-kit studio

# 데이터베이스 리셋 (주의!)
# Vercel Dashboard에서 수동으로 테이블 삭제 후
npx drizzle-kit push:pg
```

### 8.3 배포 명령어

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 모드 로컬 실행
npm run start

# Vercel 프리뷰 배포
vercel

# Vercel 프로덕션 배포
vercel --prod

# 환경변수 가져오기
vercel env pull .env.local

# 로그 확인
vercel logs
```

### 8.4 Git 명령어

```bash
# 새 기능 브랜치
git checkout -b feature/new-feature

# 변경사항 확인
git status

# 커밋
git add .
git commit -m "feat: 새 기능 추가"

# 푸시
git push origin feature/new-feature

# 브랜치 전환
git checkout develop

# 최신 코드 가져오기
git pull origin develop

# 브랜치 삭제
git branch -d feature/old-feature
```

### 8.5 패키지 관리

```bash
# 패키지 설치
npm install package-name

# 개발 의존성 설치
npm install -D package-name

# 패키지 제거
npm uninstall package-name

# 패키지 업데이트
npm update

# 취약점 검사
npm audit

# 취약점 자동 수정
npm audit fix
```

---

## 9. 트러블슈팅

### 9.1 빌드 에러

#### "Type error: Cannot find module 'bpmn-js'"
```bash
# 해결: @types 설치
npm install -D @types/bpmn-js
```

#### "Module parse failed: Unexpected token"
```javascript
// next.config.js에 추가
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};
```

### 9.2 런타임 에러

#### "window is not defined"
```typescript
// 해결: 클라이언트 전용 렌더링
'use client';

import dynamic from 'next/dynamic';

const ClientComponent = dynamic(
  () => import('./client-component'),
  { ssr: false }
);
```

#### "Failed to fetch"
```typescript
// 해결: API URL 확인
// development: http://localhost:3000/api
// production: https://your-domain.vercel.app/api

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
```

---

## 10. 유용한 리소스

### 10.1 공식 문서
- [Next.js 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.com/docs)
- [bpmn-js 문서](https://bpmn.io/toolkit/bpmn-js/)
- [Drizzle ORM 문서](https://orm.drizzle.team/)
- [shadcn/ui 문서](https://ui.shadcn.com/)

### 10.2 개발 도구
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Clerk Dashboard](https://dashboard.clerk.com/)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)

### 10.3 커뮤니티
- [Next.js Discord](https://discord.gg/nextjs)
- [bpmn-js Forum](https://forum.bpmn.io/)

---

## 마무리

이 가이드를 따라 프로젝트를 시작하고 개발하세요!

**다음 단계**:
1. [빠른 시작](#2-빠른-시작)을 따라 프로젝트 설정
2. [프로젝트 구조](#3-프로젝트-구조)를 이해
3. [개발 워크플로우](#4-개발-워크플로우)에 따라 개발 시작

**질문이 있다면**:
- `claude.md` 파일에서 자세한 기술 설계 확인
- 공식 문서 참조
- GitHub Issues에 질문 올리기

**Happy Coding! 🚀**

