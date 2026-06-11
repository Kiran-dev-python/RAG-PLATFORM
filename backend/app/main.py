from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _run_alembic_migrations() -> None:
    """Apply any pending Alembic migrations synchronously.

    Must be called in a thread pool so it doesn't conflict with the
    already-running asyncio event loop inside uvicorn.
    Alembic is smart: if no new migrations exist it's a no-op.
    """
    try:
        from alembic.config import Config
        from alembic import command
        from pathlib import Path

        # Resolve alembic.ini relative to this file (backend/app/main.py → backend/alembic.ini)
        alembic_ini = Path(__file__).resolve().parent.parent / "alembic.ini"
        alembic_cfg = Config(str(alembic_ini))
        command.upgrade(alembic_cfg, "head")
        logger.info("✅ Alembic migrations applied (or already up to date)")
    except ModuleNotFoundError as exc:
        logger.warning("⚠️  Alembic not found, skipping migrations: %s", exc)
    except Exception as exc:
        # Log but don't crash — tables may already exist from a prior init_db
        logger.warning("⚠️  Alembic migration warning: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting RAG Platform…")

    # ── Run DB migrations on every startup ─────────────────────────────
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor(max_workers=1) as pool:
        await loop.run_in_executor(pool, _run_alembic_migrations)

    # ── Pre-load embedding model into memory ────────────────────────────
    from app.services.embeddings import get_embedding_model
    get_embedding_model()

    logger.info("✅ RAG Platform ready")
    yield
    logger.info("👋 RAG Platform shutting down")


app = FastAPI(
    title="RAG Platform API",
    description="Multi-tenant RAG document chat platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import auth, workspaces, documents, chat, stats, health  # noqa: E402

app.include_router(health.router,      prefix="/api",           tags=["health"])
app.include_router(auth.router,        prefix="/api/auth",      tags=["auth"])
app.include_router(workspaces.router,  prefix="/api/workspaces",tags=["workspaces"])
app.include_router(documents.router,   prefix="/api/documents", tags=["documents"])
app.include_router(chat.router,        prefix="/api/chat",      tags=["chat"])
app.include_router(stats.router,       prefix="/api/stats",     tags=["stats"])
