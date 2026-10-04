import urllib.request
import re
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

urls_to_try = [
    'https://www.birlaschoolpilani.edu.in/gallery',
    'https://www.birlaschoolpilani.edu.in/photo-gallery',
    'https://www.birlaschoolpilani.edu.in/gallery.php',
    'https://www.birlaschoolpilani.edu.in/'
]

for url in urls_to_try:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            html = r.read().decode('utf-8', errors='ignore')
            print(f"URL: {url} -> status {r.status}, length {len(html)}")
            
            # Find all links to gallery or categories
            links = re.findall(r'href=["\']([^"\']*gallery[^"\']*)["\']', html, re.IGNORECASE)
            print(f"Gallery links on {url}:", set(links))
            
            # Look for categories/filters
            filter_items = re.findall(r'data-filter=["\']([^"\']+)["\']', html)
            if filter_items:
                print(f"Data filters on {url}:", set(filter_items))
                
            # Look for category titles
            cat_headings = re.findall(r'<h[2345][^>]*>(.*?)</h[2345]>', html, re.IGNORECASE)
            # Find image URLs inside gallery
            imgs = re.findall(r'src=["\']([^"\']*(?:storage/media|gallery|photos)[^"\']*)["\']', html, re.IGNORECASE)
            print(f"Gallery images on {url}: {len(imgs)}")
    except Exception as e:
        print(f"URL {url} failed: {e}")
