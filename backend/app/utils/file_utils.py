"""
File validation helpers used in upload endpoints.
Raises HTTP 400 on invalid extension or size.
"""
from fastapi import HTTPException
from app.core.config import settings


def validate_extension(filename: str) -> str:
    """Return the lowercase extension or raise 400."""
    if "." not in filename:
        raise HTTPException(status_code=400, detail="File has no extension")
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type .{ext} not allowed. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )
    return ext


def validate_file_size(size_bytes: int) -> None:
    """Raise 400 if file exceeds configured max size."""
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB} MB",
        )
