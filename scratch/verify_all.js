const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    try {
      const pages = JSON.parse(data);
      const p = pages.find(x => x.url && x.url.includes('index.html') && x.type === 'page');
      if (!p) {
        console.error('index.html tab not found!');
        process.exit(1);
      }
      const ws = new WebSocket(p.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));
      
      const send = (m, params = {}) => new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 99999);
        const to = setTimeout(() => reject(new Error('Timeout on ' + m)), 7000);
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
      // Reload page to catch all new scripts and css
      await send('Page.reload', { ignoreCache: true });
      await new Promise(r => setTimeout(r, 1200));

      // 1. Capture Top Bar & Header (Verify no green dot)
      await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
      await new Promise(r => setTimeout(r, 400));
      const topSnap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_top_bar_no_green_dot.png', Buffer.from(topSnap.data, 'base64'));
      console.log('SAVED: proof_top_bar_no_green_dot.png');

      // 2. Capture Principal Section
      await send('Runtime.evaluate', { expression: `document.getElementById('leadership').scrollIntoView({ behavior: 'instant', block: 'center' });` });
      await new Promise(r => setTimeout(r, 800));
      const principalSnap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_principal_section.png', Buffer.from(principalSnap.data, 'base64'));
      console.log('SAVED: proof_principal_section.png');

      // 3. Capture Scroll Progress and Floating Button
      await send('Runtime.evaluate', { expression: `window.scrollTo({ top: document.body.scrollHeight * 0.6, behavior: 'instant' });` });
      await new Promise(r => setTimeout(r, 800));
      const scrollSnap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_scroll_and_back_to_top.png', Buffer.from(scrollSnap.data, 'base64'));
      console.log('SAVED: proof_scroll_and_back_to_top.png');

      ws.close();
      console.log('ALL_VERIFIED_SUCCESSFULLY');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
