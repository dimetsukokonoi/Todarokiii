# Task-Flow

## Description

Task-Flow is a minimalist personal task manager built as a full-stack web application. It lets you create, view, edit, delete, and toggle tasks between pending and completed states. Tasks are stored persistently in a SQLite database and accessed through a clean REST API.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Python + FastAPI
- **Database**: SQLite (raw sqlite3)

## Prerequisites

- Python 3.10+
- A local server for the frontend (e.g. VS Code Live Server or `npx serve`)

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/task-flow.git
cd task-flow
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 3. Frontend setup

Open `frontend/index.html` with Live Server (port 5500)
OR:

```bash
npx serve frontend -p 5500
```

### 4. Database

SQLite DB is auto-created at `backend/taskflow.db` on first run. No manual setup needed.

### 5. Run tests

```bash
cd backend
pytest ../tests/ -v
```

## Environment Variables

See `.env.example` — `PORT` and `DATABASE_URL`.

## API Endpoints

| Method | Endpoint                 | Description            |
|--------|--------------------------|------------------------|
| GET    | `/api/tasks`             | List all tasks         |
| POST   | `/api/tasks`             | Create a new task      |
| PUT    | `/api/tasks/:id`         | Update an existing task|
| PATCH  | `/api/tasks/:id/toggle`  | Toggle task status     |
| DELETE | `/api/tasks/:id`         | Delete a task          |

## AI Assistance

This project was built with Claude (Anthropic). All code has been reviewed and understood by the author.

## Features

- View, add, edit, delete tasks
- Toggle pending / completed
- Filter by status (All / Pending / Completed)
- Priority levels (Low / Medium / High) with colored badges
- Due date with overdue highlighting
- Input validation (frontend + backend)
- Persistent SQLite storage
- Backend unit tests with pytest
