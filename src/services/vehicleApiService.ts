import { Truck } from '../types/logistics';
import { INITIAL_TRUCKS } from '../data/mockTrucks';
import { apiRequest } from './apiClient';

export const vehicleApiService = {
  /**
   * Fetch vehicles for an organization with fallback to local mock trucks
   */
  async getVehicles(organizationId?: string, status?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (organizationId) params.append('organization_id', organizationId);
      if (status) params.append('status', status);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiRequest<{ success: boolean; vehicles: any[] }>(`/vehicles${qs}`);

      if (res && res.success && Array.isArray(res.vehicles) && res.vehicles.length > 0) {
        return res.vehicles;
      }
    } catch (err) {
      // Backend offline: gracefully fallback to local dataset
    }

    if (status) {
      return INITIAL_TRUCKS.filter((t) => t.status === status);
    }
    return INITIAL_TRUCKS;
  },

  /**
   * Get single vehicle details
   */
  async getVehicleById(id: string) {
    try {
      const res = await apiRequest<{ success: boolean; vehicle: any }>(`/vehicles/${id}`);
      if (res && res.success && res.vehicle) {
        return res.vehicle;
      }
    } catch (err) {
      // fallback
    }

    return INITIAL_TRUCKS.find((t) => t.id === id) || INITIAL_TRUCKS[0];
  },

  /**
   * Onboard/Register a new vehicle
   */
  async onboardVehicle(payload: {
    registrationNumber: string;
    vehicleClass: string;
    vehicleType: string;
    totalCapacityKg: number;
    supportedCargoTypes: string[];
    organizationId?: string;
  }) {
    try {
      const res = await apiRequest<{ success: boolean; vehicle: any }>('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          registration_number: payload.registrationNumber,
          vehicle_class: payload.vehicleClass,
          vehicle_type: payload.vehicleType,
          total_capacity_kg: payload.totalCapacityKg,
          supported_cargo_types: payload.supportedCargoTypes,
          organization_id: payload.organizationId,
        }),
      });
      return res.vehicle;
    } catch (err: any) {
      // Return simulated local creation if offline
      return {
        id: `veh_${Date.now()}`,
        registrationNumber: payload.registrationNumber,
        vehicleClass: payload.vehicleClass,
        vehicleType: payload.vehicleType,
        totalCapacityKg: payload.totalCapacityKg,
        supportedCargoTypes: payload.supportedCargoTypes,
        status: 'AVAILABLE',
      };
    }
  },
};
