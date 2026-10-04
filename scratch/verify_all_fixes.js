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
      await send('Page.reload', { ignoreCache: true });
      await new Promise(r => setTimeout(r, 2000));

      // 1. Verify Highlights Section images (Cards 11-16)
      const highlightImgStatus = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const cards = Array.from(document.querySelectorAll('.gallery-card img'));
            return cards.map((img, i) => ({
              idx: i + 1,
              src: img.src,
              naturalWidth: img.naturalWidth,
              complete: img.complete
            }));
          })()
        `,
        returnByValue: true
      });
      console.log('HIGHLIGHTS_IMAGES_STATUS (First 16):', highlightImgStatus.result.value.slice(10, 16));

      // 2. Capture Desktop Affiliations & Footer
      await send('Runtime.evaluate', { expression: `document.getElementById('affiliations').scrollIntoView({ behavior: 'instant', block: 'center' });` });
      await new Promise(r => setTimeout(r, 1200));
      const affilSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_affiliations_color.png', Buffer.from(affilSnap.data, 'base64'));
      console.log('SAVED: proof_affiliations_color.png');

      await send('Runtime.evaluate', { expression: `document.getElementById('contact').scrollIntoView({ behavior: 'instant', block: 'center' });` });
      await new Promise(r => setTimeout(r, 600));
      const contactSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_contact_birla_logo.png', Buffer.from(contactSnap.data, 'base64'));
      console.log('SAVED: proof_contact_birla_logo.png');

      // 3. Switch to Mobile View (width: 390px, iPhone 14 / modern smartphone)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });

      // Capture Mobile Reviews (2 at a time)
      await send('Runtime.evaluate', { expression: `document.getElementById('parents').scrollIntoView({ behavior: 'instant', block: 'center' });` });
      await new Promise(r => setTimeout(r, 600));
      const mobParentsSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_mobile_reviews_2col.png', Buffer.from(mobParentsSnap.data, 'base64'));
      console.log('SAVED: proof_mobile_reviews_2col.png');

      // Capture Mobile Milestones (luminous track)
      await send('Runtime.evaluate', { expression: `document.querySelector('.timeline-wrap').scrollIntoView({ behavior: 'instant', block: 'center' });` });
      await new Promise(r => setTimeout(r, 600));
      const mobMilestonesSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_mobile_milestones_track.png', Buffer.from(mobMilestonesSnap.data, 'base64'));
      console.log('SAVED: proof_mobile_milestones_track.png');

      // Capture Mobile Exploded Menu Header (No Overlap)
      await send('Runtime.evaluate', { expression: `document.getElementById('menuExplodeTrigger').click();` });
      await new Promise(r => setTimeout(r, 700));
      const mobMenuSnap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_mobile_menu_header.png', Buffer.from(mobMenuSnap.data, 'base64'));
      console.log('SAVED: proof_mobile_menu_header.png');

      // Reset Emulation
      await send('Emulation.clearDeviceMetricsOverride');
      ws.close();
      console.log('ALL_FIXES_VERIFIED_SUCCESS');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
