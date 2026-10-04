import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

url = 'https://www.birlaschoolpilani.edu.in/'
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
    html = r.read().decode('utf-8', errors='ignore')

print("--- ALL A TAGS MATCHING GALLERY / PHOTO / ARCHIVE ---")
matches = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
for href, text in matches:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if any(k in href.lower() or k in clean_text.lower() for k in ['gallery', 'photo', 'album', 'archive', 'media']):
        print(f"'{clean_text}' => {href}")

archive_url = 'https://www.birlaschoolpilani.edu.in/gallery/photo-school-archive'
req2 = urllib.request.Request(archive_url, headers=headers)
with urllib.request.urlopen(req2, context=ctx, timeout=10) as r2:
    html2 = r2.read().decode('utf-8', errors='ignore')

print("\n--- IN PHOTO-SCHOOL-ARCHIVE ---")
matches2 = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html2, re.DOTALL | re.IGNORECASE)
for href, text in matches2:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if clean_text and any(k in href.lower() for k in ['gallery', 'category', 'album', 'photo', 'storage']):
        print(f"Sub-cat: '{clean_text}' => {href}")

# Find all images on photo-school-archive
imgs = re.findall(r'src=["\']([^"\']*(?:storage/media|uploads|gallery)[^"\']*)["\']', html2, re.IGNORECASE)
print(f"Found {len(imgs)} media images on archive page")
for img in imgs[:10]:
    print("  Img:", img)
