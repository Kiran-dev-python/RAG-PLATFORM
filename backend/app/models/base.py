"""
Base declarative class and shared mixins for all SQLAlchemy models.
"""
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, DateTime
from datetime import datetime, timezone


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


class TimestampMixin:
    """Adds created_at timestamp column to any model."""
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
