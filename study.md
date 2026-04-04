# 전기짱 개발 스터디 노트

## 1. 전체 구조 이해하기 (식당 비유)

전기짱 웹사이트를 만드는 건 **식당 하나 차리는 것**과 같다.

| 역할 | 기술 | 비유 |
|------|------|------|
| **Neon** | 데이터베이스 | **냉장고** — 회원정보, 문제, 시험기록 등 모든 데이터를 보관하는 곳 |
| **Prisma** | ORM (DB 통역사) | **주방장** — 냉장고에서 재료 꺼내고 넣을 때 쉽게 해주는 도구. SQL을 직접 안 써도 됨 |
| **NextAuth** | 인증 시스템 | **출입문 + 신분증 확인** — 누가 로그인했는지, 관리자인지 확인 |
| **Next.js** | 웹 프레임워크 | **식당 건물 자체** — 화면도 보여주고 서버도 돌림 |
| **Vercel** | 배포/호스팅 | **건물 임대** — 인터넷에 식당을 오픈하는 곳 |
| **Cloudinary** | 이미지 저장 | **사진 보관함** — 문제에 첨부된 이미지 저장 |
| **토스페이먼츠** | 결제 | **카드 결제기** — 등급 구독/개별 구매 처리 |
| **OpenRouter** | AI 채점 | **채점 알바생** — 주관식/서술형 답안을 AI가 자동으로 채점해줌 |

---

## 2. 각 기술을 좀 더 자세히

### Neon (데이터베이스 = 냉장고)

**뭐하는 거?**
- 모든 데이터를 저장하는 곳
- 회원이 누구인지, 어떤 문제가 있는지, 누가 시험을 봤는지 등 전부 여기에 보관

**왜 Neon?**
- PostgreSQL이라는 세계적으로 가장 많이 쓰는 데이터베이스를 클라우드에서 무료로 쓸 수 있음
- Vercel과 한 번에 연동 가능
- 싱가포르 서버 선택 가능 → 한국에서 빠름

**비유 확장:**
- 냉장고 안에 칸이 나뉘어 있듯이, DB 안에도 **테이블**이라는 칸이 있음
- `users` 테이블 = 회원 정보 칸
- `questions` 테이블 = 문제 보관 칸
- `attempts` 테이블 = 시험 기록 칸

---

### Prisma (ORM = 주방장)

**뭐하는 거?**
- 데이터베이스(냉장고)에서 데이터를 꺼내고 넣는 걸 도와주는 도구
- 원래 데이터베이스와 대화하려면 SQL이라는 언어를 써야 하는데, Prisma가 대신 해줌

**SQL 직접 쓸 때 (어려움):**
```sql
SELECT * FROM users WHERE email = 'test@gmail.com';
```

**Prisma 쓸 때 (쉬움):**
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'test@gmail.com' }
});
```

**왜 좋은가?**
- TypeScript랑 같이 쓰면 **자동완성**이 됨 (오타 방지)
- 스키마(설계도) 하나 쓰면 DB 테이블 자동 생성
- SQL 몰라도 됨

**비유:**
- 냉장고(Neon)에 직접 손 넣어서 찾는 게 SQL
- 주방장(Prisma)한테 "계란 갖다줘" 하면 알아서 꺼내오는 게 ORM

---

### NextAuth (인증 = 출입문)

**뭐하는 거?**
- 로그인/회원가입을 처리하는 시스템
- "이 사람이 누구인지" 확인하는 것

**우리 프로젝트에서 지원하는 로그인 4가지:**
1. **Google 로그인** — 구글 계정으로 로그인
2. **카카오 로그인** — 카카오톡 계정으로 로그인
3. **네이버 로그인** — 네이버 계정으로 로그인
4. **이메일 인증 (Magic Link)** — 이메일 입력 → 인증 링크 메일 발송 → 클릭하면 로그인

**비유:**
- 식당 출입문에 경비원이 있다고 생각
- 경비원(NextAuth)이 "신분증(구글/카카오/네이버 계정) 보여주세요" 하고 확인
- 확인되면 입장 허가 (세션 발급)
- 로그아웃하면 퇴장

**왜 NextAuth?**
- 카카오/네이버 로그인을 쉽게 붙일 수 있음
- 이전에 Supabase Auth를 썼는데, 카카오/네이버 지원이 제한적이어서 교체

---

### Next.js (웹 프레임워크 = 식당 건물)

**뭐하는 거?**
- 웹사이트 자체를 만드는 프레임워크
- 화면(프론트엔드)도 만들고, 서버(백엔드, API)도 만드는 **올인원 도구**

**비유:**
- React만 쓰면 = 텐트에서 장사하는 것 (프론트만 가능)
- Next.js 쓰면 = 제대로 된 건물에서 장사 (프론트 + 백엔드 + 주방 다 있음)

**주요 개념:**
- **App Router** — 폴더 구조로 페이지를 만듦 (`/app/page.tsx` = 홈페이지)
- **API Routes** — 서버 기능을 폴더로 만듦 (`/app/api/...` = 서버 API)
- **Server Components** — 서버에서 미리 렌더링해서 빠르게 보여줌

---

### Vercel (배포 = 건물 임대)

**뭐하는 거?**
- 만든 웹사이트를 인터넷에 공개하는 서비스
- GitHub에 코드 올리면 → 자동으로 빌드 → 자동으로 배포

**비유:**
- 건물(코드)을 지었으면 어딘가에 세워야 사람들이 찾아옴
- Vercel이 그 땅을 제공하고, 주소(도메인)도 붙여줌
- `www.mycbt.xyz` ← 이게 식당 주소

---

### Cloudinary (이미지 저장 = 사진 보관함)

**뭐하는 거?**
- 문제에 포함된 이미지(회로도, 그림 등)를 저장하는 곳
- 무료 25GB 저장 가능

**왜 별도 서비스?**
- 이미지는 용량이 크기 때문에 DB에 직접 넣으면 느려짐
- Cloudinary에 올리고, URL만 DB에 저장하는 방식

**비유:**
- 냉장고(DB)에 사진을 넣으면 자리가 없어짐
- 벽에 사진 걸어두고(Cloudinary), 냉장고엔 "벽 3번 위치에 사진 있음"이라고 메모(URL)만 적어둠

---

### 토스페이먼츠 (결제 = 카드 결제기)

**뭐하는 거?**
- 사용자가 등급(브론즈~다이아몬드)을 구매할 때 결제 처리
- 개별 문제나 동영상을 건당 구매할 때도 사용

**두 가지 결제 방식:**
1. **정기결제 (빌링키)** — 카드 한 번 등록하면 매월 자동 결제
2. **즉시결제** — 특정 콘텐츠 구매 시 바로 결제

---

## 3. 프로젝트 세팅 과정에서 배운 것

### .env.local 이란?
- **환경변수 파일** = 비밀번호 모음집
- DB 접속 정보, API 키 등 민감한 정보를 여기에 보관
- GitHub에 올라가면 안 됨 (`.gitignore`에 포함)
- 비유: 식당 금고. 열쇠(API 키)를 보관하는 곳

### `vercel env pull` 이란?
- Vercel 서버에 저장된 환경변수를 로컬(내 컴퓨터)로 다운로드하는 명령어
- Vercel에서 Neon DB를 연결하면 `DATABASE_URL`이 자동으로 설정됨
- 그걸 로컬에서 개발할 때도 쓸 수 있도록 가져오는 것

### `npx prisma db push` 란?
- Prisma 스키마(설계도)를 실제 데이터베이스에 반영하는 명령어
- 비유: 건축 도면(스키마)대로 실제 건물(DB 테이블)을 짓는 것
- 이 명령어 한 방으로 20개 테이블이 Neon DB에 생성됨

### `npx prisma generate` 란?
- Prisma Client(주방장의 도구)를 생성하는 명령어
- 이걸 해야 코드에서 `prisma.user.findMany()` 같은 걸 쓸 수 있음
- 스키마 변경할 때마다 다시 실행해야 함

---

## 4. 이전 기술 vs 새 기술 (왜 바꿨나?)

| 항목 | 이전 (v1) | 지금 (v2) | 바꾼 이유 |
|------|-----------|-----------|-----------|
| DB | Supabase | **Neon** | 카카오/네이버 로그인 제한 해결, 검증된 패턴 재사용 |
| ORM | Supabase SDK | **Prisma** | 타입 안전성, 자동완성, SQL 안 써도 됨 |
| 인증 | Supabase Auth | **NextAuth** | 카카오/네이버/이메일 로그인 네이티브 지원 |
| 이미지 | Supabase Storage | **Cloudinary** | 무료 25GB (Supabase는 1GB) |
| 결제 | 없었음 | **토스페이먼츠** | 등급제 + 개별 구매 기능 추가 |

---

## 5. Google OAuth 앱 만들기 (실전 가이드)

### OAuth가 뭔데?

**비유:** 놀이공원 입장권 시스템

- 우리 사이트(전기짱)에 직접 회원가입시키는 대신, 구글한테 "이 사람 누군지 확인 좀 해줘"라고 부탁하는 것
- 사용자는 구글 로그인 화면에서 "허용"을 누르면 → 구글이 우리한테 "이 사람은 홍길동이고 이메일은 xxx@gmail.com이야"라고 알려줌
- 우리는 비밀번호를 직접 관리 안 해도 됨 → 보안 걱정 줄어듦

**흐름도:**
```
사용자 → "구글로 로그인" 버튼 클릭
  → 구글 로그인 화면으로 이동
  → 사용자가 "허용" 클릭
  → 구글이 우리 서버로 "이 사람 정보야" 하고 보내줌 (callback)
  → 우리 서버가 회원 등록/로그인 처리
  → 사용자는 로그인된 상태로 돌아옴
```

### Client ID와 Client Secret이 뭔데?

- **Client ID** = 우리 식당의 **사업자등록번호** (공개해도 됨)
  - "나는 mycbt라는 앱이야"라고 구글에게 알려주는 용도
- **Client Secret** = 우리 식당의 **금고 비밀번호** (절대 공개하면 안 됨)
  - 구글이 "진짜 mycbt 맞아?"라고 확인할 때 쓰는 비밀 열쇠

### Redirect URI가 뭔데?

- 사용자가 구글에서 "허용" 누른 후 **돌아올 주소**
- 비유: "놀이공원(구글)에서 확인 끝나면 이 출구(URI)로 보내줘"
- 우리 프로젝트에서는:
  - 로컬 개발: `http://localhost:3000/api/auth/callback/google`
  - 실제 운영: `https://www.mycbt.xyz/api/auth/callback/google`

### 실제 생성 과정 (단계별)

**1단계: Google Cloud Console 접속**
- https://console.cloud.google.com 접속
- 구글 계정으로 로그인

**2단계: 프로젝트 생성**
- 상단 프로젝트 선택 드롭다운 → "새 프로젝트" 클릭
- 프로젝트 이름: `mycbt`
- "만들기" 클릭

**3단계: OAuth 동의 화면 설정**
- 왼쪽 메뉴 → "API 및 서비스" → "OAuth 동의 화면"
- 사용자 유형: "외부" 선택 → "만들기"
- 앱 이름: `mycbt`
- 사용자 지원 이메일: 본인 이메일
- 개발자 연락처 이메일: 본인 이메일
- "저장 후 계속"

**4단계: OAuth 클라이언트 ID 생성**
- 왼쪽 메뉴 → "클라이언트" 클릭
- "+ 클라이언트 만들기" 클릭
- 애플리케이션 유형: `웹 애플리케이션`
- 이름: `mycbt`
- 승인된 JavaScript 원본:
  - `http://localhost:3000`
  - `https://www.mycbt.xyz`
- 승인된 리디렉션 URI:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://www.mycbt.xyz/api/auth/callback/google`
- "만들기" 클릭

**5단계: 키 저장**
- 생성 완료 후 나오는 두 값을 `.env.local`에 저장:
```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

### 주의사항
- **리디렉션 URI가 정확해야 함** — 한 글자라도 틀리면 `redirect_uri_mismatch` 에러 발생 (에러 E-006)
- **localhost와 배포 URL 둘 다 등록** — 로컬 개발과 실제 서비스에서 모두 작동하려면 둘 다 필요
- **Client Secret은 절대 GitHub에 올리면 안 됨** — `.env.local`은 `.gitignore`에 포함되어 있어야 함

---

## 6. 카카오 OAuth 앱 만들기 (실전 가이드)

### 구글 vs 카카오 OAuth 차이점

| 항목 | 구글 | 카카오 |
|------|------|--------|
| 설정 사이트 | Google Cloud Console | 카카오 개발자 센터 |
| Client ID | OAuth 클라이언트 ID | **REST API 키** |
| Client Secret | 클라이언트 보안 비밀번호 | 보안 탭에서 별도 생성 |
| 비즈 앱 필요? | 아니오 | **예** (이메일 필수 수집하려면 필수) |
| 토큰 교환 방식 | 기본(client_secret_basic) | **client_secret_post** (필수!) |

### 카카오의 특이한 점 (삽질 포인트)

**1) 비즈 앱 전환 필수**
- 일반 앱은 이메일 수집이 "선택 동의"까지만 가능
- **비즈 앱**으로 전환해야 "필수 동의"로 설정 가능
- 비즈 앱 전환하려면 **사업자등록번호**가 필요함
- 비유: 일반 식당은 고객 이메일을 "줘도 되고 안 줘도 되는" 설문만 할 수 있고, 사업자 등록된 식당만 "필수 기입" 설문을 돌릴 수 있음

**2) client_secret_post 필수 (에러 E-009)**
- 구글은 기본 방식(client_secret_basic)으로 동작
- 카카오는 이 방식을 **지원하지 않음** → `client_secret_post`를 명시해야 함
- NextAuth 설정에서 반드시 아래 코드가 필요:
```typescript
client: { token_endpoint_auth_method: "client_secret_post" }
```
- 이걸 안 하면 "Configuration" 에러가 나면서 로그인이 안 됨
- **가장 흔한 삽질 포인트** — 구글/네이버는 잘 되는데 카카오만 안 되면 이게 원인

**3) Redirect URI 등록 위치가 독특함**
- 구글: OAuth 클라이언트 만들 때 바로 입력
- 카카오: **플랫폼 키** 메뉴 → REST API 키 → 수정 → **"카카오 로그인 리다이렉트 URI"** 에서 등록
- 별도 메뉴에 있어서 찾기 어려움

### 실제 생성 과정 (단계별)

**1단계: 카카오 개발자 센터 접속**
- https://developers.kakao.com 접속 → 로그인
- 상단 "내 애플리케이션" 클릭

**2단계: 앱 생성**
- "앱 생성" 버튼 클릭 (오른쪽 상단 파란색 버튼)
- 앱 아이콘: 원하는 이미지 업로드
- 앱 이름: `mycbt`
- 회사명: 회사명 입력
- 카테고리: `교육`
- 앱 대표 도메인: `https://www.mycbt.xyz`
- 저장

**3단계: 비즈 앱 전환 (필수)**
- 왼쪽 메뉴 → 앱 → "일반" 클릭
- 페이지 하단 "비즈니스 정보" 섹션
- "사업자 정보 등록" 버튼 클릭
- 사업자등록번호 입력 → 확인
- 비즈 앱으로 전환 완료

**4단계: 카카오 로그인 활성화**
- 왼쪽 메뉴 → 제품 설정 → "카카오 로그인" 클릭
- "일반" 탭에서 사용 설정 토글 → **ON**

**5단계: Redirect URI 등록**
- 왼쪽 메뉴 → 앱 → "플랫폼 키" 클릭
- REST API 키 옆 수정 버튼 클릭
- 스크롤 내리면 **"카카오 로그인 리다이렉트 URI"** 항목
- 추가:
  - `http://localhost:3000/api/auth/callback/kakao`
  - `https://www.mycbt.xyz/api/auth/callback/kakao`

**6단계: 동의항목 설정**
- 왼쪽 메뉴 → 카카오 로그인 → "동의항목" 클릭
- 닉네임 (profile_nickname): **필수 동의**
- 프로필 사진 (profile_image): **필수 동의**
- 카카오계정 이메일 (account_email): **필수 동의 [수집]**
- 각 항목 "설정" 버튼 → "필수 동의" 선택 → 동의 목적 입력 (예: "로그인인증") → 저장

**7단계: Client Secret 생성**
- 왼쪽 메뉴 → 카카오 로그인 → "보안" 탭
- "Client Secret 생성" 클릭 → 코드 복사

**8단계: 키 저장**
- 왼쪽 메뉴 → 앱 → "플랫폼 키"에서 REST API 키 복사
- `.env.local`에 저장:
```
KAKAO_CLIENT_ID=REST_API_키
KAKAO_CLIENT_SECRET=Client_Secret_코드
```

### 카카오 메뉴 구조 (헷갈리지 않게 정리)

```
앱 설정
├── 대시보드
├── 앱 (펼침)
│   ├── 일반           ← 비즈 앱 전환은 여기
│   ├── 플랫폼 키      ← REST API 키 확인 + Redirect URI 등록은 여기
│   ├── 어드민 키
│   ├── 제품 링크 관리
│   ├── 추가 기능 신청
│   ├── 카카오톡 채널
│   ├── 웹훅
│   ├── 멤버
│   └── 고급
├── 유료 API
│
제품 설정
├── 카카오 로그인 (펼침)
│   ├── 일반           ← 사용 설정 ON/OFF
│   ├── 동의항목       ← 닉네임/이메일 필수 설정
│   ├── 간편가입
│   └── 고급
├── 비즈니스 인증
├── 카카오톡 메시지
├── 카카오맵
└── 푸시 알림
```

### 주의사항 요약
- **비즈 앱 전환 안 하면** → 이메일 필수 수집 불가
- **Redirect URI 위치** → "플랫폼 키" 메뉴 안에 숨어있음 (찾기 어려움)
- **client_secret_post 설정 필수** → 안 하면 로그인 토큰 교환 실패 (에러 E-009)
- **동의항목 저장 시 "동의 목적" 입력 필수** → 빈칸이면 저장 버튼 비활성화

---

## 7. 네이버 OAuth 앱 만들기 (실전 가이드)

### 구글/카카오 vs 네이버 비교

| 항목 | 구글 | 카카오 | 네이버 |
|------|------|--------|--------|
| 설정 사이트 | Google Cloud Console | 카카오 개발자 센터 | 네이버 개발자 센터 |
| Client ID 이름 | OAuth 클라이언트 ID | REST API 키 | Client ID |
| 비즈 앱 필요? | 아니오 | 예 | 아니오 |
| 설정 난이도 | 중간 (OAuth 동의 화면 별도) | 어려움 (비즈앱+메뉴 복잡) | **쉬움** (한 페이지에서 다 됨) |

### 네이버의 좋은 점

- **한 페이지에서 모든 설정 완료** — 구글/카카오처럼 여러 메뉴 돌아다닐 필요 없음
- 앱 등록 페이지에서 이름, API 선택, 제공 정보, URL, Callback URL을 한 번에 입력
- 사업자등록 없이도 이메일 필수 수집 가능

### 실제 생성 과정 (단계별)

**1단계: 네이버 개발자 센터 접속**
- https://developers.naver.com/apps 접속
- 네이버 계정으로 로그인

**2단계: Application 등록 (한 페이지에서 끝)**
- "Application 등록" 버튼 클릭
- 아래 항목을 순서대로 입력:

```
애플리케이션 이름: mycbt

사용 API: "네이버 로그인" 선택

제공 정보 선택:
  ✅ 회원이름 (필수)
  ✅ 이메일 (필수)
  ✅ 프로필 사진 (추가)

환경 추가: "PC웹" 선택

서비스 URL: https://www.mycbt.xyz

네이버 로그인 Callback URL:
  http://localhost:3000/api/auth/callback/naver
  https://www.mycbt.xyz/api/auth/callback/naver
```

- "등록하기" 클릭 → **끝!**

**3단계: 키 확인 및 저장**
- 등록 완료 후 바로 Client ID와 Client Secret이 표시됨
- `.env.local`에 저장:
```
NAVER_CLIENT_ID=여기에_Client_ID
NAVER_CLIENT_SECRET=여기에_Client_Secret
```

### Callback URL = Redirect URI

- 구글은 "리디렉션 URI", 카카오는 "리다이렉트 URI", 네이버는 **"Callback URL"**이라고 부름
- 이름만 다르지 전부 같은 개념: **로그인 완료 후 돌아올 주소**
- 패턴: `http(s)://도메인/api/auth/callback/서비스명`

| 서비스 | Callback URL |
|--------|-------------|
| Google | `/api/auth/callback/google` |
| 카카오 | `/api/auth/callback/kakao` |
| 네이버 | `/api/auth/callback/naver` |

### 주의사항
- **서비스 URL에 배포 URL만 등록** — localhost는 Callback URL에만 넣으면 됨
- **Callback URL에 localhost와 배포 URL 둘 다 등록** — 개발/운영 모두 동작하려면 필수
- 네이버는 구글/카카오에 비해 설정이 간단해서 실수할 일이 적음

### 3사 OAuth 설정 총정리

```
📌 최종 .env.local에 들어가는 키 목록:

# Google
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx

# 카카오
KAKAO_CLIENT_ID=카카오_REST_API_키
KAKAO_CLIENT_SECRET=카카오_Client_Secret

# 네이버
NAVER_CLIENT_ID=네이버_Client_ID
NAVER_CLIENT_SECRET=네이버_Client_Secret
```

### 3사 Redirect URI 패턴 (외워두면 좋음)

```
로컬:  http://localhost:3000/api/auth/callback/{provider}
배포:  https://www.mycbt.xyz/api/auth/callback/{provider}

{provider} = google / kakao / naver
```

---

## 8. Gmail SMTP 설정 (이메일 Magic Link 인증용)

### Magic Link 로그인이 뭔데?

**비유:** 비밀 초대장 시스템

- 소셜 로그인(구글/카카오/네이버) 계정이 없는 사용자를 위한 로그인 방식
- 사용자가 이메일 주소 입력 → 우리 서버가 인증 링크가 담긴 메일 발송 → 사용자가 메일에서 링크 클릭 → 로그인 완료
- 비밀번호가 필요 없음! 이메일만 있으면 됨
- 비유: 클럽에 들어가려면 비밀 초대 링크를 메일로 받아서 클릭하는 것

**흐름도:**
```
사용자 → 이메일 입력 (예: user@naver.com)
  → 우리 서버가 cayson0127@gmail.com에서 인증 메일 발송
  → 사용자 메일함에 "로그인하기" 링크가 도착
  → 링크 클릭
  → 자동으로 로그인 완료
```

### 왜 Gmail SMTP를 쓰는가?

- **SMTP** = 메일을 보내는 프로토콜 (우체국 같은 것)
- 우리 서버가 직접 메일 서버를 운영하면 복잡하고 비용이 많이 듬
- 대신 **Gmail을 우체국으로 빌려 쓰는 것** — Gmail 계정으로 대신 메일을 보내줌
- 무료이고 설정이 간단함

### 앱 비밀번호가 뭔데?

- Gmail 로그인 비밀번호를 코드에 직접 넣으면 보안 위험
- 그래서 Gmail이 **앱 전용 임시 비밀번호**를 별도로 만들어줌
- 이 비밀번호는 메일 발송에만 쓸 수 있고, 실제 Gmail 로그인은 불가능
- 비유: 집 열쇠(Gmail 비밀번호) 대신 **우편함 열쇠(앱 비밀번호)**만 줘서 메일만 보낼 수 있게 하는 것

### 실제 설정 과정

**1단계: 2단계 인증 활성화 (이미 되어 있으면 생략)**
- https://myaccount.google.com/security 접속
- "2단계 인증" → 활성화
- 앱 비밀번호는 2단계 인증이 켜져 있어야만 만들 수 있음

**2단계: 앱 비밀번호 생성**
- https://myaccount.google.com/apppasswords 접속
- 앱 이름: `mycbt` 입력
- "만들기" 클릭
- **16자리 비밀번호**가 나옴 (예: `ppds pndf bxeg bmfg`)
- 복사할 때 **공백 제거** → `ppdspndfbxegbmfg`

**3단계: .env.local에 저장**
```
EMAIL_SERVER_USER=cayson0127@gmail.com
EMAIL_SERVER_PASSWORD=ppdspndfbxegbmfg
EMAIL_FROM=cayson0127@gmail.com
```

### 주의사항
- **EMAIL_SERVER_USER와 앱 비밀번호 생성 계정이 반드시 같아야 함** — 다르면 535 인증 에러 (에러 E-013)
- **앱 비밀번호에 공백 제거 필수** — 구글이 `ppds pndf bxeg bmfg`처럼 4자리씩 끊어서 보여주는데, 코드에서는 공백 없이 붙여야 함
- **앱 비밀번호는 한 번만 보여줌** — 닫으면 다시 볼 수 없으니 바로 복사해야 함. 잃어버리면 새로 생성

---

## 9. NextAuth Secret 설정

### NextAuth Secret이 뭔데?

**비유:** 식당의 도장 잉크

- 사용자가 로그인하면 서버가 **"이 사람 로그인 확인됨"이라는 도장(세션 토큰)**을 찍어줌
- 이 도장이 위조되면 안 되기 때문에, 도장에 쓰는 **특수 잉크(Secret)**가 필요
- NextAuth Secret = 세션 토큰을 암호화하는 비밀 열쇠
- 이걸 모르면 아무도 도장을 위조할 수 없음

### 생성 방법

```bash
# 터미널에서 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

이 명령어를 실행하면 64자리 랜덤 문자열이 나옴. 그걸 `.env.local`에 저장:

```
NEXTAUTH_SECRET=생성된_64자리_랜덤_문자열
NEXTAUTH_URL=http://localhost:3000
```

### NEXTAUTH_URL은 뭔데?

- NextAuth가 **"나는 이 주소에서 돌아가고 있어"**라고 알려주는 설정
- 로컬 개발: `http://localhost:3000`
- 배포 시 Vercel이 자동으로 설정해주므로 `.env.local`에만 있으면 됨

---

## 10. 지금까지 완료한 전체 세팅 현황

### .env.local 최종 구조

```bash
# === Neon PostgreSQL (데이터베이스) ===
DATABASE_URL=postgresql://...          # Vercel에서 자동 생성
DATABASE_URL_UNPOOLED=postgresql://...  # 직접 연결용
# (+ DATABASE_POSTGRES_* 여러 개)      # Vercel이 자동 추가한 변수들

# === OpenRouter AI (AI 채점) ===
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_MODEL=deepseek/deepseek-v3.2

# === Google OAuth ===
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx

# === 카카오 OAuth ===
KAKAO_CLIENT_ID=카카오_REST_API_키
KAKAO_CLIENT_SECRET=카카오_Client_Secret

# === 네이버 OAuth ===
NAVER_CLIENT_ID=네이버_Client_ID
NAVER_CLIENT_SECRET=네이버_Client_Secret

# === Gmail SMTP (이메일 Magic Link) ===
EMAIL_SERVER_USER=cayson0127@gmail.com
EMAIL_SERVER_PASSWORD=16자리앱비밀번호
EMAIL_FROM=cayson0127@gmail.com

# === NextAuth ===
NEXTAUTH_SECRET=64자리_랜덤_문자열
NEXTAUTH_URL=http://localhost:3000
```

### 완료 체크리스트

| 단계 | 항목 | 상태 |
|------|------|------|
| Step 1 | Neon DB 생성 (싱가포르 리전) | ✅ 완료 |
| Step 2 | Prisma 스키마 + DB 푸시 | ✅ 완료 |
| Step 3 | Google OAuth 앱 생성 | ✅ 완료 |
| Step 4 | 카카오 OAuth 앱 생성 (비즈앱 전환 포함) | ✅ 완료 |
| Step 5 | 네이버 OAuth 앱 생성 | ✅ 완료 |
| Step 6 | Gmail SMTP 앱 비밀번호 생성 | ✅ 완료 |
| Step 7 | NextAuth Secret 생성 | ✅ 완료 |
| Step 8 | NextAuth 코드 작성 | ⬜ 다음 단계 |
| Step 9 | 로그인 페이지 구현 | ⬜ 예정 |
| Step 10 | Cloudinary 세팅 (이미지) | ⬜ 예정 |
| Step 11 | 토스페이먼츠 세팅 (결제) | ⬜ 예정 |

### 지금까지 배운 핵심 개념 요약

```
🔑 OAuth = 다른 서비스한테 "이 사람 누구야?" 물어보는 것
🔑 Client ID = 우리 앱의 신분증 (공개 가능)
🔑 Client Secret = 우리 앱의 비밀 열쇠 (절대 공개 금지)
🔑 Redirect URI = 로그인 완료 후 돌아올 주소
🔑 SMTP = 메일 보내는 우체국
🔑 앱 비밀번호 = Gmail 전용 임시 열쇠 (메일 발송만 가능)
🔑 NextAuth Secret = 세션 토큰 암호화 열쇠
🔑 .env.local = 모든 비밀 열쇠를 보관하는 금고 (GitHub에 절대 올리면 안 됨)
```

---

## 11. 같은 이메일로 여러 소셜 로그인 (allowDangerousEmailAccountLinking)

### 문제 상황

예를 들어:
- 카카오톡 계정 이메일: `raphael0127@naver.com`
- 네이버 계정 이메일: `raphael0127@naver.com`

같은 이메일인데 다른 소셜 로그인으로 들어오면 어떻게 될까?

### 기본 동작 (설정 안 했을 때)

NextAuth는 보안상 **"OAuthAccountNotLinked"** 에러를 발생시킨다.

```
카카오로 먼저 가입 → User 생성 (email: raphael0127@naver.com)
네이버로 로그인 시도 → "이 이메일은 이미 다른 방식으로 가입됨" 에러!
```

**왜 에러를 내냐?** 보안 때문이다. 만약 누군가 같은 이메일로 다른 소셜 계정을 만들어서 남의 계정에 접근하면 위험하기 때문.

### 우리의 해결: allowDangerousEmailAccountLinking

```typescript
Google({
  clientId: ...,
  clientSecret: ...,
  allowDangerousEmailAccountLinking: true,  // ← 이거 추가
}),
Kakao({
  ...
  allowDangerousEmailAccountLinking: true,  // ← 이거 추가
}),
Naver({
  ...
  allowDangerousEmailAccountLinking: true,  // ← 이거 추가
}),
```

이걸 켜면 같은 이메일의 여러 소셜 계정이 **하나의 User에 자동 연결**된다.

```
카카오로 먼저 가입 → User (id: "abc123") 생성
네이버로 로그인 → 같은 User (id: "abc123")에 네이버 Account 추가 연결!

결과:
User (id: "abc123", email: "raphael0127@naver.com")
├── Account (provider: "kakao")
└── Account (provider: "naver")
```

### 비유

**비유:** 식당 회원카드

- 카카오 = 삼성카드, 네이버 = 현대카드
- 같은 사람이 다른 카드로 결제해도 같은 회원 포인트에 적립됨
- `allowDangerousEmailAccountLinking`은 "다른 카드여도 같은 이메일이면 같은 회원으로 인정해줘"라는 설정

### "Dangerous"라는 이름이 붙은 이유

- 이론적으로 누군가 같은 이메일로 가짜 소셜 계정을 만들어서 남의 계정에 접근할 수 있음
- 하지만 구글/카카오/네이버는 이메일 인증이 된 계정이므로 실질적 위험은 낮음
- 우리 같은 서비스에서는 편의성이 보안 우려보다 크므로 켜는 게 맞음

### 주의사항
- **모든 provider에 다 넣어야 함** — 하나만 빠져도 그 provider에서 에러 발생
- 이메일이 없는 소셜 계정은 해당 없음 (이메일로 매칭하는 거니까)
