import { apiRequest } from './apiClient';

export const telemetryApiService = {
  /**
   * Fetch all latest vehicle positions
   */
  async getLatestLocations(organizationId?: string) {
    try {
      const qs = organizationId ? `?organization_id=${organizationId}` : '';
      const res = await apiRequest<{ success: boolean; locations: any[] }>(`/telemetry/latest${qs}`);
      if (res && res.success && Array.isArray(res.locations)) {
        return res.locations;
      }
    } catch (err) {
      // fallback
    }
    return [];
  },

  /**
   * Fetch specific vehicle location & recent history
   */
  async getVehicleLocation(vehicleId: string) {
    try {
      const res = await apiRequest<{ success: boolean; latest: any; recentHistory: any[] }>(
        `/telemetry/vehicles/${vehicleId}`
      );
      if (res && res.success) {
        return res;
      }
    } catch (err) {
      // fallback
    }
    return null;
  },

  /**
   * Record a live telemetry point (Driver App simulation)
   */
  async recordLocation(payload: {
    vehicleId: string;
    tripId?: string;
    latitude: number;
    longitude: number;
    speedKmH?: number;
    heading?: number;
    accuracyMeters?: number;
  }) {
    try {
      const res = await apiRequest<{ success: boolean; location: any }>('/telemetry/record', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: payload.vehicleId,
          trip_id: payload.tripId,
          latitude: payload.latitude,
          longitude: payload.longitude,
          speed_km_h: payload.speedKmH,
          heading: payload.heading,
          accuracy_meters: payload.accuracyMeters,
        }),
      });
      return res.location;
    } catch (err) {
      return null;
    }
  },
};
