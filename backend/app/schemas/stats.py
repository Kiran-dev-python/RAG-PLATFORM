from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RecentQueryOut(BaseModel):
    query: str
    workspace_id: str
    duration_ms: Optional[float]
    created_at: datetime


class StatsOut(BaseModel):
    total_workspaces: int
    total_docs: int
    total_queries: int
    avg_duration_ms: float
    recent_queries: list[RecentQueryOut]
