from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.organization import OrganizationType
from app.schemas.user import UserResponse

class SignUpRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    organization_name: Optional[str] = Field(None, max_length=255)
    organization_type: Optional[OrganizationType] = Field(default=OrganizationType.SHIPPER)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # in seconds
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
