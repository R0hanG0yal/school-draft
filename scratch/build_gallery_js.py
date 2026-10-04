import json
import os
import re

with open('scratch/all_11_categories_metadata.json', encoding='utf-8') as f:
    cats = json.load(f)

local_files = set(os.listdir('public/photos/archive_gallery')) if os.path.exists('public/photos/archive_gallery') else set()

# Icons mapping for categories
icon_map = {
    '70': 'fa-flag',
    '68': 'fa-masks-theater',
    '60': 'fa-award',
    '59': 'fa-graduation-cap',
    '58': 'fa-medal',
    '39': 'fa-chalkboard-user',
    '38': 'fa-futbol',
    '37': 'fa-landmark-dome',
    '33': 'fa-music',
    '32': 'fa-trophy',
    '30': 'fa-shield-halved',
}

slug_map = {
    '70': 'republic-day-77',
    '68': 'annual-day-125',
    '60': 'republic-day-76',
    '59': 'annual-function-124',
    '58': 'investiture-2024',
    '39': 'fdp-2022',
    '38': 'football-bet',
    '37': 'independence-day-76',
    '33': 'annual-function-122',
    '32': 'annual-function-123',
    '30': 'republic-day-75',
}

categories_output = []

# Highlights category first
highlights_photos = [
    {"src": "public/photos/campus/Building RWS.jpg", "caption": "Birla School Pilani — Historic Main Heritage Facade (Estd. 1901)"},
    {"src": "public/photos/campus/179066173311.png", "caption": "Campus Frontage & Green Expanses"},
    {"src": "public/photos/campus/176067218465.jpg", "caption": "Morning Assembly & Institutional Gathering"},
    {"src": "public/photos/sports/177824136418.png", "caption": "Elite Horsemanship & Riding Club Ground"},
    {"src": "public/photos/academics/176067280221.jpg", "caption": "Advanced Senior Science Laboratory"},
    {"src": "public/photos/boarding/17255319745.jpg", "caption": "Residential Boarding House & Pastoral Common Room"},
    {"src": "public/photos/events/banner13.png", "caption": "The Renowned Birla School Brass & Pipe Band"},
    {"src": "public/photos/sports/172672868449.jpg", "caption": "Multi-Sport Athletics, Cricket & Football Grounds"},
    {"src": "public/photos/sports/IMG_9210.JPG", "caption": "All-India Inter-School Aquatic Championship Meet"},
    {"src": "public/photos/sports/1790223527100.5263.png", "caption": "District & Zonal Football Championship Match"},
    {"src": "public/photos/events/IMG_0018.JPG", "caption": "Abhivyakti Cultural Gala & Theatrical Production"},
    {"src": "public/photos/campus/172603136118.png", "caption": "Heritage Architecture & Educational Pavilions"},
    {"src": "public/photos/academics/17262112534.jpg", "caption": "Collaborative Seminar & Interactive Smart Classroom"},
    {"src": "public/photos/sports/172672877995.jpg", "caption": "Equestrian Training & Show Jumping Arena"},
    {"src": "public/photos/campus/172621079244.jpg", "caption": "Central Library & Digital Information Resource Hub"},
    {"src": "public/photos/events/172621086279.jpg", "caption": "National Cadet Corps (NCC) Ceremonial Contingent"}
]

categories_output.append({
    'id': 'highlights',
    'slug': 'all-highlights',
    'title': 'Campus & Life Highlights',
    'shortTitle': 'All Highlights',
    'icon': 'fa-star',
    'badge': f'{len(highlights_photos)} Key Highlights',
    'count': len(highlights_photos),
    'photos': highlights_photos
})

for c in cats:
    cat_id = c['id']
    cat_photos = []
    
    for idx, p in enumerate(c['photos']):
        remote_url = p['remote_url']
        filename = p['filename']
        expected_local = f"{cat_id}_{filename}"
        
        if expected_local in local_files:
            src = f"public/photos/archive_gallery/{expected_local}"
        else:
            src = remote_url
            
        cat_photos.append({
            'src': src,
            'fallback': remote_url,
            'caption': f"{c['title']} — Photo {idx + 1}"
        })
    
    short_title = c['title']
    short_title = re.sub(r'\s*\(.*?\)', '', short_title)
    short_title = short_title.replace('Celebration', '').replace('Function', '').strip()
    
    categories_output.append({
        'id': cat_id,
        'slug': slug_map.get(cat_id, f"category-{cat_id}"),
        'title': c['title'],
        'shortTitle': short_title if len(short_title) < 26 else short_title[:24] + '...',
        'icon': icon_map.get(cat_id, 'fa-images'),
        'badge': f"{len(cat_photos)} Photos",
        'count': len(cat_photos),
        'photos': cat_photos
    })

js_content = f"// Birla School Pilani - Official 11 Archive Categories + Highlights\nwindow.BSP_GALLERY_CATEGORIES = {json.dumps(categories_output, indent=2)};\n"

with open('gallery-data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Successfully generated gallery-data.js with {len(categories_output)} categories!")
for cat in categories_output:
    print(f" - {cat['title']}: {cat['count']} photos")
