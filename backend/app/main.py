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