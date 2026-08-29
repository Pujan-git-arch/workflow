from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db, engine, SessionLocal
from app.core.config import settings
from app.database import Base
from app.core.security import hash_password

# Import models to register them with SQLAlchemy
from app.models.department import Department
from app.models.user import User
from app.models.task import Task

from app.routers.departments import router as department_router
from app.routers.users import router as user_router
from app.routers.tasks import router as task_router
from app.routers.auth import router as auth_router

app = FastAPI(title="WorkFlow API")

# Create database tables on startup
Base.metadata.create_all(bind=engine)

# Create default department if it doesn't exist
def create_default_department():
    db = SessionLocal()
    try:
        existing = db.query(Department).filter(Department.id == 1).first()
        if not existing:
            default_dept = Department(id=1, name="General")
            db.add(default_dept)
            db.commit()
            print("Created default department")

        existing_user = db.query(User).filter(User.email == "admin@workflow.local").first()
        if not existing_user:
            admin_user = User(
                name="Admin User",
                email="admin@workflow.local",
                password_hash=hash_password("password123"),
                department_id=1,
            )
            db.add(admin_user)
            db.commit()
            print("Created default admin user")
    except Exception as e:
        print(f"Error creating default auth data: {e}")
    finally:
        db.close()

create_default_department()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
    
@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }