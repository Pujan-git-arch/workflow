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