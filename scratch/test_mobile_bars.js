const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', async () => {
    try {
      const pages = JSON.parse(d);
      const p = pages.find(x => x.url && x.url.includes('.html') && x.type === 'page');
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

      // Reload index.html
      const indexUrl = p.url.replace(/[^\/]+$/, 'index.html');
      await send('Page.navigate', { url: indexUrl });
      await new Promise(r => setTimeout(r, 1500));

      // Test at 412x915 (standard mobile device)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 412,
        height: 915,
        deviceScaleFactor: 2,
        mobile: true
      });
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' });
      await new Promise(r => setTimeout(r, 600));

      const snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_mobile_detached_header.png', Buffer.from(snap.data, 'base64'));
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_mobile_clean_bar.png', Buffer.from(snap.data, 'base64'));
      console.log('SAVED: proof_mobile_detached_header.png and proof_mobile_clean_bar.png');

      // Verify text inside trigger button
      const resText = await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.getElementById('menuExplodeTrigger');
          const textSpan = btn.querySelector('.trigger-text');
          const barsSpan = btn.querySelector('.trigger-bars');
          const style = window.getComputedStyle(textSpan);
          return {
            textVisible: style.display !== 'none' && style.visibility !== 'hidden',
            textDisplay: style.display,
            barsCount: barsSpan.querySelectorAll('span').length,
            btnWidth: btn.offsetWidth,
            btnHeight: btn.offsetHeight
          };
        })()`,
        returnByValue: true
      });
      console.log('MOBILE_TRIGGER_CHECK:', resText.result.value);

      // Reset
      await send('Emulation.clearDeviceMetricsOverride');
      ws.close();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
});
