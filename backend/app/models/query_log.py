import uuid
from sqlalchemy import Column, String, Integer, Float, Text
from app.models.base import Base, TimestampMixin


class QueryLog(Base, TimestampMixin):
    """Audit log of every RAG query made by a user."""
    __tablename__ = "query_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    workspace_id = Column(String, nullable=False, index=True)
    query = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    sources_count = Column(Integer, default=0, nullable=False)
    duration_ms = Column(Float, nullable=True)
