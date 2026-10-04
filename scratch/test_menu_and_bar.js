const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let d = '';
  res.on('data', (c) => (d += c));
  res.on('end', async () => {
    try {
      const pages = JSON.parse(d);
      const p = pages.find((x) => x.url && x.url.includes('.html') && x.type === 'page');
      if (!p) {
        console.error('No web page found in browser');
        process.exit(1);
      }
      const ws = new WebSocket(p.webSocketDebuggerUrl);
      await new Promise((r) => ws.addEventListener('open', r));

      const send = (m, params = {}) =>
        new Promise((resolve, reject) => {
          const id = Math.floor(Math.random() * 99999);
          const to = setTimeout(() => reject(new Error('Timeout on ' + m)), 10000);
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

      // 1. Navigate to index.html
      const indexUrl = p.url.replace(/[^\/]+$/, 'index.html');
      await send('Page.navigate', { url: indexUrl });
      await new Promise((r) => setTimeout(r, 1500));

      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 2,
        mobile: false
      });

      await send('Runtime.evaluate', {
        expression: `window.scrollTo({ top: 0, behavior: 'instant' });`
      });
      await new Promise((r) => setTimeout(r, 600));

      // Capture desktop header without crowd
      const snapBar = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_clean_bar_desktop.png', Buffer.from(snapBar.data, 'base64'));
      console.log('SAVED: proof_clean_bar_desktop.png');

      // 2. Click Explore Menu to show Quick Links inside menu
      await send('Runtime.evaluate', {
        expression: `document.getElementById('menuExplodeTrigger')?.click();`
      });
      await new Promise((r) => setTimeout(r, 800));

      const snapMenu = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_menu_quicklinks_desktop.png', Buffer.from(snapMenu.data, 'base64'));
      console.log('SAVED: proof_menu_quicklinks_desktop.png');

      // Close menu
      await send('Runtime.evaluate', {
        expression: `document.getElementById('explodedMenuClose')?.click();`
      });
      await new Promise((r) => setTimeout(r, 500));

      // 3. Test on about.html
      const aboutUrl = p.url.replace(/[^\/]+$/, 'about.html');
      await send('Page.navigate', { url: aboutUrl });
      await new Promise((r) => setTimeout(r, 1500));

      await send('Runtime.evaluate', {
        expression: `window.scrollTo({ top: 0, behavior: 'instant' });`
      });
      await new Promise((r) => setTimeout(r, 500));

      const snapAboutBar = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_about_clean_bar.png', Buffer.from(snapAboutBar.data, 'base64'));
      console.log('SAVED: proof_about_clean_bar.png');

      // Open menu on about.html
      await send('Runtime.evaluate', {
        expression: `document.getElementById('menuExplodeTrigger')?.click();`
      });
      await new Promise((r) => setTimeout(r, 800));

      const snapAboutMenu = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_about_menu_quicklinks.png', Buffer.from(snapAboutMenu.data, 'base64'));
      console.log('SAVED: proof_about_menu_quicklinks.png');

      // Close menu and return to index
      await send('Runtime.evaluate', {
        expression: `document.getElementById('explodedMenuClose')?.click();`
      });
      await send('Page.navigate', { url: indexUrl });
      await new Promise((r) => setTimeout(r, 1000));

      ws.close();
      console.log('TESTS_COMPLETED_SUCCESSFULLY');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
