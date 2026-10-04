const http = require('http');

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

    // Remove loading="lazy" temporarily from all gallery images or scroll to them to test if they load
    const result = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const imgs = Array.from(document.querySelectorAll('.gallery-card img'));
          imgs.forEach(img => { img.removeAttribute('loading'); });
          return imgs.map((img, i) => ({
            i: i + 1,
            src: img.src.split('/').slice(-3).join('/'),
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          }));
        })()
      `,
      returnByValue: true
    });

    console.log(JSON.stringify(result.result.value, null, 2));

    await new Promise(r => setTimeout(r, 1000));

    const resultAfter = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const imgs = Array.from(document.querySelectorAll('.gallery-card img'));
          return imgs.map((img, i) => ({
            i: i + 1,
            src: img.src.split('/').slice(-3).join('/'),
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          }));
        })()
      `,
      returnByValue: true
    });

    console.log('AFTER 1s:');
    console.log(JSON.stringify(resultAfter.result.value, null, 2));

    ws.close();
    process.exit(0);
  });
});
