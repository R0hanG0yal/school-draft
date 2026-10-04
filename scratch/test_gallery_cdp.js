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
    const timeout = setTimeout(() => {
      ws.removeEventListener('message', handler);
      reject(new Error(`CDP command ${method} timed out`));
    }, 8000);
    
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        clearTimeout(timeout);
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function testGallery() {
  const pages = await getPages();
  const page = pages.find(p => p.url && p.url.includes('index.html') && p.type === 'page');
  if (!page) {
    console.error('No page found');
    return;
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  console.log('Connected for gallery test!');

  await cdpSend(ws, 'Page.enable');
  await cdpSend(ws, 'Runtime.enable');

  // Scroll to gallery
  console.log('Scrolling to #gallery...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `const el = document.getElementById('gallery'); el.scrollIntoView(); el.getBoundingClientRect().top;`
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 1: Gallery initial (Highlights)
  const snap1 = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_gallery_tabs.png', Buffer.from(snap1.data, 'base64'));
  console.log('Saved screenshot_gallery_tabs.png');

  // Switch to category '68' (125th Annual Day)
  console.log('Switching to 125th Annual Day...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `window.BSP_SWITCH_GALLERY('68')`
  });
  await new Promise(r => setTimeout(r, 800));

  const stats = await cdpSend(ws, 'Runtime.evaluate', {
    expression: `(() => ({
      title: document.getElementById('activeCatTitle').textContent,
      badge: document.getElementById('activeCatBadge').textContent,
      cards: document.querySelectorAll('.gallery-card').length,
      loadMoreText: document.getElementById('loadMoreText').textContent
    }))()`,
    returnByValue: true
  });
  console.log('Category 68 loaded:', stats.result.value);

  // Screenshot 2: Category 68
  const snap2 = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_gallery_annual_day.png', Buffer.from(snap2.data, 'base64'));
  console.log('Saved screenshot_gallery_annual_day.png');

  // Click Load More
  console.log('Clicking Load More...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('galleryLoadMore').click()`
  });
  await new Promise(r => setTimeout(r, 600));

  const loadMoreCards = await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.querySelectorAll('.gallery-card').length`,
    returnByValue: true
  });
  console.log('Cards after Load More:', loadMoreCards.result.value);

  // Click card to open lightbox
  console.log('Opening lightbox...');
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.querySelector('.gallery-card').click()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 3: Lightbox
  const snap3 = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_gallery_lightbox_open.png', Buffer.from(snap3.data, 'base64'));
  console.log('Saved screenshot_gallery_lightbox_open.png');

  // Close lightbox
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('lightboxClose').click()`
  });
  await new Promise(r => setTimeout(r, 300));

  ws.close();
  console.log('Gallery test completed successfully!');
  process.exit(0);
}

testGallery().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
