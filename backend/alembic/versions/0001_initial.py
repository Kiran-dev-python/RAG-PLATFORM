"""initial schema — users, workspaces, documents, query_logs

Revision ID: 0001
Revises:
Create Date: 2026-06-11
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("total_queries", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_docs", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── workspaces ─────────────────────────────────────────────────────────
    op.create_table(
        "workspaces",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workspaces_user_id", "workspaces", ["user_id"])

    # ── documents ──────────────────────────────────────────────────────────
    op.create_table(
        "documents",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("workspace_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("filename", sa.String(), nullable=False),
        sa.Column("file_type", sa.String(), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("chunk_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(), nullable=False, server_default="processing"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_documents_workspace_id", "documents", ["workspace_id"])
    op.create_index("ix_documents_user_id", "documents", ["user_id"])

    # ── query_logs ─────────────────────────────────────────────────────────
    op.create_table(
        "query_logs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("workspace_id", sa.String(), nullable=False),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=True),
        sa.Column("sources_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("duration_ms", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_query_logs_user_id", "query_logs", ["user_id"])
    op.create_index("ix_query_logs_workspace_id", "query_logs", ["workspace_id"])


def downgrade() -> None:
    op.drop_table("query_logs")
    op.drop_table("documents")
    op.drop_table("workspaces")
    op.drop_table("users")
