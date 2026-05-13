from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import init_db
from src.routes.tasks import router as tasks_router


@asynccontextmanager
async def lifespan(application):
  init_db()
  yield


app = FastAPI(title="Task-Flow API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5501",
    "http://127.0.0.1:5501",
    "http://localhost:5502",
    "http://127.0.0.1:5502",
    "http://localhost:5503",
    "http://127.0.0.1:5503",
    "http://0.0.0.0:5502",
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(tasks_router)


if __name__ == "__main__":
  import uvicorn
  uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
