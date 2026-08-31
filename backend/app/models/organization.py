import uuid
import enum
from sqlalchemy import Column, String, DateTime, Enum, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class OrganizationType(str, enum.Enum):
    SHIPPER = "SHIPPER"
    FLEET_PARTNER = "FLEET_PARTNER"
    LOGISTICS_COMPANY = "LOGISTICS_COMPANY"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    organization_type = Column(Enum(OrganizationType, name="organization_type_enum"), nullable=False, default=OrganizationType.SHIPPER)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Organization {self.name} ({self.organization_type})>"
