import { DedicatedTruck, ShipmentSearchCriteria, DedicatedSearchResult } from '../types/logistics';
import { calculateDedicatedPricing } from './dedicatedPricingService';

/**
 * Searches and scores the dedicated fleet for Full Vehicle bookings
 */
export function searchDedicatedFleet(
  fleet: DedicatedTruck[],
  criteria: ShipmentSearchCriteria
): DedicatedSearchResult {
  const reqWeightKg = criteria.weightKg || 700;
  const cargoType = criteria.cargoType || 'General Cargo';

  // 1. Filter only available trucks with sufficient total capacity and cargo compatibility
  const eligibleTrucks = fleet.filter(truck => {
    // Only available status
    if (truck.availabilityStatus !== 'AVAILABLE') return false;

    // Must be able to carry the entire requested weight
    if (truck.totalCapacityKg < reqWeightKg) return false;

    // Supported cargo fit
    if (cargoType && truck.supportedCargoTypes) {
      if (!truck.supportedCargoTypes.includes(cargoType)) return false;
    }

    return true;
  });

  if (eligibleTrucks.length === 0) {
    return {
      availableTrucks: [],
      bestFitTruck: null,
      criteria,
      distanceKm: 630,
      sharedPriceEstimateRs: 5150
    };
  }

  // 2. Compute pricing for each eligible truck
  const pricedTrucks = eligibleTrucks.map(truck => {
    const pricingDetails = calculateDedicatedPricing(truck, criteria);
    return {
      ...truck,
      pricing: pricingDetails
    };
  });

  // 3. Sort ascending by capacity to find the smallest suitable vehicle ("BEST FIT")
  pricedTrucks.sort((a, b) => a.totalCapacityKg - b.totalCapacityKg);

  // 4. Tag the smallest suitable vehicle as BEST FIT and larger ones accordingly
  const enrichedTrucks: DedicatedTruck[] = pricedTrucks.map((truck, idx) => {
    if (idx === 0) {
      return {
        ...truck,
        isBestFit: true,
        fitTag: '⭐ BEST FIT',
        fitReason: `Optimal capacity (${truck.totalCapacityTonnes}T) for your ${(reqWeightKg / 1000).toFixed(1)}T shipment`
      };
    }

    return {
      ...truck,
      isBestFit: false,
      fitTag: truck.totalCapacityTonnes >= 10 ? '🛡️ HEAVY DUTY' : '⚡ HIGH CAPACITY',
      fitReason: `More capacity than required (${truck.totalCapacityTonnes}T vs ${(reqWeightKg / 1000).toFixed(1)}T cargo)`
    };
  });

  const bestFitTruck = enrichedTrucks.find(t => t.isBestFit) || enrichedTrucks[0];
  const distanceKm = bestFitTruck?.pricing?.distanceKm || 630;
  const sharedPriceEstimateRs = bestFitTruck?.pricing?.sharedEquivalentPriceRs || 5150;

  return {
    availableTrucks: enrichedTrucks,
    bestFitTruck,
    criteria,
    distanceKm,
    sharedPriceEstimateRs
  };
}
