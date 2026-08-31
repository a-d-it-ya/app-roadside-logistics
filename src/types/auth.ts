export type OrganizationType = 'SHIPPER' | 'FLEET_PARTNER' | 'LOGISTICS_COMPANY' | 'ROADSIDE_INTERNAL';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'FLEET_MANAGER' | 'DISPATCHER' | 'SHIPPER' | 'DRIVER';

export type UserRole = 'BUSINESS' | 'DRIVER';

export type AccountType = 'Individual' | 'Business' | 'Driver';

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
  accountType: AccountType;
  role?: UserRole;
  companyName?: string;
  licenseNumber?: string;
  assignedVehicleReg?: string;
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

export type AuthIntent = 'GENERAL' | 'BOOKING_FLOW' | 'MY_SHIPMENTS' | 'TRACKING' | 'DRIVER_DASHBOARD';

export interface SignUpPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  userRole: UserRole;
  organizationName?: string;
  organizationType?: OrganizationType;
  licenseNumber?: string;
  assignedVehicleReg?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
