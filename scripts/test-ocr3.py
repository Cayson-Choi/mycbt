"""OCR 테스트: Claude sonnet 직접 호출"""
import requests, sys, base64, json
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = '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'

def img_to_base64(url):
    resp = requests.get(url, timeout=15)
    return base64.b64encode(resp.content).decode()

q_url = 'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001.png'
c_urls = [f'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001_{i}.png' for i in range(1,5)]

prompt = (
    "아래 이미지들에서 텍스트를 정확히 추출하세요. 첫 번째가 문제, 나머지 4개가 보기입니다.\n\n"
    "중요 규칙:\n"
    "1. 이미지에 보이는 글자를 그대로 정확히 읽으세요. 절대 내용을 추측하거나 변경하지 마세요.\n"
    "2. 수학 기호와 수식은 KaTeX 인라인 문법 $...$ 으로 감싸세요\n"
    "3. 그림/도표가 포함되어 있으면 [그림] 표시 후 그림 속 텍스트/레이블도 추출\n"
    "4. 아래 JSON 형식으로만 응답 (```json 없이 순수 JSON만):\n"
    '{"question_text": "문제 텍스트", "choice_1": "보기1", "choice_2": "보기2", "choice_3": "보기3", "choice_4": "보기4"}\n'
)

content = [
    {'type': 'text', 'text': prompt},
    {'type': 'text', 'text': '문제 이미지:'},
    {'type': 'image_url', 'image_url': {'url': f'data:image/png;base64,{img_to_base64(q_url)}'}},
]
for i, curl in enumerate(c_urls):
    content.append({'type': 'text', 'text': f'보기 {i+1} 이미지:'})
    content.append({'type': 'image_url', 'image_url': {'url': f'data:image/png;base64,{img_to_base64(curl)}'}})

# Try multiple models
models = [
    'google/gemini-2.5-flash-preview-05-20',
    'openai/gpt-4o',
]

for model in models:
    print(f'\n=== {model} ===')
    try:
        resp = requests.post('https://openrouter.ai/api/v1/chat/completions',
            headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'},
            json={
                'model': model,
                'messages': [{'role': 'user', 'content': content}],
                'max_tokens': 1000,
            },
            timeout=90
        )
        result = resp.json()
        if 'choices' in result:
            msg = result['choices'][0]['message']['content']
            cost = result.get('usage', {}).get('cost', 'N/A')
            print(f'Cost: ${cost}')
            print(msg)
        else:
            print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f'Error: {e}')
