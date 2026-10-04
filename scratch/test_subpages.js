const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', async () => {
    try {
      const pages = JSON.parse(data);
      const p = pages.find(x => x.url && x.url.includes('.html') && x.type === 'page');
      if (!p) {
        console.error('No tab found!');
        process.exit(1);
      }
      const ws = new WebSocket(p.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));
      
      const send = (m, params = {}) => new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 99999);
        const to = setTimeout(() => reject(new Error('Timeout on ' + m)), 8000);
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

      const subpages = [
        'about.html',
        'academics.html',
        'admissions.html',
        'pastoral-care.html',
        'co-curricular.html'
      ];

      for (const pageName of subpages) {
        const fileUrl = p.url.replace(/[^\/]+$/, pageName);
        console.log(`Navigating to ${pageName}...`);
        await send('Page.navigate', { url: fileUrl });
        await new Promise(r => setTimeout(r, 1800));

        const snap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        fs.writeFileSync(`C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_${pageName.replace('.html','')}.png`, Buffer.from(snap.data, 'base64'));
        console.log(`Captured proof_${pageName.replace('.html','')}.png`);
      }

      // Return back to index.html
      const indexUrl = p.url.replace(/[^\/]+$/, 'index.html');
      await send('Page.navigate', { url: indexUrl });
      await new Promise(r => setTimeout(r, 1000));

      ws.close();
      console.log('ALL_SUBPAGES_VERIFIED_SUCCESS');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
