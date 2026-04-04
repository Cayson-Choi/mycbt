새 기능을 구현해줘.

## 진행 절차
1. 사용자 요구사항 정리
2. 영향받는 파일 파악 (기존 코드 먼저 읽기)
3. 구현 계획 제시 (사용자 확인)
4. 최소 변경 원칙으로 구현
5. 빌드 확인
6. 결과 보고 (커밋은 사용자가 요청할 때만)

## 구현 원칙
- 기존 코드 패턴 따르기
- API: snake_case 응답
- Prisma: camelCase → snake_case 변환
- 페이지: 'use client' + 로딩/에러 상태 처리
- 다크모드 지원 필수
- 모바일 반응형 필수
- 이모지 사용 금지

## 참고 파일
- CLAUDE.md: 프로젝트 규칙
- CURRENT_STATE.md: 현재 개발 상태
- prisma/schema.prisma: DB 스키마
