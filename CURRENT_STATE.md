# 현재 개발 상태

## 최종 업데이트
2026-04-04

## 기술 스택
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (Singapore region) + Prisma 7 (PrismaPg adapter)
- **Auth**: NextAuth v5 (JWT 전략, PrismaAdapter)
  - Google / Kakao / Naver OAuth + 이메일 매직링크 (Nodemailer)
  - `allowDangerousEmailAccountLinking: true` (동일 이메일 계정 연결)
- **Storage**: Cloudinary (문제 이미지, cloud_name: dwulm3bd0)
- **AI**: OpenRouter API (주관식/서술형 자동 채점)
- **배포**: Vercel

## 완료된 기능

### 1. 프로젝트 기반
- [x] Next.js 15 (App Router, TypeScript, Tailwind CSS)
- [x] Neon PostgreSQL + Prisma 7 연동
- [x] NextAuth v5 (JWT 전략)
- [x] 다크모드 지원 (next-themes, class 전략)
- [x] 미들웨어 인증 체크 (쿠키 기반 경량 체크, Edge 호환)
- [x] 프리미엄 다크 테마 대문 (전기 파티클 인터랙티브 애니메이션)

### 2. 인증 시스템 (4가지 로그인)
- [x] Google OAuth 로그인
- [x] Kakao OAuth 로그인 (client_secret_post 방식)
- [x] Naver OAuth 로그인
- [x] 이메일 매직링크 로그인 (Gmail SMTP)
- [x] 로그인 후 nickname 미설정 → `/complete-profile` 리다이렉트
- [x] 추가정보기입 (아이디 설정 + 중복확인, 전화번호, 개인정보 동의)
- [x] 아이디(nickname)는 한 번 설정하면 변경 불가
- [x] 프로필 수정 (전화번호)
- [x] 회원 탈퇴 (DB 삭제 + JWT 세션 정리 + 홈 리다이렉트)
- [x] 로그아웃

### 3. 시험 시스템
- [x] 시험 카테고리 → 시험 목록 구조 (ExamCategory → Exam with year/round)
- [x] 시험 선택 (전기기초/기능사/산업기사/기사)
- [x] 시험 시작 (랜덤 문제 선택, 시험지 스냅샷)
- [x] 문제 풀이 (4지선다, 이미지 문제, 타이머)
- [x] 답안 실시간 저장 (서버 저장)
- [x] 시험 중단 시 기록 완전 삭제 (abandon API)
- [x] 새 시험 시작 시 기존 IN_PROGRESS 자동 삭제
- [x] 제출/채점 (서버 채점, 과목별 점수)
- [x] 시험 결과 화면 (정답/오답, 해설, 과목별 정답 개수 표시)
- [x] 시간 제한 (관리자 설정 가능), 만료 처리
- [x] 홈페이지 시험 카드 실시간 갱신 (10초 폴링)

### 4. 랭킹 시스템
- [x] 오늘 Top5 (daily_best_scores)
- [x] 어제 Top5 스냅샷 (daily_leaderboard_snapshots)
- [x] NEW/▲▼ 순위 변동 표시
- [x] 내 순위 표시

### 5. 마이페이지
- [x] 응시 기록 조회 (날짜별, 시험별)
- [x] 오답 노트 (틀린 문제 모아보기, 해설 포함)

### 6. 관리자 페이지
- [x] 문제 관리 (추가/수정/삭제)
  - [x] Canvas 스타일 분할 편집기 (왼쪽=편집, 오른쪽=실시간 미리보기)
  - [x] 연속 저장 (닫지 않고 계속 저장)
  - [x] MathText 렌더링 (sub/sup/frac 태그)
  - [x] 이미지 업로드 (Cloudinary)
  - [x] 문제코드 자동생성/중복검사
  - [x] 드롭다운 필터 + 페이지네이션 (20개씩)
- [x] 일괄 문제 업로드 (JSON/CSV)
- [x] 회원 관리 (목록, 아이디/등급 표시, 권한 부여/해제, 삭제)
- [x] 시험 설정 (시험 시간, 과목별 출제 문항 수 설정)

### 7. 공식 시험 (OFFICIAL)
- [x] 공식 시험 생성/수정/삭제
- [x] 문제 출제 (객관식/주관식/서술형)
- [x] 게시/비게시 토글 (is_published)
- [x] 비밀번호 기반 접근 제어
- [x] 이탈 감지 (violation_count)
- [x] 응시자 답안 조회 및 주관식 수동 채점
- [x] AI 자동 채점 (OpenRouter API, 주관식/서술형)

### 8. 등급 시스템 (DB 구조만)
- [x] UserTier enum (GUEST/BRONZE/SILVER/GOLD/DIAMOND)
- [x] 관리자 페이지에 등급 뱃지 표시
- [ ] 결제 연동 등급 승급 로직

## 미구현 기능
- [ ] 결제 시스템 (토스페이먼츠) - PRD 설계 완료, DB 스키마 있음
- [ ] 동영상 강의 기능 - PRD 설계 완료, DB 스키마(Video) 있음
- [ ] 등급제 결제 연동 (등급 승급/만료 로직)
- [ ] Cloudinary 이미지 업로드 실제 테스트

## 프로젝트 구조

```
app/
├── layout.tsx                  # 루트 레이아웃 (Header, Footer, AuthProvider, ThemeProvider)
├── page.tsx                    # 홈 (HeroSection + 시험 카드)
├── globals.css                 # 전역 스타일 + 애니메이션
├── login/page.tsx              # 소셜 로그인 (Google, Kakao, Naver, Email)
├── complete-profile/page.tsx   # 추가정보기입 (아이디, 전화번호, 개인정보 동의)
├── admin/
│   ├── page.tsx                # 관리자 대시보드
│   ├── questions/page.tsx      # 문제 관리
│   ├── users/page.tsx          # 회원 관리 (아이디/등급 표시)
│   └── official-exams/         # 공식 시험 관리
├── exam/
│   ├── [examId]/page.tsx       # 시험 시작 화면
│   ├── attempt/[attemptId]/    # 문제 풀이
│   └── result/[attemptId]/     # 결과 확인
├── my/
│   ├── page.tsx                # 응시 기록
│   ├── profile/page.tsx        # 프로필 수정 (전화번호)
│   ├── withdraw/page.tsx       # 회원 탈퇴
│   └── wrong-answers/page.tsx  # 오답 노트
└── api/
    ├── auth/
    │   ├── [...nextauth]/route.ts    # NextAuth 핸들러
    │   ├── check-nickname/route.ts   # 아이디 중복 확인
    │   └── complete-profile/route.ts # 추가정보 저장
    ├── account/            # 프로필 수정, 탈퇴
    ├── admin/              # 문제/회원/공식시험 관리
    ├── attempts/           # 시험 시작/풀이/제출/중단(abandon)
    ├── exams/              # 시험/과목 조회
    ├── exam-categories/    # 시험 카테고리 목록
    ├── home/               # 리더보드
    ├── my/                 # 응시기록/오답노트
    ├── upload/             # 이미지 업로드 (Cloudinary)
    └── cron/               # 리더보드 스냅샷

components/
├── HeroSection.tsx             # 대문 인터랙티브 파티클 애니메이션 (Canvas)
├── Header.tsx                  # 네비게이션 (nickname 기반 메뉴 표시)
├── Footer.tsx                  # 푸터
├── AuthProvider.tsx            # NextAuth SessionProvider
├── ThemeProvider.tsx            # 다크모드 프로바이더
├── ThemeToggle.tsx              # 다크모드 토글 버튼
├── ExamCards.tsx               # 시험 카드 목록 (10초 폴링)
├── HomeExamCards.tsx           # 홈페이지 시험 카드
├── MathText.tsx                # 수학 표기법 렌더링
├── ConfirmDialog.tsx           # 확인 다이얼로그
├── FullscreenEnforcer.tsx      # 전체화면 강제 (OFFICIAL 모드)
├── ExamSettingsSection.tsx     # 시험 설정 관리
├── ResetAttemptsSection.tsx    # 응시 기록 초기화
├── DuplicateQuestionsSection.tsx # 중복 문제 관리
├── QuestionSplitEditor.tsx     # 문제 편집 분할 뷰 (lazy loaded)
└── BulkUploadSplitEditor.tsx   # 일괄 업로드 분할 뷰 (lazy loaded)

lib/
├── auth.ts                     # NextAuth v5 설정 (Google/Kakao/Naver/Email)
├── prisma.ts                   # Prisma 7 클라이언트 (PrismaPg adapter)
├── cloudinary.ts               # Cloudinary 이미지 업로드/삭제
├── openrouter.ts               # OpenRouter AI 채점
├── question-code-mapping.ts    # 문제코드 매핑 유틸
└── generated/prisma/           # Prisma 생성 클라이언트

prisma/
├── schema.prisma               # DB 스키마 (User, Exam, Question, Attempt 등)
└── prisma.config.ts            # Prisma 7 설정 (datasource URL)

middleware.ts                   # 쿠키 기반 경량 인증 체크 (Edge 호환)
```

## 보안
- [x] 정답(answer)은 프론트로 전송 금지 (제출 후 결과에서만 표시)
- [x] 모든 관리자 API에 isAdmin 검증
- [x] 모든 시험 API에 userId 소유권 검증
- [x] 파일 업로드 검증 (이미지 타입, 5MB 제한)
- [x] 미들웨어: Prisma/NextAuth 미사용 (Edge 호환성)
- [x] JWT 기반 세션 관리 (서버 사이드 토큰 검증)
