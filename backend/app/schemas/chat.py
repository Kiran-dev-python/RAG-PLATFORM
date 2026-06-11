from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class QueryRequest(BaseModel):
    query: str
    n_results: int = 5


class SourceOut(BaseModel):
    filename: str
    score: float
    preview: str


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceOut]
    duration_ms: float


class HistoryItemOut(BaseModel):
    id: str
    query: str
    answer: Optional[str]
    sources_count: int
    duration_ms: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
