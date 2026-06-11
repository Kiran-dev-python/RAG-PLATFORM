import uuid
from sqlalchemy import Column, String, Text
from app.models.base import Base, TimestampMixin


class Workspace(Base, TimestampMixin):
    """Isolated knowledge-base namespace owned by a single user."""
    __tablename__ = "workspaces"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
