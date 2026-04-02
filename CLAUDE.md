# 전기짱 - 전기 자격시험 CBT 시스템

## 프로젝트 개요
전기 자격시험 문제를 풀고, 서버가 채점해서 점수와 랭킹을 보여주는 CBT(Computer Based Test) 사이트

## 기술 스택
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google, Kakao 소셜 로그인)
- **Storage**: Supabase Storage (문제 이미지)
- **AI**: OpenRouter API (주관식/서술형 자동 채점)

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
1. 로그인 페이지에서 Google 또는 Kakao 소셜 로그인
2. Supabase OAuth → 콜백에서 프로필 존재 여부 확인
3. 프로필 없음 → `/complete-profile` (추가정보기입: 이름, 전화번호, 개인정보 동의)
4. 프로필 있음 → 홈으로 이동

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
  HeroSection.tsx - 대문 인터랙티브 파티클 애니메이션
  Leaderboard.tsx - 랭킹 (10초 폴링)
  ExamCards.tsx   - 시험 카드 목록 (10초 폴링)
/lib
  /supabase       - Supabase 클라이언트 (client, server, admin)
  openrouter.ts   - OpenRouter AI 채점 (주관식/서술형)
/types            - TypeScript 타입 정의
/public/fonts     - 커스텀 폰트 (따악단단 등)
```

## DB 테이블 요약

1. **profiles** - 회원 정보 (name, phone, is_admin)
2. **exams** - 시험 종류 (기능사/산업기사/기사, exam_mode: PRACTICE/OFFICIAL, is_published, sort_order)
3. **subjects** - 과목 설정 (과목당 문항 수 포함)
4. **questions** - 문제 은행 (정답 포함, 프론트 노출 금지, question_type, points, answer_text)
5. **attempts** - 시험 응시 기록 (grading_status: PENDING/GRADING/COMPLETED)
6. **attempt_questions** - 시험지 스냅샷 (문제 순서)
7. **attempt_items** - 학생 답안 (answer_text, awarded_points, grading_status, ai_feedback)
8. **subject_scores** - 과목별 점수
9. **daily_best_scores** - 오늘 랭킹
10. **daily_leaderboard_snapshots** - 어제 Top5 스냅샷
11. **audit_logs** - 관리자 변경 이력

## 개발 가이드

### 환경 변수 설정
`.env.local` 파일 생성 (`.env.example` 참조):
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
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

## 참고 문서
- `prd.md` - 전체 요구사항 명세서
- `CURRENT_STATE.md` - 현재 개발 진행 상태
