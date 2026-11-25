const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const port = process.env.PORT || 3000;
const database = new sqlite3.Database(path.join(__dirname, 'tasks.db'));

database.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const publicFiles = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/style.css': 'style.css',
  '/script.js': 'script.js'
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(data));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/tasks') {
    database.all('SELECT * FROM tasks ORDER BY id DESC', (error, tasks) => {
      if (error) return sendJson(response, 500, { error: 'Could not read tasks.' });
      sendJson(response, 200, tasks);
    });
    return;
  }

  if (request.method === 'POST' && request.url === '/api/tasks') {
    try {
      const { text } = JSON.parse(await readRequestBody(request));
      const taskText = String(text || '').trim();

      if (!taskText || taskText.length > 100) {
        return sendJson(response, 400, { error: 'Task must be between 1 and 100 characters.' });
      }

      database.run('INSERT INTO tasks (text) VALUES (?)', [taskText], function (error) {
        if (error) return sendJson(response, 500, { error: 'Could not save task.' });
        sendJson(response, 201, { id: this.lastID, text: taskText });
      });
    } catch (error) {
      sendJson(response, 400, { error: 'Please send valid JSON.' });
    }
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

    const type = path.extname(fileName) === '.css' ? 'text/css' : path.extname(fileName) === '.js' ? 'application/javascript' : 'text/html';
    response.writeHead(200, { 'Content-Type': type });
    response.end(content);
  });
});

server.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
