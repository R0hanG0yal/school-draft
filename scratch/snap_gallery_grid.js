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
      reject(new Error(`Timeout ${method}`));
    }, 10000);
    
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

async function run() {
  const pages = await getPages();
  const page = pages.find(p => p.url && p.url.includes('index.html') && p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  await cdpSend(ws, 'Page.enable');
  await cdpSend(ws, 'Runtime.enable');

  // Scroll so gallery grid is centered
  await cdpSend(ws, 'Runtime.evaluate', {
    expression: `window.scrollBy({ top: 380, behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 600));

  const snap = await cdpSend(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_gallery_cards_grid.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved screenshot_gallery_cards_grid.png');

  ws.close();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
