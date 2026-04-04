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
| Step 8 | NextAuth 코드 작성 | ✅ 완료 |
| Step 9 | 로그인 페이지 구현 (4종 소셜 + 이메일) | ✅ 완료 |
| Step 10 | Cloudinary 세팅 (이미지) | ✅ 완료 (API 코드 작성, 실테스트 미진행) |
| Step 11 | 핵심 기능 포팅 (52+ 파일) | ✅ 완료 |
| Step 12 | 성능 최적화 (7+ 라운드) | ✅ 완료 |
| Step 13 | 토스페이먼츠 세팅 (결제) | ⬜ 예정 |
| Step 14 | 동영상 강의 기능 | ⬜ 예정 |

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

---

## 12. 서버 컴포넌트 vs 클라이언트 컴포넌트 (가장 중요한 성능 개념)

### 핵심 개념

Next.js에서 페이지를 만드는 방식이 두 가지가 있다.

| 구분 | 서버 컴포넌트 | 클라이언트 컴포넌트 |
|------|-------------|-------------------|
| 코드 실행 위치 | **서버 (Vercel)** | 사용자 브라우저 |
| 선언 방법 | 아무것도 안 씀 (기본값) | 파일 맨 위에 `"use client"` 작성 |
| DB 접근 | **직접 가능** (`prisma.xxx.findMany()`) | 불가능 (API를 통해서만) |
| 사용자 인터랙션 | 불가능 (onClick, useState 등 사용 불가) | **가능** |
| HTML 생성 시점 | 서버에서 미리 완성 → 브라우저에 전달 | 브라우저가 JS 다운로드 후 그려냄 |

### 비유: 식당 배달 vs 밀키트

**서버 컴포넌트 = 완성된 요리 배달**
- 주방(서버)에서 요리를 다 만들어서 완성품을 배달
- 손님(브라우저)은 받자마자 바로 먹을 수 있음
- **빠르다!** (HTML이 이미 완성되어 있으니까)

**클라이언트 컴포넌트 (API 방식) = 밀키트 배달**
- 재료(JS 코드)를 배달
- 손님(브라우저)이 직접 조리(API 호출 → 데이터 받기 → 화면 그리기)
- **느리다!** (요리하는 시간 = 로딩 시간)
- "로딩 중...", "불러오는 중..." 이런 게 나오는 이유가 이것

### 실제 코드 비교

**느린 방식 (클라이언트 컴포넌트 + API 호출):**
```typescript
"use client"  // ← 브라우저에서 실행
import { useState, useEffect } from 'react'

export default function MyPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)  // "로딩 중..."이 필요한 이유

  useEffect(() => {
    // 브라우저에서 서버로 데이터 요청 (왕복 시간 발생!)
    fetch('/api/my/attempts')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>로딩 중...</div>  // ← 사용자가 이걸 보게 됨
  return <div>{/* 데이터 표시 */}</div>
}
```

**빠른 방식 (서버 컴포넌트 + 직접 DB 조회):**
```typescript
// "use client" 없음 → 서버에서 실행
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export default async function MyPage() {
  const session = await auth()
  // 서버에서 DB 직접 조회 (네트워크 왕복 없음!)
  const attempts = await prisma.attempt.findMany({
    where: { userId: session.user.id }
  })

  // HTML이 이미 완성된 상태로 브라우저에 전달
  return <div>{/* 데이터 표시 */}</div>
  // "로딩 중..." 이 필요 없다!
}
```

### 왜 서버 컴포넌트가 빠른가?

```
[클라이언트 방식 - 느림]
브라우저 → 페이지 로드 → JS 다운로드 → API 호출 → 서버 → DB → 서버 → 브라우저 → 화면 그리기
                                      ↑ 여기서 "로딩 중..." 표시 ↑

[서버 컴포넌트 방식 - 빠름]
브라우저 → 서버(DB 조회 + HTML 완성) → 완성된 HTML 전달 → 바로 표시!
          ↑ 서버와 DB는 같은 데이터센터에 있어서 초고속 ↑
```

서버(Vercel)와 DB(Neon)가 둘 다 클라우드에 있어서, 서버→DB 통신은 1~5ms밖에 안 걸림.
반면 브라우저→서버 통신은 50~200ms가 걸림.
서버 컴포넌트는 이 왕복을 없앤 것!

### 그러면 언제 클라이언트 컴포넌트를 쓰냐?

**사용자가 뭔가 클릭하거나 입력해야 할 때만!**

| 상황 | 사용할 컴포넌트 |
|------|---------------|
| 데이터를 보여주기만 할 때 | **서버 컴포넌트** |
| 버튼 클릭, 폼 입력, 토글 등 | **클라이언트 컴포넌트** |
| 타이머 (시험 시간 카운트다운) | **클라이언트 컴포넌트** |
| 필터 버튼 (전체/기능사/산업기사 전환) | **클라이언트 컴포넌트** |

### 서버+클라이언트 분리 패턴 (우리 프로젝트의 핵심 패턴)

대부분의 페이지는 **"서버에서 데이터 가져오고, 클라이언트에서 인터랙션"** 패턴을 사용한다.

```
page.tsx (서버 컴포넌트)
├── DB에서 데이터 조회 (prisma)
├── 데이터를 props로 전달
└── <ClientComponent data={data} />  ← 여기만 클라이언트

ClientComponent.tsx (클라이언트 컴포넌트)
├── "use client"
├── props로 받은 데이터를 화면에 표시
├── 필터, 토글, 버튼 등 인터랙션 처리
└── 필요할 때만 API 호출 (데이터 변경 시)
```

**비유:** 
- page.tsx = 주방에서 재료를 다 준비해서 접시에 담아놓는 것
- ClientComponent = 손님 테이블에서 소스 뿌리거나 뚜껑 여는 것

### API는 언제 꼭 써야 하나?

API(fetch)를 써야 하는 경우는 **데이터를 "변경"할 때**뿐이다.

| 작업 | 방법 | 이유 |
|------|------|------|
| 시험 목록 보기 | 서버 컴포넌트 | 읽기만 하니까 |
| 시험 결과 보기 | 서버 컴포넌트 | 읽기만 하니까 |
| **시험 시작** | **API (POST)** | DB에 새 데이터 생성 |
| **답안 제출** | **API (POST)** | DB에 데이터 저장 |
| **시험 중단** | **API (POST)** | DB에서 데이터 삭제 |
| **로그인/로그아웃** | **API** | 세션 생성/삭제 |

**비유:**
- 메뉴판 보기(읽기) = 서버 컴포넌트
- 주문하기(쓰기) = API

---

## 13. 페이지 로딩 속도 최적화 (7라운드에 걸친 대작전)

### 최초 상태 (문제)

처음에 전기짱 사이트는 페이지 전환할 때 **2초 이상** 걸렸다.

```
홈 → 카테고리 페이지 : 2~3초
카테고리 → 시험 시작 : 1~2초
시험 끝 → 결과 보기 : 1~2초
마이페이지 진입 : 2초+
```

원인: 모든 페이지가 클라이언트 컴포넌트 + API 호출 방식이었음

### 최종 결과 (최적화 후)

```
홈 → 카테고리 페이지 : 0.1~0.2초 ⚡
카테고리 → 시험 시작 : 0.1~0.2초 ⚡
시험 끝 → 결과 보기 : 0.1~0.2초 ⚡
마이페이지 진입 : 0.1~0.2초 ⚡
```

### 어떻게 달성했나? (6가지 기법)

---

### 기법 1: 서버 컴포넌트 전환 (가장 큰 효과)

위의 섹션 12에서 설명한 대로, 모든 "읽기 전용" 페이지를 서버 컴포넌트로 바꿨다.

**바꾼 페이지들:**
- 홈페이지 (`app/page.tsx`)
- 카테고리 페이지 (`app/category/[categoryId]/page.tsx`)
- 시험 시작 페이지 (`app/exam/[examId]/page.tsx`)
- 시험 풀기 페이지 (`app/exam/attempt/[attemptId]/page.tsx`)
- 시험 결과 페이지 (`app/exam/result/[attemptId]/page.tsx`)
- 마이페이지 (`app/my/page.tsx`)
- 오답노트 (`app/my/wrong-answers/page.tsx`)
- 프로필 수정 (`app/my/profile/page.tsx`)
- 관리자 페이지 5개 전부

---

### 기법 2: DB 연결 방식 변경 (PrismaPg → PrismaNeon)

**비유:** 전화 vs 문자

- **PrismaPg (TCP 연결)** = 전화 걸기
  - "여보세요? → 네 → 이거 주세요 → 잠깐만요 → 여기요 → 감사합니다 → 끊기"
  - 처음 전화 연결하는 데 시간이 걸림 (1~2초) = **콜드 스타트**
  - 서버리스(Vercel) 환경에서는 매번 새로 전화해야 할 수 있음

- **PrismaNeon (HTTP 연결)** = 문자 보내기
  - "이거 주세요" → 바로 답장 옴
  - 연결 과정 없이 바로 통신 (100~200ms)
  - 서버리스에서도 항상 빠름

```typescript
// 변경 전 (느림)
import { PrismaPg } from '@prisma/adapter-pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

// 변경 후 (빠름)
import { PrismaNeon } from '@prisma/adapter-neon'
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
```

**결과:** DB 첫 요청이 1~2초 → 100~200ms로 단축

---

### 기법 3: 캐싱 3단계 (3-Layer Caching)

캐싱 = 한 번 만든 결과를 저장해두고 다시 쓰는 것

**비유:** 식당 주문

레벨 1: **CDN 캐시 (ISR)** = 만들어둔 도시락
- 자주 바뀌지 않는 페이지(홈, 카테고리 목록)는 미리 만들어서 저장
- 60초마다 새로 만듦
- 전세계 어디서든 가장 가까운 보관소에서 바로 꺼내줌

```typescript
// page.tsx에 이 한 줄 추가하면 ISR 활성화
export const revalidate = 60  // 60초마다 새로 만듦
```

레벨 2: **서버 캐시 (unstable_cache)** = 주방장의 메모장
- DB 조회 결과를 서버 메모리에 60초간 저장
- 같은 데이터를 다시 요청하면 DB 안 가고 메모에서 바로 답변
- DB 부하 감소 + 응답 속도 향상

```typescript
import { unstable_cache } from 'next/cache'

const getCategories = unstable_cache(
  async () => {
    return prisma.examCategory.findMany({ ... })  // 실제 DB 조회
  },
  ["exam-categories"],     // 캐시 이름표
  { revalidate: 60 }       // 60초 후 새로 조회
)

// 사용할 때
const categories = await getCategories()  // 캐시에 있으면 DB 안 감!
```

레벨 3: **브라우저 캐시 (staleTimes)** = 손님의 기억
- 한 번 방문한 페이지를 브라우저가 기억
- 다시 방문하면 서버에 안 물어보고 바로 보여줌

```typescript
// next.config.ts
experimental: {
  staleTimes: {
    dynamic: 60,   // 동적 페이지: 60초간 기억
    static: 300,   // 정적 페이지: 5분간 기억
  },
},
```

**3단계 캐싱 흐름:**
```
사용자가 페이지 요청
  → 1단계: 브라우저 캐시에 있나? → 있으면 즉시 표시 (0ms)
  → 2단계: CDN 캐시에 있나? → 있으면 바로 전달 (10~50ms)
  → 3단계: 서버 캐시에 있나? → 있으면 DB 안 감 (50~100ms)
  → 전부 없으면: DB 조회 → 결과를 3단계 모두에 저장
```

---

### 기법 4: 미리 준비 (Prefetch)

**비유:** 손님이 주문하기 전에 미리 요리 시작

사용자가 아직 클릭하지 않았지만, **"아마 여길 누를 거야"** 하고 미리 페이지를 준비해두는 것.

```typescript
// 홈에 들어오면 → 카테고리 페이지들을 미리 준비
useEffect(() => {
  router.prefetch('/category/1')  // 전기기초
  router.prefetch('/category/2')  // 전기기능사
  router.prefetch('/category/3')  // 전기산업기사
  router.prefetch('/category/4')  // 전기기사
}, [router])

// 마이페이지에 들어오면 → 하위 페이지들을 미리 준비
useEffect(() => {
  router.prefetch('/my/wrong-answers')
  router.prefetch('/my/profile')
  router.prefetch('/my/withdraw')
  // 최근 결과 페이지 10개도 미리 준비
  for (const attempt of attempts.slice(0, 10)) {
    router.prefetch(`/exam/result/${attempt.id}`)
  }
}, [router, attempts])
```

**결과:** 사용자가 버튼 누르는 순간 이미 준비가 끝나 있어서 **즉시 전환!**

---

### 기법 5: 빌드 시 미리 생성 (generateStaticParams)

**비유:** 개점 전에 인기 메뉴 미리 만들어두기

카테고리 페이지(4개), 시험 시작 페이지(여러 개)를 **빌드할 때** 미리 HTML로 만들어둔다.

```typescript
// app/category/[categoryId]/page.tsx
export async function generateStaticParams() {
  const categories = await prisma.examCategory.findMany({
    select: { id: true }
  })
  return categories.map(c => ({ categoryId: String(c.id) }))
}
// → 빌드 시 /category/1, /category/2, /category/3, /category/4 페이지가 미리 생성됨
```

사용자가 방문하면 서버에서 새로 만들 필요 없이 미리 만들어둔 걸 바로 전달.

---

### 기법 6: 불필요한 것 제거

**로딩 스켈레톤 제거:**
- 원래 `loading.tsx` 파일이 있으면 페이지 전환 시 스켈레톤(회색 블록)이 나왔음
- 서버 컴포넌트로 바꾼 후에는 스켈레톤이 오히려 **깜빡임**을 일으킴
- 모든 `loading.tsx` 삭제 → 이전 페이지가 유지되다가 새 페이지가 준비되면 바로 교체

**KaTeX 동적 임포트:**
- 수학 수식 렌더링 라이브러리 (264KB로 매우 큼)
- 모든 페이지에서 로드하던 것을 → 수식이 있는 페이지에서만 로드하도록 변경

```typescript
// 변경 전: 항상 로드 (264KB 낭비)
import katex from 'katex'

// 변경 후: 필요할 때만 로드
const katex = await import('katex')
```

**API 병렬 처리:**
- 시험 시작 API에서 4개 DB 조회를 순차적으로 하던 것을 동시에 실행

```typescript
// 변경 전 (느림): 하나씩 순서대로
const exam = await prisma.exam.findUnique(...)      // 100ms
const subjects = await prisma.subject.findMany(...) // 100ms
const existing = await prisma.attempt.findMany(...) // 100ms
const questions = await prisma.question.findMany(...)// 100ms
// 총 400ms

// 변경 후 (빠름): 4개를 동시에
const [exam, subjects, existing, questions] = await Promise.all([
  prisma.exam.findUnique(...),
  prisma.subject.findMany(...),
  prisma.attempt.findMany(...),
  prisma.question.findMany(...),
])
// 총 ~100ms (가장 느린 하나 기준)
```

**비유:** 4명에게 전화를 걸어야 할 때, 한 명씩 순서대로 거는 것(400초) vs 4명에게 동시에 거는 것(100초)

---

### 최적화 전후 비교 총정리

| 항목 | 최적화 전 | 최적화 후 | 기법 |
|------|----------|----------|------|
| 카테고리 페이지 | 2~3초 | 0.1~0.2초 | 서버 컴포넌트 + ISR + prefetch |
| 시험 시작 페이지 | 1~2초 | 0.1~0.2초 | 서버 컴포넌트 + generateStaticParams |
| 시험 결과 페이지 | 1~2초 | 0.1~0.2초 | 서버 컴포넌트 + prefetch |
| 마이페이지 | 2초+ | 0.1~0.2초 | 서버 컴포넌트 + prefetch |
| DB 콜드 스타트 | 1~2초 | 0.1~0.2초 | PrismaPg→PrismaNeon |
| 시험 제출 API | 2초+ | 0.15초 | batch createMany |
| "로딩 중..." 표시 | 매번 나옴 | **완전 제거** | 서버 컴포넌트 |

---

## 14. 커스텀 폰트와 FOUT 문제

### FOUT가 뭔데?

**FOUT = Flash of Unstyled Text** (스타일 안 된 글자가 번쩍 나타나는 현상)

우리 사이트에서 "전기짱"이라는 타이틀은 **따악단단(DdakDanDan)** 이라는 커스텀 폰트를 사용한다. 이 폰트 파일이 4.8MB로 꽤 크다.

**문제:**
```
페이지 로드
  → HTML이 먼저 보임 → 폰트 아직 안 옴 → 기본 고딕체로 "전기짱" 표시
  → 0.5초 후 폰트 도착 → 갑자기 따악단단체로 바뀜!
  → 사용자: "뭐지? 글씨가 깜빡거렸는데?"
```

### 해결 방법

**1단계: font-display를 block으로 변경**

```css
/* 변경 전 */
@font-face {
  font-family: 'DdakDanDan';
  font-display: swap;  /* ← 폰트 없으면 기본 폰트로 먼저 보여줌 (깜빡임 원인) */
}

/* 변경 후 */
@font-face {
  font-family: 'DdakDanDan';
  font-display: block;  /* ← 폰트 올 때까지 글자를 안 보여줌 (깜빡임 방지) */
}
```

**비유:**
- `swap` = 대역 배우가 먼저 나가고, 주연이 도착하면 교체 (관객이 눈치챔)
- `block` = 주연이 도착할 때까지 무대를 안 열음 (관객은 모름)

**2단계: 폰트 미리 로드 (preload)**

```html
<!-- layout.tsx의 <head>에 추가 -->
<link rel="preload" href="/fonts/DdakDanDan.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
```

이러면 브라우저가 HTML을 읽자마자 폰트를 **최우선으로 다운로드**한다. 다른 이미지나 JS보다 먼저!

---

## 15. 카카오톡 인앱 브라우저 문제

### 문제

카카오톡 채팅방에서 전기짱 링크를 누르면 **카카오톡 내장 브라우저**에서 열린다.
이 브라우저에서는 **구글 로그인이 작동하지 않는다** (구글이 보안상 차단).

### 해결

```typescript
// 카카오톡 인앱 브라우저 감지
function isKakaoInApp() {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes("kakaotalk")  // 카카오톡이면 true
}

// 구글 로그인 버튼 클릭 시
const handleGoogleLogin = () => {
  if (isKakaoInApp()) {
    // 1. 안내 메시지 표시: "카카오톡 내에서는 구글 로그인이 불가합니다"
    setKakaoAlert(true)
    // 2. 1.5초 후 외부 브라우저(Chrome/Safari)로 자동 이동
    setTimeout(() => openExternalBrowser(window.location.href), 1500)
    return
  }
  // 일반 브라우저면 바로 구글 로그인
  signIn("google", { callbackUrl: "/" })
}
```

**비유:** 
- 카카오톡 브라우저 = 회사 건물 안 작은 매점 (구글 결제기가 없음)
- 외부 브라우저 = 밖에 있는 큰 마트 (구글 결제기 있음)
- 해결: "여기선 구글 결제 안 돼요, 밖에 마트로 안내할게요" → 자동 이동

---

## 16. 이메일 인증 메일 커스터마이징

### 기본 상태

NextAuth의 이메일 로그인은 기본적으로 **영어 템플릿**을 보냈다:
- 제목: "Sign in to www.mycbt.xyz"
- 버튼: "Sign in" (영어)
- 디자인: 밋밋한 기본 템플릿

### 커스텀 적용

`lib/auth.ts`에서 Nodemailer 프로바이더에 `sendVerificationRequest` 함수를 직접 작성:

- **제목:** `[전기짱] 이메일 로그인 인증`
- **버튼:** `로그인하기` (한글, 파란색)
- **브랜딩:** 전기짱 로고 텍스트 + "전기 자격시험 CBT" 소개
- **하단:** 본인 미요청 안내 + 링크 복사용 URL

### callbackUrl 설정 (중요!)

이메일의 로그인 링크를 클릭한 후 어디로 갈지 설정해야 한다.

```typescript
// 잘못된 설정 (callbackUrl 없음)
await signIn("nodemailer", { email, redirect: false })
// → 이메일 링크 클릭 → /login 페이지로 돌아감 (회원가입 페이지 안 뜸!)

// 올바른 설정
await signIn("nodemailer", { email, redirect: false, callbackUrl: "/" })
// → 이메일 링크 클릭 → 홈(/)으로 이동 → ProfileGuard가 회원가입 페이지로 리다이렉트
```

---

## 17. Middleware (미들웨어 = 경비실)

### 뭐하는 거?

모든 페이지 요청 전에 **먼저 실행**되는 코드. 로그인 여부를 확인해서 비로그인 사용자를 차단한다.

**비유:** 건물 입구 경비실
- 사람(요청)이 건물에 들어오면 → 경비실(미들웨어)에서 먼저 확인
- 신분증(세션 쿠키) 있으면 → 통과
- 없으면 → "로그인 페이지로 가세요" 하고 돌려보냄

### Edge Runtime 제한 (중요한 삽질 포인트)

미들웨어는 **Edge Runtime**에서 실행된다. Edge Runtime은 가볍고 빠르지만 제한이 있다:
- **Prisma 사용 불가** — Node.js 전용 라이브러리
- **DB 직접 조회 불가**
- 따라서 **쿠키만 확인**하는 방식으로 작성해야 함

```typescript
// ❌ 이렇게 하면 에러 (Edge에서 Prisma 못 씀)
import { prisma } from '@/lib/prisma'

// ✅ 이렇게 해야 함 (쿠키만 확인)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('authjs.session-token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

---

## 18. ProfileGuard 패턴 (프로필 완성 강제)

### 문제

소셜 로그인(구글/카카오/네이버)만 하면 이메일과 이름만 있고, **아이디(nickname)와 전화번호**가 없다.
이 상태로 사이트를 쓰면 안 되므로, 추가 정보 입력을 강제해야 한다.

### 해결: ProfileGuard 컴포넌트

홈페이지에 `<ProfileGuard />` 컴포넌트를 넣어두고, 프로필이 미완성이면 자동으로 `/complete-profile`로 이동시킨다.

```typescript
"use client"
export default function ProfileGuard() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    // 로그인은 했는데 닉네임이나 전화번호가 없으면
    if (session?.user?.id && (!session.user.nickname || !session.user.phone)) {
      router.replace("/complete-profile")  // 회원가입 페이지로 강제 이동
    }
  }, [session, router])

  return null  // 화면에는 아무것도 안 보임 (감시만 함)
}
```

**비유:** 
- 식당에 들어왔는데 회원카드가 없으면 → "먼저 카드 만들고 오세요" 하고 접수처로 안내
- ProfileGuard = 이 안내원 역할

### 회원가입 취소

회원가입 페이지에서 "취소"를 누르면:
1. `signOut()` 호출 → 로그아웃
2. 메인 페이지로 이동

로그아웃을 해야 하는 이유: 로그인 상태로 메인에 가면 ProfileGuard가 다시 회원가입으로 보내기 때문.

---

## 19. 알게 된 버그와 해결 방법 모음

### 버그 1: question_type 불일치
- **증상:** 모든 문제가 서술형으로 나옴 (4지 선다가 안 보임)
- **원인:** 코드에서 `questionType === 'CHOICE'`로 비교했는데, DB 값은 `'MULTIPLE_CHOICE'`
- **해결:** `'CHOICE'` → `'MULTIPLE_CHOICE'`로 수정

### 버그 2: camelCase vs snake_case
- **증상:** 과목별 점수가 안 나옴
- **원인:** Prisma는 `subjectScore` (camelCase) 반환, 프론트엔드는 `subject_score` (snake_case) 기대
- **해결:** API 응답에서 변환 코드 추가

### 버그 3: useSearchParams + Suspense
- **증상:** 관리자 문제 관리 페이지 빌드 에러
- **원인:** Next.js 15에서 `useSearchParams()`를 쓰려면 반드시 `<Suspense>`로 감싸야 함
- **해결:** page.tsx에 Suspense 래퍼 추가, 실제 컴포넌트를 별도 파일로 분리

### 버그 4: PrismaNeon 생성자
- **증상:** DB 연결 에러
- **원인:** `new PrismaNeon(connectionString)` 이렇게 문자열 직접 전달하면 안 됨
- **해결:** `new PrismaNeon({ connectionString })` 객체로 감싸서 전달

### 버그 5: 회원탈퇴 후 로그인 유지
- **증상:** 회원 탈퇴했는데 사이트가 로그인 상태로 남아있음
- **원인:** DB에서 유저를 삭제했지만 JWT 세션 쿠키가 브라우저에 남아있었음
- **해결:** 탈퇴 후 `signOut({ callbackUrl: '/' })` 호출하여 세션 쿠키 삭제

### 버그 6: LaTeX 백슬래시 손실
- **증상:** 수학 공식 선택지가 `∂arepsilon`, `dfrac`, `imes`처럼 깨져서 표시
- **원인:** TypeScript에서 `"$\\varepsilon$"` 대신 일반 문자열을 사용하여 `\v`, `\d`, `\t`가 이스케이프 시퀀스로 해석됨
- **해결:** `String.raw` 템플릿 리터럴 사용 → `String.raw\`$\varepsilon$\`` 으로 백슬래시 보존

### 버그 7: next/image 외부 이미지 차단
- **증상:** 관리자 페이지에서 문제 이미지(Cloudinary)가 안 보임, "문제 이미지" alt 텍스트만 표시
- **원인:** `next.config.ts`의 `images.remotePatterns`에 Cloudinary 도메인이 등록되지 않음
- **해결:** `res.cloudinary.com` 도메인 추가

### 버그 8: OG 이미지 404
- **증상:** 카카오톡 링크 미리보기에서 이미지가 안 나옴
- **원인:** `public/og.png` 파일이 git에 커밋되지 않아서 Vercel에 배포 안 됨
- **해결:** `git add public/og.png` → 커밋/푸시

---

## 20. 선택지 이미지 기능

### 왜 필요한가?

"배전반을 나타내는 그림 기호는?" 같은 문제는 선택지 자체가 **이미지**여야 한다.
텍스트로 "직사각형 안에 X 표시 (빈 배경)"이라고 쓰면 실제 시험과 다르다.

### DB 구조

Question 테이블에 4개 필드 추가:

```
choice_1_image  -- 선택지 1 이미지 URL (없으면 텍스트 표시)
choice_2_image  -- 선택지 2 이미지 URL
choice_3_image  -- 선택지 3 이미지 URL
choice_4_image  -- 선택지 4 이미지 URL
```

### 렌더링 로직

```
이미지 URL이 있으면 → <img> 태그로 이미지 표시
이미지 URL이 없으면 → 기존처럼 텍스트(MathText) 표시
```

이 로직이 적용된 페이지:
- 시험 풀기 (ExamAttemptClient)
- 시험 결과 (ExamResultContent)
- 오답노트 (WrongAnswersContent)
- 관리자 문제 목록 (QuestionsClient)
- 관리자 문제 편집기 (QuestionSplitEditor) - 미리보기 포함

### 관리자 이미지 업로드

선택지 이미지 입력은 본문 이미지와 **동일한 방식** 지원:
1. **URL 직접 입력** — 이미지 주소 붙여넣기
2. **Base64 붙여넣기** — `data:image/...` 자동 감지 → Cloudinary 업로드
3. **Ctrl+V 붙여넣기** — 클립보드 이미지 자동 업로드
4. **파일 선택** — "파일" 버튼으로 탐색기에서 선택
5. **삭제** — "삭제" 버튼으로 이미지 제거
6. **미리보기** — 업로드된 이미지 썸네일 표시

---

## 21. KaTeX로 수학 수식 표시

### 뭐하는 거?

전기 시험 문제에는 분수, 루트, 삼각함수 같은 수학 공식이 많다.
이걸 예쁘게 표시하려면 **KaTeX**(카텍)이라는 수학 렌더링 라이브러리를 사용한다.

### 사용법

문제 텍스트나 선택지에 `$...$`로 감싸면 된다.

```
입력: $\dfrac{V_0 - V_n}{V_n} \times 100\%$

결과:  V₀ - Vₙ
      ───────── × 100%
         Vₙ
```

### 자주 쓰는 LaTeX 명령어

| 명령어 | 결과 | 설명 |
|--------|------|------|
| `\dfrac{a}{b}` | a/b 분수 | 큰 분수 표시 |
| `\sqrt{x}` | √x | 루트 |
| `\times` | × | 곱셈 기호 |
| `\cos\theta` | cosθ | 코사인 세타 |
| `\tan^{-1}` | tan⁻¹ | 아크탄젠트 |
| `\omega` | ω | 오메가 |
| `\varepsilon` | ε | 엡실론 |
| `V_n` | Vₙ | 아래 첨자 |
| `10^3` | 10³ | 위 첨자 |
| `\Omega` | Ω | 옴 기호 |

### 주의: String.raw 사용 필수

TypeScript/JavaScript에서 LaTeX 문자열을 코드로 작성할 때 반드시 `String.raw`를 사용해야 한다.

```typescript
// ❌ 잘못된 방식 — \v, \t, \d 등이 이스케이프 시퀀스로 해석됨
const bad = "$\\varepsilon$"  // \v → 수직탭 문자로 변환돼버림!

// ✅ 올바른 방식 — String.raw는 백슬래시를 있는 그대로 유지
const good = String.raw`$\varepsilon$`  // \v가 그대로 보존됨
```

**비유:**
- 일반 문자열 = 편지를 읽으면서 약어를 자동 번역하는 비서 (`\n` → 줄바꿈, `\t` → 탭)
- `String.raw` = 편지를 있는 그대로 전달하는 비서 (아무것도 건드리지 않음)

---

## 22. force-dynamic vs ISR (페이지 캐싱 전략)

### force-dynamic = 주문 즉시 조리

```
손님이 주문 → 매번 주방에서 새로 요리 → 항상 최신 상태
```

```typescript
export const dynamic = "force-dynamic"  // 매 요청마다 서버에서 새로 렌더링
```

- **장점:** 관리자가 수정하면 **즉시** 반영
- **단점:** 매번 DB 조회 → **0.5~1초** 걸림

### ISR = 미리 만들어두고 주기적으로 교체

```
첫 손님이 주문 → 요리를 진열대에 올려둠
→ 30초간 다음 손님들은 진열대에서 바로 가져감 (DB 안 감!)
→ 30초 지나면 새로 만들어서 교체
```

```typescript
export const revalidate = 30  // 30초마다 갱신
```

- **장점:** 진열대(캐시)에서 바로 꺼내니까 **0.1초** 이내
- **단점:** 관리자가 수정해도 **최대 30초** 기다려야 반영

### 우리는 뭘 쓰나?

**ISR (revalidate = 30)** 을 쓴다.

이유: 관리자가 시험 정보를 바꾸는 건 하루에 한두 번 있을까 말까.
반면 사용자가 시험 페이지를 여는 건 하루에 수백 번.
30초 지연 때문에 관리자가 약간 불편한 것 vs 수백 명이 매번 1초씩 기다리는 것
→ **ISR이 압도적으로 유리**

### 페이지별 전략 정리

| 페이지 | 전략 | 이유 |
|--------|------|------|
| 홈페이지 | ISR 60초 | 자주 안 바뀜 |
| 카테고리 페이지 | ISR 60초 + generateStaticParams | 시험 목록은 천천히 변함 |
| 시험 시작 페이지 | ISR 30초 + generateStaticParams | 시험 정보 변경 빠르게 반영 |
| 시험 풀기 | 서버 컴포넌트 (캐시 없음) | 개인별 답안 데이터 |
| 시험 결과 | 서버 컴포넌트 (캐시 없음) | 개인별 성적 데이터 |
| 마이페이지 | 서버 컴포넌트 (캐시 없음) | 개인별 기록 |
| 관리자 페이지 | 서버 컴포넌트 (캐시 없음) | 항상 최신 필요 |

---

## 23. OG (Open Graph) 메타태그

### 뭐하는 거?

카카오톡이나 슬랙에 URL을 보내면 **미리보기 카드**가 나온다.
이게 OG 메타태그를 읽어서 보여주는 것이다.

```html
<meta property="og:title" content="전기짱" />
<meta property="og:description" content="전기 박사와 기술사들이 검증한 CBT 문제" />
<meta property="og:image" content="https://www.mycbt.xyz/og.png" />
```

### Next.js에서 설정하는 법

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: "전기짱",
  description: "전기 박사와 기술사들이 검증한 CBT 문제",
  openGraph: {
    title: "전기짱",
    description: "전기 박사와 기술사들이 검증한 CBT 문제",
    siteName: "전기짱",
    url: "https://www.mycbt.xyz",
    images: [
      {
        url: "https://www.mycbt.xyz/og.png",  // 절대 URL 필수!
        width: 1200,
        height: 630,
      },
    ],
  },
}
```

### 주의사항

1. **이미지 URL은 절대 경로** — `/og.png`가 아니라 `https://www.mycbt.xyz/og.png`
2. **이미지 파일은 git에 커밋** — `public/og.png`가 커밋 안 되면 Vercel에 배포 안 됨 (404)
3. **카카오톡 캐시** — OG 수정 후에도 카톡에서 예전 것이 보이면 [카카오 캐시 초기화](https://developers.kakao.com/tool/debugger/sharing) 필요
4. **권장 이미지 크기** — 1200 × 630 픽셀

---

## 24. Cloudinary 이미지 저장소

### next/image와 외부 이미지

Next.js의 `<Image>` 컴포넌트는 보안상 **허용된 도메인의 이미지만** 표시한다.
허용되지 않은 도메인은 차단되어 깨진 이미지로 나온다.

### 도메인 등록 방법

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',  // ← Cloudinary 허용
    },
  ],
},
```

### 비유

- `<Image>` = 보안이 철저한 우편함 (등록된 발신자만 통과)
- `remotePatterns` = 허용 목록 (이 목록에 있는 도메인만 이미지 통과)
- 등록 안 하면 = "이 발신자 모르겠는데?" → 이미지 차단

---

## 25. 문제 등록 시 알게 된 것들

### 문제 코드 체계

```
FUNC-T-ET-001
│     │  │  └── 일련번호
│     │  └──── 과목 약어 (ET=전기이론, EM=전기기기, EI=전기설비)
│     └─────── T=맛보기(Trial)
└───────────── FUNC=전기기능사
```

### 과목 분류 기준

| 문제 내용 | 과목 | 예시 |
|-----------|------|------|
| 회로, 저항, 전압, 전류 계산 | 전기이론 | RC 병렬회로 위상각, Rx 저항값 |
| 전동기, 변압기, 발전기 | 전기기기 | 유도 전동기 효율, 전압 변동률, 기동 토크 |
| 배선, 기호, 법규, 시설 | 전기설비 | 배전반 그림 기호 |

### 시드 스크립트 작성 시 주의

1. **환경변수 로드**: `import * as dotenv from "dotenv"; dotenv.config({ path: ".env.local" })`
2. **Prisma 경로**: 프로젝트 디렉토리 안에서 실행해야 `./lib/generated/prisma/client` 경로가 잡힘
3. **LaTeX 문자열**: 반드시 `String.raw` 사용 (위 섹션 21 참조)
4. **임시 파일 정리**: 시드 스크립트 실행 후 `rm` 으로 삭제 (git에 올라가면 안 됨)
