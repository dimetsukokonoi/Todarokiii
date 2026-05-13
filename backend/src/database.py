import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
  """Returns a psycopg2 connection with RealDictCursor."""
  if not DATABASE_URL:
      raise ValueError("DATABASE_URL environment variable is missing.")
  conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
  return conn


def init_db():
  """Creates the tasks table if it does not exist."""
  conn = get_connection()
  with conn.cursor() as cursor:
      cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
          id          SERIAL PRIMARY KEY,
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
