# 전기짱 v2.0 PRD (Product Requirements Document)

## 리뉴얼 개요

Supabase 기반 → **Neon(DB) + Prisma(ORM) + NextAuth(인증) + Cloudinary(이미지) + Vercel(배포)** 전면 전환

- **프로젝트명(영문)**: `mycbt` (외부 서비스, 코드, 도메인 등에서 사용)
- **서비스명(한글)**: `전기짱` (사용자에게 보이는 브랜딩)

### 전환 이유
- Supabase Auth는 카카오/네이버 OAuth 지원이 제한적 → NextAuth로 네이티브 지원
- Cayson MBTI 프로젝트에서 Neon + Prisma + NextAuth 패턴 검증 완료 → 코드 재사용
- Cloudinary 무료 25GB로 문제 이미지 충분 (Vercel Blob 무료 500MB 부족)
- Prisma로 타입 안전성 자동 생성 (수동 database.ts 불필요)

### 기술 스택

| 항목 | v1 (현재) | v2 (리뉴얼) |
|------|-----------|-------------|
| 프레임워크 | Next.js 15 (App Router, TypeScript) | 유지 |
| DB | Supabase PostgreSQL | **Neon PostgreSQL** |
| ORM | Supabase Client SDK | **Prisma** |
| 인증 | Supabase Auth (Google, 카카오) | **NextAuth v5** (Google, 카카오, 네이버, 이메일 Magic Link) |
| 이미지 저장 | Supabase Storage | **Cloudinary** (무료 25GB) |
| 스타일링 | Tailwind CSS | 유지 |
| AI 채점 | OpenRouter (DeepSeek v3.2) | 유지 |
| 결제 | 없음 | **토스페이먼츠** (등급 정기결제 + 개별 콘텐츠 구매) |
| 배포 | Vercel | 유지 |

---

## 0. 서비스 한 줄

전기 자격시험 CBT 모의고사를 풀고, 서버가 채점해서 점수와 랭킹을 보여주는 웹사이트. 등급제(월 정기결제)와 개별 콘텐츠 구매를 결합한 하이브리드 결제 모델.

---

## 1. 절대 규칙

### 규칙 1) 랜덤이지만 시험지는 "시작 순간 고정"
- 시험 시작 버튼 누르는 순간 서버가 문제를 랜덤으로 뽑음
- 그 목록/순서를 DB에 저장해서 "시험지(스냅샷)"를 만듦
- 새로고침/재접속/꺼졌다 켜도 문제와 순서가 절대 안 바뀜

### 규칙 2) 채점/점수 계산은 서버만
- 브라우저에서 점수 계산하면 조작 가능
- 제출하면 서버가 정답과 비교해서 채점하고 점수를 저장한 뒤 결과만 보여줌
- **정답(answer)은 프론트에 절대 내려보내지 않는다**

### 규칙 3) 랭킹은 "한국 날짜(KST)" 기준
- 오늘 랭킹은 KST 오늘 날짜 데이터만 모아서 만듦
- 밤 12시(00:00 KST) 지나면 새로운 "오늘 랭킹"이 시작

---

## 2. 등급제 및 결제 시스템

### 등급 체계

| 등급 | 월 결제 금액 | 설명 |
|------|-------------|------|
| 게스트 (GUEST) | 0원 | 무료 가입, 제한된 콘텐츠 접근 |
| 브론즈 (BRONZE) | 500원/월 | |
| 실버 (SILVER) | 1,000원/월 | |
| 골드 (GOLD) | 3,000원/월 | |
| 다이아몬드 (DIAMOND) | 5,000원/월 | 모든 콘텐츠 접근 |

### 등급별 접근 제한
- 각 시험/문제/동영상에 **최소 필요 등급**을 설정 (관리자가 지정)
- 사용자 등급이 해당 콘텐츠의 최소 등급 이상이면 접근 가능
- 시험 카드에 필요 등급을 표시하여 사용자가 사전에 파악 가능

### 동영상 강의
- 동영상은 직접 호스팅하지 않고 **외부 링크(유튜브 등) 첨부** 방식
- 각 동영상에 최소 필요 등급 설정
- 등급 미달 시 "등급 업그레이드 필요" 안내 표시

### 결제 방식 (토스페이먼츠 통합)

**1) 등급 정기결제 (빌링키 방식)**
- 사용자가 등급 선택 → 토스페이먼츠 카드 등록 → 빌링키 발급
- 매월 자동 결제 → Webhook으로 결과 수신 → 등급 자동 갱신
- 결제 실패 시 → 유예 기간 후 게스트로 다운그레이드
- `tierExpiresAt`으로 만료일 관리 (결제일 + 30일)

**2) 개별 콘텐츠 구매 (즉시 결제)**
- 등급이 부족해도 특정 문제/동영상을 건당 구매 가능
- 토스페이먼츠 SDK로 즉시 결제창 → 결제 완료 → `PurchasedContent` 테이블에 기록
- 한 번 구매하면 영구 접근

### 콘텐츠 접근 판단 로직
```
접근 가능 = (사용자 등급 >= 콘텐츠 최소 등급) OR (개별 구매 이력 있음)
```

---

## 3. 운영 규칙

### A) 23:00~23:59(KST) 새 시험 시작 금지
- 이 시간에는 새 시험지를 만들 수 없음
- 이미 진행 중(IN_PROGRESS)이고 만료 전이면 "이어풀기"는 가능

### B) 시험 시간 제한
- started_at부터 duration_minutes(기본 60분) 안에 제출해야 함
- 시간이 지나면 자동으로 만료(EXPIRED)

### C) 동시에 시험은 1개만 가능
- 하나 시작했으면 제출하거나 만료돼야 다음 시험 시작 가능
- DB 유니크 인덱스로 강제

---

## 4. 사용자 흐름

### 학생 흐름
1. 회원가입/로그인 (Google / 카카오 / 네이버 / 이메일 인증)
   - 이메일 인증: 이메일 입력 → cayson0127@gmail.com SMTP로 Magic Link 발송 → 메일 내 링크 클릭 → 가입/로그인 완료
2. 프로필 완성 (이름, 전화번호)
3. (선택) 등급 업그레이드 — 토스페이먼츠로 월 정기결제
4. 홈에서 시험 카테고리 선택 (전기기초 / 전기기능사 / 전기산업기사 / 전기기사)
5. 카테고리 페이지에서 구체적 시험 선택 (무료, 2020년 1회차 ~ 2026년 1회차)
   - 각 시험 카드에 최소 필요 등급 표시
   - 등급 미달 시 업그레이드 안내 또는 개별 구매 유도
6. 시험 시작 (진행 중 시험 있으면 이어풀기)
7. 문제 풀기 (답 고를 때마다 서버에 자동 저장)
8. 제출 (시간 내)
9. 결과 보기 (점수 / 오답 / 해설)
10. 동영상 강의 시청 (등급별 접근 제한, 개별 구매 가능)
11. 마이페이지에서 기록/통계/등급/결제내역 보기
12. 원하면 회원 탈퇴

---

## 5. 환경 변수 (.env.local)

```bash
# === NextAuth ===
NEXTAUTH_SECRET=(자동 생성된 랜덤 문자열)
NEXTAUTH_URL=http://localhost:3000

# === Neon PostgreSQL ===
DATABASE_URL=(Neon PostgreSQL 연결 문자열)

# === Google OAuth ===
GOOGLE_CLIENT_ID=(Google Cloud Console에서 발급)
GOOGLE_CLIENT_SECRET=(Google Cloud Console에서 발급)

# === 카카오 OAuth ===
KAKAO_CLIENT_ID=(카카오 개발자 센터 REST API 키)
KAKAO_CLIENT_SECRET=(카카오 개발자 센터 Client Secret)
NEXT_PUBLIC_KAKAO_JS_KEY=(카카오 JavaScript 키 - 카카오톡 공유용)

# === 네이버 OAuth ===
NAVER_CLIENT_ID=(네이버 개발자 센터에서 발급)
NAVER_CLIENT_SECRET=(네이버 개발자 센터에서 발급)

# === Gmail SMTP ===
EMAIL_SERVER_USER=cayson0127@gmail.com
EMAIL_SERVER_PASSWORD=(Gmail 앱 비밀번호 16자리)
EMAIL_FROM=cayson0127@gmail.com

# === Cloudinary ===
CLOUDINARY_CLOUD_NAME=(Cloudinary 대시보드에서 확인)
CLOUDINARY_API_KEY=(Cloudinary 대시보드에서 확인)
CLOUDINARY_API_SECRET=(Cloudinary 대시보드에서 확인)

# === 토스페이먼츠 ===
TOSS_CLIENT_KEY=(토스페이먼츠 클라이언트 키)
TOSS_SECRET_KEY=(토스페이먼츠 시크릿 키)

# === OpenRouter AI (유지) ===
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_MODEL=deepseek/deepseek-v3.2

# === Vercel Cron ===
CRON_SECRET=(랜덤 시크릿)
```

---

## 6. 외부 서비스 설정

### Neon PostgreSQL
- Vercel Storage에서 생성
- Prisma로 스키마 관리, `npx prisma db push`로 적용
- 무료 티어: 512MB 스토리지

### Google OAuth
- Google Cloud Console → 프로젝트 생성
- OAuth 동의 화면: 외부 사용자 타입
- 승인된 JavaScript 원본: `https://전기짱도메인.vercel.app`
- 승인된 리디렉션 URI: `https://전기짱도메인.vercel.app/api/auth/callback/google`

### 카카오 OAuth
- 카카오 개발자 센터 → 앱 생성 (비즈 앱 전환 필요)
- 플랫폼 키 → Default REST API Key → Redirect URI 등록
- 플랫폼 키 → Default JS Key → JavaScript SDK 도메인 등록
- 동의항목: 닉네임(필수), 프로필 사진(필수), 이메일(필수 수집)
- **핵심: `client: { token_endpoint_auth_method: "client_secret_post" }` 설정 필수**

### 네이버 OAuth
- 네이버 개발자 센터 → 앱 생성
- 사용 API: 네이버 로그인
- 제공 정보: 회원이름(필수), 이메일(필수), 프로필 사진(추가)
- 서비스 URL: `https://전기짱도메인.vercel.app`
- Callback URL: `https://전기짱도메인.vercel.app/api/auth/callback/naver`

### Gmail SMTP (이메일 Magic Link 인증용)
- 발신 계정: cayson0127@gmail.com
- 사용자가 이메일 입력 → cayson0127@gmail.com에서 인증 링크 메일 발송 → 클릭 시 가입/로그인 완료
- 2단계 인증 활성화 필수
- 앱 비밀번호 생성 후 사용 (공백 제거)
- **주의: EMAIL_SERVER_USER와 앱 비밀번호 생성 계정이 반드시 일치해야 함**

### Cloudinary
- 무료 25GB 스토리지
- 이미지 URL로 자동 리사이즈/최적화 지원
- 부족해질 경우 AWS S3로 전환 가능
- 폴더 구조: `electric-jjang/questions/q_{question_code}.{ext}`

### 토스페이먼츠 (Toss Payments)
- 토스페이먼츠 개발자센터에서 API 키 발급
- **등급 정기결제 (빌링키)**: 월 자동 결제로 등급 유지
- **개별 콘텐츠 구매**: 즉시 결제로 특정 문제/동영상 구매
- Webhook으로 결제 결과 수신 → 자동 등급/구매 처리
- 테스트 키로 개발 후 라이브 키로 전환

### OpenRouter AI (유지)
- 모델: deepseek/deepseek-v3.2
- OpenAI 호환 API 형식 사용
- 주관식/서술형 AI 채점용

---

## 7. DB 스키마 (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── 사용자 ───

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  // 전기짱 전용 필드
  phone         String?
  studentId     String?   // 학번 (OFFICIAL 시험용)
  isAdmin       Boolean   @default(false)

  // 등급/결제
  tier          UserTier  @default(GUEST)
  tierExpiresAt DateTime? @map("tier_expires_at") // 등급 만료일 (결제일+30일)
  billingKey    String?   @map("billing_key")     // 토스페이먼츠 빌링키

  attempts          Attempt[]
  dailyBestScores   DailyBestScore[]
  payments          Payment[]
  purchasedContents PurchasedContent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// ─── NextAuth 필수 테이블 ───

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─── 등급/결제 ───

enum UserTier {
  GUEST
  BRONZE
  SILVER
  GOLD
  DIAMOND
}

model Payment {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  paymentKey    String?  @unique @map("payment_key") // 토스페이먼츠 결제키
  orderId       String   @unique @map("order_id")
  amount        Int
  type          String   // SUBSCRIPTION(정기결제) / ONE_TIME(개별구매)
  tier          UserTier? // 정기결제 시 해당 등급
  status        String   // READY / DONE / CANCELED / FAILED
  paidAt        DateTime? @map("paid_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")

  @@map("payments")
}

model PurchasedContent {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  contentType String   @map("content_type") // EXAM / VIDEO
  contentId   Int      @map("content_id")   // examId 또는 videoId
  purchasedAt DateTime @default(now()) @map("purchased_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, contentType, contentId])
  @@map("purchased_contents")
}

// ─── 동영상 강의 ───

model Video {
  id           Int      @id @default(autoincrement())
  title        String
  description  String?  @db.Text
  videoUrl     String   @map("video_url")  // 유튜브 등 외부 링크
  thumbnailUrl String?  @map("thumbnail_url")
  minTier      UserTier @default(GUEST) @map("min_tier") // 최소 필요 등급
  price        Int?     // 개별 구매 가격 (null이면 개별 구매 불가)
  examId       Int?     @map("exam_id")    // 관련 시험 (nullable)
  sortOrder    Int      @default(0) @map("sort_order")
  isActive     Boolean  @default(true) @map("is_active")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("videos")
}

// ─── 시험 카테고리 + 시험 ───

// 시험 카테고리 (전기기초, 전기기능사, 전기산업기사, 전기기사)
model ExamCategory {
  id          Int      @id @default(autoincrement())
  name        String   @unique // "전기기초", "전기기능사", "전기산업기사", "전기기사"
  description String?  @db.Text
  sortOrder   Int      @default(0) @map("sort_order")
  isActive    Boolean  @default(true) @map("is_active")

  exams Exam[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("exam_categories")
}

enum ExamMode {
  PRACTICE
  OFFICIAL
}

// 개별 시험 (무료, 2020년 1회차, 2020년 2회차, ... 2026년 1회차)
model Exam {
  id              Int          @id @default(autoincrement())
  categoryId      Int          @map("category_id") // 상위 카테고리
  name            String       // "무료", "2020년 1회차", "2024년 3회차" 등
  year            Int?         // 연도 (null이면 무료/연습)
  round           Int?         // 회차 1~4 (null이면 무료/연습)
  examMode        ExamMode     @default(PRACTICE) @map("exam_mode")
  password        String?      // OFFICIAL 모드 비밀번호
  durationMinutes Int          @default(60) @map("duration_minutes")
  isPublished     Boolean      @default(true) @map("is_published")
  creatorName     String?      @map("creator_name")
  creatorTitle    String?      @map("creator_title")
  sortOrder       Int          @default(0) @map("sort_order")
  minTier         UserTier     @default(GUEST) @map("min_tier") // 최소 필요 등급
  price           Int?         // 개별 구매 가격 (null이면 개별 구매 불가)

  category  ExamCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  subjects  Subject[]
  questions Question[]
  attempts  Attempt[]
  dailyBestScores       DailyBestScore[]
  dailyLeaderboardSnaps DailyLeaderboardSnapshot[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([categoryId, year, round]) // 같은 카테고리 내 연도+회차 중복 방지
  @@map("exams")
}

model Subject {
  id                  Int    @id @default(autoincrement())
  examId              Int    @map("exam_id")
  name                String
  questionsPerAttempt Int    @default(5) @map("questions_per_attempt")
  orderNo             Int    @default(0) @map("order_no")

  exam      Exam       @relation(fields: [examId], references: [id], onDelete: Cascade)
  questions Question[]
  subjectScores SubjectScore[]

  @@map("subjects")
}

// ─── 문제은행 ───

enum QuestionType {
  MULTIPLE_CHOICE
  SHORT_ANSWER
  ESSAY
}

model Question {
  id           Int          @id @default(autoincrement())
  questionCode String       @unique @map("question_code")
  examId       Int          @map("exam_id")
  subjectId    Int          @map("subject_id")
  questionType QuestionType @default(MULTIPLE_CHOICE) @map("question_type")
  questionText String       @map("question_text") @db.Text
  choice1      String?      @map("choice_1")
  choice2      String?      @map("choice_2")
  choice3      String?      @map("choice_3")
  choice4      String?      @map("choice_4")
  answer       Int?         // 정답 1~4 (객관식용) - 프론트 전송 금지
  answerText   String?      @map("answer_text") @db.Text // 주관식/서술형 참고 정답
  points       Int          @default(1)
  explanation  String?      @db.Text // 해설 (제출 후만 공개)
  imageUrl     String?      @map("image_url")
  isActive     Boolean      @default(true) @map("is_active")

  exam    Exam    @relation(fields: [examId], references: [id], onDelete: Cascade)
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  attemptQuestions AttemptQuestion[]
  attemptItems     AttemptItem[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([examId, subjectId, isActive])
  @@map("questions")
}

// ─── 시험 응시 ───

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  EXPIRED
}

enum GradingStatus {
  PENDING
  GRADING
  COMPLETED
}

model Attempt {
  id             Int           @id @default(autoincrement())
  userId         String        @map("user_id")
  examId         Int           @map("exam_id")
  status         AttemptStatus @default(IN_PROGRESS)
  gradingStatus  GradingStatus @default(PENDING) @map("grading_status")
  startedAt      DateTime      @default(now()) @map("started_at")
  expiresAt      DateTime      @map("expires_at")
  submittedAt    DateTime?     @map("submitted_at")
  totalQuestions Int           @map("total_questions")
  totalCorrect   Int?          @map("total_correct")
  totalScore     Int?          @map("total_score")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  exam Exam @relation(fields: [examId], references: [id], onDelete: Cascade)

  attemptQuestions AttemptQuestion[]
  attemptItems     AttemptItem[]
  subjectScores    SubjectScore[]
  dailyBestScore   DailyBestScore[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // 한 사람은 IN_PROGRESS 시험을 동시에 1개만
  // Prisma에서는 partial unique index 미지원 → 앱 레벨 + raw SQL로 처리
  @@index([userId, status])
  @@map("attempts")
}

model AttemptQuestion {
  attemptId  Int @map("attempt_id")
  seq        Int
  questionId Int @map("question_id")

  attempt  Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([attemptId, seq])
  @@unique([attemptId, questionId])
  @@map("attempt_questions")
}

enum ItemGradingStatus {
  PENDING
  AI_GRADED
  MANUAL_GRADED
}

model AttemptItem {
  attemptId     Int     @map("attempt_id")
  questionId    Int     @map("question_id")
  selected      Int?    // 1~4 (객관식)
  answerText    String? @map("answer_text") @db.Text // 주관식/서술형 답안
  isCorrect     Boolean? @map("is_correct")
  awardedPoints Int?    @map("awarded_points")
  gradingStatus ItemGradingStatus? @map("grading_status")
  aiFeedback    String? @map("ai_feedback") @db.Text

  attempt  Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([attemptId, questionId])
  @@map("attempt_items")
}

model SubjectScore {
  attemptId       Int @map("attempt_id")
  subjectId       Int @map("subject_id")
  subjectQuestions Int @map("subject_questions")
  subjectCorrect  Int @map("subject_correct")
  subjectScore    Int @map("subject_score")

  attempt Attempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@id([attemptId, subjectId])
  @@map("subject_scores")
}

// ─── 랭킹 ───

model DailyBestScore {
  kstDate       DateTime @map("kst_date") @db.Date
  examId        Int      @map("exam_id")
  userId        String   @map("user_id")
  bestScore     Int      @map("best_score")
  bestSubmittedAt DateTime @map("best_submitted_at")
  attemptId     Int      @map("attempt_id")

  exam    Exam    @relation(fields: [examId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  attempt Attempt @relation(fields: [attemptId], references: [id])

  @@id([kstDate, examId, userId])
  @@map("daily_best_scores")
}

model DailyLeaderboardSnapshot {
  kstDate        DateTime @map("kst_date") @db.Date
  examId         Int      @map("exam_id")
  rank           Int
  userId         String?  @map("user_id")
  userNameDisplay String  @map("user_name_display")
  score          Int
  submittedAt    DateTime @map("submitted_at")

  exam Exam @relation(fields: [examId], references: [id], onDelete: Cascade)

  @@id([kstDate, examId, rank])
  @@map("daily_leaderboard_snapshots")
}

// ─── 관리자 로그 ───

model AuditLog {
  id           Int      @id @default(autoincrement())
  adminUserId  String   @map("admin_user_id")
  actionType   String   @map("action_type")
  targetTable  String   @map("target_table")
  targetId     String?  @map("target_id")
  reason       String?
  changedFields Json?   @map("changed_fields")
  oldData      Json?    @map("old_data")
  newData      Json?    @map("new_data")
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("audit_logs")
}
```

### DB 보조 처리 (앱 레벨)

Supabase에서 DB 함수로 처리하던 것들을 앱 레벨로 이동:

```
- to_kst_date() → lib/utils.ts의 toKstDate() 함수
- now_kst() → lib/utils.ts의 nowKst() 함수
- is_prohibited_hour_kst() → lib/utils.ts의 isProhibitedHourKst() 함수
- IN_PROGRESS 유니크 제약 → raw SQL: CREATE UNIQUE INDEX idx_one_active ON attempts(user_id) WHERE status = 'IN_PROGRESS'
  (Prisma migration 후 prisma/migrations에 raw SQL 추가)
```

### 점수 공식
- 전체 점수: `Math.round(totalCorrect / totalQuestions * 100)`
- 과목 점수: `Math.round(subjectCorrect / subjectQuestions * 100)`

---

## 8. 페이지 구조

### 공개 페이지 (로그인 불필요)
| 경로 | 설명 |
|------|------|
| `/` | 홈 (히어로 섹션 + 시험 **카테고리** 카드 + 주요기능) |
| `/login` | 로그인 (Google / 카카오 / 네이버 / 이메일 Magic Link) |
| `/complete-profile` | 프로필 완성 (이름, 전화번호) |

### 보호 페이지 (로그인 필요)
| 경로 | 설명 |
|------|------|
| `/exam/[categoryId]` | 시험 목록 (무료 + 연도/회차별 기출문제 카드) |
| `/exam/[categoryId]/[examId]` | 시험 상세/시작 화면 |
| `/exam/attempt/[attemptId]` | 시험 진행 |
| `/exam/result/[attemptId]` | 결과 (점수/오답/해설) |
| `/my` | 마이페이지 (응시 기록, 최근 점수) |
| `/my/profile` | 프로필 수정 |
| `/my/wrong-answers` | 오답 노트 |
| `/my/membership` | 등급 관리 (현재 등급, 업그레이드, 결제 내역) |
| `/my/withdraw` | 회원 탈퇴 |
| `/videos` | 동영상 강의 목록 |
| `/videos/[videoId]` | 동영상 시청 (등급/구매 확인) |
| `/payment/success` | 결제 성공 리다이렉트 |
| `/payment/fail` | 결제 실패 리다이렉트 |

### 관리자 페이지 (관리자만)
| 경로 | 설명 |
|------|------|
| `/admin` | 관리자 대시보드 |
| `/admin/questions` | 문제 관리 (CRUD, 벌크 업로드) |
| `/admin/users` | 사용자 관리 |
| `/admin/official-exams` | 공식 시험 관리 |
| `/admin/official-exams/[examId]` | 공식 시험 편집 |
| `/admin/official-exams/[examId]/attempts/[attemptId]` | 주관식 수동 채점 |
| `/admin/videos` | 동영상 관리 (등록/수정/삭제/등급 설정) |
| `/admin/payments` | 결제 내역 조회 / 수동 등급 부여 |

---

## 9. API 설계

### 인증 (NextAuth 내장)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `*` | `/api/auth/[...nextauth]` | NextAuth 핸들러 (Google/카카오/네이버 콜백 포함) |
| `POST` | `/api/auth/complete-profile` | 프로필 완성 |

### 시험 카테고리/조회
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/exam-categories` | 카테고리 목록 (전기기초/기능사/산업기사/기사) |
| `GET` | `/api/exam-categories/[categoryId]/exams` | 카테고리 내 시험 목록 (무료 + 연도/회차별) |
| `GET` | `/api/exams/[examId]` | 시험 상세 |
| `GET` | `/api/exams/[examId]/subjects` | 과목 목록 + 문항 수 |
| `GET` | `/api/exams/[examId]/question-count` | 활성 문제 수 |

### 응시
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/attempts/start` | 시험 시작 (exam_id, password?) |
| `GET` | `/api/attempts/[attemptId]/paper` | 시험지 조회 (정답 제외) |
| `POST` | `/api/attempts/[attemptId]/answer` | 답안 저장 (자동 저장) |
| `POST` | `/api/attempts/[attemptId]/submit` | 제출/채점 |
| `POST` | `/api/attempts/[attemptId]/abandon` | 시험 포기 |
| `GET` | `/api/attempts/[attemptId]/result` | 결과 조회 |

### 계정/프로필
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/account/profile` | 프로필 조회 |
| `PUT` | `/api/account/profile` | 프로필 수정 (전화번호) |
| `POST` | `/api/account/withdraw` | 회원 탈퇴 |

### 홈/마이페이지
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/home/leaderboard` | 오늘/어제 Top5 + 내 순위 |
| `GET` | `/api/my/history` | 응시 기록 |
| `GET` | `/api/my/wrong-answers` | 오답 목록 |

### 관리자 - 문제
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/admin/questions` | 문제 목록 |
| `POST` | `/api/admin/questions` | 문제 생성 |
| `PATCH` | `/api/admin/questions/[id]` | 문제 수정 |
| `DELETE` | `/api/admin/questions/[id]` | 문제 삭제 |
| `POST` | `/api/admin/questions/bulk` | 벌크 업로드 |
| `POST` | `/api/admin/questions/check-code` | 코드 중복 확인 |
| `POST` | `/api/admin/questions/next-code` | 다음 코드 생성 |
| `POST` | `/api/admin/questions/duplicates` | 중복 문제 탐지 |

### 관리자 - 사용자
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/admin/users` | 사용자 목록 |
| `PATCH` | `/api/admin/users/[id]` | 사용자 수정 |
| `DELETE` | `/api/admin/users/[id]` | 사용자 삭제 |

### 관리자 - 공식 시험
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/admin/official-exams` | 목록 |
| `POST` | `/api/admin/official-exams` | 생성 |
| `PATCH` | `/api/admin/official-exams/[examId]` | 수정 (게시/비게시 토글) |
| `POST` | `/api/admin/official-exams/[examId]/results` | 결과/리더보드 |
| `POST` | `/api/admin/official-exams/[examId]/ai-grade` | AI 자동 채점 |
| `PATCH` | `/api/admin/official-exams/[examId]/attempts/[attemptId]/grade` | 수동 채점 |

### 관리자 - 설정
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/admin/exam-settings` | 시험 설정 조회 |
| `POST` | `/api/admin/exam-settings` | 시험 설정 수정 |
| `POST` | `/api/admin/reset-attempts` | 응시 기록 초기화 |

### 결제 (토스페이먼츠)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/payments/billing-key` | 빌링키 발급 (카드 등록) |
| `POST` | `/api/payments/subscribe` | 등급 정기결제 요청 |
| `POST` | `/api/payments/one-time` | 개별 콘텐츠 즉시 결제 |
| `POST` | `/api/payments/webhook` | 토스페이먼츠 Webhook 수신 |
| `GET` | `/api/payments/history` | 결제 내역 조회 |
| `POST` | `/api/payments/cancel-subscription` | 정기결제 해지 |

### 동영상 강의
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/videos` | 동영상 목록 (등급별 필터) |
| `GET` | `/api/videos/[videoId]` | 동영상 상세 (접근 권한 확인) |

### 관리자 - 동영상
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/admin/videos` | 동영상 관리 목록 |
| `POST` | `/api/admin/videos` | 동영상 등록 (링크 + 등급 설정) |
| `PATCH` | `/api/admin/videos/[id]` | 동영상 수정 |
| `DELETE` | `/api/admin/videos/[id]` | 동영상 삭제 |

### 이미지 업로드
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/upload/image` | Cloudinary에 문제 이미지 업로드 |

### 크론
| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/cron/snapshot-leaderboard` | 어제 Top5 스냅샷 생성 (매일) |

---

## 10. API 상세 로직

### 10-1) 시험 시작 - POST /api/attempts/start

```
입력: { examId, password? }
1. 로그인 확인 (NextAuth session)
2. IN_PROGRESS가 있는지 확인 (시험 종류 상관없이)
3. 있으면:
   - 만료 전이면 그 attemptId 반환 (이어풀기)
   - 만료면 EXPIRED 처리 + 답안 삭제 + 계속 진행
4. OFFICIAL 모드:
   - isPublished 체크 (비게시면 차단)
   - 비밀번호 검증
   - 학번 확인 (없으면 차단)
5. PRACTICE 모드:
   - 23:00~23:59(KST)이면 새 시험 생성 거절
6. 새 attempt 생성 (startedAt, expiresAt=+durationMinutes, status=IN_PROGRESS)
7. PRACTICE: 과목별 questionsPerAttempt만큼 랜덤 추출
   OFFICIAL: 전체 활성 문제 id순
8. attemptQuestions에 저장 → attemptId 반환
```

### 10-2) 시험지 조회 - GET /api/attempts/[attemptId]/paper
- attemptQuestions 기준으로 문제 가져옴
- **정답(answer) 절대 포함하지 않음**

### 10-3) 제출/채점 - POST /api/attempts/[attemptId]/submit

```
1. 내 것인지, IN_PROGRESS인지, 만료 전인지 확인
2. attemptQuestions에 있는 문제만 채점 (조작 방지)
3. attemptItems 저장 (isCorrect 확정)
4. subjectScores 계산/저장
5. totalCorrect / totalScore 계산/저장
6. SUBMITTED 처리 + submittedAt 기록
7. dailyBestScores upsert (오늘 KST 기준)
8. 결과 반환
```

### 10-4) 홈 랭킹 - GET /api/home/leaderboard?examId=...

```
반환:
- 오늘 Top5 (dailyBestScores)
- 어제 Top5 (dailyLeaderboardSnapshots)
- NEW/▲▼ 계산
- 로그인 시 내 순위 포함

NEW 규칙: 어제 Top5에 없었는데 오늘 Top5에 들어오면 NEW
```

### 10-5) 등급 정기결제 - POST /api/payments/subscribe

```
입력: { tier }
1. 로그인 확인
2. 빌링키 확인 (없으면 먼저 /api/payments/billing-key로 카드 등록)
3. 토스페이먼츠 빌링키 결제 API 호출 (금액: BRONZE=500, SILVER=1000, GOLD=3000, DIAMOND=5000)
4. 결제 성공 → User.tier 업데이트, tierExpiresAt = now + 30일
5. Payment 레코드 생성 (type=SUBSCRIPTION)
6. 결과 반환
```

### 10-6) 개별 콘텐츠 구매 - POST /api/payments/one-time

```
입력: { contentType, contentId } (EXAM 또는 VIDEO)
1. 로그인 확인
2. 이미 구매했는지 PurchasedContent 확인
3. 토스페이먼츠 즉시 결제 → 승인 API 호출
4. 성공 → PurchasedContent 레코드 생성
5. Payment 레코드 생성 (type=ONE_TIME)
```

### 10-7) 토스페이먼츠 Webhook - POST /api/payments/webhook

```
1. Webhook Signature 검증
2. 결제 상태 업데이트 (Payment.status)
3. 정기결제 성공 → tier, tierExpiresAt 갱신
4. 정기결제 실패 → 유예 후 GUEST로 다운그레이드
```

### 10-8) 콘텐츠 접근 권한 확인 로직

```
function canAccess(user, content):
  // 1. 등급 확인
  if user.tier >= content.minTier AND user.tierExpiresAt > now:
    return true
  // 2. 개별 구매 확인
  if PurchasedContent exists (userId, contentType, contentId):
    return true
  return false
```

### 10-10) 회원 탈퇴 - POST /api/account/withdraw

```
1. 본인 확인
2. dailyBestScores에서 해당 유저 레코드 삭제
3. dailyLeaderboardSnapshots 익명 처리 (userNameDisplay = "(탈퇴한 사용자)", userId = null)
4. 사용자 관련 데이터 삭제 (Cascade로 자동 처리)
5. User 레코드 삭제
```

---

## 11. 컴포넌트 구조

### 레이아웃/네비게이션
- `Header.tsx` - 상단 네비게이션 (로고, 테마 토글, 사용자 메뉴)
- `Footer.tsx` - 하단 푸터
- `HeroSection.tsx` - 홈 히어로 섹션 (전기 파티클 애니메이션, 랭킹 없이 타이틀만 표시)

### 인증
- `AuthProvider.tsx` - NextAuth SessionProvider 래퍼 (Supabase AuthListener 대체)
- `ThemeProvider.tsx` - next-themes 다크모드
- `ThemeToggle.tsx` - 다크/라이트 토글

### 시험
- `CategoryCards.tsx` - 홈 카테고리 카드 (전기기초/기능사/산업기사/기사)
- `ExamCards.tsx` - 카테고리 내 시험 카드 목록 (무료 + 연도/회차별, 등급 표시)

- `ExamPaperPrint.ts` - 시험지 인쇄

### 랭킹
- `Leaderboard.tsx` - 전체 리더보드 (홈 랭킹 표시는 제거됨)

### 문제 관리 (관리자)
- `QuestionSplitEditor.tsx` - 단일 문제 편집기
- `BulkUploadSplitEditor.tsx` - 벌크 업로드
- `DuplicateQuestionsSection.tsx` - 중복 문제 탐지
- `ExamSettingsSection.tsx` - 시험 설정
- `ResetAttemptsSection.tsx` - 응시 초기화

### 공통
- `MathText.tsx` - KaTeX 수식 렌더러
- `ConfirmDialog.tsx` - 확인 모달

---

## 12. lib/ 구조 (리뉴얼 후)

```
lib/
├── prisma.ts          # Prisma Client 싱글톤
├── auth.ts            # NextAuth 설정 (Google/카카오/네이버/Email Magic Link provider)
├── auth-helpers.ts    # getServerSession 래퍼, 권한 체크 유틸
├── cloudinary.ts      # Cloudinary 업로드/삭제 유틸
├── toss-payments.ts   # 토스페이먼츠 API (빌링키, 결제 승인, 정기결제)
├── openrouter.ts      # OpenRouter AI 채점 (유지)
├── utils.ts           # toKstDate, nowKst, isProhibitedHourKst 등
└── question-code-mapping.ts  # 문제 코드 매핑 (유지)
```

---

## 13. Middleware (리뉴얼 후)

NextAuth 기반 경량 미들웨어:

```
공개 경로 (통과):
- /, /login, /complete-profile
- /api/auth/*, /api/home/*, /api/exams/*, /api/cron/*, /api/payments/webhook

보호 경로 (세션 필요):
- /exam/*, /my/*, /admin/*
- /api/attempts/*, /api/account/*, /api/my/*, /api/admin/*

관리자 경로 (isAdmin 필요):
- /admin/*
- /api/admin/*

주의: middleware에서 Prisma import 금지 (Edge Function 크기 초과 E-003)
→ NextAuth JWT 토큰의 세션 정보만 사용
```

---

## 14. EXPIRED(만료) 처리 정책

### 만료 시점
- startedAt + durationMinutes가 지나면 만료

### 만료된 시험 처리
- 마이페이지에 "미제출(시간초과)" 표시
- **답안 삭제**: attemptItems, subjectScores 삭제
- **시험지 유지**: attemptQuestions는 보존 (분석용)
- **기록 유지**: attempt는 남기고 status를 EXPIRED로 변경

---

## 15. 탈퇴 정책

### 오늘 랭킹 (dailyBestScores)
- 탈퇴 즉시 삭제 → 오늘 Top5에서 제외

### 어제 스냅샷 (dailyLeaderboardSnapshots)
- 통계 목적으로 유지
- 익명 처리: `userNameDisplay = "(탈퇴한 사용자)"`, `userId = null`

### 개인정보
- User + 연관 데이터 전부 삭제 (Prisma Cascade)

---

## 16. 이미지 저장/매칭 규칙

- Cloudinary 경로: `electric-jjang/questions/q_{questionCode}.{ext}`
- 확장자: png, jpg, jpeg
- DB 저장: `questions.imageUrl` (Cloudinary 공개 URL)
- 매칭 실패 시: 문제는 저장되지만 `imageUrl = null`
- 관리자: images.zip 업로드 → questionCode로 매칭 → imageUrl 업데이트

---

## 17. 이전에 발생한 에러 및 대응 (참고용)

| 코드 | 내용 | 대응 |
|------|------|------|
| E-001 | NextAuth token.id 타입 에러 | `token.id as string` 타입 단언 |
| E-002 | Script onLoad 서버 컴포넌트 에러 | 클라이언트 컴포넌트 분리 |
| E-003 | Vercel Edge Function 1MB 초과 | **미들웨어에서 Prisma/bcrypt import 금지**, 쿠키 기반 경량 처리 |
| E-004 | DYNAMIC_SERVER_USAGE 에러 | `export const dynamic = "force-dynamic"` |
| E-005 | OG 이미지 edge runtime 경고 | `dynamic = "force-dynamic"` |
| E-006 | Google OAuth redirect_uri_mismatch | 배포 URL을 Cloud Console에 등록 |
| E-007 | 카카오 KOE006 앱 설정 오류 | Redirect URI에 배포 URL 추가 |
| E-008 | 네이버 OAuth 로그인 실패 | Callback URL에 배포 URL 추가 |
| E-009 | **카카오 OAuth 토큰 교환 실패** | **`client_secret_post` 필수 설정** |
| E-010 | Gemini API 429 할당량 초과 | OpenRouter로 전환 완료 |
| E-011 | Gemini 404 모델 미지원 | OpenRouter로 전환 완료 |
| E-012 | Vercel 배포 캐시 미반영 | Redeploy 시 Build Cache 해제 |
| E-013 | Gmail SMTP 인증 실패 | 발신 계정과 앱 비밀번호 계정 통일 |
| E-014 | 카카오톡 공유 4019 에러 | JS SDK 도메인 + 웹 도메인 두 곳 등록 |

---

## 18. 개발 순서

### Phase 1: 기반 세팅
1. 패키지 설치 (`prisma`, `@prisma/client`, `next-auth`, `cloudinary`, `@tosspayments/payment-widget-sdk` 등)
2. Supabase 패키지 제거 (`@supabase/ssr`, `@supabase/supabase-js`)
3. Prisma 스키마 작성 + Neon DB 연결 + `npx prisma db push`
4. partial unique index 추가 (raw SQL)
5. NextAuth 설정 (Google / 카카오 / 네이버 / Email Magic Link provider)
6. Prisma Client 싱글톤 (`lib/prisma.ts`)
7. 유틸 함수 이동 (`lib/utils.ts` - KST 날짜 등)

### Phase 2: 인증/미들웨어
8. NextAuth API 라우트 (`/api/auth/[...nextauth]`) — Google, 카카오, 네이버, Email provider
9. middleware.ts 교체 (NextAuth 세션 기반)
10. AuthProvider 컴포넌트 (SessionProvider)
11. 로그인 페이지 교체 (소셜 3종 + 이메일 입력 폼)
12. 프로필 완성 페이지 교체

### Phase 3: 핵심 API 교체
13. 시험 조회 API (Prisma 쿼리로 교체)
14. 응시 API (start / paper / answer / submit / result)
15. 랭킹 API (leaderboard)
16. 마이페이지 API (history / wrong-answers)
17. 계정 API (profile / withdraw)

### Phase 4: 관리자 API 교체
18. 문제 관리 API
19. 사용자 관리 API
20. 공식 시험 관리 API
21. 이미지 업로드 API (Cloudinary로 교체)
22. 크론 API

### Phase 5: 결제/등급/동영상
23. 토스페이먼츠 연동 (`lib/toss-payments.ts`)
24. 결제 API (빌링키 / 정기결제 / 개별구매 / Webhook)
25. 등급 관리 페이지 (`/my/membership`)
26. 동영상 강의 API + 페이지 (`/videos`)
27. 관리자 동영상/결제 관리 페이지
28. 시험/동영상에 등급 접근 제한 적용

### Phase 6: 프론트 교체
29. Header/Footer에서 Supabase auth 제거 → NextAuth useSession
30. 시험 관련 페이지 API 호출 수정 + 등급 표시
31. 마이페이지 API 호출 수정
32. 관리자 페이지 API 호출 수정

### Phase 7: 정리/테스트
33. Supabase 관련 코드 전부 삭제 (`lib/supabase/`, `types/database.ts`)
34. `.env.local` 정리
35. 통합 테스트
    - 로그인 4종 (Google / 카카오 / 네이버 / 이메일 Magic Link)
    - 시험 시작 연타 → IN_PROGRESS 1개
    - 23:30 새 시험 생성 불가, 이어하기 가능
    - 만료 처리 + 답안 삭제 + 마이페이지 표시
    - 이미지 업로드 (Cloudinary)
    - 탈퇴 → 랭킹 제외 + 스냅샷 익명화
    - 토스페이먼츠 정기결제 → 등급 업그레이드 → 만료 → 다운그레이드
    - 개별 콘텐츠 구매 → 즉시 접근 가능
    - 등급 미달 시 시험/동영상 접근 차단 + 안내 표시
36. Vercel 배포 + OAuth 리다이렉트 URL 최종 등록

---

## 19. 데이터 마이그레이션

### 기존 데이터 (Supabase → Neon)
- `exams`, `subjects`: 수동 시드 또는 SQL export/import
- `questions`: CSV/JSON export → Prisma seed 스크립트
- `profiles`: NextAuth 첫 로그인 시 자동 생성 (기존 사용자는 재가입)
- `attempts`, `daily_*`: 리셋 (신규 시작)

### 문제 이미지 (Supabase Storage → Cloudinary)
- Supabase Storage에서 이미지 다운로드
- Cloudinary에 재업로드
- DB의 imageUrl 업데이트
