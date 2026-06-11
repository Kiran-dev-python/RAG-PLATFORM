"""
Database engine and session factory.

Models are in app/models/ — imported here only to register them
with Base.metadata so init_db() / alembic can see all tables.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
from app.models.base import Base

# Register all models with Base so metadata is complete
from app.models import User, Workspace, Document, QueryLog  # noqa: F401

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def init_db() -> None:
    """Create all tables that don't exist yet (dev/test convenience).
    In production, use `alembic upgrade head` instead.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """FastAPI dependency that yields an async DB session."""
    async with AsyncSessionLocal() as session:
        yield session
