"""
전기기사 1500문제 이미지 OCR → 텍스트+LaTeX 추출
Claude Sonnet 4 via OpenRouter
"""
import requests, sys, base64, json, os, time
sys.stdout.reconfigure(encoding='utf-8')

API_KEY = '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'
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DATA_FILE = os.path.join(BASE, 'data', 'electric-engineer-questions.json')
PROGRESS_FILE = os.path.join(BASE, 'data', 'ocr-progress.json')

def img_b64(url):
    for i in range(3):
        try:
            r = requests.get(url, timeout=20)
            r.raise_for_status()
            return 'data:image/png;base64,' + base64.b64encode(r.content).decode()
        except:
            if i == 2: raise
            time.sleep(2)

def ocr_question(q_img, c_imgs):
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
    content.append({'type': 'image_url', 'image_url': {'url': img_b64(q_img)}})
    for c in c_imgs:
        content.append({'type': 'image_url', 'image_url': {'url': img_b64(c)}})

    for attempt in range(5):
        try:
            resp = requests.post('https://openrouter.ai/api/v1/chat/completions',
                headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'},
                json={'model': 'anthropic/claude-sonnet-4', 'messages': [{'role': 'user', 'content': content}], 'max_tokens': 800},
                timeout=90
            )
            result = resp.json()
            if 'choices' not in result:
                err = str(result)
                if 'rate' in err.lower() or '429' in err:
                    time.sleep(10 * (attempt + 1))
                    continue
                raise Exception(err[:200])

            msg = result['choices'][0]['message']['content'].strip()
            cost = result.get('usage', {}).get('cost', 0)

            if msg.startswith('```'):
                msg = msg.split('\n', 1)[-1].rsplit('```', 1)[0].strip()

            parsed = json.loads(msg)
            return {
                'question_text': parsed.get('q', ''),
                'choice_1': parsed.get('c1', ''),
                'choice_2': parsed.get('c2', ''),
                'choice_3': parsed.get('c3', ''),
                'choice_4': parsed.get('c4', ''),
                'cost': cost,
            }
        except json.JSONDecodeError:
            if attempt < 4:
                time.sleep(2)
                continue
            return {'question_text': msg[:500], 'choice_1': '', 'choice_2': '', 'choice_3': '', 'choice_4': '', 'cost': cost, 'parse_error': True}
        except Exception as e:
            if attempt < 4:
                time.sleep(5 * (attempt + 1))
                continue
            raise

def main():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    progress = {}
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            progress = json.load(f)

    total_cost = float(progress.get('_total_cost', 0))
    processed = int(progress.get('_processed', 0))
    total_q = sum(sum(len(s['questions']) for s in e['subjects']) for e in data)

    print(f'총 {total_q}문제, 이미 처리: {processed}, 비용: ${total_cost:.4f}', flush=True)

    for exam_data in data:
        for subj in exam_data['subjects']:
            for q in subj['questions']:
                qcode = q['question_code']
                if qcode in progress:
                    continue

                q_img = q.get('image_url')
                c_imgs = [q.get(f'choice_{i}_image') for i in range(1, 5)]
                if not q_img or not all(c_imgs):
                    progress[qcode] = {'skip': True}
                    continue

                try:
                    result = ocr_question(q_img, c_imgs)
                    progress[qcode] = result
                    total_cost += result.get('cost', 0)
                    processed += 1
                    progress['_total_cost'] = total_cost
                    progress['_processed'] = processed

                    # 매 문제마다 저장
                    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
                        json.dump(progress, f, ensure_ascii=False)

                    if processed % 5 == 0:
                        print(f'[{processed}/{total_q}] ${total_cost:.2f} | {qcode} | {result.get("question_text","")[:60]}', flush=True)

                except Exception as e:
                    print(f'ERROR {qcode}: {e}', flush=True)
                    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
                        json.dump(progress, f, ensure_ascii=False)
                    time.sleep(10)

    print(f'\n완료! {processed}문제, 총 비용: ${total_cost:.2f}', flush=True)

if __name__ == '__main__':
    main()
