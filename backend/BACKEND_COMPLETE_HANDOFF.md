# WorkFlow Backend Complete Handoff

Updated: August 25, 2026

This document is a current snapshot of the backend project. It includes the source code, tests, migrations, configuration, dependency list, and environment template currently present in `backend/`.

The real `backend/.env` file is intentionally excluded because it can contain database credentials and secret keys. Generated folders and files are also excluded: `.venv/`, `__pycache__/`, and `*.pyc`.

## Folder Structure

```text
backend/
|-- .env                         # Excluded: local secrets
|-- .env.example                 # Included below
|-- BACKEND_COMPLETE_HANDOFF.md  # This document
|-- alembic.ini                  # Included below
|-- requirements.txt             # Included below
|-- test_crud.py                 # Included below
|-- test_db.py                   # Included below
|-- test_models.py               # Included below
|-- test_password.py             # Included below
|-- alembic/
|   |-- README                   # Included below
|   |-- env.py                   # Included below
|   |-- script.py.mako           # Included below
|   `-- versions/
|       `-- d936964faef9_create_initial_tables.py
`-- app/
    |-- database.py
    |-- main.py
    |-- core/
    |   |-- __init__.py
    |   |-- config.py
    |   `-- security.py
    |-- models/
    |   |-- __init__.py
    |   |-- department.py
    |   |-- task.py
    |   `-- user.py
    |-- routers/
    |   |-- __init__.py
    |   |-- auth.py
    |   |-- departments.py
    |   |-- tasks.py
    |   `-- users.py
    `-- schemas/
        |-- department.py
        |-- task.py
        `-- user.py
```

## Environment Template

### `.env.example`

```dotenv
DATABASE_URL=postgresql+psycopg://youruser:yourpassword@localhost:5432/workflow
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:3000
```

## Dependencies

### `requirements.txt`

```text
alembic==1.19.1
annotated-doc==0.0.5
annotated-types==0.8.0
anyio==4.14.2
argon2-cffi==25.1.0
argon2-cffi-bindings==25.1.0
bcrypt==5.0.0
certifi==2026.7.22
cffi==2.1.1
click==8.4.2
colorama==0.4.6
cryptography==50.0.0
detect-installer==0.1.0
dnspython==2.8.0
ecdsa==0.19.2
email-validator==2.3.0
fastapi==0.141.1
fastapi-cli==0.0.32
fastapi-cloud-cli==0.23.0
fastar==0.11.0
greenlet==3.5.4
h11==0.16.0
httpcore==1.0.9
httptools==0.8.0
httpx==0.28.1
idna==3.18
Jinja2==3.1.6
Mako==1.4.1
markdown-it-py==4.2.0
MarkupSafe==3.0.3
mdurl==4.2.0
passlib==1.7.4
psycopg==3.3.4
psycopg-binary==3.3.4
pwdlib==0.3.1
pyasn1==0.6.4
pycparser==3.0
pydantic==2.13.4
pydantic-extra-types==2.11.1
pydantic-settings==2.15.0
pydantic_core==2.46.4
Pygments==2.20.0
python-dotenv==1.2.2
python-jose==3.5.0
python-multipart==0.0.32
PyYAML==6.0.3
rich==15.0.0
rich-toolkit==0.20.3
rignore==0.8.1
rsa==4.9.1
sentry-sdk==2.66.1
shellingham==1.5.4
six==1.17.0
SQLAlchemy==2.0.51
starlette==1.6.0
typer==0.27.1
typing-inspection==0.4.2
typing_extensions==4.16.0
tzdata==2026.3
urllib3==2.7.0
uvicorn==0.52.1
watchfiles==1.2.0
websockets==17.0.1
```

## Application Code

### `app/core/__init__.py`

```python
# Empty file
```

### `app/core/config.py`

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    FRONTEND_URL: str

    class Config:
        env_file = ".env"


settings = Settings()
```

### `app/core/security.py`

```python
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Optional

from app.core.config import settings


password_hash = PasswordHash.recommended()

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password
    )


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return {}
```

### `app/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)


class Base(DeclarativeBase):
    pass


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
```

### `app/main.py`

```python
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.config import settings

from app.routers.departments import router as department_router
from app.routers.users import router as user_router
from app.routers.tasks import router as task_router
from app.routers.auth import router as auth_router

app = FastAPI(title="WorkFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(department_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(task_router)


@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))

    return {
        "database": result.scalar()
    }
```

## Models

### `app/models/__init__.py`

```python
from app.models.department import Department
from app.models.user import User
from app.models.task import Task
```

### `app/models/department.py`

```python
from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


if TYPE_CHECKING:
    from app.models.user import User


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    users: Mapped[list["User"]] = relationship(
        "User",
        back_populates="department"
    )
```

### `app/models/user.py`

```python
from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


if TYPE_CHECKING:
    from app.models.department import Department


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False
    )

    department: Mapped["Department"] = relationship(
        "Department",
        back_populates="users"
    )
```

### `app/models/task.py`

```python
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.user import User


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="todo"
    )

    priority: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="medium"
    )

    due_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    department: Mapped["Department"] = relationship(
        "Department",
        foreign_keys=[department_id]
    )

    created_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by]
    )

    assigned_to_user: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[assigned_to]
    )
```

## Schemas

### `app/schemas/department.py`

```python
from pydantic import BaseModel, ConfigDict


class DepartmentCreate(BaseModel):
    name: str


class DepartmentUpdate(BaseModel):
    name: str | None = None


class DepartmentResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)
```

### `app/schemas/task.py`

```python
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: str = "medium"
    due_date: datetime | None = None
    department_id: int
    created_by: int
    assigned_to: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
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
```

### `app/schemas/user.py`

```python
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
```

## Routers

### `app/routers/__init__.py`

```python
# Empty file
```

### `app/routers/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from app.schemas.user import UserResponse
from app.database import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    return user


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user
```

### `app/routers/departments.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.department import Department
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse
)


router = APIRouter(
    prefix="/api/departments",
    tags=["Departments"]
)


# CREATE
@router.post("/", response_model=DepartmentResponse)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db)
):
    new_department = Department(
        name=department.name
    )

    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return new_department


# READ ALL
@router.get("/", response_model=list[DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db)
):
    departments = db.query(Department).all()

    return departments


# READ ONE
@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db)
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    return department


# UPDATE
@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db)
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    if department_data.name is not None:
        department.name = department_data.name

    db.commit()
    db.refresh(department)

    return department


# DELETE
@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db)
):
    department = db.query(Department).filter(
        Department.id == department_id
    ).first()

    if department is None:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    db.delete(department)
    db.commit()

    return {
        "message": "Department deleted successfully"
    }
```

### `app/routers/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException
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
    tasks = db.query(Task).all()

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
            status_code=404,
            detail="Task not found"
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
            status_code=404,
            detail="Task not found"
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
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }
```

### `app/routers/users.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse
)


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


# CREATE USER
@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user is not None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        department_id=user.department_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# GET ALL USERS
@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    return users


# GET ONE USER
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# UPDATE USER
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user_data.name is not None:
        user.name = user_data.name

    if user_data.email is not None:
        user.email = user_data.email

    db.commit()
    db.refresh(user)

    return user


# DELETE USER
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }
```

## Tests and Utility Scripts

### `test_db.py`

```python
from sqlalchemy import text

from app.database import engine


with engine.connect() as connection:
    result = connection.execute(text("SELECT 1"))
    print(result.scalar())
```

### `test_models.py`

```python
from app.database import Base
from app.models import Department, User, Task


print("Tables discovered:")

for table in Base.metadata.tables.values():
    print(f"- {table.name}")
```

### `test_crud.py`

```python
from app.database import SessionLocal
from app.models import Department, User, Task


db = SessionLocal()

try:
    # 1. Create a department
    department = Department(
        name="Development"
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    print("Department created:", department.id, department.name)

    # 2. Create a user
    user = User(
        name="Pujan",
        email="pujan@example.com",
        password_hash="temporary_hash",
        department_id=department.id
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    print("User created:", user.id, user.name)

    # 3. Create a task
    task = Task(
        title="Build WorkFlow backend",
        description="Complete the database foundation",
        status="todo",
        priority="high",
        department_id=department.id,
        created_by=user.id,
        assigned_to=user.id
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    print("Task created:", task.id, task.title)

finally:
    db.close()
```

### `test_password.py`

```python
from app.core.security import hash_password, verify_password


password = "hello123"

hash1 = hash_password(password)
hash2 = hash_password(password)

print("Hash 1:", hash1)
print("Hash 2:", hash2)

print("Hashes equal:", hash1 == hash2)

print(
    "Hash 1 verifies:",
    verify_password(password, hash1)
)

print(
    "Hash 2 verifies:",
    verify_password(password, hash2)
)
```

## Alembic

The backend has one project-owned Markdown handoff document, `BACKEND_COMPLETE_HANDOFF.md`. Alembic also has a README file without a `.md` extension; its current contents are included below.

### `alembic/README`

```text
Generic single-database configuration.
```

### `alembic/script.py.mako`

```python
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, Sequence[str], None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    """Upgrade schema."""
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    """Downgrade schema."""
    ${downgrades if downgrades else "pass"}
```

### `alembic/env.py`

```python
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.database import Base
from app.models import Department, User, Task
from app.core.config import settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

config.set_main_option(
    "sqlalchemy.url",
    settings.DATABASE_URL
)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata


target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to
    the script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### `alembic/versions/d936964faef9_create_initial_tables.py`

```python
"""create initial tables

Revision ID: d936964faef9
Revises:
Create Date: 2026-08-13 14:11:38.843458

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd936964faef9'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('departments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password_hash', sa.String(length=255), nullable=False),
    sa.Column('department_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('name')
    )
    op.create_table('tasks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('priority', sa.String(length=50), nullable=False),
    sa.Column('due_date', sa.DateTime(), nullable=True),
    sa.Column('department_id', sa.Integer(), nullable=False),
    sa.Column('created_by', sa.Integer(), nullable=False),
    sa.Column('assigned_to', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['department_id'], ['departments.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('tasks')
    op.drop_table('users')
    op.drop_table('departments')
    # ### end Alembic commands ###
```

## Alembic Configuration

### `alembic.ini`

The file uses the standard Alembic-generated configuration. Its active settings are:

```ini
[alembic]
script_location = %(here)s/alembic
prepend_sys_path = .
path_separator = os
sqlalchemy.url = driver://user:pass@localhost/dbname

[post_write_hooks]

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARNING
handlers = console
qualname =

[logger_sqlalchemy]
level = WARNING
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

## Current Backend Behavior

- FastAPI application title: `WorkFlow API`.
- CORS is configured for the `FRONTEND_URL` environment setting.
- Departments, users, and tasks have CRUD routes.
- Passwords are hashed with `pwdlib`.
- Authorization uses OAuth2 bearer tokens through FastAPI's `OAuth2PasswordBearer`.
- `POST /api/auth/login` accepts OAuth2 form data, using the user's email as the `username` field and the password as the `password` field.
- Successful login returns `{ "access_token": "<JWT>", "token_type": "bearer" }`.
- JWTs use the `HS256` algorithm, include the user's ID in the `sub` claim and email in the `email` claim, and expire according to `ACCESS_TOKEN_EXPIRE_MINUTES`.
- `get_current_user()` reads the bearer token, decodes the JWT, looks up the user by the `sub` claim, and rejects invalid, missing, expired, or unknown-user credentials with HTTP 401.
- `GET /api/auth/me` requires a bearer token and returns the authenticated user.
- All task CRUD endpoints require a bearer token through `get_current_user()`.
- Department and user CRUD endpoints currently do not require a bearer token.
- `GET /test-db` checks database connectivity.
- Alembic has an initial migration for departments, users, and tasks.

## Important Notes

- Do not share the real `.env` file with another AI. Replace its values with safe placeholders if configuration is needed.
- The password test uses `hello123` as a local test password only.
- `decode_access_token()` currently returns `{}` on invalid JWT errors. `get_current_user()` then rejects the token because the `sub` claim is missing, but returning `None` would make the failure path clearer.
- Task creation currently does not set `created_by`, even though the database model requires it. The authenticated user's ID should likely be assigned to `created_by`.
- User update accepts `department_id` in `UserUpdate`, but the router currently does not apply it.
- The current authorization implementation verifies that a user is logged in, but it does not yet implement role-based permissions or department-level access rules.
