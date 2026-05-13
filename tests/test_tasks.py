import pytest
import sqlite3
from fastapi.testclient import TestClient

from app import app
from src.database import get_connection, init_db


def get_test_connection():
  """Returns an in-memory SQLite connection for testing."""
  conn = sqlite3.connect(":memory:", check_same_thread=False)
  conn.row_factory = sqlite3.Row
  conn.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       VARCHAR(255) NOT NULL,
      description TEXT,
      status      VARCHAR(20) DEFAULT 'pending',
      priority    VARCHAR(10) DEFAULT 'medium',
      due_date    TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  """)
  conn.commit()
  return conn


_test_conn = get_test_connection()


def override_get_connection():
  return _test_conn


import src.database
import src.models.task_model

src.database.get_connection = override_get_connection
src.models.task_model.get_connection = override_get_connection

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
  """Clears the tasks table before each test."""
  _test_conn.execute("DELETE FROM tasks")
  _test_conn.commit()
  yield


def test_create_task_valid():
  """POST /api/tasks with valid data returns 201."""
  response = client.post("/api/tasks", json={
    "title": "Test Task",
    "description": "A test description",
    "priority": "high",
    "due_date": "2026-12-31"
  })
  assert response.status_code == 201
  data = response.json()
  assert data["title"] == "Test Task"
  assert data["status"] == "pending"
  assert data["priority"] == "high"


def test_create_task_empty_title():
  """POST /api/tasks with empty title returns 400."""
  response = client.post("/api/tasks", json={
    "title": "",
    "description": "Missing title"
  })
  assert response.status_code == 400
  assert "Title is required" in response.json()["detail"]


def test_get_tasks():
  """GET /api/tasks returns 200 with a list."""
  client.post("/api/tasks", json={"title": "Task A"})
  client.post("/api/tasks", json={"title": "Task B"})
  response = client.get("/api/tasks")
  assert response.status_code == 200
  data = response.json()
  assert isinstance(data, list)
  assert len(data) == 2


def test_delete_nonexistent_task():
  """DELETE /api/tasks/9999 returns 404."""
  response = client.delete("/api/tasks/9999")
  assert response.status_code == 404
  assert "Task not found" in response.json()["detail"]


def test_toggle_task():
  """PATCH /api/tasks/:id/toggle toggles status."""
  create_res = client.post("/api/tasks", json={"title": "Toggle Me"})
  task_id = create_res.json()["id"]

  toggle_res = client.patch(f"/api/tasks/{task_id}/toggle")
  assert toggle_res.status_code == 200
  assert toggle_res.json()["status"] == "completed"

  toggle_res2 = client.patch(f"/api/tasks/{task_id}/toggle")
  assert toggle_res2.json()["status"] == "pending"


def test_update_task():
  """PUT /api/tasks/:id updates a task."""
  create_res = client.post("/api/tasks", json={"title": "Original"})
  task_id = create_res.json()["id"]

  update_res = client.put(f"/api/tasks/{task_id}", json={
    "title": "Updated",
    "priority": "low"
  })
  assert update_res.status_code == 200
  assert update_res.json()["title"] == "Updated"
  assert update_res.json()["priority"] == "low"
