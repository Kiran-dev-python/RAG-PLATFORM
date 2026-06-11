import uuid
from sqlalchemy import Column, String, Integer, Text
from app.models.base import Base, TimestampMixin


class Document(Base, TimestampMixin):
    """Uploaded document with embedding status tracking.

    Status lifecycle:  processing → ready | error
    """
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)            # e.g. pdf, docx, txt, md
    file_size = Column(Integer, nullable=True)            # bytes
    chunk_count = Column(Integer, default=0, nullable=False)
    status = Column(String, default="processing", nullable=False)  # processing | ready | error
    error_message = Column(Text, nullable=True)
