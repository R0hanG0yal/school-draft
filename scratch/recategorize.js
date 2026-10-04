/**
 * Recategorize photos using the source page in the manifest, then verify picks.
 */
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('scratch/photo_manifest.json', 'utf8'));

for (const item of manifest.manifest) {
  const from = item.local;
  if (!fs.existsSync(from)) continue;
  const src = item.source || '';
  const file = path.basename(from);
  let target = null;

  if (/swimming|football|volleyball|shooting|horse|riding|sport|cricket|athlet/i.test(src + ' ' + file)) {
    target = 'sports';
  } else if (/annual|independence|republic|jubilee|band|cadet|mun|debate|founders|celebrat|parade|award|function/i.test(src + ' ' + file)) {
    target = 'events';
  } else if (/CBSE|IPSC|NPSC|QCI|sic\.|quality|conference|17260366|1726036/i.test(file)) {
    target = 'affiliations';
  }

  if (target) {
    const to = 'public/photos/' + target + '/' + file;
    if (from !== to) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      try {
        fs.renameSync(from, to);
        item.local = to.replace(/\\/g, '/');
        item.category = target;
      } catch (e) { /* keep old location on failure */ }
    }
  }
}

fs.writeFileSync('scratch/photo_manifest.json', JSON.stringify(manifest, null, 2));

// Final picks for the page
const picks = [
  'campus/Building RWS.jpg',
  'campus/179066173311.png',
  'sports/177824136418.png',
  'campus/176067218465.jpg',
  'sports/172672868449.jpg',
  'campus/172603136118.png',
  'campus/176067280221.jpg',
  'boarding/172553199357.jpg',
  'boarding/17255319745.jpg',
  'people/172543546895.png',
  'brand/Schoolnamelogoweb.png',
  'brand/172717889173.png',
  'affiliations/172603662317.png',
  'affiliations/172603660358.webp',
  'affiliations/172603659629.webp',
  'affiliations/172603658264.webp',
  'affiliations/sic.jpg',
  'sports/IMG_9210.JPG',
  'sports/1790223527100.5263.png',
  'events/172977083560.png',
  'events/banner13.png',
  'academics/172750915468.jpg',
];

for (const p of picks) {
  const full = 'public/photos/' + p;
  console.log((fs.existsSync(full) ? 'OK   ' : 'MISS ') + p + (fs.existsSync(full) ? '  ' + fs.statSync(full).size + 'b' : ''));
}

// Counts per category
const counts = {};
for (const item of manifest.manifest) {
  if (fs.existsSync(item.local)) counts[item.category] = (counts[item.category] || 0) + 1;
}
console.log('Final counts:', JSON.stringify(counts));
