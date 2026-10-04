const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    try {
      const pages = JSON.parse(data);
      const p = pages.find(x => x.url && x.url.includes('index.html') && x.type === 'page');
      const ws = new WebSocket(p.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));
      
      const send = (m, params = {}) => new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 99999);
        const to = setTimeout(() => reject(new Error('Timeout ' + m)), 6000);
        ws.addEventListener('message', function h(e) {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            clearTimeout(to);
            ws.removeEventListener('message', h);
            resolve(msg.result);
          }
        });
        ws.send(JSON.stringify({ id, method: m, params }));
      });

      await send('Page.bringToFront');
      
      // Click first card to open lightbox
      await send('Runtime.evaluate', { expression: `document.querySelectorAll('.gallery-card')[5].click();` });
      await new Promise(r => setTimeout(r, 600));

      const snap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/screenshot_lightbox_verified.png', Buffer.from(snap.data, 'base64'));
      console.log('SUCCESS_LIGHTBOX_SNAP');
      
      // Close lightbox
      await send('Runtime.evaluate', { expression: `document.getElementById('lightboxClose').click();` });
      await new Promise(r => setTimeout(r, 300));

      ws.close();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
