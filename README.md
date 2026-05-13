# Task-Flow

## Description

Task-Flow is a minimalist personal task manager built as a full-stack web application. It lets you create, view, edit, delete, and toggle tasks between pending and completed states. Tasks are stored persistently in a PostgreSQL database and accessed through a clean REST API.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Python + FastAPI
- **Database**: PostgreSQL (via `psycopg2`)
- **Hosting**: Vercel (Frontend & Backend APIs) + Render (PostgreSQL Database)

## Beginner-Friendly Local Setup

### Prerequisites

- Python 3.10+
- A PostgreSQL database (local or hosted)
- A simple static file server for the frontend (VS Code Live Server or `npx serve`)

### 1) Clone the repository

```bash
git clone https://github.com/your-username/task-flow.git
cd task-flow
```

### 2) Backend setup (create a virtual environment)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 3) Configure your database

Open `backend/.env` and set your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
```

If you are using a hosted DB (e.g., Render), paste the external connection URL here.

### 4) Start the backend API

```bash
uvicorn app:app --reload --port 8000
```

Your API will be available at `http://localhost:8000`. The `tasks` table is created automatically if it does not exist.

### 5) Start the frontend

Use any static server. Two easy options:

```bash
npx serve frontend -p 5500
```

Or open `frontend/index.html` with VS Code Live Server (port 5500).

### 6) Run tests

```bash
cd backend
pytest ../tests -v
```

## Deployment (Vercel + Render)

This application is configured for deployment on Vercel with a Render-hosted PostgreSQL database.

1. **Database:** Create a PostgreSQL instance on Render and copy the External Database URL.
2. **Vercel:** Import your GitHub repository to Vercel.
   - **Framework Preset:** Other
   - **Environment Variables:** Add `DATABASE_URL` with your Render connection string.
3. Vercel will host both your frontend static files and run your FastAPI backend as Serverless Functions via the `api/` endpoints configured in `vercel.json`.

## Environment Variables

See `backend/.env.example` — `DATABASE_URL` is required.

## API Endpoints

| Method | Endpoint                 | Description            |
|--------|--------------------------|------------------------|
| GET    | `/api/tasks`             | List all tasks         |
| POST   | `/api/tasks`             | Create a new task      |
| PUT    | `/api/tasks/:id`         | Update an existing task|
| PATCH  | `/api/tasks/:id/toggle`  | Toggle task status     |
| DELETE | `/api/tasks/:id`         | Delete a task          |

## Features

- View, add, edit, delete tasks
- Toggle pending / completed
- Filter by status (All / Pending / Completed)
- Priority levels (Low / Medium / High) with colored badges
- Due date with overdue highlighting
- Input validation (frontend + backend)
- Persistent PostgreSQL storage
- Backend unit tests with pytest
