const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BASE_URL = isLocal ? 'http://localhost:8000/api' : '/api';

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong');
  }
  return data;
}

async function getTasks() {
  const response = await fetch(`${BASE_URL}/tasks`);
  return handleResponse(response);
}

async function createTask(data) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

async function updateTask(id, data) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

async function toggleTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
  return handleResponse(response);
}

async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}
