"""EasyOCR 테스트: 한국어+수식 이미지 OCR"""
import easyocr, sys, requests, io
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8')

reader = easyocr.Reader(['ko', 'en'], gpu=False)

def ocr_from_url(url):
    resp = requests.get(url, timeout=15)
    results = reader.readtext(resp.content)
    return ' '.join([r[1] for r in results])

q_url = 'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001.png'
c_urls = [f'https://image.engineerlab.co.kr/ibt/ee_pil/ee_pil_prev/18_01/images/EE18_01_001_{i}.png' for i in range(1,5)]

print('문제:', ocr_from_url(q_url))
for i, curl in enumerate(c_urls):
    print(f'보기{i+1}:', ocr_from_url(curl))
