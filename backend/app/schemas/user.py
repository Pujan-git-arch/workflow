from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    department_id: int


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    department_id: int | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    department_id: int

    model_config = ConfigDict(from_attributes=True)