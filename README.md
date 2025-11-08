# BPMN Flow - 식품 제조 공정 관리 시스템 (MVP)

식품 제조업체를 위한 BPMN 다이어그램 생성 및 관리 웹 애플리케이션입니다.

## 🚀 MVP 버전 기능

### ✅ 구현된 기능
- **BPMN 다이어그램 편집기**
  - bpmn-js 기반 드래그 앤 드롭 에디터
  - 프로세스 요소 추가, 수정, 삭제
  - 연결선 그리기 및 속성 편집

- **자동 저장**
  - 3초 디바운스 자동 저장
  - 로컬스토리지 기반 데이터 저장

- **다이어그램 관리**
  - 다이어그램 목록 보기
  - 검색 기능
  - 생성, 편집, 삭제

- **내보내기**
  - BPMN 2.0 XML 파일로 내보내기
  - 파일명 지정 다운로드

- **UI/UX**
  - 반응형 디자인
  - 키보드 단축키 (Ctrl+S: 저장)
  - 토스트 알림
  - 사용 통계 대시보드

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **BPMN**: bpmn-js
- **UI Components**: shadcn/ui
- **Storage**: localStorage (임시)

## 📦 시작하기

### 사전 요구사항
- Node.js 18 이상

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📖 사용 방법

### 1. 새 다이어그램 생성
- 대시보드에서 "새 다이어그램" 버튼 클릭
- 에디터가 열리면 왼쪽 팔레트에서 요소를 드래그하여 캔버스에 배치

### 2. 다이어그램 편집
- 요소 클릭하여 선택
- 드래그하여 이동
- 요소를 연결하여 프로세스 플로우 생성
- 제목 클릭하여 이름 변경

### 3. 저장 및 내보내기
- 자동 저장: 변경 후 3초 뒤 자동 저장
- 수동 저장: 우측 상단 "저장" 버튼 또는 Ctrl+S
- 내보내기: "내보내기" 버튼 클릭하여 BPMN XML 파일 다운로드

### 4. 다이어그램 관리
- 대시보드에서 모든 다이어그램 확인
- 검색창에서 제목으로 검색
- 카드 클릭하여 편집, 삭제 버튼으로 삭제

## 🎯 향후 개발 계획

### Phase 2: 데이터베이스 통합
- [ ] Vercel Postgres 설정
- [ ] Drizzle ORM 통합
- [ ] 클라우드 저장

### Phase 3: 사용자 인증
- [ ] Clerk 인증 시스템
- [ ] 사용자별 다이어그램 관리

### Phase 4: 고급 기능
- [ ] 식품 제조 공정 템플릿
- [ ] PNG/SVG 이미지 내보내기
- [ ] 버전 히스토리
- [ ] 협업 기능

## 📂 프로젝트 구조

```
bpmn/
├── app/
│   ├── dashboard/          # 다이어그램 목록
│   │   └── page.tsx
│   ├── editor/            # BPMN 에디터
│   │   └── page.tsx
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 (대시보드로 리다이렉트)
├── components/
│   └── bpmn/
│       └── bpmn-editor.tsx  # BPMN 에디터 컴포넌트
├── lib/
│   └── utils.ts           # 유틸리티 함수
├── .env.local             # 환경 변수
└── package.json           # 의존성
```

## 🔧 주요 컴포넌트

### BpmnEditor
BPMN.js 모델러를 래핑한 React 컴포넌트
- Props: `initialXml`, `onXmlChange`, `onSave`, `diagramId`
- 기능: 다이어그램 로드, 편집, 저장, 이벤트 핸들링

### EditorPage
BPMN 에디터 페이지
- 기능: 자동 저장, 수동 저장, 내보내기, 키보드 단축키

### DashboardPage
다이어그램 관리 대시보드
- 기능: 목록 보기, 검색, 생성, 삭제, 통계

## 🐛 알려진 이슈

- localStorage 사용으로 인한 용량 제한 (향후 DB로 해결 예정)
- 인증 없이 모든 사용자가 동일한 localStorage 공유

## 📝 참고 문서

- [Angent.md](./Angent.md) - 개발자/에이전트를 위한 실전 가이드
- [claude.md](./claude.md) - 기술 청사진 및 상세 설계

## 📝 라이선스

MIT License

---

**버전**: 0.1.0-mvp
**최종 업데이트**: 2025-11-08
**개발 서버**: http://localhost:3000
