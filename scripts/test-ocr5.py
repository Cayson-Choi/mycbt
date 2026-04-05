"""OCR 테스트: Claude Sonnet via OpenRouter - 정확한 모델명"""
import requests, sys, base64, json
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = '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'

def img_to_base64_data(url):
    resp = requests.get(url, timeout=15)
    b64 = base64.b64encode(resp.content).decode()
    return f'data:image/png;base64,{b64}'

q_url = 'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001.png'
c_urls = [f'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001_{i}.png' for i in range(1,5)]

prompt = (
    "전기기사 시험 이미지에서 텍스트를 정확히 추출하세요.\n"
    "첫 번째=문제, 나머지 4개=보기1~4\n\n"
    "규칙:\n"
    "- 이미지의 텍스트를 글자 그대로 정확히 읽기\n"
    "- 수식은 KaTeX $...$ 으로 감싸기 (예: $\\pi a^2 BI$)\n"
    "- 그림 있으면 [그림] 표시\n"
    "- JSON만 출력 (```없이):\n"
    '{"q":"문제텍스트","c1":"보기1","c2":"보기2","c3":"보기3","c4":"보기4"}'
)

content = [{'type': 'text', 'text': prompt}]
content.append({'type': 'image_url', 'image_url': {'url': img_to_base64_data(q_url)}})
for i, curl in enumerate(c_urls):
    content.append({'type': 'image_url', 'image_url': {'url': img_to_base64_data(curl)}})

# 시도할 모델들
models = [
    'anthropic/claude-sonnet-4',
    'anthropic/claude-3.5-sonnet-20241022',
]

for model in models:
    print(f'\n=== {model} ===')
    try:
        resp = requests.post('https://openrouter.ai/api/v1/chat/completions',
            headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'},
            json={
                'model': model,
                'messages': [{'role': 'user', 'content': content}],
                'max_tokens': 800,
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
            print(f'Error: {json.dumps(result, ensure_ascii=False)[:300]}')
    except Exception as e:
        print(f'Exception: {e}')
