import { LogisticsHub } from '../types/logistics';
import { INITIAL_HUBS } from '../data/mockHubs';
import { apiRequest } from './apiClient';

export const hubApiService = {
  /**
   * Fetch all hubs from backend API with fallback to local mock hubs
   */
  async getAllHubs(city?: string): Promise<LogisticsHub[]> {
    try {
      const query = city ? `?city=${encodeURIComponent(city)}` : '';
      const res = await apiRequest<{ success: boolean; hubs: any[] }>(`/hubs${query}`);
      if (res && res.success && Array.isArray(res.hubs) && res.hubs.length > 0) {
        return res.hubs.map((h) => ({
          id: h.code || h.id,
          name: h.name,
          address: h.address,
          city: h.city,
          state: h.state,
          coordinates: { lat: h.latitude, lng: h.longitude },
          lat: h.latitude,
          lng: h.longitude,
          status: 'Operational',
          capacityStatus: h.capacityStatus || 'Available',
          supportedCargoTypes: h.supportedCargoTypes || [],
          supportedCargo: h.supportedCargoTypes || [],
          activeVehiclesCount: 18,
          activeFleet: 18,
          dailyInboundTonnes: 120,
          dailyOutboundTonnes: 160,
          connectedCorridors: [],
        }));
      }
    } catch (err) {
      // Backend offline: gracefully fallback to local dataset
    }

    if (city) {
      const c = city.toLowerCase().trim();
      return INITIAL_HUBS.filter((h) => h.city.toLowerCase().includes(c));
    }
    return INITIAL_HUBS;
  },

  /**
   * Search nearby hubs within radius from lat/lng
   */
  async getNearbyHubs(lat: number, lng: number, radiusKm = 35) {
    try {
      const res = await apiRequest<{ success: boolean; results: any[] }>(
        `/hubs/search/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`
      );
      if (res && res.success && Array.isArray(res.results)) {
        return res.results;
      }
    } catch (err) {
      // fallback
    }
    return [];
  },
};
