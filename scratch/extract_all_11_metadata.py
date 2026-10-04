import urllib.request
import re
import ssl
import json
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

archive_url = 'https://www.birlaschoolpilani.edu.in/gallery/photo-school-archive'
req = urllib.request.Request(archive_url, headers=headers)
with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
    html = r.read().decode('utf-8', errors='ignore')

# Match category links
items = re.findall(r'<a\s+[^>]*href=["\'](https://www.birlaschoolpilani.edu.in/galleryitems/(\d+))["\'][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)

seen = set()
gallery_categories = []
for full_url, item_id, title_raw in items:
    clean_title = re.sub(r'<[^>]+>', '', title_raw).replace('\ufffd', '-').strip()
    if item_id not in seen and clean_title:
        seen.add(item_id)
        gallery_categories.append({
            'id': item_id,
            'url': full_url,
            'title': clean_title
        })

print(f"Discovered {len(gallery_categories)} categories:")
for idx, c in enumerate(gallery_categories, 1):
    print(f" {idx}. [{c['id']}] {c['title']}")

all_categories_data = []

# Map existing downloaded files
local_files = os.listdir('public/photos/archive_gallery') if os.path.exists('public/photos/archive_gallery') else []
local_map = {}
for f in local_files:
    # format: {cat_id}_{filename}
    parts = f.split('_', 1)
    if len(parts) == 2:
        local_map.setdefault(parts[0], {})[parts[1]] = f"public/photos/archive_gallery/{f}"

for cat in gallery_categories:
    try:
        creq = urllib.request.Request(cat['url'], headers=headers)
        with urllib.request.urlopen(creq, context=ctx, timeout=8) as cr:
            chtml = cr.read().decode('utf-8', errors='ignore')
            
            # Find all image URLs in this gallery page
            img_urls = re.findall(r'src=["\']([^"\']*(?:storage/media|uploads|gallery)[^"\']+\.(?:jpg|jpeg|png|webp))["\']', chtml, re.IGNORECASE)
            href_imgs = re.findall(r'href=["\']([^"\']*(?:storage/media|uploads|gallery)[^"\']+\.(?:jpg|jpeg|png|webp))["\']', chtml, re.IGNORECASE)
            combined = list(dict.fromkeys(img_urls + href_imgs))
            
            # Filter out logos and banners
            photos = []
            for p_url in combined:
                if any(x in p_url.lower() for x in ['logo', 'icon', 'banner', 'headshot']):
                    continue
                if not p_url.startswith('http'):
                    p_url = 'https://www.birlaschoolpilani.edu.in' + (p_url if p_url.startswith('/') else '/' + p_url)
                
                filename = p_url.split('/')[-1]
                # Check if we have local copy
                cat_local = local_map.get(cat['id'], {})
                local_path = cat_local.get(filename)
                
                photos.append({
                    'remote_url': p_url,
                    'local_path': local_path if local_path else p_url,
                    'is_local': bool(local_path),
                    'filename': filename
                })
            
            all_categories_data.append({
                'id': cat['id'],
                'slug': f"cat-{cat['id']}",
                'title': cat['title'],
                'photo_count': len(photos),
                'photos': photos
            })
            print(f"Category '{cat['title']}': {len(photos)} photos mapped")
    except Exception as e:
        print(f"Error on {cat['title']}: {e}")

with open('scratch/all_11_categories_metadata.json', 'w', encoding='utf-8') as f:
    json.dump(all_categories_data, f, indent=2)

print("\nSaved all 11 categories metadata to scratch/all_11_categories_metadata.json")
