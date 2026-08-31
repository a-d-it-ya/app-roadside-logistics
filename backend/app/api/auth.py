from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.schemas.auth import (
    SignUpRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    MessageResponse
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.core.deps import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_COOKIE_NAME = "rsl_refresh_token"
COOKIE_MAX_AGE = settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

def set_refresh_cookie(response: Response, refresh_token: str):
    """Set secure HttpOnly cookie for refresh token."""
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/"
    )

def clear_refresh_cookie(response: Response):
    """Clear HttpOnly refresh cookie."""
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE
    )

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(
    req: SignUpRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Register a new user account with secure password hashing.
    Optionally creates a SaaS organization and assigns OWNER membership.
    Returns access token and sets HttpOnly refresh cookie.
    """
    user_agent = request.headers.get("User-Agent")
    ip_address = request.client.host if request.client else None

    token_response, refresh_token = AuthService.signup(
        db=db,
        req=req,
        user_agent=user_agent,
        ip_address=ip_address
    )
    set_refresh_cookie(response, refresh_token)
    return token_response

@router.post("/login", response_model=TokenResponse)
def login(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Authenticate user using normalized email and password.
    Returns short-lived access token and sets HttpOnly rotating refresh cookie.
    """
    user_agent = request.headers.get("User-Agent")
    ip_address = request.client.host if request.client else None

    token_response, refresh_token = AuthService.login(
        db=db,
        email=req.email,
        password=req.password,
        user_agent=user_agent,
        ip_address=ip_address
    )
    set_refresh_cookie(response, refresh_token)
    return token_response

@router.post("/refresh", response_model=TokenResponse)
def refresh(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Rotate refresh session and obtain a new short-lived access token.
    Accepts refresh token via HttpOnly cookie or request body.
    """
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token and body and body.refresh_token:
        refresh_token = body.refresh_token

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token. Please sign in again."
        )

    user_agent = request.headers.get("User-Agent")
    ip_address = request.client.host if request.client else None

    token_response, new_refresh_token = AuthService.rotate_refresh_session(
        db=db,
        raw_refresh_token=refresh_token,
        user_agent=user_agent,
        ip_address=ip_address
    )
    set_refresh_cookie(response, new_refresh_token)
    return token_response

@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Revoke active server-managed refresh session and clear cookie.
    """
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token and body and body.refresh_token:
        refresh_token = body.refresh_token

    if refresh_token:
        AuthService.revoke_session(db, refresh_token)

    clear_refresh_cookie(response)
    return MessageResponse(message="Successfully signed out. Active session revoked.")

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get profile, organization memberships, and roles for the authenticated user.
    Requires Bearer access token.
    """
    return AuthService.get_current_user_by_id(db, current_user.id)
