const messageButton = document.getElementById('message-button');
const serverMessage = document.getElementById('server-message');

messageButton.addEventListener('click', async function () {
  serverMessage.textContent = 'Loading message...';

  try {
    const response = await fetch('/api/message');
    const data = await response.json();
    serverMessage.textContent = data.message;
  } catch (error) {
    serverMessage.textContent = 'Could not contact the server.';
  }
});
