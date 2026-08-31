import { apiRequest } from './apiClient';
import { matchingService as localMatchingService } from './matchingService';

export const matchingApiService = {
  /**
   * Search matching vehicles via backend API with fallback to local client-side matcher
   */
  async findMatchingVehicles(params: {
    origin: string;
    destination: string;
    cargoWeightKg: number;
    cargoType: string;
    bookingMode?: 'SHARED_CAPACITY' | 'FULL_VEHICLE';
  }) {
    try {
      const res = await apiRequest<{ success: boolean; count: number; matches: any[] }>(
        '/matching/find-vehicles',
        {
          method: 'POST',
          body: JSON.stringify({
            origin: params.origin,
            destination: params.destination,
            cargo_weight_kg: params.cargoWeightKg,
            cargo_type: params.cargoType,
            booking_mode: params.bookingMode || 'SHARED_CAPACITY',
          }),
        }
      );

      if (res && res.success && Array.isArray(res.matches) && res.matches.length > 0) {
        return res.matches;
      }
    } catch (err) {
      // Backend offline: gracefully fallback to local client matcher
    }

    // Local client fallback
    return localMatchingService.findMatches({
      fromCity: params.origin,
      toCity: params.destination,
      weightKg: params.cargoWeightKg,
      cargoType: params.cargoType,
    });
  },
};
