import { DedicatedTruck, ShipmentSearchCriteria } from '../types/logistics';
import { calculateHaversineDistanceKm, getCityCoordinates } from '../utils/geoUtils';

/**
 * Calculates deterministic pricing for a dedicated full-vehicle booking
 */
export function calculateDedicatedPricing(
  truck: DedicatedTruck,
  criteria: ShipmentSearchCriteria
): {
  distanceKm: number;
  baseCostRs: number;
  distanceCostRs: number;
  reservationFeeRs: number;
  totalDedicatedPriceRs: number;
  sharedEquivalentPriceRs: number;
  sharedSavingsRs: number;
} {
  const originCoord = getCityCoordinates(criteria.origin);
  const destCoord = getCityCoordinates(criteria.destination);
  
  // Driving distance estimation with 1.25 road curvature factor
  const straightLineKm = calculateHaversineDistanceKm(originCoord, destCoord);
  const distanceKm = Math.max(120, Math.round(straightLineKm * 1.25));

  const baseCostRs = truck.baseRateRs;
  const distanceCostRs = Math.round(distanceKm * truck.perKmRateRs);
  const reservationFeeRs = truck.reservationFeeRs;
  
  const totalDedicatedPriceRs = baseCostRs + distanceCostRs + reservationFeeRs;

  // Shared equivalent baseline for comparison
  const weightKg = criteria.weightKg || 700;
  const sharedBasePerKg = 4.2;
  const sharedDistanceFactor = distanceKm * 0.0048;
  const sharedEquivalentPriceRs = Math.round(
    1200 + (weightKg * sharedBasePerKg) + (distanceKm * 2.8)
  );

  const sharedSavingsRs = Math.max(0, totalDedicatedPriceRs - sharedEquivalentPriceRs);

  return {
    distanceKm,
    baseCostRs,
    distanceCostRs,
    reservationFeeRs,
    totalDedicatedPriceRs,
    sharedEquivalentPriceRs,
    sharedSavingsRs
  };
}
