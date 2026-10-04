/**
 * Crawler for birlaschoolpilani.edu.in
 * - Fetches key section pages (home + gallery already on disk)
 * - Extracts every image URL
 * - Downloads each into public/photos/<category>/<filename>
 * - Writes scratch/photo_manifest.json
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BASE = 'https://www.birlaschoolpilani.edu.in';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const OUT = 'public/photos';
const MANIFEST = 'scratch/photo_manifest.json';

// Pages to crawl: section pages + a representative set of news/event pages
const SECTION_PAGES = [
  { url: '/', category: 'campus' },
  { url: '/gallery', category: 'campus' },
  { url: '/about-us', category: 'campus' },
  { url: '/academics', category: 'academics' },
  { url: '/achievements', category: 'events' },
  { url: '/admission', category: 'campus' },
  { url: '/boarding', category: 'boarding' },
  { url: '/origin-and-history', category: 'campus' },
  { url: '/why-bsp', category: 'campus' },
];

const NEWS_PAGES = [
  '/bsp/125th-annual-day-celebration-15th-oct-2025',
  '/bsp/80th-independence-day-celebration',
  '/bsp/bet-inter-school-boys-swimming-meet-2024',
  '/bsp/bet-inter-school-football-tournament-2025',
  '/bsp/birla-school-pilani-students-shine-at-bet-tatc-robotics-navigation-challenge-2025',
  '/bsp/birla-school-shooters-win-five-medals-at-70th-district-level-shooting-competition',
  '/bsp/birla-school-pilani-wins-two-championships-at-education-district-swimming-meet',
  '/bsp/70th-educational-district-level-football-tournament-under-19-birla-school-players-selected-for-state-level',
  '/bsp/basant-panchami-founders-day-celebration-2025',
  '/bsp/124th-annual-function-abhivyakti-2024',
  '/bsp/birla-school-pilani-welcomes-new-students',
  '/bsp/bsv-mun-3-0-22-23-aug-2026',
  '/bsp/birla-school-pilani-clinches-the-inter-bet-volleyball-championship',
  '/bsp/birla-school-pilani-shines-at-fnf-international-english-debate-competition',
].map((u) => ({ url: u, category: 'events' }));

function curl(url, outFile, extra) {
  const args = ['-s', '-m', '60', '-A', UA, '-L'];
  if (extra) args.push(...extra);
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
  const srcset = /srcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = srcset.exec(html)) !== null) {
    m[1].split(',').forEach((part) => urls.add(part.trim().split(/\s+/)[0]));
  }
  const bg = /url\((["']?)([^)"']+)\1\)/gi;
  while ((m = bg.exec(html)) !== null) urls.add(m[2]);
  const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/gi;
  while ((m = og.exec(html)) !== null) urls.add(m[1]);
  return Array.from(urls);
}

function normalize(u) {
  if (!u) return null;
  u = u.trim();
  if (u.startsWith('data:') || u.startsWith('javascript:')) return null;
  if (u.startsWith('//')) u = 'https:' + u;
  if (u.startsWith('/')) u = BASE + u;
  if (!/^https?:\/\//.test(u)) return null;
  if (!/birlaschoolpilani\.edu\.in/.test(u)) return null; // only our site's assets
  return u.split('#')[0];
}

// Category rules by keyword, checked against page slug + image filename
const RULES = [
  ['brand', /logo|crest|favicon|banner-?logo|namelogo/i],
  ['affiliations', /cbse|ipsc|npsc|qci|quality.?council|sic\.|association|conference/i],
  ['people', /principal|staff|faculty|director|teacher/i],
  ['sports', /sport|swim|horse|riding|equestri|cricket|football|volleyball|shoot|athlet|skat|basketball|kho|kabaddi|medal|tournament|champion|arena|pool/i],
  ['academics', /lab|class|robot|science|tatc|stem|library|computer|exam|study|smart|projector/i],
  ['boarding', /hostel|boarding|dorm|dining|mess|refectory|house|infirmary/i],
  ['events', /annual|function|celebrat|republic|independence|jubilee|parade|festival|farewell|orientation|mun|debate|award|assembly|prize|foundation/i],
  ['campus', /building|campus|aerial|ground|frontage|garden|quad|school/i],
];

function categorize(fallback, file, altText) {
  const hay = (file + ' ' + (altText || '')).toLowerCase();
  for (const [cat, re] of RULES) {
    if (re.test(hay)) return cat;
  }
  return fallback;
}

function isJunk(u) {
  const file = decodeURIComponent(u.split('/').pop() || '');
  if (/\.(ico|svg)$/i.test(file) && !/logo|crest/i.test(file)) return true;
  if (/^(call|whatsapp|phone|mail|facebook|instagram|twitter|youtube|linkedin|icon|arrow|close|menu|search)\b/i.test(file)) return true;
  return false;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = [];
  const seen = new Set();
  const stats = { pages: 0, found: 0, downloaded: 0, failed: 0, skipped: 0 };

  const allPages = [];
  for (const p of SECTION_PAGES) {
    const file = 'scratch/site/page' + allPages.length + '.html';
    if (p.url === '/' || p.url === '/gallery') {
      // already on disk
      allPages.push({ ...p, htmlFile: p.url === '/' ? 'scratch/site/home.html' : 'scratch/site/gallery.html' });
      continue;
    }
    const ok = curl(BASE + p.url, file);
    if (ok) allPages.push({ ...p, htmlFile: file });
    stats.pages++;
  }
  for (const p of NEWS_PAGES) {
    const file = 'scratch/site/news' + allPages.length + '.html';
    if (curl(BASE + p.url, file)) allPages.push({ ...p, htmlFile: file });
    stats.pages++;
  }

  for (const page of allPages) {
    let html = '';
    try { html = fs.readFileSync(page.htmlFile, 'utf8'); } catch { continue; }
    const urls = extractImages(html).map(normalize).filter(Boolean);
    for (const u of urls) {
      stats.found++;
      if (seen.has(u)) continue;
      seen.add(u);
      const file = decodeURIComponent(u.split('/').pop() || '').split('?')[0];
      if (!file || isJunk(u)) { stats.skipped++; continue; }
      const altMatch = html.match(new RegExp('<img[^>]*src=["\']' + u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\'][^>]*>', 'i'));
      const alt = altMatch ? (altMatch[0].match(/alt=["\']([^"\']*)["\']/i) || [])[1] || '' : '';
      const cat = categorize(page.category, file, alt);
      const dir = path.join(OUT, cat);
      fs.mkdirSync(dir, { recursive: true });
      const dest = path.join(dir, file);
      if (fs.existsSync(dest)) {
        manifest.push({ url: u, local: dest.replace(/\\/g, '/'), category: cat, source: BASE + page.url, alt });
        stats.downloaded++;
        continue;
      }
      if (curl(u, dest)) {
        const size = fs.statSync(dest).size;
        if (size < 1200) { // tiny icons / tracking pixels
          fs.unlinkSync(dest);
          stats.skipped++;
          continue;
        }
        manifest.push({ url: u, local: dest.replace(/\\/g, '/'), category: cat, source: BASE + page.url, alt, bytes: size });
        stats.downloaded++;
      } else {
        stats.failed++;
      }
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify({ stats, manifest }, null, 2));
  console.log('Pages crawled:', stats.pages);
  console.log('Image refs found:', stats.found);
  console.log('Downloaded:', stats.downloaded);
  console.log('Failed:', stats.failed);
  console.log('Skipped (icons/junk):', stats.skipped);
  const byCat = {};
  manifest.forEach((m) => { byCat[m.category] = (byCat[m.category] || 0) + 1; });
  console.log('By category:', JSON.stringify(byCat));
})();
