# 문제 JSON 작성 가이드 (Gemini Gems용)

## JSON 스키마

```json
[
  {
    "exam": "시험명 (아래 표 참조, 정확히 일치해야 함)",
    "subject": "과목명 (아래 표 참조, 해당 시험의 과목만 사용 가능)",
    "question_text": "문제 본문",
    "choice_1": "1번 선택지",
    "choice_2": "2번 선택지",
    "choice_3": "3번 선택지",
    "choice_4": "4번 선택지",
    "answer": 1,
    "explanation": "해설 (선택사항)"
  }
]
```

## 시험 및 과목 목록

### 1. 전기기능사
- 전기이론
- 전기기기
- 전기설비

### 2. 전기산업기사
- 전기자기학
- 전력공학
- 전기기기
- 회로이론
- 전기설비기술기준

### 3. 전기기사
- 전기자기학
- 전력공학
- 전기기기
- 회로이론 및 제어공학
- 전기설비기술기준

## 주의사항

- `exam`과 `subject`는 위 표의 값과 **정확히 동일**해야 함 (띄어쓰기, 오타 주의)
- `answer`는 1~4 정수
- `question_code`는 생략하면 서버가 자동 생성함
- 수식은 LaTeX로 `$...$` (인라인) 또는 `$$...$$` (블록) 사용 가능
  - 예: `$\frac{1}{2}$`, `$\sqrt{3}$`, `$R_1$`, `$V^2$`
- 수식이 아닌 아래첨자/위첨자는 HTML 태그 사용 가능
  - 예: `R<sub>1</sub>`, `x<sup>2</sup>`

## 예시

```json
[
  {
    "exam": "전기기능사",
    "subject": "전기이론",
    "question_text": "직렬 회로에서 전류의 특성은?",
    "choice_1": "$\\varepsilon_1 > \\varepsilon_2$인 경우 $\\varepsilon_1$",
    "choice_2": "각 지점마다 다르다",
    "choice_3": "처음이 가장 크다",
    "choice_4": "끝이 가장 크다",
    "answer": 1,
    "explanation": "직렬 회로에서는 전류가 어디서나 동일합니다."
  },
  {
    "exam": "전기산업기사",
    "subject": "회로이론",
    "question_text": "저항 $R$에 걸리는 전력 $P$를 구하는 공식은?",
    "choice_1": "$P = \\frac{V^2}{R}$",
    "choice_2": "$P = \\frac{R}{V^2}$",
    "choice_3": "$P = V^2 \\cdot R$",
    "choice_4": "$P = \\frac{V}{R^2}$",
    "answer": 1,
    "explanation": "$P = VI = \\frac{V^2}{R} = I^2R$"
  }
]
```
