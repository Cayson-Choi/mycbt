# 현재 개발 상태

## 최종 업데이트
2026-04-14

## 기술 스택
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (Singapore region) + Prisma 7 (PrismaPg adapter)
- **Auth**: NextAuth v5 (JWT 전략, PrismaAdapter)
  - Google / Kakao / Naver OAuth
  - 이메일+비밀번호 로그인 (Credentials provider, bcryptjs)
  - 이메일 매직링크 (Nodemailer, 회원가입 인증용)
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

### 2. 인증 시스템 (5가지 로그인)
- [x] Google OAuth 로그인
- [x] Kakao OAuth 로그인 (client_secret_post 방식)
- [x] Naver OAuth 로그인
- [x] 이메일+비밀번호 로그인 (Credentials provider, bcryptjs)
  - 회원가입: 이메일+비밀번호 → 인증 메일 발송 → 링크 클릭 → complete-profile
  - 다음 로그인: 이메일+비밀번호만 입력 → 즉시 로그인
  - emailVerified 체크 적용 (미인증 이메일 로그인 차단)
- [x] 이메일 매직링크 (회원가입 인증용, Gmail SMTP)
- [x] 로그인 후 nickname 미설정 → `/complete-profile` 리다이렉트
- [x] 추가정보기입 (아이디 설정 + 중복확인, 전화번호, 개인정보 동의)
- [x] 아이디(nickname)는 한 번 설정하면 변경 불가
- [x] 프로필 수정 (전화번호 + 비밀번호 변경)
- [x] 비밀번호 찾기 (이메일 → HMAC 토큰 기반 재설정 링크 발송 → 새 비밀번호 설정)
- [x] 이메일 찾기 (전화번호 → 마스킹된 이메일 표시: ca****@gmail.com)
- [x] 회원 탈퇴 (DB 삭제 + JWT 세션 정리 + 홈 리다이렉트)
- [x] 로그아웃

### 3. 시험 시스템
- [x] 시험 카테고리 → 필기/실기 선택 → 시험 목록 구조
- [x] ExamType enum (WRITTEN/PRACTICAL) - 필기/실기 구분
- [x] 카테고리 페이지에서 필기/실기 선택 화면 (`/category/[id]`)
- [x] 필기/실기별 연도 그룹 시험 목록 (`/category/[id]/[examType]`)
- [x] 시험 시작 (랜덤 문제 선택, 시험지 스냅샷)
- [x] 문제 풀이 (4지선다, 이미지 문제, 타이머)
- [x] 선택지 UI: 동그라미 안에 1,2,3,4 번호 (전체 화면 통일)
- [x] 답안 실시간 저장 (서버 저장)
- [x] 시험 중단 시 기록 완전 삭제 (abandon API)
- [x] 새 시험 시작 시 기존 IN_PROGRESS 자동 삭제
- [x] 제출/채점 (서버 채점, 과목별 점수)
- [x] 시험 결과 화면 (정답/오답, 해설, 과목별 정답 개수 표시)
- [x] 시간 제한 (관리자 설정 가능), 만료 처리
- [x] 홈페이지 시험 카드 실시간 갱신 (10초 폴링)

### 4. 필기/실기 배지 시스템
- [x] 모든 시험 관련 화면에 필기/실기 배지 표시
  - 홈 카테고리 카드, 시험 시작, 시험 풀이, 결과, 오답노트, 응시기록
  - 관리자 대시보드, 문제 관리, 시험 설정
- [x] 필기: 파란색 배지 / 실기: 초록색 배지
- [x] DB unique constraint: `categoryId_year_round_examType`

### 5. 랭킹 시스템
- [x] 오늘 Top5 (daily_best_scores)
- [x] 어제 Top5 스냅샷 (daily_leaderboard_snapshots)
- [x] NEW/▲▼ 순위 변동 표시
- [x] 내 순위 표시

### 6. 마이페이지
- [x] 응시 기록 조회 (날짜별, 시험별, 필기/실기 표시)
- [x] 오답 노트 (틀린 문제 모아보기, 해설 포함, 필기/실기 표시)

### 7. 관리자 페이지
- [x] 문제 관리 (추가/수정/삭제)
  - [x] Canvas 스타일 분할 편집기 (왼쪽=편집, 오른쪽=실시간 미리보기)
  - [x] 연속 저장 (닫지 않고 계속 저장)
  - [x] MathText 렌더링 (sub/sup/frac 태그)
  - [x] 이미지 업로드 (Cloudinary)
  - [x] 문제코드 자동생성/중복검사
  - [x] 드롭다운 필터 + 페이지네이션 (20개씩)
  - [x] 필기/실기 유형 필터
- [x] 일괄 문제 업로드 (JSON/CSV)
- [x] 회원 관리 (목록, 아이디/등급 표시, 권한 부여/해제, 삭제)
- [x] 시험 설정 (시험 시간, 과목별 출제 문항 수 설정, 필기/실기 배지)
- [x] 시험별 문제 현황에 필기/실기 배지 표시

### 8. 공식 시험 (OFFICIAL)
- [x] 공식 시험 생성/수정/삭제
- [x] 문제 출제 (객관식/주관식/서술형)
- [x] 게시/비게시 토글 (is_published)
- [x] 비밀번호 기반 접근 제어
- [x] 이탈 감지 (violation_count)
- [x] 응시자 답안 조회 및 주관식 수동 채점
- [x] AI 자동 채점 (OpenRouter API, 주관식/서술형)

### 9. 홈페이지 UI/UX
- [x] ⚡ 번개 이모지 로고 (이미지 로고 대체, 헤더/푸터 밀착 배치)
- [x] 카테고리 카드 컴팩트 디자인 (필기/실기 배지 상단, 입장하기 하단)
- [x] 모바일 반응형 카드 중앙 정렬 (max-w-sm)
- [x] WHY CAYSON 섹션 스크롤 인터랙티브 효과
  - ScrollReveal: fade-in + slide-up 애니메이션
  - CountUp: 0→100% 반복 카운트업 (3초 ease-out pow(5), 3초 유지 후 반복)
  - TypeWriter: "합격! 운이 아니라 전략입니다." 타이핑 애니메이션 (제자리 글자 등장 → 3번 깜빡임 → 반복)
- [x] CTA 카드 다크 골드 프리미엄 디자인 (다크 네이비 배경 + 골드 텍스트/버튼)
- [x] 전체 여백 최적화 (모바일 + 데스크탑)
- [x] 모바일 글씨 크기 반응형 적용
- [x] 시험 화면 글씨/선택지 크기 축소 (긴 문제 대응)

### 10. 페이지 로딩 최적화
- [x] 서버 컴포넌트 전환 (19개 중 16개, 나머지 3개는 클라이언트 필수)
- [x] PrismaNeon 어댑터 (HTTP 연결, 콜드 스타트 100~200ms)
- [x] Prefetch 확대: 시험 풀이→결과, 결과→마이페이지, 시작→홈, 오답→마이페이지
- [x] Promise.all 병렬 DB 조회 (13곳)
- [x] KaTeX 동적 임포트 (264KB 초기 로드 방지)
- [x] 홈/등급/카테고리/시험목록 force-dynamic (ISR/unstable_cache 제거) — 관리자 변경 즉시 반영
- [x] `next.config.ts` staleTimes dynamic/static 모두 0 (클라이언트 라우터 캐시 최소화)

### 11. 등급 시스템
- [x] UserTier enum: FREE / BRONZE / SILVER / GOLD / PREMIUM / ADMIN
- [x] 관리자 페이지에 등급 뱃지 표시
- [x] 시험별 min_tier 설정 (등급 이상만 응시 가능)
- [x] tier.ts 유틸 (tierLevel, hasTierAccess)
- [ ] 결제 연동 등급 승급 로직

### 12. UX 개선
- [x] 10분 무활동 자동 로그아웃 (1분 전 경고 모달, 시험 중에는 비활성)
- [x] 유튜브 스타일 상단 프로그레스 바 (ProgressBar.tsx)
  - 모든 내부 링크 클릭 자동 감지, 경로 변경 시 자동 완료
  - 버튼 클릭 시 바 시작 안 함 (Link 내부 button의 stopPropagation 존중)
  - `useProgress().run(promise)` API로 비동기 작업 수동 제어 지원
- [x] 관리자 페이지 상단에 시험/문제/회원/공식시험 관리 카드 4개 배치

### 13. 공식 시험 확장 기능
- [x] 참고정답 이미지 (answer_text_image) — 관리자 채점 참고용
- [x] 해설 이미지 (explanation_image) — 응시 결과 화면 노출
- [x] 수험자 답안 이미지 (answer_image) — 주관식/서술형에서 손글씨·풀이 이미지 첨부
- [x] 편집기 Ctrl+V 이미지 붙여넣기 (문제, 보기, 참고정답, 해설 textarea 모두)
- [x] 공식시험 기본 배점 10점 (연습시험은 1점)
- [x] 응시 시 각 문제 오른쪽 상단 배점 배지 표시
- [x] 공식시험 합격/불합격 판정 없음 (점수만 표시, "채점 완료" 배지)
- [x] 채점 대기 중인 공식시험 결과: 점수/합불 대신 "채점 대기 중" 노출
- [x] 응시자 목록에 로그인 아이디(nickname) 표시

## 문제 데이터 현황

### 전기기사 필기 (21개 시험, 2,100문제)
- 2018년 1~3회, 2019년 1~3회, 2020년 1·3·4회
- 2021년 1~3회, 2022년 1~2회
- 2023년 2~3회, 2024년 1~3회
- 2025년 2~3회
- 5과목: 전기자기학(EM), 전력공학(PC), 전기기기(MA), 회로이론 및 제어공학(CC), 전기설비기술기준(EL)
- 각 시험 100문제 × 5과목 × 20문제

### 이미지 처리
- [그림] 포함 문제 → Cloudinary에 크롭된 다이어그램만 업로드
- Agent 비전으로 300DPI 원본에서 정밀 크롭 (텍스트/선택지 제거)
- 보기에 그림이 있는 문제 → choice_N_image로 개별 업로드
- 텍스트만 있는 문제 → image_url = NULL (불필요한 이미지 제거)

### 수학 수식
- KaTeX 문법으로 변환 (인라인: $수식$, 블록: $$수식$$)
- 분수: `\dfrac` 사용 (단, 지수 안에서는 `\frac` 사용하여 크기 적절하게)
- 규정 개정 무효 문제 → is_active = true, question_text에 "(규정 개정 문제)" 표시

### 문제 검토 현황 (2026-04-06)
- 전체 2,100문제 AI 검토 완료
- 검토 결과: `data/전기기사_문제검토_오류목록.xlsx` (통합 4시트)
  - 정답 오류: 41건 (DB 수정 필요 32건 + 원본 대조 필요 9건)
  - 규정 변경: 2건 (KEC 2021 개정 → 비활성화 권장)
  - OCR·��스트 오류: 15건 (DB 수정 완료 3건 + 원본 대조 필요 7건 + 조치불필요 2건 + 텍스트 수정 3건)
  - 총 58건
- OCR 오류 3건 DB 수정 완료: CC-381(보기4 누락), CC-394(분자 오류), CC-399(보기4 지수)
- 정답 오류 41건은 아직 DB 미수정 (Excel에 조치사항 정리됨)
- 2024년 3회 9건은 AI 검토 결과이며, 원본 시험지 대조 확인 필요
- 이미지 크롭 수정 3건 완료: EM-320(텍스트 잔존), CC-361(텍스트 잔존), EM-286(L 라벨 잘림)

## 미구현 기능
- [ ] 결제 시스템 (토스페이먼츠) - PRD 설계 완료, DB 스키마 있음
- [ ] 동영상 강의 기능 - PRD 설계 완료, DB 스키마(Video) 있음
- [ ] 등급제 결제 연동 (등급 승급/만료 로직)
- [ ] 전기기사 실기 문제 등록
- [ ] 정답 오류 41건 DB 수정 (Excel 조치사항 참조)
- [ ] 규정 변경 문제 2건 비활성화 처리
- [ ] OCR·텍스트 오류 잔여 10건 원본 대조 후 수정

## 프로젝트 구조

```
app/
├── layout.tsx                  # 루트 레이아웃 (Header, Footer, AuthProvider, ThemeProvider)
├── page.tsx                    # 홈 (HeroSection + LandingContent + ProfileGuard + CertifiedBanner)
├── globals.css                 # 전역 스타일 + 애니메이션
├── login/page.tsx              # 로그인 (소셜 3종 + 이메일+비밀번호)
├── complete-profile/page.tsx   # 추가정보기입 (아이디, 전화번호, 개인정보 동의)
├── forgot-password/page.tsx    # 비밀번호 찾기 (이메일 입력 → 재설정 링크 발송)
├── reset-password/page.tsx     # 비밀번호 재설정 (토큰 검증 → 새 비밀번호 설정)
├── find-email/page.tsx         # 이메일 찾기 (전화번호 → 마스킹된 이메일)
├── category/
│   ├── [categoryId]/page.tsx         # 필기/실기 선택 화면
│   └── [categoryId]/[examType]/page.tsx  # 연도별 시험 목록
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
│   ├── profile/page.tsx        # 프로필 수정 (전화번호 + 비밀번호 변경)
│   ├── withdraw/page.tsx       # 회원 탈퇴
│   └── wrong-answers/page.tsx  # 오답 노트
└── api/
    ├── auth/
    │   ├── [...nextauth]/route.ts    # NextAuth 핸들러
    │   ├── signup/route.ts           # 이메일+비밀번호 회원가입
    │   ├── forgot-password/route.ts  # 비밀번호 재설정 링크 발송
    │   ├── reset-password/route.ts   # 비밀번호 재설정 (토큰 검증)
    │   ├── find-email/route.ts       # 전화번호로 이메일 찾기
    │   ├── check-nickname/route.ts   # 아이디 중복 확인
    │   └── complete-profile/route.ts # 추가정보 저장
    ├── account/            # 프로필 수정, 탈퇴, 비밀번호 변경
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
├── Header.tsx                  # 네비게이션
├── Footer.tsx                  # 푸터
├── AuthProvider.tsx            # NextAuth SessionProvider
├── ThemeProvider.tsx           # 다크모드 프로바이더
├── ThemeToggle.tsx             # 다크모드 토글 버튼
├── LandingContent.tsx          # 랜딩 과정별 CBT + 합격 수기 섹션
├── WhySection.tsx              # WHY CAYSON 섹션 (ScrollReveal/CountUp/TypeWriter)
├── ScrollReveal.tsx            # 스크롤 애니메이션 + CountUp + TypeWriter (named export)
├── MathText.tsx                # 수학 표기법 렌더링 (KaTeX)
├── ConfirmDialog.tsx           # 확인 다이얼로그
├── ExamSettingsSection.tsx     # 시험 설정 관리
├── ResetAttemptsSection.tsx    # 응시 기록 초기화
├── DuplicateQuestionsSection.tsx # 중복 문제 관리
├── LandingCardSettings.tsx     # 랜딩 카드 표시/숨김 관리
├── CategoryAccordion.tsx       # 관리자 대시보드 카테고리 아코디언
├── AdminNavCard.tsx            # 관리자 네비게이션 카드 (시험/문제/회원/공식시험)
├── CertifiedBanner.tsx         # 인증 배너
├── PremiumSection.tsx          # 프리미엄 멤버십 안내
├── InactivityGuard.tsx         # 10분 무활동 자동 로그아웃
├── ProgressBar.tsx             # 유튜브 스타일 상단 프로그레스 바 + useProgress hook
├── QuestionSplitEditor.tsx     # 문제 편집 분할 뷰 (lazy loaded)
├── BulkUploadSplitEditor.tsx   # 일괄 업로드 분할 뷰 (lazy loaded)
├── ProfileGuard.tsx            # 프로필 미완성 감지 리다이렉트
├── ExamPaperPrint.ts           # 시험지 인쇄 헬퍼
└── admin/
    ├── OfficialExamsClient.tsx       # 공식시험 목록 관리
    ├── OfficialExamDetailClient.tsx  # 공식시험 상세 (문제 + 결과 탭)
    └── AttemptDetailClient.tsx       # 개별 응시자 결과/수동 채점

lib/
├── auth.ts                     # NextAuth v5 (Google/Kakao/Naver/Credentials/Nodemailer)
├── prisma.ts                   # Prisma 7 (PrismaPg adapter)
├── cloudinary.ts               # Cloudinary 이미지 업로드/삭제
├── openrouter.ts               # OpenRouter AI 채점
├── tier.ts                     # 등급 권한 유틸 (tierLevel, hasTierAccess)
├── utils.ts                    # 공통 유틸 (dataUrlToBlob, normalizeLineBreaks)
├── question-code-mapping.ts    # 문제코드 매핑 유틸
└── generated/prisma/           # Prisma 생성 클라이언트

prisma/
├── schema.prisma               # DB 스키마 (ExamType enum 포함)
└── prisma.config.ts            # Prisma 7 설정 (datasource URL)

middleware.ts                   # 쿠키 기반 경량 인증 체크 (Edge 호환)
```

### 시험 시간 설정
- 전기기사 필기: 150분 (5과목 × 30분)
- 전기기능사 필기: 60분 (3과목 × 20분)

## 보안
- [x] 정답(answer)은 프론트로 전송 금지 (제출 후 결과에서만 표시)
- [x] 모든 관리자 API에 isAdmin 검증
- [x] 모든 시험 API에 userId 소유권 검증
- [x] 파일 업로드 검증 (이미지 타입, 5MB 제한)
- [x] 미들웨어: Prisma/NextAuth 미사용 (Edge 호환성)
- [x] JWT 기반 세션 관리 (서버 사이드 토큰 검증)
- [x] 비밀번호 bcrypt 해싱 (salt round 10)
- [x] Credentials 로그인 시 emailVerified 체크 (미인증 차단)
- [x] 비밀번호 재설정 토큰: HMAC-SHA256 서명 + timingSafeEqual 비교
- [x] 이메일 열거 공격 방지 (로그인 실패 시 통합 에러 메시지)
- [x] 이메일 찾기: 마스킹 처리 (ca****@gmail.com)
