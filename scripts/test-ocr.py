"""OCR 테스트: 이미지에서 텍스트+LaTeX 추출"""
import requests, sys, base64, json
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = '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'

def img_to_base64(url):
    resp = requests.get(url, timeout=15)
    return base64.b64encode(resp.content).decode()

q_url = 'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001.png'
c_urls = [f'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001_{i}.png' for i in range(1,5)]

prompt = (
    "다음은 전기기사 시험 문제 이미지입니다. 문제 이미지 1개와 보기 이미지 4개를 보고 텍스트를 추출하세요.\n\n"
    "규칙:\n"
    "- 수식은 반드시 KaTeX 인라인 문법 $...$ 으로 감싸세요 (예: $V = IR$, $\\pi a^2 BI$)\n"
    "- 그림/회로도가 있으면 [그림] 으로 표시하고, 그림의 내용을 간략히 설명\n"
    "- JSON 형식으로만 응답하세요:\n"
    '{"question_text": "추출된 문제 텍스트", "choice_1": "보기1", "choice_2": "보기2", "choice_3": "보기3", "choice_4": "보기4"}\n\n'
    "첫 번째 이미지가 문제, 나머지 4개가 보기 1~4입니다."
)

content = [
    {'type': 'text', 'text': prompt},
    {'type': 'image_url', 'image_url': {'url': f'data:image/png;base64,{img_to_base64(q_url)}'}},
]

for i, curl in enumerate(c_urls):
    content.append({'type': 'text', 'text': f'보기 {i+1}:'})
    content.append({'type': 'image_url', 'image_url': {'url': f'data:image/png;base64,{img_to_base64(curl)}'}})

resp = requests.post('https://openrouter.ai/api/v1/chat/completions',
    headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'},
    json={
        'model': 'google/gemini-2.0-flash-001',
        'messages': [{'role': 'user', 'content': content}],
        'max_tokens': 1000,
    },
    timeout=60
)
result = resp.json()
print(json.dumps(result, ensure_ascii=False, indent=2))
