import urllib.request
import re

url = 'https://www.birlaschoolpilani.edu.in/'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=12) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    matches = re.findall(r'<img[^>]+>', html, re.I)
    for m in matches:
        print(m)
except Exception as e:
    print("Error:", e)
