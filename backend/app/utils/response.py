"""
Standard response helpers for consistent API output shapes.
"""
from typing import Any


def success(data: Any = None, message: str = "Success") -> dict:
    """Wrap any payload in a standard success envelope."""
    return {"success": True, "message": message, "data": data}


def deleted_response(resource: str = "Resource") -> dict:
    """Standard 200 response for DELETE endpoints."""
    return {"deleted": True, "message": f"{resource} deleted successfully"}
