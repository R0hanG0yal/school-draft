const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let d = '';
  res.on('data', (c) => (d += c));
  res.on('end', async () => {
    try {
      const pages = JSON.parse(d);
      const p = pages.find((x) => x.url && x.url.includes('index.html') && x.type === 'page');
      if (!p) {
        console.error('No index.html page tab found');
        process.exit(1);
      }
      const ws = new WebSocket(p.webSocketDebuggerUrl);
      await new Promise((r) => ws.addEventListener('open', r));

      const send = (m, params = {}) =>
        new Promise((resolve, reject) => {
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

      await send('Page.bringToFront');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 2,
        mobile: false
      });
      await send('Page.reload', { ignoreCache: true });
      await new Promise((r) => setTimeout(r, 2000));

      // 1. Verify Detached Floating Header
      const headerInfo = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const h = document.querySelector('.site-header');
            const cs = window.getComputedStyle(h);
            const rect = h.getBoundingClientRect();
            return {
              position: cs.position,
              top: rect.top,
              width: rect.width,
              borderRadius: cs.borderRadius,
              boxShadow: cs.boxShadow
            };
          })()
        `,
        returnByValue: true
      });
      console.log('HEADER_INFO:', headerInfo.result.value);

      // Capture detached floating header on desktop
      const headerSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_detached_floating_header.png', Buffer.from(headerSnap.data, 'base64'));
      console.log('SAVED: proof_detached_floating_header.png');

      // 2. Verify Affiliations in 1 Single Line
      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('is-visible');
            el.style.opacity = '1';
            el.style.transform = 'none';
          });
          document.getElementById('affiliations').scrollIntoView({ behavior: 'instant', block: 'center' });
        `
      });
      await new Promise((r) => setTimeout(r, 800));

      const affilInfo = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const items = Array.from(document.querySelectorAll('#affiliations .logo-item'));
            return items.map((it, i) => ({
              idx: i + 1,
              top: it.offsetTop,
              left: it.offsetLeft,
              text: it.querySelector('figcaption')?.textContent
            }));
          })()
        `,
        returnByValue: true
      });
      console.log('AFFILIATIONS_ITEMS_POSITIONS:', affilInfo.result.value);

      const affilSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_affiliations_single_line.png', Buffer.from(affilSnap.data, 'base64'));
      console.log('SAVED: proof_affiliations_single_line.png');

      // 3. Test Exploded Menu (No Yellowish color)
      await send('Runtime.evaluate', {
        expression: `
          window.scrollTo({ top: 0, behavior: 'instant' });
          document.getElementById('menuExplodeTrigger')?.click();
        `
      });
      await new Promise((r) => setTimeout(r, 700));

      const menuSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_exploded_menu_clean_white.png', Buffer.from(menuSnap.data, 'base64'));
      console.log('SAVED: proof_exploded_menu_clean_white.png');

      // Close menu
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.exploded-menu-close')?.click();`
      });
      await new Promise((r) => setTimeout(r, 500));

      // 4. Test Floating Quick Links Drawer
      await send('Runtime.evaluate', {
        expression: `document.getElementById('quickLinksDockBtn')?.click();`
      });
      await new Promise((r) => setTimeout(r, 700));

      const drawerSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_quicklinks_drawer_open.png', Buffer.from(drawerSnap.data, 'base64'));
      console.log('SAVED: proof_quicklinks_drawer_open.png');

      // Close drawer
      await send('Runtime.evaluate', {
        expression: `document.getElementById('quicklinksCloseBtn')?.click();`
      });
      await new Promise((r) => setTimeout(r, 400));

      // 5. Test Mobile Detached Header
      await send('Emulation.setDeviceMetricsOverride', {
        width: 412,
        height: 915,
        deviceScaleFactor: 2,
        mobile: true
      });
      await send('Runtime.evaluate', {
        expression: `window.scrollTo({ top: 0, behavior: 'instant' });`
      });
      await new Promise((r) => setTimeout(r, 600));

      const mobileSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_mobile_detached_header.png', Buffer.from(mobileSnap.data, 'base64'));
      console.log('SAVED: proof_mobile_detached_header.png');

      ws.close();
      console.log('ALL_TESTS_COMPLETED_SUCCESSFULLY');
      process.exit(0);
    } catch (err) {
      console.error('Test error:', err);
      process.exit(1);
    }
  });
});
