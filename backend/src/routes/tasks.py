from fastapi import APIRouter, Request
from src.controllers.task_controller import (
  list_tasks,
  get_single_task,
  add_task,
  edit_task,
  toggle_task,
  remove_task,
)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("")
def get_tasks():
  """GET /api/tasks — returns all tasks."""
  return list_tasks()


@router.post("", status_code=201)
async def post_task(request: Request):
  """POST /api/tasks — creates a new task."""
  data = await request.json()
  return add_task(data)


@router.put("/{task_id}")
async def put_task(task_id: int, request: Request):
  """PUT /api/tasks/:id — updates a task."""
  data = await request.json()
  return edit_task(task_id, data)


@router.patch("/{task_id}/toggle")
def patch_toggle(task_id: int):
  """PATCH /api/tasks/:id/toggle — toggles task status."""
  return toggle_task(task_id)


@router.delete("/{task_id}")
def delete_task_route(task_id: int):
  """DELETE /api/tasks/:id — deletes a task."""
  return remove_task(task_id)
