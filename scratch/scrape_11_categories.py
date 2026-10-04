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

# Extract gallery items: <a href="https://www.birlaschoolpilani.edu.in/galleryitems/(\d+)">Title</a>
items = re.findall(r'<a\s+[^>]*href=["\'](https://www.birlaschoolpilani.edu.in/galleryitems/(\d+))["\'][^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)

# Deduplicate
seen = set()
gallery_categories = []
for full_url, item_id, title_raw in items:
    title = re.sub(r'<[^>]+>', '', title_raw).replace('', '-').strip()
    if item_id not in seen and title:
        seen.add(item_id)
        gallery_categories.append({
            'id': item_id,
            'url': full_url,
            'title': title
        })

print(f"Found {len(gallery_categories)} categories:")
for c in gallery_categories:
    print(f"  [{c['id']}] {c['title']} -> {c['url']}")

# Now visit each category and extract all photos!
os.makedirs('public/photos/archive_gallery', exist_ok=True)
all_gallery_data = []

for cat in gallery_categories:
    print(f"\nFetching category: {cat['title']} ({cat['url']})...")
    try:
        creq = urllib.request.Request(cat['url'], headers=headers)
        with urllib.request.urlopen(creq, context=ctx, timeout=12) as cr:
            chtml = cr.read().decode('utf-8', errors='ignore')
            
            # Find all image URLs in this gallery page
            # Usually <img ... src="https://www.birlaschoolpilani.edu.in/public/storage/media/..." or similar
            img_urls = re.findall(r'src=["\']([^"\']*(?:storage/media|uploads|gallery)[^"\']+\.(?:jpg|jpeg|png|webp))["\']', chtml, re.IGNORECASE)
            
            # Also check href in lightbox / anchor tags
            href_imgs = re.findall(r'href=["\']([^"\']*(?:storage/media|uploads|gallery)[^"\']+\.(?:jpg|jpeg|png|webp))["\']', chtml, re.IGNORECASE)
            combined = list(dict.fromkeys(img_urls + href_imgs))
            
            # Filter out logos
            filtered_imgs = [u for u in combined if not any(x in u.lower() for x in ['logo', 'icon', 'banner'])]
            print(f"  Found {len(filtered_imgs)} photos in {cat['title']}")
            
            cat_photos = []
            for i, p_url in enumerate(filtered_imgs):
                if not p_url.startswith('http'):
                    p_url = 'https://www.birlaschoolpilani.edu.in' + (p_url if p_url.startswith('/') else '/' + p_url)
                
                filename = p_url.split('/')[-1]
                local_path = f"public/photos/archive_gallery/{cat['id']}_{filename}"
                
                # Check if already exists or download
                if not os.path.exists(local_path):
                    try:
                        img_req = urllib.request.Request(p_url, headers=headers)
                        with urllib.request.urlopen(img_req, context=ctx, timeout=10) as ir:
                            data = ir.read()
                            with open(local_path, 'wb') as img_out:
                                img_out.write(data)
                        print(f"    Downloaded {filename} ({len(data)} bytes)")
                    except Exception as err:
                        print(f"    Failed download {p_url}: {err}")
                
                cat_photos.append({
                    'remote_url': p_url,
                    'local_path': local_path if os.path.exists(local_path) else p_url,
                    'filename': filename,
                    'alt': f"{cat['title']} - Photo {i+1}"
                })
            
            all_gallery_data.append({
                'id': cat['id'],
                'slug': f"cat-{cat['id']}",
                'title': cat['title'],
                'photos': cat_photos
            })
    except Exception as e:
        print(f"  Error fetching {cat['url']}: {e}")

with open('scratch/complete_11_categories.json', 'w', encoding='utf-8') as f:
    json.dump(all_gallery_data, f, indent=2)

print("\n--- SUMMARY OF ALL 11 CATEGORIES ---")
total_photos = sum(len(c['photos']) for c in all_gallery_data)
print(f"Total categories: {len(all_gallery_data)}, Total photos: {total_photos}")
for c in all_gallery_data:
    print(f"Category '{c['title']}': {len(c['photos'])} photos")
