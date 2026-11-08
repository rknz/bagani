const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const distDir = path.join(__dirname, 'dist');
const port = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8',
  '.apk': 'application/vnd.android.package-archive'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(distDir, reqPath);

  // Security check
  if (!filePath.startsWith(distDir)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const acceptEncoding = req.headers['accept-encoding'] || '';
  const rawStream = fs.createReadStream(filePath);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Long-lived cache for hashed assets
  if (reqPath.includes('_expo/static/') || reqPath.includes('assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }

  if (acceptEncoding.includes('gzip') && (contentType.startsWith('text/') || contentType.includes('javascript') || contentType.includes('json'))) {
    res.writeHead(200, { 'Content-Encoding': 'gzip' });
    rawStream.pipe(zlib.createGzip()).pipe(res);
  } else {
    res.writeHead(200);
    rawStream.pipe(res);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`High-speed production server running at http://0.0.0.0:${port}`);
});

