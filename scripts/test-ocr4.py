"""OCR 테스트: 이미지 하나씩 개별 처리"""
import requests, sys, base64, json
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = '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'

def img_to_base64(url):
    resp = requests.get(url, timeout=15)
    return base64.b64encode(resp.content).decode()

def ocr_single_image(img_url, model, context=""):
    b64 = img_to_base64(img_url)
    prompt = (
        f"{context}"
        "이 이미지에 보이는 텍스트를 한 글자도 빠짐없이 정확히 그대로 읽어서 출력하세요. "
        "수식은 KaTeX 인라인 $...$ 으로 감싸세요. "
        "이미지에 그림이 포함되어 있으면 [그림] 으로 표시하세요. "
        "텍스트만 출력하고, 다른 설명은 하지 마세요."
    )
    resp = requests.post('https://openrouter.ai/api/v1/chat/completions',
        headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'},
        json={
            'model': model,
            'messages': [{'role': 'user', 'content': [
                {'type': 'text', 'text': prompt},
                {'type': 'image_url', 'image_url': {'url': f'data:image/png;base64,{b64}'}},
            ]}],
            'max_tokens': 500,
        },
        timeout=60
    )
    result = resp.json()
    if 'choices' in result:
        return result['choices'][0]['message']['content'], result.get('usage', {}).get('cost', 0)
    return f"ERROR: {result}", 0

# 테스트 이미지들
q_url = 'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001.png'
c_urls = [f'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001_{i}.png' for i in range(1,5)]

models = ['google/gemini-2.0-flash-001']

for model in models:
    print(f'\n=== {model} (개별 처리) ===')
    total_cost = 0

    text, cost = ocr_single_image(q_url, model, "전기기사 시험 문제 이미지입니다. ")
    total_cost += cost
    print(f'문제: {text}')

    for i, curl in enumerate(c_urls):
        text, cost = ocr_single_image(curl, model, "전기기사 시험 보기 이미지입니다. ")
        total_cost += cost
        print(f'보기{i+1}: {text}')

    print(f'총 비용: ${total_cost}')
