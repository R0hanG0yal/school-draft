const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('scratch/photo_manifest.json', 'utf8'));
const gw = 'public/photos';

const SITE_GALLERY_CATEGORIES = [
  { key: 'academics',      label: 'Academics',                path: '/academics' },
  { key: 'events',         label: 'Annual Days & Events',     path: '/bsp/125th-annual-day-celebration-15th-oct-2025' },
  { key: 'achievements',   label: 'Achievements',             path: '/achievements' },
  { key: 'sports',         label: 'Games & Sports',           path: '/bsp/bet-inter-school-boys-swimming-meet-2024' },
  { key: 'clubs',          label: 'Clubs & Societies',        path: '/bsp/birla-school-pilani-clinches-the-inter-bet-volleyball-championship' },
  { key: 'campus',         label: 'Campus & Facilities',      path: '/' },
  { key: 'boarding',       label: 'Boarding Life',            path: '/boarding' },
  { key: 'societies',      label: 'National Cadet Corps',     path: '/bsp/bsv-mun-3-0-22-23-aug-2026' },
  { key: 'excursion',      label: 'Tour & Excursion',         path: '/bsp/a-day-of-fun-and-frolic-at-pratapgarh-farms-26-aug-2026' },
  { key: 'people',         label: 'Principal & Staff',        path: '/administrative-staff' },
  { key: 'others',         label: 'School Archive',           path: '/gallery' },
];

const CAT_RULES = [
  ['academics',  /academics|lab|class|science|result|stem|robot/i],
  ['events',     /annual|independence|republic|jubilee|celebrat|function|prize|assembly|foundation|parade|festival|farewell/i],
  ['achievements', /achieve|win|medal|trophy|champion|rank|grit|award|result|express|cbse/i],
  ['sports',     /swimming|football|volleyball|shooting|horse|riding|sport|cricket|athlet|arena|pool|games/i],
  ['clubs',      /robotics|band|pipe|cadet|ncc|mun|debate|science\s*club|kindness/i],
  ['campus',     /building|campus|aerial|ground|frontage|garden|quad|school|architecture|building ?rws|prospectus/i],
  ['boarding',   /hostel|boarding|dorm|dining|mess|refectory|house|infirmary|bspilani|residential/i],
  ['societies',  /ncc|cadet|mun|parade|army|navy|air\s*force|brass/i],
  ['excursion',  /excursion|tour|trip|pratapgarh|farm|outdoor|outing/i],
  ['people',     /principal|staff|faculty|director|teacher|headmaster|bupan/i],
  ['others',     /^/],
];

function bestCategory(src, file) {
  const hay = (src + ' ' + path.basename(file)).toLowerCase();
  for (const [key, re] of CAT_RULES) if (re.test(hay)) return key;
  return 'others';
}

const gallery = {};
for (const cat of SITE_GALLERY_CATEGORIES) gallery[cat.key] = { cat: cat, photos: [] };

for (let i = 0; i < manifest.manifest.length; i++) {
  const item = manifest.manifest[i];
  if (!item || !item.local || !fs.existsSync(item.local)) continue;
  const src = (item.source || '').toLowerCase();
  const file = path.basename(item.local);
  const cat = bestCategory(src, item.local);
  gallery[cat].photos.push({
    file: `${gw}/${file}`,
    src: item.url,
    page: src,
    caption: (item.alt || file.replace(/\.\w+$/, '').replace(/[_-]/g, ' ')).trim() || null,
    added: new Date().toISOString(),
  });
}

Object.entries(gallery).forEach(([key, bucket]) => {
  bucket.photos.sort((a, b) => {
    const n = (p) => { const m = p.file.match(/[\d]+/g); return m ? Number(m[0]) : 0; };
    return n(a) - n(b);
  });
});

const counts = {};
for (const [key, bucket] of Object.entries(gallery)) counts[key] = bucket.photos.length;
console.log('photos per category:', JSON.stringify(counts));
console.log('total:', Object.values(counts).reduce((a,b) => a+b, 0));

// detect likely duplicates by hash/size within a category
const byCatAndSize = {};
for (const [key, bucket] of Object.entries(gallery)) {
  for (const p of bucket.photos) {
    const tag = path.basename(p.file).replace(/[^a-z0-9]/gi, '').slice(0, 14);
    p.tag = tag;
  }
}

fs.mkdirSync('public/photos/_meta', { recursive: true });
fs.writeFileSync('public/photos/_meta/gallery.json', JSON.stringify(gallery, null, 2));
console.log('wrote public/photos/_meta/gallery.json');
