const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const message = document.getElementById('message');

async function loadTasks() {
  const response = await fetch('/api/tasks');
  const tasks = await response.json();
  taskList.innerHTML = '';

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.textContent = task.text;
    taskList.appendChild(item);
  });
}

taskForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  message.textContent = '';

  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: taskInput.value })
  });

  const data = await response.json();
  if (!response.ok) {
    message.textContent = data.error;
    return;
  }

  taskInput.value = '';
  loadTasks();
});

loadTasks();
