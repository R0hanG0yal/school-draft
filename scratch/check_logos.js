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

    const info = await send('Runtime.evaluate', {
      expression: `
        Array.from(document.querySelectorAll('#affiliations .logo-item')).map((fig, i) => {
          const img = fig.querySelector('img');
          return {
            i,
            text: fig.querySelector('figcaption') ? fig.querySelector('figcaption').textContent : '',
            src: img ? img.src : null,
            complete: img ? img.complete : null,
            naturalWidth: img ? img.naturalWidth : null,
            offsetWidth: img ? img.offsetWidth : null,
            offsetHeight: img ? img.offsetHeight : null,
            display: img ? window.getComputedStyle(img).display : null,
            opacity: img ? window.getComputedStyle(img).opacity : null,
            visibility: img ? window.getComputedStyle(img).visibility : null
          };
        })
      `,
      returnByValue: true
    });
    console.log(JSON.stringify(info.result.value, null, 2));

    ws.close();
    process.exit(0);
  });
});
