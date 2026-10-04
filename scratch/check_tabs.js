const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const pages = JSON.parse(data);
    pages.forEach(p => console.log(p.type, p.url));
    process.exit(0);
  });
});
