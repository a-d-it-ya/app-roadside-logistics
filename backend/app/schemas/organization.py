from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.models.organization import OrganizationType
from app.models.organization_member import MemberRole

class OrganizationBase(BaseModel):
    name: str
    organization_type: OrganizationType = OrganizationType.SHIPPER

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OrganizationMemberResponse(BaseModel):
    id: UUID
    organization_id: UUID
    organization_name: Optional[str] = None
    organization_type: Optional[OrganizationType] = None
    role: MemberRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
