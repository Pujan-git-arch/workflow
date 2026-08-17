from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db


from app.routers.departments import router as department_router
from app.routers.users import router as user_router
from app.routers.tasks import router as task_router


app = FastAPI()


app.include_router(department_router)
app.include_router(user_router)
app.include_router(task_router)


@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    
    return {
        "database": result.scalar()
    }