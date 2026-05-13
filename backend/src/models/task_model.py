from src.database import get_connection


def row_to_dict(row):
  """Converts a sqlite3.Row to a plain dictionary."""
  if row is None:
    return None
  return dict(row)


def get_all_tasks():
  """Returns a list of all tasks ordered by creation date descending."""
  conn = get_connection()
  cursor = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC")
  tasks = [row_to_dict(row) for row in cursor.fetchall()]
  return tasks


def get_task_by_id(task_id):
  """Returns a single task by ID, or None if not found."""
  conn = get_connection()
  cursor = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
  task = row_to_dict(cursor.fetchone())
  return task


def create_task(title, description, priority, due_date):
  """Inserts a new task and returns the created task as a dict."""
  conn = get_connection()
  cursor = conn.execute(
    """INSERT INTO tasks (title, description, priority, due_date)
       VALUES (?, ?, ?, ?)""",
    (title, description, priority, due_date)
  )
  conn.commit()
  new_id = cursor.lastrowid
  cursor2 = conn.execute("SELECT * FROM tasks WHERE id = ?", (new_id,))
  return row_to_dict(cursor2.fetchone())


def update_task(task_id, data):
  """Updates a task with the given data dict. Returns the updated task or None."""
  conn = get_connection()
  cursor = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
  existing = row_to_dict(cursor.fetchone())
  if existing is None:
    return None

  title = data.get("title", existing["title"])
  description = data.get("description", existing["description"])
  status = data.get("status", existing["status"])
  priority = data.get("priority", existing["priority"])
  due_date = data.get("due_date", existing["due_date"])

  conn.execute(
    """UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?,
           due_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?""",
    (title, description, status, priority, due_date, task_id)
  )
  conn.commit()
  cursor2 = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
  return row_to_dict(cursor2.fetchone())


def toggle_task_status(task_id):
  """Toggles a task between 'pending' and 'completed'. Returns updated task or None."""
  conn = get_connection()
  cursor = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
  existing = row_to_dict(cursor.fetchone())
  if existing is None:
    return None

  new_status = "completed" if existing["status"] == "pending" else "pending"
  conn.execute(
    """UPDATE tasks
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?""",
    (new_status, task_id)
  )
  conn.commit()
  cursor2 = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
  return row_to_dict(cursor2.fetchone())


def delete_task(task_id):
  """Deletes a task by ID. Returns True if deleted, False if not found."""
  conn = get_connection()
  cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
  conn.commit()
  return cursor.rowcount > 0
