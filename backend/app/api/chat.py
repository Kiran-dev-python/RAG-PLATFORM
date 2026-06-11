from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import time

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rate_limit import check_rate_limit
from app.models import User, Workspace, QueryLog
from app.schemas.chat import QueryRequest, QueryResponse, HistoryItemOut
from app.services.rag import run_rag

router = APIRouter()


@router.post("/{workspace_id}", response_model=QueryResponse)
async def query_workspace(
    workspace_id: str,
    req: QueryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await check_rate_limit(user.id)

    ws = await db.get(Workspace, workspace_id)
    if not ws or ws.user_id != user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    start = time.time()
    result = await run_rag(workspace_id, req.query, n_results=req.n_results)
    duration_ms = round((time.time() - start) * 1000, 2)

    # Persist audit log
    log = QueryLog(
        user_id=user.id,
        workspace_id=workspace_id,
        query=req.query,
        answer=result["answer"],
        sources_count=len(result["sources"]),
        duration_ms=duration_ms,
    )
    db.add(log)
    user.total_queries += 1
    await db.commit()

    return QueryResponse(
        answer=result["answer"],
        sources=result["sources"],
        duration_ms=duration_ms,
    )


@router.get("/{workspace_id}/history", response_model=list[HistoryItemOut])
async def get_history(
    workspace_id: str,
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select

    ws = await db.get(Workspace, workspace_id)
    if not ws or ws.user_id != user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")

    result = await db.execute(
        select(QueryLog)
        .where(QueryLog.workspace_id == workspace_id)
        .order_by(QueryLog.created_at.desc())
        .limit(limit)
    )
    logs = result.scalars().all()
    return [
        HistoryItemOut(
            id=l.id,
            query=l.query,
            answer=l.answer,
            sources_count=l.sources_count,
            duration_ms=l.duration_ms,
            created_at=l.created_at,
        )
        for l in logs
    ]
