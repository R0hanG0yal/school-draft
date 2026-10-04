import urllib.request
import re
import os
import json

os.makedirs('public/photos/parents', exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

# The 4 official parent testimonials found on home page:
parents = [
    {
        "name": "Sikander Singh",
        "role": "Boarding Parent",
        "img_url": "https://www.birlaschoolpilani.edu.in/public/storage/media/172723703036.bmp",
        "local_file": "public/photos/parents/sikander_singh.png",
        "quote": "Birla School Pilani is a century-old pioneer institute in the field of education. In order to promote students' overall development in the boarding school setting, the school pledges to implement strong pastoral care. It was a very tough decision for me to send my only son to Birla School Pilani, but it ended up being one of the best ones I have ever made. I am incredibly appreciative of all the school's assistance and direction."
    },
    {
        "name": "Rashmita Bhattacharjee",
        "role": "Parent of Aditya, Senior Boarder",
        "img_url": "https://www.birlaschoolpilani.edu.in/public/storage/media/172674389210.jpg",
        "local_file": "public/photos/parents/rashmita_bhattacharjee.jpg",
        "quote": "My heartfelt appreciation for BSP and applaud the profound impact it has had on my child's life. Since joining this incredible school, I have witnessed Aditya grow into a confident and compassionate teenager. The school's environment, combined with its academic programs, has developed a love of learning that extends beyond the regular classroom curriculum."
    },
    {
        "name": "Navneet Kaushik",
        "role": "Parent of Class X Student",
        "img_url": "https://www.birlaschoolpilani.edu.in/public/storage/media/172922832019.png",
        "local_file": "public/photos/parents/navneet_kaushik.png",
        "quote": "I would like to express my gratitude to the team of The Birla School, Pilani. My child is currently studying in grade X and we have received exceptional support and guidance from the faculty. Their dedication has not only fostered my child's academic growth but also nurtured his personal development into an independent young individual."
    },
    {
        "name": "Naorem Sarda Devi & Haobam Satyajyoti Singh",
        "role": "Parents of Kheljit Haobam, Class X",
        "img_url": "https://www.birlaschoolpilani.edu.in/public/storage/media/175810953765.png",
        "local_file": "public/photos/parents/naorem_sarda_devi.png",
        "quote": "As a parent, I feel immensely proud to be associated with this century-old, top residential school through my son, Master Kheljit Haobam. His journey has been wonderful. I am impressed by the learning environment, the success of the curriculum, and the support of the teachers in striking a balance between academics and extracurricular activities."
    }
]

print("Downloading parent photos...")
for p in parents:
    try:
        req = urllib.request.Request(p['img_url'], headers=headers)
        with urllib.request.urlopen(req, timeout=15) as res:
            img_data = res.read()
            with open(p['local_file'], 'wb') as f:
                f.write(img_data)
        print(f"Downloaded {p['name']} -> {p['local_file']} ({len(img_data)} bytes)")
    except Exception as e:
        print(f"Failed to download {p['name']}: {e}")

with open('public/photos/parents/parents_manifest.json', 'w', encoding='utf-8') as f:
    json.dump(parents, f, indent=2)

print("Saved parents manifest!")
