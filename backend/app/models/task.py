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