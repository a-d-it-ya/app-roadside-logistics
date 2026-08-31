export type OrganizationType = 'SHIPPER' | 'FLEET_PARTNER' | 'LOGISTICS_COMPANY';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'FLEET_MANAGER' | 'DISPATCHER';

export interface UserOrganizationMembership {
  id: string;
  organizationId: string;
  organizationName?: string;
  organizationType?: OrganizationType;
  role: MemberRole;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  accountType: 'Individual' | 'Business';
  companyName?: string;
  memberSince: string;
  organizations?: UserOrganizationMembership[];
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export type AuthModalMode = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

export type AuthIntent = 'GENERAL' | 'BOOKING_FLOW' | 'MY_SHIPMENTS' | 'TRACKING';

export interface SignUpPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  organizationName?: string;
  organizationType?: OrganizationType;
}

export interface LoginPayload {
  email: string;
  password: string;
}
