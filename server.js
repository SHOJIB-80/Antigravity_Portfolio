const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  try {
    let reqUrl = decodeURI(req.url.split('?')[0]);
    if (reqUrl === '/') reqUrl = '/index.html';

    const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Ensure HTML, CSS and JS are never cached during development so changes show instantly
      const isStaticCode = ['.html', '.css', '.js'].includes(ext);
      const cacheControl = isStaticCode 
        ? 'no-cache, no-store, must-revalidate' 
        : 'public, max-age=86400';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*'
      });

      const stream = fs.createReadStream(filePath);
      stream.on('error', () => {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end();
      });
      stream.pipe(res);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server actively running at http://localhost:${PORT}/`);
});

process.on('uncaughtException', (err) => {
  console.error('Handled exception:', err);
});
