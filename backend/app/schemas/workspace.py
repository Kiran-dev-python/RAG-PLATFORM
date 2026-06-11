from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None


class WorkspaceOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    doc_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
