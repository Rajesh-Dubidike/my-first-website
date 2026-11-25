const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;
const database = new sqlite3.Database(path.join(__dirname, 'tasks.db'));

database.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Lets Express read JSON sent from script.js.
app.use(express.json());

// Makes the built React app available in the browser.
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// GET: send every task from SQLite to the browser.
app.get('/api/tasks', (request, response) => {
  database.all('SELECT * FROM tasks ORDER BY id DESC', (error, tasks) => {
    if (error) return response.status(500).json({ error: 'Could not read tasks.' });
    response.json(tasks);
  });
});

// POST: receive a task from the browser and save it in SQLite.
app.post('/api/tasks', (request, response) => {
  const taskText = String(request.body.text || '').trim();

  if (!taskText || taskText.length > 100) {
    return response.status(400).json({ error: 'Task must be between 1 and 100 characters.' });
  }

  database.run('INSERT INTO tasks (text) VALUES (?)', [taskText], function (error) {
    if (error) return response.status(500).json({ error: 'Could not save task.' });
    response.status(201).json({ id: this.lastID, text: taskText });
  });
});

app.listen(port, () => {
  console.log(`Website is running at http://localhost:${port}`);
});
