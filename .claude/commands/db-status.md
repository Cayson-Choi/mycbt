Neon PostgreSQL 데이터베이스 현황을 조회해서 보기 좋게 정리해줘.

다음 쿼리를 실행해서 결과를 테이블 형태로 보여줘:

1. **회원 현황**: 전체 회원 수, 관리자 수, 등급별 회원 수
2. **시험 현황**: 카테고리별 시험 수, 게시/비게시 현황
3. **문제 현황**: 카테고리별 문제 수, 과목별 문제 수
4. **응시 현황**: 전체 응시 수, 상태별(SUBMITTED/IN_PROGRESS/EXPIRED) 수

pg Pool을 사용해서 직접 쿼리 실행:
```
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED });
```
