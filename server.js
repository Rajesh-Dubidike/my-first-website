const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const publicFiles = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/style.css': 'style.css',
  '/script.js': 'script.js'
};

const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript'
};

const server = http.createServer((request, response) => {
  if (request.url === '/api/message') {
    const data = { message: 'Hello! This message came from the server.' };
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
    return;
  }

  const fileName = publicFiles[request.url];
  if (!fileName) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Page not found');
    return;
  }

  fs.readFile(path.join(__dirname, fileName), (error, content) => {
    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('Server error');
      return;
    }

    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(fileName)] });
    response.end(content);
  });
});

server.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
