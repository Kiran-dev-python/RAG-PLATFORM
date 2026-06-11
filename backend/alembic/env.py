"""
Alembic env.py — async SQLAlchemy (asyncpg) setup.

Run migrations:
    alembic upgrade head        # apply all pending
    alembic downgrade -1        # roll back one step
    alembic revision --autogenerate -m "describe change"
"""
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# ── Pull in app config & models ────────────────────────────────────────────
# Models must be imported so their tables are registered on Base.metadata
from app.core.config import settings
from app.models.base import Base
from app.models import User, Workspace, Document, QueryLog  # noqa: F401 — register tables

# ── Alembic Config object ──────────────────────────────────────────────────
config = context.config

# Override sqlalchemy.url from app settings (avoids duplication in .ini)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# NOTE: fileConfig() is intentionally NOT called here.
# - When invoked from the alembic CLI, alembic sets up logging itself before
#   env.py runs, so fileConfig() is redundant.
# - When invoked programmatically from the app (inside a ThreadPoolExecutor),
#   fileConfig() resets the root logger to WARN (per alembic.ini) and silences
#   all subsequent INFO logs from the application.
# If you need alembic's own log config for CLI use, run:
#   alembic -c alembic.ini upgrade head

# Metadata that autogenerate should compare against
target_metadata = Base.metadata


# ── Offline mode ───────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    """Emit SQL to stdout without a live connection (useful for CI/review)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online mode (async) ────────────────────────────────────────────────────
def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Connect to the live database and apply migrations."""
    connectable = create_async_engine(
        settings.DATABASE_URL,
        poolclass=pool.NullPool,   # NullPool avoids async loop issues during migration
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Run migrations online.

    env.py is always invoked from a plain thread (either the CLI's main thread
    or a ThreadPoolExecutor worker inside uvicorn). In both cases there is NO
    running asyncio event loop in that thread, so asyncio.run() is always safe.

    We use a sync psycopg2 engine to keep things simple and avoid any
    async/event-loop complexity entirely during migrations.
    """
    from sqlalchemy import create_engine

    # Convert asyncpg URL → psycopg2-compatible sync URL
    sync_url = settings.DATABASE_URL.replace(
        "postgresql+asyncpg://", "postgresql://"
    ).replace(
        "postgres+asyncpg://", "postgresql://"
    )

    sync_engine = create_engine(sync_url, poolclass=pool.NullPool)
    with sync_engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
    sync_engine.dispose()


# ── Entry point ────────────────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
