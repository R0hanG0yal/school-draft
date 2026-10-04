const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9222/json', (res) => {
  let d = '';
  res.on('data', (c) => (d += c));
  res.on('end', async () => {
    const pages = JSON.parse(d);
    const p = pages.find((x) => x.url && x.url.includes('index.html') && x.type === 'page');
    const ws = new WebSocket(p.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener('open', r));

    const send = (m, params = {}) =>
      new Promise((resolve, reject) => {
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
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });

    // Ensure menu is closed
    await send('Runtime.evaluate', {
      expression: `
        const closeBtn = document.querySelector('.exploded-menu-close');
        if (closeBtn) closeBtn.click();
        document.body.classList.remove('menu-open');
        const modal = document.getElementById('exploded-menu-modal');
        if (modal) modal.setAttribute('aria-hidden', 'true');
        
        document.querySelectorAll('.reveal').forEach(el => {
          el.classList.add('is-visible');
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.transition = 'none';
        });
        document.querySelectorAll('#affiliations img').forEach(img => {
          img.removeAttribute('loading');
        });
        document.getElementById('affiliations').scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });

    await new Promise(r => setTimeout(r, 600));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_affiliations_desktop_clear.png', Buffer.from(snap.data, 'base64'));
    console.log('SAVED: proof_affiliations_desktop_clear.png');

    // Also mobile view of affiliations
    await send('Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 915,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Runtime.evaluate', {
      expression: `
        document.getElementById('affiliations').scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await new Promise(r => setTimeout(r, 600));
    const mobileSnap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_affiliations_mobile_clear.png', Buffer.from(mobileSnap.data, 'base64'));
    console.log('SAVED: proof_affiliations_mobile_clear.png');

    ws.close();
    process.exit(0);
  });
});
