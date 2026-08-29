from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "todo"
    priority: str = "medium"
    due_date: datetime | None = None
    department_id: int
    assigned_to: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    due_date: datetime | None = None
    department_id: int | None = None
    assigned_to: int | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    priority: str
    due_date: datetime | None
    created_by: int
    assigned_to: int | None
    department_id: int

    model_config = ConfigDict(from_attributes=True)