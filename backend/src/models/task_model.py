from datetime import datetime, timezone
from src.database import _request

def get_all_tasks():
  """Returns a list of all tasks ordered by creation date descending."""
  return _request("GET", "tasks?order=created_at.desc")

def get_task_by_id(task_id):
  """Returns a single task by ID, or None if not found."""
  result = _request("GET", f"tasks?id=eq.{task_id}", prefer="return=representation")
  if result and len(result) > 0:
    return result[0]
  return None

def create_task(title, description, priority, due_date):
  """Inserts a new task and returns the created task as a dict."""
  data = {
    "title": title,
    "description": description or "",
    "priority": priority,
    "due_date": due_date,
  }
  result = _request("POST", "tasks", data=data, prefer="return=representation")
  if result and len(result) > 0:
    return result[0]
  return result

def update_task(task_id, data):
  """Updates a task with the given data dict. Returns the updated task or None."""
  existing = get_task_by_id(task_id)
  if existing is None:
    return None

  update_data = {}
  if "title" in data:
    update_data["title"] = data["title"]
  if "description" in data:
    update_data["description"] = data["description"]
  if "status" in data:
    update_data["status"] = data["status"]
  if "priority" in data:
    update_data["priority"] = data["priority"]
  if "due_date" in data:
    update_data["due_date"] = data["due_date"]
  update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

  result = _request("PATCH", f"tasks?id=eq.{task_id}", data=update_data, prefer="return=representation")
  if result and len(result) > 0:
    return result[0]
  return None

def toggle_task_status(task_id):
  """Toggles a task between 'pending' and 'completed'. Returns updated task or None."""
  existing = get_task_by_id(task_id)
  if existing is None:
    return None

  new_status = "completed" if existing["status"] == "pending" else "pending"
  result = _request("PATCH", f"tasks?id=eq.{task_id}",
    data={"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()},
    prefer="return=representation"
  )
  if result and len(result) > 0:
    return result[0]
  return None

def delete_task(task_id):
  """Deletes a task by ID. Returns True if deleted, False if not found."""
  existing = get_task_by_id(task_id)
  if existing is None:
    return False
  _request("DELETE", f"tasks?id=eq.{task_id}")
  return True
