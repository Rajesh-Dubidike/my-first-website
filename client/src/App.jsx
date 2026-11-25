import { useEffect, useState } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [message, setMessage] = useState('');

  async function loadTasks() {
    const response = await fetch('/api/tasks');
    const data = await response.json();
    setTasks(data);
  }

  async function addTask(event) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newTask })
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error);
      return;
    }

    setNewTask('');
    loadTasks();
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <main className="card">
      <p className="label">REACT + EXPRESS + SQLITE</p>
      <h1>My tasks</h1>
      <p>Add a task and React will update the page.</p>

      <form onSubmit={addTask}>
        <input
          value={newTask}
          onChange={(event) => setNewTask(event.target.value)}
          placeholder="Example: Learn React"
          maxLength="100"
          required
        />
        <button type="submit">Add task</button>
      </form>

      <p className="message">{message}</p>
      <ul>{tasks.map((task) => <li key={task.id}>{task.text}</li>)}</ul>
    </main>
  );
}
