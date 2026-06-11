from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str | None
    total_queries: int
    total_docs: int
    created_at: str | None = None

    class Config:
        from_attributes = True
