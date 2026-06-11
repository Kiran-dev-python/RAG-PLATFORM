"""
Generic pagination FastAPI dependency.

Usage:
    @router.get("/items")
    async def list_items(page: PaginationParams = Depends()):
        ...
        .offset(page.offset).limit(page.limit)
"""
from fastapi import Query
from dataclasses import dataclass


@dataclass
class PaginationParams:
    limit: int = Query(default=20, ge=1, le=100, description="Number of items to return")
    offset: int = Query(default=0, ge=0, description="Number of items to skip")
