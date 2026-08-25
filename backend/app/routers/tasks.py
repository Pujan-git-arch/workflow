from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.auth import get_current_user
from app.models.user import User
from app.database import get_db
from app.models.task import Task
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse
)


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)


# CREATE TASK
@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        department_id=task.department_id,
        created_by=current_user.id,
        assigned_to=task.assigned_to
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# GET ALL TASKS
@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(
        (Task.created_by == current_user.id) |
        (Task.assigned_to == current_user.id) |
        (Task.department_id == current_user.department_id)
    ).all()

    return tasks


# GET ONE TASK
@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # AUTHORIZATION CHECK: Must be creator, assignee, or belong to the same department
    has_access = (
        task.created_by == current_user.id or
        task.assigned_to == current_user.id or
        task.department_id == current_user.department_id
    )

    if not has_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation forbidden: You do not have permission to view this task."
        )

    return task


# UPDATE TASK
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # AUTHORIZATION CHECK: Only task creator or assignee can update
    is_owner = task.created_by == current_user.id
    is_assignee = task.assigned_to == current_user.id

    if not (is_owner or is_assignee):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation forbidden: You do not have permission to modify this task."
        )

    if task_data.title is not None:
        task.title = task_data.title

    if task_data.description is not None:
        task.description = task_data.description

    if task_data.priority is not None:
        task.priority = task_data.priority

    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    if task_data.assigned_to is not None:
        task.assigned_to = task_data.assigned_to

    if task_data.department_id is not None:
        task.department_id = task_data.department_id

    db.commit()
    db.refresh(task)

    return task


# DELETE TASK
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # STRICT AUTHORIZATION CHECK: Only task creator can delete
    if task.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation forbidden: Only the creator can delete this task."
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }