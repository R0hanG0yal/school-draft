const fs = require('fs');
const path = require('path');

const OUT = 'scratch/gallery_snippet.html';
const GALLERY_DATA = buildGalleryData();
const out = emitGalleryHTML(GALLERY_DATA);
fs.writeFileSync(OUT, out);
console.log('wrote', OUT);
printSummary(GALLERY_DATA);
console.log('DEBUG GALLERY_DATA.length:', GALLERY_DATA.length);
GALLERY_DATA.forEach((c, i) => console.log('[' + i + ']', c.key, c.label, 'photos=' + c.photos.length));
if (GALLERY_DATA.length === 0) {
  console.log('DEBUG: GALLERY_DATA empty, root public/photos subdirs:');
  try {
    const names = fs.readdirSync('public/photos');
    names.forEach(n => console.log('   -', n, fs.statSync('public/photos/' + n).isDirectory() ? '(dir)' : ''));
  } catch (e) { console.log('DEBUG readdir failed:', e.message); }
}

function buildGalleryData() {
  const root = 'public/photos';
  const manifest = safeParse('public/photos/_meta/gallery.json');
  console.log('DEBUG buildGalleryData: manifest defined=' + !!manifest + ' manifest keys=' + (manifest ? Object.keys(manifest).length : 0));
  const categories = [];

  function addCat(key, label, sourcePath) {
    const allPhotos = pullCategoryPhotos(root, key, manifest);
    derivePhotosFromDisk({
      key,
      label,
      sourcePath,
      allPhotos,
    });
  }

  function addCatFromManifest(entry, overrideLabel) {
    const key = (entry?.cat?.key) || labelToKey(overrideLabel || entry?.cat?.label);
    derivePhotosFromManifest(entry);
  }

  const order = fillGalleryDataFromDisk(categories);
  if (!order || !order.length) {
    console.log('DEBUG: no order from manifest, using disk order');
    order = diskOrder();
  }
  console.log('DEBUG buildGalleryData order length=' + order.length);
  order.forEach((o, i) => console.log('  [' + i + ']', o.key, '=>', o.label));

  order.forEach((item) => addCat(item.key, item.label, item.srcPath));

  const byKey = {};
  categories.forEach((c) => {
    if (!byKey[c.key]) byKey[c.key] = c;
    else {
      const prev = byKey[c.key];
      prev.photos = prev.photos.concat(c.photos).filter(deduplicatePhoto);
      prev.photos.sort(byNumericName);
    }
  });

  return categories.map((c) => byKey[c.key] || c).filter((c) => c.photos.length > 0);
}

function derivePhotosFromDisk({ key, label, sourcePath, photos }) {
  const list = photos || [];
  list = list.filter(isKeepable);
  console.log('DEBUG derivePhotosFromDisk key=' + key + ' inputPhotos=' + (photos ? photos.length : 0) + ' kept=' + list.length);
  return {
    key,
    label,
    sourcePath: sourcePath || '/',
    photos: kept,
  };
}

function derivePhotosFromManifest(entry) {
  const photos = (entry?.photos || []).map((p) => ({
    src: p.src || '',      file: p.file || '',
    caption: p.caption || null,
    added: p.added || new Date().toISOString(),
    catKey: entry?.cat?.key,
  })).filter((p) => p.file && fs.existsSync(p.file));
  const key = entry?.cat?.key || labelToKey(entry?.cat?.label);
  return derivePhotosFromDisk({
    key,
    label: entry?.cat?.label,
    sourcePath: entry?.page || `/${key}`,
    photos,
  });
}function buildOrderFromManifest() {
  const manifest = JSON.parse(fs.readFileSync('public/photos/_meta/gallery.json', 'utf8'));
  console.log('DEBUG buildOrderFromManifest: manifest defined=' + !!manifest);
  if (!manifest || typeof manifest !== 'object') {
    console.log('DEBUG buildOrderFromManifest: manifest missing or bad, falling back to disk');
    return diskOrder();
  }
  const seen = new Set();
  const order = [];
  for (const [key, bucket] of Object.entries(manifest)) {
    if (!bucket || !bucket.photos || !bucket.photos.length) continue;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const label = bucket.cat?.label || labelToKey(key);
    const srcPath = bucket.cat?.path || '/';
    order.push({ key, label, srcPath });
    console.log('DEBUG buildOrderFromManifest push key=' + key + ' label=' + label + ' size=' + bucket.photos.length);
  }
  if (!order.length) {
    console.log('DEBUG buildOrderFromManifest: manifest had no valid entries, fallback to disk');
    return diskOrder();
  }
  console.log('DEBUG buildOrderFromManifest: total order entries=' + order.length);
  return order;
}

function diskOrder() {
  const root = 'public/photos';
  console.log('DEBUG diskOrder: scanning public/photos for dirs');
  if (!fs.existsSync(root)) {
    console.log('DEBUG diskOrder: public/photos missing, returning empty');
    return [];
  }
  const names = fs.readdirSync(root);
  const dirs = names.filter((n) => {
    try { return fs.statSync(path.join(root, n)).isDirectory(); } catch { return false; }
  }).filter((n) => n !== '_meta').sort();
  console.log('DEBUG diskOrder: discovered dirs=', JSON.stringify(dirs));
  return dirs.map((name) => ({
    key: name,
    label: niceLabel(name),
    srcPath: '/' + name,
  }));
}

function niceLabel(name) {
  return String(name).replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()); }

function fillGalleryDataFromDisk(categories) {
  console.log('DEBUG fillGalleryDataFromDisk: scanning for image directories');
  if (!fs.existsSync('public/photos')) {
    console.log('DEBUG fillGalleryDataFromDisk: public/photos does not exist');
    return [];
  }
  let scanned = [];
  try {
    scanned = fs.readdirSync('public/photos');
  } catch (e) {
    console.log('DEBUG fillGalleryDataFromDisk: readdir failed:', e.message);
    return [];
  }
  const directories = scanned.filter((name) => {
    try {
      return fs.statSync(path.join('public/photos', name)).isDirectory();
    } catch (e) {
      return false;
    }
  }).filter((name) => name !== '_meta').sort();
  console.log('DEBUG fillGalleryDataFromDisk discovered directories:', JSON.stringify(directories));

  const recognized = new Set();
  for (const item of categories) {
    if (!item || !item.key) continue;
    recognized.add(item.key);
  }

  const added = new Set();
  for (const name of directories) {
    if (added.has(name)) continue;
    if (recognized.has(name)) continue;
    const label = niceLabel(name);
    categories.push({ key: name, label, sourcePath: '/' + name, photos: [] });
    added.add(name);
    console.log('DEBUG fillGalleryDataFromDisk added category from disk: ' + name + ' => ' + label);
  }

  console.log('DEBUG fillGalleryDataFromDisk final categories count=' + categories.length);
  return categories;
}function pullCategoryPhotos(root, key, allPhotos) {
  const files = [];
  let source = allPhotos;
  if (!Array.isArray(source)) {
    try {
      const local = JSON.parse(fs.readFileSync('public/photos/_meta/gallery.json', 'utf8'));
      source = local && local[key] ? local[key].photos : [];
    } catch (e) {
      source = [];
    }
  }
  console.log('DEBUG pullCategoryPhotos key=' + key + ' manifestPhotoCount=' + (Array.isArray(source) ? source.length : 'n/a'));
  if (Array.isArray(source) && source.length) {
    return source;
  }

  const fallbackDir = path.join('public', 'photos', key);  if (files.length === 0 && allPhotos && Array.isArray(allPhotos) && allPhotos.length === 0) {
    console.log('DEBUG pullCategoryPhotos key=' + key + ' no source and no files, scanning disk for key=' + key);
    try {
      const names = fs.readdirSync(fallbackDir).sort();
      for (const name of names) {
        let rawFilePath = path.join(fallbackDir, name);
        try {
          if (!fs.statSync(rawFilePath).isFile()) continue;
        } catch { continue; }
        if (!path.isAbsolute(rawFilePath)) {
          rawFilePath = path.resolve(baseDir, rawFilePath);
        }
        files.push({
          file: rawFilePath,
          src: null,
          caption: null,
          added: null,
          catKey: key,
        });
      }
    } catch (e) {
      console.log('DEBUG pullCategoryPhotos key=' + key + ' disk scan failed: ' + e.message);
    }
  }
  console.log('DEBUG pullCategoryPhotos key=' + key + ' fallbackDir=' + fallbackDir + ' baseDir=' + baseDir + ' filesFound=' + files.length);

  if (fs.existsSync(fallbackDir)) {
    const names = fs.readdirSync(fallbackDir).sort();
    for (const name of names) {
      let rawFilePath = path.join(fallbackDir, name);
      try {
        if (!fs.statSync(rawFilePath).isFile()) continue;
      } catch { continue; }
      if (!path.isAbsolute(rawFilePath)) {
        rawFilePath = path.resolve(baseDir, rawFilePath);
      }
      files.push({
        file: rawFilePath,
        src: null,
        caption: null,
        added: null,
        catKey: key,
      });
    }
  }

  if (files.length > 0) {
    files.slice(0, 3).forEach(f => console.log('   sample file=' + f.file));
  }

  return files.map(normalizePhotoPath);
}

function normalizePhotoPath(p) {
  const fallbackDir = path.join('public', 'photos', key);
  if (fs.existsSync(fallbackDir)) {
    const names = fs.readdirSync(fallbackDir).sort();
    for (const name of names) {
      let rawFilePath = path.join(fallbackDir, name);
      try {
        if (!fs.statSync(rawFilePath).isFile()) continue;
      } catch { continue; }
      if (!path.isAbsolute(rawFilePath)) {
        rawFilePath = path.resolve(baseDir, rawFilePath);
      }
      files.push({
        file: rawFilePath,
        src: null,
        caption: null,
        added: null,
        catKey: key,
      });
    }
  }
  return files;
}

function pullCategoryPhotos(root, key, allPhotos) {
  const baseDir = process.cwd();
  const files = [];
  let source = allPhotos;
  if (!Array.isArray(source)) {
    try {
      const local = JSON.parse(fs.readFileSync('public/photos/_meta/gallery.json', 'utf8'));
      source = local && local[key] ? local[key].photos : [];
    } catch (e) {
      source = [];
    }
  }
  console.log('DEBUG pullCategoryPhotos key=' + key + ' manifestPhotoCount=' + (Array.isArray(source) ? source.length : 'n/a'));
  if (Array.isArray(source) && source.length) {
    return source;
  }

  const fallbackDir = path.join(root, key);  if (files.length === 0 && allPhotos && Array.isArray(allPhotos) && allPhotos.length === 0) {
    console.log('DEBUG pullCategoryPhotos key=' + key + ' no source and no files, scanning disk for key=' + key);
    try {
      const names = fs.readdirSync(fallbackDir).sort();
      for (const name of names) {
        let rawFilePath = path.join(fallbackDir, name);
        try {
          if (!fs.statSync(rawFilePath).isFile()) continue;
        } catch { continue; }
        if (!path.isAbsolute(rawFilePath)) {
          rawFilePath = path.resolve(baseDir, rawFilePath);
        }
        files.push({
          file: rawFilePath,
          src: null,
          caption: null,
          added: null,
          catKey: key,
        });
      }
    } catch (e) {
      console.log('DEBUG pullCategoryPhotos key=' + key + ' disk scan failed: ' + e.message);
    }
  }
  console.log('DEBUG pullCategoryPhotos key=' + key + ' fallbackDir=' + fallbackDir + ' baseDir=' + baseDir + ' filesFound=' + files.length);

  if (fs.existsSync(fallbackDir)) {
    const names = fs.readdirSync(fallbackDir).sort();
    for (const name of names) {
      let rawFilePath = path.join(fallbackDir, name);
      try {
        if (!fs.statSync(rawFilePath).isFile()) continue;
      } catch { continue; }
      if (!path.isAbsolute(rawFilePath)) {
        rawFilePath = path.resolve(baseDir, rawFilePath);
      }
      files.push({
        file: rawFilePath,
        src: null,
        caption: null,
        added: null,
        catKey: key,
      });
    }
  }

  if (files.length > 0) {
    files.slice(0, 3).forEach(f => console.log('   sample file=' + f.file));
  }

  return files.map(normalizePhotoPath);
}

function normalizePhotoPath(p) {
  p.file = path.normalize(p.file).replace(/[/\\]+/g, '/');
  if (p.caption == null) {
    p.caption = path.basename(p.file, path.extname(p.file))
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  if (!p.added) p.added = new Date().toISOString();
  return p;
}

function isKeepable(p) {
  if (!p.file) return false;
  let stat;
  try { stat = fs.statSync(p.file); } catch { return false; }
  if (!stat) return false;
  if (stat.size < 4000) return false;
  const ext = path.extname(p.file || '').toLowerCase();
  if (!/\.(jpe?g|png|webp|gif)$/i.test(ext)) return false;
  if (p.file.toLowerCase().includes('favicon')) return false;
  return true;
}

function byNumericName(a, b) {
  const na = a.file && a.file.match(/\d+/g);
  const nb = b.file && b.file.match(/\d+/g);
  const naN = na ? Number(na[0]) : 0;
  const nbN = nb ? Number(nb[0]) : 0;
  return naN - nbN;
}

function deduplicatePhoto(a, _, all) {
  return !all.some((c) => c !== a && c.file === a.file);
}

function emitGalleryHTML(data) {
  console.log('emitGalleryHTML: data.length=', data.length);
  const controls = data.reduce((acc, cat) => {
    acc.push(`<button class="gallery-filter" type="button" data-cat="${cat.key}">${escAttr(cat.label)}</button>`);
    return acc;
  }, []);

  const filters = ['all', ...data.map((c) => c.key)];
  const filterHTML = filters.map((k) => {
    const label = k === 'all' ? 'All categories' : data.find((c) => c.key === k)?.label || k;
    const active = k === 'all' ? ' is-active' : '';
    return `<button class="gallery-filter${active}" type="button" data-cat="${k}">${escAttr(label)}</button>`;
  }).join('\n    ');

  console.log('emitGalleryHTML: data.length=', data.length);
  const grids = data.map((cat) => {
    const items = cat.photos.map((p) => {
      const src = p.file.replace(/\\/g, '/');
      const caption = escAttr(p.caption || '');
      return `<button class="gallery-item" type="button" data-category="${escAttr(cat.key)}" data-caption="${caption}">
        <img src="${escAttr(src)}" alt="${caption}" loading="lazy">
      </button>`;
    }).join('\n      ');
    return `<div class="gallery-category" data-cat="${escAttr(cat.key)}">
      <h3 class="gallery-category-title">${escHtml(cat.label)}</h3>
      <p class="gallery-category-meta">${cat.photos.length} ${cat.photos.length === 1 ? 'photograph' : 'photographs'}</p>
      <div class="gallery-grid" id="cat-${escAttr(cat.key)}">
        ${items}
      </div>
    </div>`;
  }).join('\n\n    ');

  return `
  <div class="gallery-controls" id="galleryControls">
    ${filterHTML}
  </div>

  <div class="gallery-lanes" id="galleryGrid">
    ${grids}
  </div>

  <p class="gallery-empty" id="galleryEmptyNote" hidden>The gallery has not been populated yet.</p>
`;
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function escAttr(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function labelToKey(label) {
  return String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'others';
}

function safeParse(fp) {
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch { return null; }
}

function printSummary(data) {
  let total = 0;
  console.log('category photo counts:');
  data.forEach((c) => {
    total += c.photos.length;
    console.log(`  ${String(c.label).padEnd(26)} ${c.photos.length} photographs`);
  });
  console.log('total photographs shown:', total);
}
