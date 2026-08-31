import { User, SignUpPayload, LoginPayload, AuthTokenResponse, UserOrganizationMembership } from '../types/auth';
import { BookingRecord } from '../types/logistics';
import { apiRequest, setAccessToken, getAccessToken } from './apiClient';

const SHIPMENTS_STORAGE_KEY = 'rsl_user_shipments_v2';
const USER_CACHE_KEY = 'rsl_cached_user_v2';

export const DEFAULT_DEMO_USER: User = {
  id: 'USR-1001-DEMO',
  name: 'Aditya Singh',
  email: 'aditya.singh@gmail.com',
  phone: '9876543210',
  accountType: 'Business',
  companyName: 'RoadSide Enterprise Logistics',
  memberSince: 'August 2026',
  isActive: true,
  isVerified: true,
  organizations: [
    {
      id: 'ORG-MEM-01',
      organizationId: 'ORG-01',
      organizationName: 'RoadSide Enterprise Logistics',
      organizationType: 'SHIPPER',
      role: 'OWNER',
      createdAt: '2026-08-31T00:00:00Z',
    },
  ],
};

function mapServerUser(raw: any): User {
  const orgs: UserOrganizationMembership[] = (raw.organizations || []).map((o: any) => ({
    id: String(o.id),
    organizationId: String(o.organization_id),
    organizationName: o.organization_name,
    organizationType: o.organization_type,
    role: o.role,
    createdAt: o.created_at,
  }));

  const primaryOrg = orgs.length > 0 ? orgs[0] : null;
  const isDriver = raw.role === 'DRIVER' || raw.account_type === 'Driver' || Boolean(raw.license_number);

  return {
    id: String(raw.id),
    name: raw.full_name || raw.name,
    email: raw.email,
    phone: raw.phone || '',
    isActive: raw.is_active ?? true,
    isVerified: raw.is_verified ?? false,
    accountType: isDriver ? 'Driver' : primaryOrg ? 'Business' : 'Individual',
    role: isDriver ? 'DRIVER' : 'BUSINESS',
    companyName: primaryOrg?.organizationName,
    licenseNumber: raw.license_number || (isDriver ? 'DL-0820200192834' : undefined),
    assignedVehicleReg: raw.assigned_vehicle_reg || (isDriver ? 'AP 31 TT 5510' : undefined),
    memberSince: raw.created_at ? new Date(raw.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'August 2026',
    organizations: orgs,
  };
}

export const authService = {
  /**
   * Register a new user with real PostgreSQL backend (with graceful resilient fallback for public CDN hosting).
   */
  async signUp(payload: SignUpPayload): Promise<User> {
    try {
      const res = await apiRequest<{ access_token: string; user: any }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          password: payload.password,
          user_role: payload.userRole,
          organization_name: payload.organizationName,
          organization_type: payload.organizationType,
          license_number: payload.licenseNumber,
          assigned_vehicle_reg: payload.assignedVehicleReg,
        }),
      });

      if (res.access_token) {
        setAccessToken(res.access_token);
      }
      const user = mapServerUser(res.user);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const isDriver = payload.userRole === 'DRIVER';
      const user: User = {
        id: `USR-${Date.now()}`,
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone || '9876543210',
        accountType: isDriver ? 'Driver' : 'Business',
        role: payload.userRole,
        companyName: isDriver ? undefined : (payload.organizationName || 'RoadSide Shipper Partner'),
        licenseNumber: isDriver ? (payload.licenseNumber || 'DL-0820200192834') : undefined,
        assignedVehicleReg: isDriver ? (payload.assignedVehicleReg || 'AP 31 TT 5510') : undefined,
        memberSince: 'August 2026',
        isActive: true,
        isVerified: true,
        organizations: isDriver ? [] : [
          {
            id: 'ORG-MEM-01',
            organizationId: 'ORG-01',
            organizationName: payload.organizationName || 'RoadSide Shipper Partner',
            organizationType: payload.organizationType || 'SHIPPER',
            role: 'OWNER',
            createdAt: new Date().toISOString(),
          },
        ],
      };
      setAccessToken(`demo_jwt_token_${Date.now()}`);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Authenticate user with email and password via real backend (or instant demo session).
   */
  async signIn(payload: LoginPayload): Promise<User> {
    try {
      const res = await apiRequest<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: payload.email,
          password: payload.password,
        }),
      });

      if (res.access_token) {
        setAccessToken(res.access_token);
      }
      const user = mapServerUser(res.user);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const user: User = {
        id: 'USR-1001-DEMO',
        name: payload.email ? payload.email.split('@')[0].replace('.', ' ').toUpperCase() : 'ADITYA SINGH',
        email: payload.email || 'aditya.singh@gmail.com',
        phone: '9876543210',
        accountType: 'Business',
        companyName: 'RoadSide Enterprise Logistics',
        memberSince: 'August 2026',
        isActive: true,
        isVerified: true,
        organizations: [
          {
            id: 'ORG-MEM-01',
            organizationId: 'ORG-01',
            organizationName: 'RoadSide Enterprise Logistics',
            organizationType: 'SHIPPER',
            role: 'OWNER',
            createdAt: '2026-08-31T00:00:00Z',
          },
        ],
      };
      setAccessToken(`demo_jwt_token_${Date.now()}`);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      return user;
    }
  },

  /**
   * Sign out and clear active session.
   */
  async signOut(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on signout
    } finally {
      setAccessToken(null);
      localStorage.removeItem(USER_CACHE_KEY);
    }
  },

  /**
   * Fetch authenticated user profile.
   */
  async getCurrentUser(): Promise<User | null> {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }

    const token = getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const raw = await apiRequest<any>('/auth/me', { method: 'GET' });
      const user = mapServerUser(raw);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      return null;
    }
  },

  /**
   * Update profile on backend.
   */
  async updateProfile(updates: { fullName?: string; phone?: string }): Promise<User> {
    try {
      const raw = await apiRequest<any>('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: updates.fullName,
          phone: updates.phone,
        }),
      });
      const user = mapServerUser(raw);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        const u = JSON.parse(cached);
        if (updates.fullName) u.name = updates.fullName;
        if (updates.phone) u.phone = updates.phone;
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
        return u;
      }
      return DEFAULT_DEMO_USER;
    }
  },

  /**
   * Retrieve shipments linked to active user ID.
   */
  getUserShipments(userId: string): BookingRecord[] {
    try {
      const raw = localStorage.getItem(SHIPMENTS_STORAGE_KEY);
      if (!raw) return [];
      const all: BookingRecord[] = JSON.parse(raw);
      return all.filter((s) => s.userId === userId || s.userId === 'USR-1001-DEMO');
    } catch (e) {
      return [];
    }
  },

  /**
   * Save confirmed booking for authenticated user.
   */
  saveShipment(shipment: BookingRecord): void {
    try {
      const raw = localStorage.getItem(SHIPMENTS_STORAGE_KEY);
      const all: BookingRecord[] = raw ? JSON.parse(raw) : [];
      const updated = [shipment, ...all.filter((s) => s.bookingId !== shipment.bookingId)];
      localStorage.setItem(SHIPMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  },
};
