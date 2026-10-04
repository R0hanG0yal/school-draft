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
        ws.addEventListener('message', function h(e) {
          const msg = JSON.parse(e.data);
          if (msg.id === id) {
            ws.removeEventListener('message', h);
            resolve(msg.result);
          }
        });
        ws.send(JSON.stringify({ id, method: m, params }));
      });

      // Scroll specifically to card 14
      await send('Runtime.evaluate', {
        expression: `
          const cards = document.querySelectorAll('.gallery-card');
          if (cards[13]) cards[13].scrollIntoView({ behavior: 'instant', block: 'center' });
        `
      });
      await new Promise(r => setTimeout(r, 1200));

      const status = await send('Runtime.evaluate', {
        expression: `
          Array.from(document.querySelectorAll('.gallery-card img')).slice(10, 16).map((img, i) => ({
            cardNum: i + 11,
            src: img.src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete
          }))
        `,
        returnByValue: true
      });
      console.log('CARDS_11_TO_16_LOAD_STATUS:');
      console.log(JSON.stringify(status.result.value, null, 2));

      // Capture screenshot of cards 11-16
      const snap = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:/Users/pc/.gemini/antigravity-ide/brain/c21c8b9b-51a4-4614-8171-85099189066a/proof_cards_13_16_loaded.png', Buffer.from(snap.data, 'base64'));
      console.log('SAVED: proof_cards_13_16_loaded.png');

      ws.close();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
});
