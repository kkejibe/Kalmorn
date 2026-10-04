const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp' };

function createServer() {
  return http.createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname.split('/').some(part => part.startsWith('.') || part === 'node_modules')) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      let file = path.resolve(root, '.' + pathname);
      if (file !== root && !file.startsWith(root + path.sep)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const real = await fs.realpath(file);
      if (!real.startsWith(root + path.sep)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      const content = await fs.readFile(real);
      response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      response.writeHead(error instanceof URIError ? 400 : 404).end('Not found');
    }
  });
}

module.exports = { createServer };
if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  createServer().listen(port, '127.0.0.1', () => console.log(`Kalmorn preview: http://127.0.0.1:${port}`));
}
