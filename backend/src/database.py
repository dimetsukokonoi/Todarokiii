import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "./taskflow.db")


def get_connection():
  """Returns a sqlite3 connection with Row factory enabled."""
  conn = sqlite3.connect(DATABASE_URL)
  conn.row_factory = sqlite3.Row
  conn.execute("PRAGMA journal_mode=WAL")
  return conn


def init_db():
  """Creates the tasks table if it does not exist."""
  conn = get_connection()
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
  conn.close()
