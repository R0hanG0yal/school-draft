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
        console.error('No tab found');
        process.exit(1);
      }
      const ws = new WebSocket(p.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));
      
      const send = (m, params = {}) => new Promise((resolve, reject) => {
        const id = Math.floor(Math.random() * 99999);
        ws.addEventListener('message', function h(e) {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', h);
            resolve(msg.result);
          }
        });
        ws.send(JSON.stringify({ id, method: m, params }));
      });

      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });

      await send('Runtime.evaluate', { 
        expression: `document.getElementById('parents').scrollIntoView({ behavior: 'instant', block: 'center' });` 
      });
      await new Promise(r => setTimeout(r, 600));

      const snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_mobile_parents.png', Buffer.from(snap.data, 'base64'));
      
      // Reset back to desktop
      await send('Emulation.clearDeviceMetricsOverride');
      ws.close();
      console.log('MOBILE_CHECK_COMPLETE_SUCCESS');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
