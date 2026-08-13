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