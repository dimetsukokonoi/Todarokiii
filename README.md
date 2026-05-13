# Task-Flow (Todarokiii)

> **Live Demo:** [https://todarokiii.vercel.app](https://todarokiii.vercel.app)

A minimalist, premium task manager built as a full-stack web application. Create, view, edit, delete, and toggle tasks between pending and completed states. All data is persisted in a PostgreSQL database (Supabase) and accessed through a clean REST API.

---

## Tech Stack

| Layer      | Technology                             |
| ---------- | -------------------------------------- |
| Frontend   | HTML, Vanilla CSS, Vanilla JavaScript  |
| Backend    | Python 3.10+ · FastAPI                 |
| Database   | PostgreSQL (hosted on Supabase)        |
| Deployment | Vercel (frontend + serverless backend) |

---

## Features

### Core
- View all tasks with title, status, creation date, and due date
- Create new tasks via a modal form
- Edit existing tasks (title, description, priority, due date)
- Delete tasks with a confirmation dialog
- Toggle tasks between pending and completed
- Visual distinction for completed tasks (strikethrough + opacity)

### Bonus
- **Filter bar** — Toggle between All, Pending, and Completed views
- **Due date with overdue highlighting** — Overdue tasks are flagged in red
- **Priority levels** — Low (green), Medium (yellow), High (red) with colored indicators
- **Sort by priority** — Tasks are automatically sorted High → Medium → Low
- **Backend unit tests** — Written with `pytest` and FastAPI `TestClient`
- **Deployed** — Live on Vercel at the link above
- **Mobile-responsive UI** — Optimised for both desktop and mobile screens

### Validation
- **Frontend:** Empty title submissions are blocked with a visible error message
- **Backend:** Returns `400 Bad Request` for missing titles or invalid priority values; `404 Not Found` for non-existent tasks

---

## Project Structure

```
task-flow/
├── api/                          # Vercel serverless entry point
│   ├── index.py                  # Re-exports FastAPI app for Vercel
│   └── requirements.txt          # Production dependencies for Vercel
├── backend/
│   ├── app.py                    # Server entry point (FastAPI)
│   ├── requirements.txt          # Development dependencies
│   ├── .env.example              # Example environment variables
│   └── src/
│       ├── database.py           # Supabase REST API connection layer
│       ├── routes/
│       │   └── tasks.py          # API route definitions
│       ├── controllers/
│       │   └── task_controller.py # Request handlers / business logic
│       └── models/
│           └── task_model.py     # Database queries (Supabase REST)
├── frontend/
│   ├── index.html                # Main HTML page
│   ├── css/
│   │   └── styles.css            # Custom CSS styles
│   └── js/
│       ├── api.js                # Frontend API service (fetch calls)
│       ├── app.js                # App logic, event bindings, filters
│       └── ui.js                 # DOM rendering, modals, task cards
├── tests/
│   └── test_tasks.py             # Backend unit tests (pytest)
├── vercel.json                   # Vercel deployment configuration
├── .gitignore
└── README.md
```

---

## Local Setup

### Prerequisites

- **Python 3.10+**
- **A Supabase project** (free tier works — [supabase.com](https://supabase.com))
- A static file server for the frontend (VS Code Live Server or `npx serve`)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/task-flow.git
cd task-flow
```

### 2. Set up the database (Supabase)

Create a new project on [Supabase](https://supabase.com) and run this SQL in the **SQL Editor** to create the tasks table:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          BIGSERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status      VARCHAR(20) DEFAULT 'pending',
  priority    VARCHAR(10) DEFAULT 'medium',
  due_date    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON tasks
  FOR ALL USING (true) WITH CHECK (true);
```

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key-here
```

You can find these values in your Supabase Dashboard under **Project Settings → API**.

### 4. Install Python dependencies

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Start the backend API

```bash
uvicorn app:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 6. Start the frontend

Open a new terminal and serve the frontend:

```bash
npx serve frontend -p 5500
```

Or open `frontend/index.html` with VS Code **Live Server** extension (port 5500 or 5502).

### 7. Run tests

```bash
cd backend
pytest ../tests -v
```

---

## API Endpoints

| Method   | Endpoint                | Description            | Success Code |
| -------- | ----------------------- | ---------------------- | ------------ |
| `GET`    | `/api/tasks`            | List all tasks         | `200`        |
| `POST`   | `/api/tasks`            | Create a new task      | `201`        |
| `PUT`    | `/api/tasks/:id`        | Update an existing task| `200`        |
| `PATCH`  | `/api/tasks/:id/toggle` | Toggle task status     | `200`        |
| `DELETE` | `/api/tasks/:id`        | Delete a task          | `200`        |

### Error Responses

| Code  | Condition                          |
| ----- | ---------------------------------- |
| `400` | Empty title or invalid priority    |
| `404` | Task with given ID does not exist  |

---

## Environment Variables

| Variable       | Description                              | Required |
| -------------- | ---------------------------------------- | -------- |
| `SUPABASE_URL` | Your Supabase project URL                | Yes      |
| `SUPABASE_KEY` | Your Supabase anonymous (public) API key | Yes      |

See `backend/.env.example` for a template. **Never commit your `.env` file.**

---

## Deployment (Vercel)

This project is configured for Vercel deployment via `vercel.json`:

1. Import your GitHub repository on [Vercel](https://vercel.com).
2. Set **Framework Preset** to `Other`.
3. Add Environment Variables in Project Settings:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_KEY` — your Supabase anon key
4. Deploy. Vercel serves the frontend as static files and runs the FastAPI backend as a Serverless Function under `/api/*`.

---

## AI Assistance Disclosure

AI coding assistants (GitHub Copilot, Gemini) were used during development for code scaffolding and debugging. All application logic, architecture decisions, and implementation details were reviewed and understood by the developer.
