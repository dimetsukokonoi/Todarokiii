from fastapi import HTTPException
from src.models.task_model import (
  get_all_tasks,
  get_task_by_id,
  create_task,
  update_task,
  toggle_task_status,
  delete_task,
)


def list_tasks():
  """Returns all tasks."""
  return get_all_tasks()


def get_single_task(task_id):
  """Returns a single task or raises 404."""
  task = get_task_by_id(task_id)
  if task is None:
    raise HTTPException(status_code=404, detail="Task not found")
  return task


def add_task(data):
  """Validates and creates a new task. Raises 400 if title is missing."""
  title = data.get("title", "").strip()
  if not title:
    raise HTTPException(status_code=400, detail="Title is required")

  description = data.get("description", "")
  priority = data.get("priority", "medium")
  due_date = data.get("due_date", None)

  if priority not in ("low", "medium", "high"):
    raise HTTPException(status_code=400, detail="Priority must be low, medium, or high")

  return create_task(title, description, priority, due_date)


def edit_task(task_id, data):
  """Validates and updates an existing task. Raises 404 if not found, 400 on bad data."""
  if "title" in data and not data["title"].strip():
    raise HTTPException(status_code=400, detail="Title cannot be empty")

  if "priority" in data and data["priority"] not in ("low", "medium", "high"):
    raise HTTPException(status_code=400, detail="Priority must be low, medium, or high")

  if "status" in data and data["status"] not in ("pending", "completed"):
    raise HTTPException(status_code=400, detail="Status must be pending or completed")

  task = update_task(task_id, data)
  if task is None:
    raise HTTPException(status_code=404, detail="Task not found")
  return task


def toggle_task(task_id):
  """Toggles task status. Raises 404 if not found."""
  task = toggle_task_status(task_id)
  if task is None:
    raise HTTPException(status_code=404, detail="Task not found")
  return task


def remove_task(task_id):
  """Deletes a task. Raises 404 if not found."""
  deleted = delete_task(task_id)
  if not deleted:
    raise HTTPException(status_code=404, detail="Task not found")
  return {"message": "deleted"}
