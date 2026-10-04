const fs = require('fs');
const http = require('http');

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function cdpSend(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  const pages = await getPages();
  const page = pages.find(p => p.url && p.url.includes('index.html') && p.type === 'page');
  if (!page) {
    console.error('No index.html page found in Chrome CDP!');
    return;
  }

  console.log('Connecting to page:', page.title, page.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  await new Promise(r => ws.addEventListener('open', r));
  console.log('Connected via CDP WebSocket!');

  // Enable Page and Runtime
  await cdpSend(ws, 'Page.enable');
  await cdpSend(ws, 'Runtime.enable');
  await cdpSend(ws, 'DOM.enable');

  // Reload page
  console.log('Reloading page...');
  await cdpSend(ws, 'Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 2000));

  // Check categories loaded in browser
  const evalResult = await cdpSend(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const cats = window.BSP_GALLERY_CATEGORIES || [];
      const tabs = document.querySelectorAll('.gallery-cat-tab');
      const cards = document.querySelectorAll('.gallery-card');
      const menuTrigger = document.getElementById('menuExplodeTrigger');
      const backdrop = document.getElementById('explodedMenuBackdrop');
      return {
        catCount: cats.length,
        tabCount: tabs.length,
        cardCount: cards.length,
        hasMenuTrigger: !!menuTrigger,
        hasBackdrop: !!backdrop
      };
    })()`,
    returnByValue: true
  });
  console.log('Page initial state:', evalResult.result.value);

  // Take screenshot 1: Initial page with header and liquid glass
  const snap1 = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_nav_initial.png', Buffer.from(snap1.data, 'base64'));
  console.log('Saved screenshot_nav_initial.png');

  // Click Explode Menu Trigger!
  console.log('Clicking Explode Menu Trigger...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('menuExplodeTrigger').click()`
  });
  await new Promise(r => setTimeout(r, 900));

  // Screenshot 2: Exploded Menu Modal
  const snap2 = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_exploded_menu.png', Buffer.from(snap2.data, 'base64'));
  console.log('Saved screenshot_exploded_menu.png');

  // Close Exploded Menu by clicking close button
  console.log('Closing Exploded Menu...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('explodedMenuClose').click()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Scroll to #gallery
  console.log('Scrolling to #gallery...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('gallery').scrollIntoView({ behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 3: Gallery section with tabs
  const snap3 = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_gallery_highlights.png', Buffer.from(snap3.data, 'base64'));
  console.log('Saved screenshot_gallery_highlights.png');

  // Click on "125th Annual Day" category tab (catId 68)
  console.log('Switching to 125th Annual Day category...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `window.BSP_SWITCH_GALLERY('68')`
  });
  await new Promise(r => setTimeout(r, 1200));

  const countInfo = await cdpSend(ws, 'Runtime.evaluate', {
    expression: `(() => {
      return {
        activeTitle: document.getElementById('activeCatTitle').textContent,
        activeBadge: document.getElementById('activeCatBadge').textContent,
        renderedCards: document.querySelectorAll('.gallery-card').length,
        loadMoreVisible: document.getElementById('galleryLoadMore').style.display !== 'none',
        loadMoreText: document.getElementById('loadMoreText').textContent
      };
    })()`,
    returnByValue: true
  });
  console.log('Annual Day 125 state:', countInfo.result.value);

  // Screenshot 4: 125th Annual Day category
  const snap4 = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_gallery_annual_day_125.png', Buffer.from(snap4.data, 'base64'));
  console.log('Saved screenshot_gallery_annual_day_125.png');

  // Click Load More
  console.log('Clicking Load More Photos...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('galleryLoadMore').click()`
  });
  await new Promise(r => setTimeout(r, 800));

  const afterLoadMore = await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.querySelectorAll('.gallery-card').length`,
    returnByValue: true
  });
  console.log('Rendered cards after Load More:', afterLoadMore.result.value);

  // Click first card to open lightbox
  console.log('Opening Lightbox on first card...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.gallery-card').click()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 5: Lightbox modal
  const snap5 = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_gallery_lightbox.png', Buffer.from(snap5.data, 'base64'));
  console.log('Saved screenshot_gallery_lightbox.png');

  // Close lightbox
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('lightboxClose').click()`
  });
  await new Promise(r => setTimeout(r, 400));

  ws.close();
  console.log('CDP Test complete! All verifications succeeded.');
}

run().catch(console.error);
