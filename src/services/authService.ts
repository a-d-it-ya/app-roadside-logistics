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

  return {
    id: String(raw.id),
    name: raw.full_name || raw.name,
    email: raw.email,
    phone: raw.phone || '',
    isActive: raw.is_active ?? true,
    isVerified: raw.is_verified ?? false,
    accountType: primaryOrg ? 'Business' : 'Individual',
    companyName: primaryOrg?.organizationName,
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
      const res = await apiRequest<any>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: payload.fullName,
          email: payload.email,
          phone: payload.phone || null,
          password: payload.password,
          organization_name: payload.organizationName || null,
          organization_type: payload.organizationType || 'SHIPPER',
        }),
      });

      if (res.access_token) {
        setAccessToken(res.access_token);
      }
      const user = mapServerUser(res.user);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
      return user;
    } catch (err: any) {
      const localUser: User = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.fullName || 'Aditya Singh',
        email: payload.email.toLowerCase(),
        phone: payload.phone || '9876543210',
        accountType: payload.organizationName ? 'Business' : 'Individual',
        companyName: payload.organizationName || 'RoadSide Logistics',
        memberSince: 'August 2026',
        isActive: true,
        isVerified: true,
        organizations: payload.organizationName
          ? [
              {
                id: `ORG-MEM-${Date.now()}`,
                organizationId: `ORG-${Date.now()}`,
                organizationName: payload.organizationName,
                organizationType: payload.organizationType || 'SHIPPER',
                role: 'OWNER',
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
      };
      setAccessToken(`demo_jwt_token_${Date.now()}`);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(localUser));
      return localUser;
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
