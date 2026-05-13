from src.database import get_connection

def row_to_dict(row):
  """Converts a psycopg2 RealDictRow to a plain dictionary."""
  if row is None:
    return None
  return dict(row)

def get_all_tasks():
  """Returns a list of all tasks ordered by creation date descending."""
  conn = get_connection()
  with conn.cursor() as cursor:
      cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
      tasks = [row_to_dict(row) for row in cursor.fetchall()]
  conn.close()
  return tasks

def get_task_by_id(task_id):
  """Returns a single task by ID, or None if not found."""
  conn = get_connection()
  with conn.cursor() as cursor:
      cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
      task = row_to_dict(cursor.fetchone())
  conn.close()
  return task

def create_task(title, description, priority, due_date):
  """Inserts a new task and returns the created task as a dict."""
  conn = get_connection()
  with conn.cursor() as cursor:
      cursor.execute(
        """INSERT INTO tasks (title, description, priority, due_date)
           VALUES (%s, %s, %s, %s) RETURNING id""",
        (title, description, priority, due_date)
      )
      new_id = cursor.fetchone()['id']
      conn.commit()
      cursor.execute("SELECT * FROM tasks WHERE id = %s", (new_id,))
      task = row_to_dict(cursor.fetchone())
  conn.close()
  return task

def update_task(task_id, data):
  """Updates a task with the given data dict. Returns the updated task or None."""
  conn = get_connection()
  with conn.cursor() as cursor:
      cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
      existing = row_to_dict(cursor.fetchone())
      if existing is None:
        conn.close()
        return None

      title = data.get("title", existing["title"])
      description = data.get("description", existing["description"])
      status = data.get("status", existing["status"])
      priority = data.get("priority", existing["priority"])
      due_date = data.get("due_date", existing["due_date"])

      cursor.execute(
        """UPDATE tasks
           SET title = %s, description = %s, status = %s, priority = %s,
               due_date = %s, updated_at = CURRENT_TIMESTAMP
           WHERE id = %s""",
        (title, description, status, priority, due_date, task_id)
      )
      conn.commit()
      cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
      task = row_to_dict(cursor.fetchone())
  conn.close()
  return task

def toggle_task_status(task_id):
  """Toggles a task between 'pending' and 'completed'. Returns updated task or None."""
  conn = get_connection()
  with conn.cursor() as cursor:
      cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
      existing = row_to_dict(cursor.fetchone())
      if existing is None:
        conn.close()
        return None

      new_status = "completed" if existing["status"] == "pending" else "pending"
      cursor.execute(
        """UPDATE tasks
           SET status = %s, updated_at = CURRENT_TIMESTAMP
           WHERE id = %s""",
        (new_status, task_id)
      )
      conn.commit()
      cursor.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
      task = row_to_dict(cursor.fetchone())
  conn.close()
  return task

def delete_task(task_id):
  """Deletes a task by ID. Returns True if deleted, False if not found."""
  conn = get_connection()
  with conn.cursor() as cursor:
      cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
      deleted = cursor.rowcount > 0
      conn.commit()
  conn.close()
  return deleted
