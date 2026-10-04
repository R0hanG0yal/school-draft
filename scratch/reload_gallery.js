const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BASE = 'https://www.birlaschoolpilani.edu.in';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const OUT = 'public/photos';
const META = 'public/photos/_meta/gallery.json';

const TARGET_PAGES = [
  { url: '/',                          catKey: 'campus',    label: 'Campus & Facilities',  path: '/' },
  { url: '/achievements',             catKey: 'achievements', label: 'Achievements',   path: '/achievements' },
  { url: '/academics',                catKey: 'academics',    label: 'Academics',     path: '/academics' },
  { url: '/boarding',                 catKey: 'boarding',     label: 'Boarding Life',  path: '/boarding' },
  { url: '/bsp/bsv-mun-3-0-22-23-aug-2026', catKey: 'societies', label: 'National Cadet Corps', path: '/bsp/bsv-mun-3-0-22-23-aug-2026' },
  { url: '/bsp/a-day-of-fun-and-frolic-at-pratapgarh-farms-26-aug-2026', catKey: 'excursion', label: 'Tour & Excursion', path: '/bsp/a-day-of-fun-and-frolic-at-pratapgarh-farms-26-aug-2026' },
  { url: '/administrative-staff',     catKey: 'people',       label: 'Principal & Staff', path: '/administrative-staff' },
  { url: '/bsp/birla-school-pilani-welcomes-new-students', catKey: 'events', label: 'Annual Days & Events', path: '/bsp/birla-school-pilani-welcomes-new-students' },
];

function curl(url, outFile) {
  const args = ['-s', '-m', '90', '-A', UA, '-L', '--compressed'];
  args.push('-o', outFile, url);
  try {
    execFileSync('curl', args, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function extractImages(html) {
  const urls = new Set();
  const re = /(?:src|data-src|data-cke-saved-src|data-background)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) urls.add(m[1]);
  const srcsetRe = /srcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = srcsetRe.exec(html)) !== null) {
    m[1].split(',').forEach((part) => urls.add(part.trim().split(/\s+/)[0]));
  }
  const ogRe = /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/gi;
  while ((m = ogRe.exec(html)) !== null) urls.add(m[1]);
  const tagRe = /<img[^>]+alt=["']([^"']+)["'][^>]*src=["']([^"']+)["']/gi;
  const alts = new Map();
  while ((m = tagRe.exec(html)) !== null) {
    const alt = (m[1] || '').trim();
    if (alt) alts.set(m[2].trim(), alt);
  }
  return { urls, alts };
}

function normalize(u) {
  if (!u) return null;
  u = u.trim();
  if (u.startsWith('data:') || u.startsWith('javascript:')) return null;
  if (u.startsWith('//')) u = 'https:' + u;
  if (u.startsWith('/')) u = BASE + u;
  if (!/^https?:\/\//.test(u)) return null;
  if (!/birlaschoolpilani\.edu\.in/.test(u)) return null;
  return u.split('#')[0];
}

function isJunk(u) {
  const file = decodeURIComponent(u.split('/').pop() || '').split('?')[0];
  if (/\.(ico|svg)$/i.test(file) && !/logo|crest|favicon/i.test(file)) return true;
  if (/^(call|whatsapp|phone|mail|facebook|instagram|twitter|youtube|linkedin|icon|arrow|close|menu|search|loader|loading|placeholder)\b/i.test(file)) return true;
  return false;
}

async function main() {
  if (!fs.existsSync(META)) {
    console.log('no gallery.json yet; run remap_manifest.js first');
    return;
  }
  const gallery = JSON.parse(fs.readFileSync(META, 'utf8'));

  let totalFound = 0, totalAdded = 0, totalFailed = 0, totalSkipped = 0;

  for (const page of TARGET_PAGES) {
    const safe = page.url.replace(/[^a-z0-9/-]/gi, '_');
    const file = `scratch/site/${safe.slice(1).replace(/\//g, '_')}.html`;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const ok = curl(BASE + page.url, file);
    if (!ok) { console.log('SKIP', page.url, '-> curl failed'); continue; }

    let html;
    try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }
    const { urls, alts } = extractImages(html);

    for (const u of urls) {
      const nu = normalize(u);
      if (!nu) continue;
      totalFound++;
      if (isJunk(nu)) { totalSkipped++; continue; }

      const file2 = decodeURIComponent(nu.split('/').pop() || '').split('?')[0];
      if (!file2) { totalSkipped++; continue; }
      const dest = path.join(OUT, page.catKey, file2);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      if (fs.existsSync(dest)) continue;

      if (curl(nu, dest)) {
        try {
          const size = fs.statSync(dest).size;
          if (size < 1500) { fs.unlinkSync(dest); totalSkipped++; continue; }
        } catch { fs.unlinkSync(dest); totalSkipped++; continue; }

        const photo = {
          file: `${OUT}/${page.catKey}/${file2}`,
          src: nu,
          page: BASE + page.url,
          pageTitle: page.label,
          caption: (alts.get(nu) || page.label).trim() || null,
          added: new Date().toISOString(),
        };
        gallery[page.catKey].photos.push(photo);
        totalAdded++;
      } else {
        totalFailed++;
      }
    }
  }

  // dedupe by size+hash-ish within each category
  for (const bucket of Object.values(gallery)) {
    const seen = new Set();
    bucket.photos = bucket.photos.filter(p => {
      const key = (p.file || '').split('/').pop() + '@' + (p.src || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  fs.writeFileSync(META, JSON.stringify(gallery, null, 2));
  console.log('pages probed:', TARGET_PAGES.length);
  console.log('image refs found:', totalFound);
  console.log('added:', totalAdded, 'failed:', totalFailed, 'skipped:', totalSkipped);
  console.log('photos per category now:');
  for (const key in gallery) console.log(' ', key, gallery[key].photos.length, gallery[key].cat.label);
  console.log('total photos:', Object.values(gallery).reduce((a, b) => a + b.photos.length, 0));
}

main().catch((e) => { console.error(e); process.exit(1); });
