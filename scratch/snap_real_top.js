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
      await send('Runtime.evaluate', { 
        expression: `
          document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        ` 
      });
      await new Promise(r => setTimeout(r, 600));
      const resVal = await send('Runtime.evaluate', { expression: `window.scrollY` });
      console.log('Final scrollY:', resVal.result.value);

      const topSnap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_top_utility_bar_zero.png', Buffer.from(topSnap.data, 'base64'));
      console.log('SAVED: proof_top_utility_bar_zero.png');
      ws.close();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
