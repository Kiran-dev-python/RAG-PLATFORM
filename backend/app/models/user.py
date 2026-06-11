import uuid
from sqlalchemy import Column, String, Boolean, Integer
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """Application user with JWT auth and usage counters."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Aggregate usage counters (denormalised for fast dashboard reads)
    total_queries = Column(Integer, default=0, nullable=False)
    total_docs = Column(Integer, default=0, nullable=False)
