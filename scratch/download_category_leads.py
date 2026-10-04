import urllib.request
import ssl
import json
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

with open('scratch/all_11_categories_metadata.json', encoding='utf-8') as f:
    cats = json.load(f)

os.makedirs('public/photos/archive_gallery', exist_ok=True)
downloaded = 0

for c in cats:
    cat_id = c['id']
    # For very large categories (e.g. 359 photos), ensure at least the first 30 photos are downloaded locally
    photos_to_check = c['photos'][:40]
    for idx, p in enumerate(photos_to_check):
        p_url = p['remote_url']
        filename = p_url.split('/')[-1]
        local_path = f"public/photos/archive_gallery/{cat_id}_{filename}"
        if not os.path.exists(local_path):
            try:
                req = urllib.request.Request(p_url, headers=headers)
                with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
                    with open(local_path, 'wb') as out:
                        out.write(resp.read())
                downloaded += 1
                if downloaded % 10 == 0:
                    print(f"Downloaded {downloaded} more photos...")
            except Exception as e:
                pass

print(f"Finished downloading pass. Total newly downloaded: {downloaded}")
print(f"Total files in archive_gallery: {len(os.listdir('public/photos/archive_gallery'))}")
