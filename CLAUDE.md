# CAYSON - 전기 자격시험 CBT 시스템

## 프로젝트 개요
전기 자격시험 문제를 풀고, 서버가 채점해서 점수와 랭킹을 보여주는 CBT(Computer Based Test) 사이트

## 기술 스택
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (Singapore region) + Prisma 7 (PrismaPg adapter)
- **Auth**: NextAuth v5 (JWT 전략, PrismaAdapter)
  - Google / Kakao / Naver OAuth
  - 이메일+비밀번호 로그인 (Credentials provider, bcryptjs)
  - 이메일 매직링크 (Nodemailer, 회원가입 인증용)
- **Storage**: Cloudinary (문제 이미지, cloud_name: dwulm3bd0)
- **AI**: OpenRouter API (주관식/서술형 자동 채점)
- **배포**: Vercel

## 핵심 규칙 (절대 준수)

### 1. 시험지는 시작 순간 고정
- 시험 시작 버튼 누르는 순간 서버가 문제를 랜덤으로 뽑음
- 그 목록/순서를 DB(`attempt_questions`)에 저장해서 "시험지 스냅샷" 생성
- 새로고침/재접속해도 문제와 순서가 절대 안 바뀜

### 2. 채점/점수 계산은 서버만
- 브라우저에서 점수 계산 금지 (조작 방지)
- 제출 시 서버가 정답과 비교해서 채점
- **정답(answer)은 프론트로 절대 내려보내지 않음**

### 3. 랭킹은 한국 시간(KST) 기준
- 오늘 랭킹: KST 오늘 날짜 데이터만 집계
- 밤 12시(00:00 KST) 지나면 새로운 "오늘 랭킹" 시작

### 4. 공식시험은 합격/불합격 판정 없음
- 공식시험(OFFICIAL)에서는 점수만 표시하고 합격/불합격 판단 없음
- 시험 시작 안내에서 "합격 기준" 문구 숨김
- 연습시험(PRACTICE)만 60점 기준 합격/불합격 표시

### 5. 10분 무활동 자동 로그아웃
- 로그인 상태에서 마우스/키보드/터치/스크롤 없이 10분 경과 시 자동 로그아웃
- 9분 경과 시 1분 카운트다운 경고 모달 표시
- 시험 풀이 중(`/exam/attempt/...`)에는 비활성화 (시험 방해 방지)

## 운영 규칙

### A. 23:00~23:59(KST) 신규 시험 시작 금지
- 이 시간에는 새 시험지를 만들 수 없음

### B. 시험 시간 제한 (관리자 설정)
- `started_at`부터 설정된 시간 안에 제출해야 함
- 시간 초과 시 자동 만료(EXPIRED)

### C. 시험 중단 시 기록 삭제
- 시험 도중 나가면 해당 시험 기록(attempt, 답안, 점수)이 완전 삭제됨
- 새 시험 시작 시 기존 IN_PROGRESS 시험도 자동 삭제

## 인증 플로우

### 소셜 로그인 (Google/Kakao/Naver)
1. 로그인 페이지에서 소셜 로그인 버튼 클릭
2. NextAuth OAuth → 콜백에서 프로필 존재 여부 확인
3. 프로필 없음 → `/complete-profile` (추가정보기입: 아이디, 전화번호, 개인정보 동의)
4. 프로필 있음 → 홈으로 이동

### 이메일+비밀번호 회원가입
1. 로그인 페이지에서 "회원가입" 모드 전환
2. 이메일 + 비밀번호(6자 이상) 입력 → `/api/auth/signup` (bcrypt 해시 저장)
3. Nodemailer로 인증 메일 발송 → 사용자가 링크 클릭
4. emailVerified 설정 → `/complete-profile` (아이디, 전화번호)
5. 다음 로그인: 이메일 + 비밀번호 → Credentials provider → 즉시 로그인

### 비밀번호 찾기
1. `/forgot-password` → 이메일 입력 → HMAC-SHA256 토큰 생성 (1시간 만료)
2. 재설정 링크 메일 발송 → `/reset-password?token=xxx`
3. 새 비밀번호 입력 → 토큰 검증 (timingSafeEqual) → 비밀번호 변경

### 이메일 찾기
1. `/find-email` → 전화번호 입력
2. DB에서 전화번호로 조회 → 마스킹된 이메일 표시 (ca****@gmail.com)

## 프로젝트 구조

```
/app              - Next.js App Router
  /api            - API Routes
    /auth         - 인증 (콜백, 로그아웃, 추가정보기입)
    /account      - 프로필, 탈퇴
    /admin        - 문제/회원/공식시험 관리 (관리자 전용)
    /attempts     - 시험 시작/풀이/제출/중단
    /exams        - 시험/과목 조회
    /home         - 리더보드
    /my           - 응시기록/오답노트
    /upload       - 이미지 업로드
    /cron         - 리더보드 스냅샷 (Vercel Cron)
  /(auth)         - 인증 페이지 (로그인, 추가정보기입)
  /admin          - 관리자 페이지 (문제관리, 회원관리, 공식시험관리)
  /exam           - 시험 관련 페이지 (시작, 풀이, 결과)
  /my             - 마이페이지 (기록, 프로필, 오답노트, 탈퇴)
/components       - 재사용 컴포넌트
  HeroSection.tsx       - 대문 인터랙티브 파티클 애니메이션
  Header/Footer.tsx     - 레이아웃
  LandingContent.tsx    - 랜딩 과정별 CBT/합격수기 섹션
  WhySection.tsx        - WHY 섹션 (ScrollReveal/CountUp/TypeWriter)
  ScrollReveal.tsx      - 스크롤 인터랙션 + CountUp/TypeWriter named export
  InactivityGuard.tsx   - 10분 무활동 자동 로그아웃 (1분 전 경고)
  ProgressBar.tsx       - 유튜브 스타일 상단 프로그레스 바 + useProgress hook
  CertifiedBanner.tsx   - 인증 배너
  PremiumSection.tsx    - 프리미엄 멤버십 안내
  MathText.tsx          - 수학 표기 렌더 (KaTeX)
  QuestionSplitEditor.tsx - 문제 편집 분할 뷰 (lazy loaded)
  BulkUploadSplitEditor.tsx - 일괄 업로드 (lazy loaded)
  admin/                 - 관리자 전용 (OfficialExamsClient, OfficialExamDetailClient, AttemptDetailClient)
/lib
  /generated      - Prisma 생성 파일
  auth.ts         - NextAuth v5 설정 (OAuth 4종 + Credentials + Magic Link)
  prisma.ts       - Prisma 7 (PrismaPg adapter)
  cloudinary.ts   - Cloudinary 이미지 업로드
  openrouter.ts   - OpenRouter AI 채점 (주관식/서술형)
  tier.ts         - 등급 권한 유틸 (tierLevel, hasTierAccess)
  question-code-mapping.ts - 문제코드 생성 유틸
/types            - TypeScript 타입 정의
/public/fonts     - 커스텀 폰트 (따악단단 등)
```

## DB 테이블 요약

1. **users** - 회원 정보 (name, nickname, phone, email, is_admin, tier, tier_expires_at)
   - UserTier enum: `FREE | BRONZE | SILVER | GOLD | PREMIUM | ADMIN`
2. **exams** - 시험 종류 (기능사/산업기사/기사, exam_mode: PRACTICE/OFFICIAL, is_published, sort_order, min_tier)
3. **exam_categories** - 시험 카테고리 (grade, is_active, sort_order)
4. **subjects** - 과목 설정 (과목당 문항 수 포함)
5. **questions** - 문제 은행 (정답 포함, 프론트 노출 금지)
   - 필드: question_type, points, answer, answer_text, **answer_text_image** (참고정답 이미지), explanation, **explanation_image** (해설 이미지), image_url, choice_N_image
   - 기본 배점: 공식시험 10점, 연습시험 1점
6. **attempts** - 시험 응시 기록 (grading_status: PENDING/GRADING/COMPLETED)
7. **attempt_questions** - 시험지 스냅샷 (문제 순서)
8. **attempt_items** - 학생 답안 (selected, answer_text, **answer_image** (수험자 답안 이미지), awarded_points, grading_status, ai_feedback)
9. **subject_scores** - 과목별 점수
10. **daily_best_scores** - 오늘 랭킹
11. **daily_leaderboard_snapshots** - 어제 Top5 스냅샷
12. **site_settings** - 관리자 설정 (랜딩 카드 숨김 목록 등, key-value JSON)
13. **wrong_note_items** - 오답 노트 (userId × questionId)
14. **audit_logs** - 관리자 변경 이력

## 개발 가이드

### 환경 변수 설정
`.env.local` 파일 생성 (`.env.example` 참조):
```env
DATABASE_URL=your-neon-database-url
NEXTAUTH_SECRET=your-nextauth-secret
CRON_SECRET=your-cron-secret
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=deepseek/deepseek-v3.2
```

### 로컬 개발 서버 실행
```bash
npm install
npm run dev
```

### 코딩 원칙
- 최소 변경(minimal changes) 원칙
- 기존 로직 유지하며 개선 (rewrite 지양, refactor 중심)
- 요청하지 않은 파일 수정 금지
- 큰 변경은 계획(plan) 먼저 제시

### 렌더링/캐싱 전략
- **홈 / 등급 / 카테고리 / 시험목록 페이지**: `export const dynamic = 'force-dynamic'`
  - 관리자가 시험/문제 생성·삭제 시 즉시 반영되어야 해서 ISR 캐시 사용 안 함
  - unstable_cache도 제거됨
- **`next.config.ts`**: `staleTimes: { dynamic: 0, static: 0 }` — 클라이언트 라우터 캐시 사실상 비활성
- **API 변경 시**: 관련 경로에 `revalidatePath('/', 'layout')` 호출 + 클라이언트에서 `router.refresh()` 병행

## 문제 등록 프로세스 (시험 문제 추가 시 반드시 따를 것)

### 전체 흐름
```
1. 원본 파싱 → 2. 이미지 다운로드 → 3. OCR(텍스트 추출) → 4. 이미지 처리 → 5. DB 입력
```

### 1단계: 원본 파싱
- `.doc` 파일은 실제로 HTML임 (UTF-8 BOM + `<html>`)
- BeautifulSoup으로 파싱, 두 가지 HTML 구조 존재:
  - 구형: CSS 클래스 `qb/qh/qi/ch/ci/ab/cc`
  - 신형: `question-block/q-header/q-title-img/choices/choice/answer-box/correct-choice`
- 추출 항목: 문제 이미지 URL, 보기 1~4 이미지 URL, 정답 번호
- 참고 스크립트: `scripts/parse-exam-docs.py`

### 2단계: 이미지 다운로드
- 원본 이미지를 로컬에 다운로드 (`data/ocr-images/` 또는 `data/ocr-images-{년도-회차}/`)
- 네이밍: `{QUESTION_CODE}_{0-4}.png` (0=문제, 1-4=보기)
- 403 에러 시 → 규정 개정으로 무효화된 문제일 가능성 있음

### 3단계: OCR (텍스트 추출) ⭐ 중요
- **반드시 Claude 자체 비전(Read tool)으로 수행** — OpenRouter 등 외부 API 사용 금지
- 10개 병렬 에이전트로 배치 처리 (16개/에이전트)
- 각 에이전트가 이미지를 직접 읽고 텍스트 추출
- **수학 공식은 KaTeX 문법으로 변환:**
  - 인라인: `$수식$`
  - 행렬/큰 수식: `$$수식$$` (줄바꿈 포함)
  - `\begin{bmatrix}`, `\begin{cases}` 등은 반드시 `$$...$$`로 감싸기
  - **분수는 반드시 `\dfrac` 사용** (`\frac` 금지) — `\frac`은 인라인에서 너무 작게 렌더링됨
- **[그림]** 표시: 텍스트로 표현 불가능한 도표/회로도/그래프가 있으면 `[그림]` 삽입
- 출력: JSON `{"code":"...", "q":"문제텍스트", "c1":"보기1", "c2":"보기2", "c3":"보기3", "c4":"보기4"}`

### 4단계: 이미지 처리 ⭐⭐ 가장 중요
**원칙: 텍스트만 있는 문제는 이미지 불필요, 그림이 있는 문제만 그림 부분을 Cloudinary에 업로드**

#### 텍스트만 있는 문제 (이미지 불필요)
- `image_url` = NULL
- `choice_N_image` = NULL
- 텍스트는 `question_text`, `choice_1`~`choice_4`에 저장

#### [그림]이 있는 문제 (이미지 필요)
1. **원본 이미지 다운로드** (engineerlab 등 외부 소스)
2. **텍스트 부분 제거, 그림만 크롭** — 핵심!
   - 원본 이미지 = 텍스트(위) + 그림(아래)
   - 텍스트는 이미 `question_text`에 OCR로 들어가 있으므로 이미지에서 제거
   - **자동 크롭은 정확도가 낮음** → Agent 비전으로 정확한 크롭 좌표 결정
3. **Agent 비전 크롭 방법:**
   - 10개 에이전트 병렬 실행 (16개/에이전트)
   - 각 에이전트가 이미지를 Read tool로 직접 보고 `crop_y` (그림 시작 Y좌표) 반환
   - 텍스트와 그림이 겹치는 경우 `crop_y = 0` (전체 이미지 유지)
   - PIL로 `img.crop((0, crop_y, width, height))` 실행
4. **Cloudinary 업로드** (크롭된 이미지)
   - `public_id`: `electric-jjang/questions/{QUESTION_CODE}_q`
   - 반환된 `secure_url`을 DB `image_url`에 저장
5. **보기 이미지도 동일 처리**
   - 보기에 [그림]이 있으면 해당 보기 이미지를 Cloudinary에 업로드
   - `public_id`: `electric-jjang/questions/{QUESTION_CODE}_c{N}`
   - `choice_N_image`에 URL 저장

#### ❌ 절대 하면 안 되는 것
- **engineerlab.co.kr 등 외부 URL을 직접 DB에 저장** → 앱에서 안 보임
- **이미지를 그레이스케일로 변환** → 색상 손실
- **자동 크롭만으로 처리** → 텍스트 잔존 또는 그림 잘림 발생
- **텍스트만 있는 문제에 이미지 URL 넣기** → 불필요
- **분수에 `\frac` 사용** → 인라인에서 너무 작게 보임. 반드시 `\dfrac` 사용

### 5단계: DB 입력
- `questions` 테이블에 INSERT/UPDATE
- 필수 컬럼: `question_code`, `exam_id`, `subject_id`, `question_type`, `question_text`, `choice_1`~`choice_4`, `answer`, `points`, `image_url`(있으면)
- `question_type`: 'MULTIPLE_CHOICE'
- `points`: 공식시험 10점, 연습시험 1점 (기본값 — API에서 exam.examMode 보고 자동 결정)
- `is_active`: true (규정 개정 문제도 일단 올림)

### "공통" 과목 처리
- 일부 시험(예: 2025년 2회)은 5과목이 아닌 "공통 100문제"로 출제됨
- 이 경우 **각 문제를 내용에 따라 5과목으로 분류**하여 DB에 넣어야 함
- 과목 분류는 OCR 시 에이전트가 함께 수행
- 5과목: 전기자기학(EM), 전력공학(PC), 전기기기(MA), 회로이론 및 제어공학(CC), 전기설비기술기준(EL)
- 각 과목 20문제씩 균등 배분 확인

### Cloudinary 설정
```
CLOUDINARY_CLOUD_NAME=dwulm3bd0
CLOUDINARY_API_KEY=225368121665588
CLOUDINARY_API_SECRET=P1HI0k-tz5-guQFTr5Zw6UVVgWg
```

### 프론트엔드 이미지 표시 규격
- 문제 이미지: `max-w-sm max-h-[280px] w-auto h-auto rounded border border-gray-200`
- 보기 이미지: `inline-block max-h-16 align-middle`
- 적용 파일: `ExamAttemptClient.tsx`, `ExamResultContent.tsx`

### 관련 스크립트 목록
| 스크립트 | 용도 |
|----------|------|
| `scripts/parse-exam-docs.py` | .doc(HTML) 파싱 → JSON |
| `scripts/parse-2025-2.py` | HTML 파싱 + 이미지 다운로드 |
| `scripts/precise-crop-upload.py` | Agent 크롭 좌표로 정밀 크롭 + Cloudinary 업로드 |
| `scripts/insert-2025-2.py` | 2025년 2회 DB 입력 (공통→5과목 분류) |
| `scripts/update-db-ocr.py` | OCR 결과를 DB에 반영 |
| `scripts/fix-frac-display.py` | 보기의 `\frac` → `\dfrac` 일괄 변환 |
| `scripts/update-review-xlsx.py` | 문제 검토 오류목록 Excel 생성 (2018~2025 통합) |

## 문제 검토 현황 (2026-04-06)
- 전체 2,100문제 AI 검토 완료 → `data/전기기사_문제검토_오류목록.xlsx`
- 정답 오류 41건 / 규정 변경 2건 / OCR·텍스트 오류 15건 (총 58건)
- OCR 오류 3건 DB 수정 완료 (CC-381, CC-394, CC-399)
- 정답 오류 41건 DB 미수정 (Excel 조치사항 참조)
- 관련 스크립트: `scripts/update-review-xlsx.py`

## 참고 문서
- `prd.md` - 전체 요구사항 명세서
- `CURRENT_STATE.md` - 현재 개발 진행 상태
- `QUESTION_CODE_MAPPING.md` - 문제 코드 체계
- `data/전기기사_문제검토_오류목록.xlsx` - 문제 검토 오류 목록 (통합)
