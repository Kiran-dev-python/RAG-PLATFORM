"""
app.schemas — Pydantic request / response models.
"""
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserOut
from app.schemas.workspace import WorkspaceCreate, WorkspaceOut
from app.schemas.document import DocumentOut, UploadResponse
from app.schemas.chat import QueryRequest, QueryResponse, SourceOut, HistoryItemOut
from app.schemas.stats import StatsOut, RecentQueryOut

__all__ = [
    "RegisterRequest", "LoginRequest", "TokenResponse", "UserOut",
    "WorkspaceCreate", "WorkspaceOut",
    "DocumentOut", "UploadResponse",
    "QueryRequest", "QueryResponse", "SourceOut", "HistoryItemOut",
    "StatsOut", "RecentQueryOut",
]
