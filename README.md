# 전기짱 - 전기 자격시험 CBT

전기 자격시험 문제를 풀고, 서버가 채점해서 점수와 랭킹을 보여주는 온라인 모의고사 플랫폼

## 시작하기

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일을 생성하고 필요한 정보를 입력하세요:
```env
DATABASE_URL=your-neon-database-url
NEXTAUTH_SECRET=your-nextauth-secret
CRON_SECRET=your-cron-secret
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=deepseek/deepseek-v3.2
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 주요 기능

- 소셜 로그인 (Google, Kakao)
- 랜덤 문제 출제 (시작 순간 고정)
- 서버 사이드 채점 (보안)
- 시간 제한 시험 (관리자 설정)
- 실시간 랭킹 (오늘/어제 Top5)
- KST 기준 일별 집계
- 공식 시험 (비밀번호, 이탈 감지)
- 주관식/서술형 문제 + AI 자동 채점
- 인터랙티브 대문 (전기 파티클 애니메이션)

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon (PostgreSQL)
- **ORM**: Prisma
- **Auth**: NextAuth v5 (Google, Kakao OAuth)
- **Storage**: Cloudinary
- **AI**: OpenRouter API

## 문서

- [CLAUDE.md](./CLAUDE.md) - 프로젝트 상세 가이드
- [CURRENT_STATE.md](./CURRENT_STATE.md) - 개발 진행 상태

## 개발 명령어

```bash
npm run dev      # 개발 서버 (Turbopack)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
```

## 라이선스

Private
