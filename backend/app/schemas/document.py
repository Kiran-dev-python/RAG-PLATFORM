from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentOut(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: Optional[int]
    chunk_count: int
    status: str                      # processing | ready | error
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    id: str
    filename: str
    status: str
    created_at: datetime
