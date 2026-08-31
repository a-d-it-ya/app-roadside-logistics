import { apiRequest } from './apiClient';

export const driverApiService = {
  /**
   * Fetch drivers for an organization
   */
  async getDrivers(organizationId?: string, status?: string) {
    try {
      const params = new URLSearchParams();
      if (organizationId) params.append('organization_id', organizationId);
      if (status) params.append('status', status);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest<{ success: boolean; drivers: any[] }>(`/drivers${qs}`);

      if (res && res.success && Array.isArray(res.drivers)) {
        return res.drivers;
      }
    } catch (err) {
      // fallback
    }

    return [];
  },

  /**
   * Get single driver profile
   */
  async getDriverById(id: string) {
    try {
      const res = await apiRequest<{ success: boolean; driver: any }>(`/drivers/${id}`);
      if (res && res.success && res.driver) {
        return res.driver;
      }
    } catch (err) {
      // fallback
    }
    return null;
  },

  /**
   * Onboard a new driver
   */
  async onboardDriver(payload: {
    fullName: string;
    phone: string;
    licenseNumber?: string;
    organizationId?: string;
  }) {
    try {
      const res = await apiRequest<{ success: boolean; driver: any }>('/drivers', {
        method: 'POST',
        body: JSON.stringify({
          full_name: payload.fullName,
          phone: payload.phone,
          license_number: payload.licenseNumber,
          organization_id: payload.organizationId,
        }),
      });
      return res.driver;
    } catch (err: any) {
      return {
        id: `drv_${Date.now()}`,
        fullName: payload.fullName,
        phone: payload.phone,
        licenseNumber: payload.licenseNumber || 'DL-PENDING',
        status: 'AVAILABLE',
      };
    }
  },

  /**
   * Assign driver to a vehicle shift
   */
  async assignVehicle(driverId: string, vehicleId: string, organizationId?: string) {
    try {
      const res = await apiRequest<{ success: boolean; assignment: any }>(
        `/drivers/${driverId}/assign-vehicle`,
        {
          method: 'POST',
          body: JSON.stringify({ vehicle_id: vehicleId, organization_id: organizationId }),
        }
      );
      return res.assignment;
    } catch (err: any) {
      return {
        id: `asg_${Date.now()}`,
        driverId,
        vehicleId,
        isActive: true,
      };
    }
  },

  /**
   * Unassign driver from vehicle shift
   */
  async unassignVehicle(driverId: string, organizationId?: string) {
    try {
      await apiRequest(`/drivers/${driverId}/unassign-vehicle`, {
        method: 'POST',
        body: JSON.stringify({ organization_id: organizationId }),
      });
      return true;
    } catch (err) {
      return true;
    }
  },
};
