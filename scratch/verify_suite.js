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
      // Reload page to re-initialize scripts
      await send('Page.reload', { ignoreCache: true });
      await new Promise(r => setTimeout(r, 1200));

      // 1. Capture Header with Dropdown Open
      await send('Runtime.evaluate', { 
        expression: `
          window.scrollTo(0, 0);
          const firstNavItem = document.querySelector('.nav-item');
          if (firstNavItem) firstNavItem.querySelector('.nav-dropdown').style.opacity = '1';
          if (firstNavItem) firstNavItem.querySelector('.nav-dropdown').style.visibility = 'visible';
          if (firstNavItem) firstNavItem.querySelector('.nav-dropdown').style.pointerEvents = 'auto';
          if (firstNavItem) firstNavItem.querySelector('.nav-dropdown').style.transform = 'translateY(0) scale(1)';
        ` 
      });
      await new Promise(r => setTimeout(r, 500));
      const dropdownSnap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_nav_dropdown.png', Buffer.from(dropdownSnap.data, 'base64'));
      console.log('SAVED: proof_nav_dropdown.png');

      // 2. Capture Scrapbook Gallery
      await send('Runtime.evaluate', { 
        expression: `
          const g = document.getElementById('gallery');
          if (g) g.scrollIntoView({ behavior: 'instant', block: 'center' });
        ` 
      });
      await new Promise(r => setTimeout(r, 800));
      const scrapbookSnap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_scrapbook_gallery.png', Buffer.from(scrapbookSnap.data, 'base64'));
      console.log('SAVED: proof_scrapbook_gallery.png');

      // 3. Capture Parents Section with 4 Original Photos
      await send('Runtime.evaluate', { 
        expression: `
          const p = document.getElementById('parents');
          if (p) p.scrollIntoView({ behavior: 'instant', block: 'center' });
        ` 
      });
      await new Promise(r => setTimeout(r, 800));
      const parentsSnap = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_parents_original_photos.png', Buffer.from(parentsSnap.data, 'base64'));
      console.log('SAVED: proof_parents_original_photos.png');

      ws.close();
      console.log('VERIFICATION_COMPLETE_SUCCESS');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
