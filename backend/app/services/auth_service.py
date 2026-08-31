from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, status
from uuid import UUID
from app.models.user import User
from app.models.organization import Organization, OrganizationType
from app.models.organization_member import OrganizationMember, MemberRole
from app.models.refresh_session import RefreshSession
from app.schemas.auth import SignUpRequest, TokenResponse
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.organization import OrganizationMemberResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_refresh_token
)
from app.core.config import settings

class AuthService:
    @staticmethod
    def normalize_email(email: str) -> str:
        return email.strip().lower()

    @classmethod
    def get_user_response(cls, user: User) -> UserResponse:
        """Helper to construct UserResponse with organization details."""
        org_responses = []
        for mem in user.memberships:
            org_responses.append(
                OrganizationMemberResponse(
                    id=mem.id,
                    organization_id=mem.organization_id,
                    organization_name=mem.organization.name if mem.organization else None,
                    organization_type=mem.organization.organization_type if mem.organization else None,
                    role=mem.role,
                    created_at=mem.created_at
                )
            )
        return UserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            updated_at=user.updated_at,
            organizations=org_responses
        )

    @classmethod
    def create_user_session(
        cls,
        db: Session,
        user: User,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Tuple[TokenResponse, str]:
        """Create access token and server-managed refresh session."""
        access_token = create_access_token(subject=user.id)
        raw_refresh_token = generate_refresh_token()
        token_hash = hash_refresh_token(raw_refresh_token)

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)

        session = RefreshSession(
            user_id=user.id,
            token_hash=token_hash,
            user_agent=user_agent[:500] if user_agent else None,
            ip_address=ip_address[:50] if ip_address else None,
            expires_at=expires_at
        )
        db.add(session)
        db.commit()

        user_response = cls.get_user_response(user)
        token_response = TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
        return token_response, raw_refresh_token

    @classmethod
    def signup(
        cls,
        db: Session,
        req: SignUpRequest,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Tuple[TokenResponse, str]:
        """Transactional user signup with optional organization."""
        email = cls.normalize_email(req.email)

        # Check existing user
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists."
            )

        # Password policy check
        if len(req.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Password must be at least 8 characters long."
            )

        try:
            # 1. Create User
            hashed_pwd = get_password_hash(req.password)
            user = User(
                full_name=req.full_name.strip(),
                email=email,
                phone=req.phone.strip() if req.phone else None,
                password_hash=hashed_pwd,
                is_active=True,
                is_verified=False
            )
            db.add(user)
            db.flush()  # Flush to obtain user.id

            # 2. Create Organization if provided
            if req.organization_name and req.organization_name.strip():
                org = Organization(
                    name=req.organization_name.strip(),
                    organization_type=req.organization_type or OrganizationType.SHIPPER
                )
                db.add(org)
                db.flush()

                # Membership as OWNER
                member = OrganizationMember(
                    user_id=user.id,
                    organization_id=org.id,
                    role=MemberRole.OWNER
                )
                db.add(member)
                db.flush()

            db.commit()
            db.refresh(user)

            # Re-fetch user with relationships
            user = db.query(User).options(
                joinedload(User.memberships).joinedload(OrganizationMember.organization)
            ).filter(User.id == user.id).first()

            return cls.create_user_session(db, user, user_agent, ip_address)

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred during signup."
            )

    @classmethod
    def login(
        cls,
        db: Session,
        email: str,
        password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Tuple[TokenResponse, str]:
        """Authenticate user with normalized email & bcrypt verify."""
        normalized = cls.normalize_email(email)
        user = db.query(User).options(
            joinedload(User.memberships).joinedload(OrganizationMember.organization)
        ).filter(User.email == normalized).first()

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support."
            )

        return cls.create_user_session(db, user, user_agent, ip_address)

    @classmethod
    def rotate_refresh_session(
        cls,
        db: Session,
        raw_refresh_token: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Tuple[TokenResponse, str]:
        """Rotate an active refresh session and return new token pair."""
        token_hash = hash_refresh_token(raw_refresh_token)
        session = db.query(RefreshSession).filter(
            RefreshSession.token_hash == token_hash
        ).first()

        now = datetime.now(timezone.utc)

        if not session or session.revoked_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked refresh session."
            )

        # Check expiration
        if session.expires_at < now:
            session.revoked_at = now
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh session has expired. Please sign in again."
            )

        # Revoke old session (Rotation principle)
        session.revoked_at = now
        db.commit()

        # Load user
        user = db.query(User).options(
            joinedload(User.memberships).joinedload(OrganizationMember.organization)
        ).filter(User.id == session.user_id).first()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is no longer active."
            )

        # Issue new session
        return cls.create_user_session(db, user, user_agent, ip_address)

    @classmethod
    def revoke_session(cls, db: Session, raw_refresh_token: str) -> None:
        """Revoke a refresh session on logout."""
        token_hash = hash_refresh_token(raw_refresh_token)
        session = db.query(RefreshSession).filter(
            RefreshSession.token_hash == token_hash,
            RefreshSession.revoked_at == None
        ).first()
        if session:
            session.revoked_at = datetime.now(timezone.utc)
            db.commit()

    @classmethod
    def get_current_user_by_id(cls, db: Session, user_id: UUID) -> UserResponse:
        """Retrieve full user profile with memberships."""
        user = db.query(User).options(
            joinedload(User.memberships).joinedload(OrganizationMember.organization)
        ).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found."
            )
        return cls.get_user_response(user)

    @classmethod
    def update_user_profile(cls, db: Session, user: User, update_data: UserUpdate) -> UserResponse:
        """Update user profile name and phone."""
        if update_data.full_name is not None:
            user.full_name = update_data.full_name.strip()
        if update_data.phone is not None:
            user.phone = update_data.phone.strip()

        db.commit()
        db.refresh(user)

        user = db.query(User).options(
            joinedload(User.memberships).joinedload(OrganizationMember.organization)
        ).filter(User.id == user.id).first()

        return cls.get_user_response(user)
