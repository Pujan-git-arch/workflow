from app.database import Base
from app.models import Department, User, Task


print("Tables discovered:")

for table in Base.metadata.tables.values():
    print(f"- {table.name}")