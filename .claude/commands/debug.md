체계적으로 버그를 분석하고 수정해줘.

## 분석 절차
1. 사용자가 설명한 증상을 정리
2. 관련 파일을 읽고 코드 흐름 추적 (API → 프론트 순서)
3. 캡처 이미지가 있으면 확인 (C:\Users\CaysonTech\Pictures\Screenshots)
4. DB 데이터 문제인지, API 응답 문제인지, 프론트 렌더링 문제인지 원인 분류
5. 원인을 정확히 짚은 후 최소 변경으로 수정
6. 빌드 확인 후 커밋하지 말고 결과 보고

## 주의사항
- 추측하지 말고 실제 코드와 데이터를 확인할 것
- snake_case vs camelCase 불일치 주의 (이전에 여러 번 발생한 버그 패턴)
- question_type: MULTIPLE_CHOICE vs CHOICE 혼동 주의
- Prisma 객체를 프론트에 그대로 내려보내는지 확인 (camelCase → snake_case 변환 필요)
