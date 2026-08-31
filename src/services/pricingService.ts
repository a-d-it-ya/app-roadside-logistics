import { Truck, ShipmentSearchCriteria, PricingEstimate } from '../types/logistics';

/**
 * City-to-city estimated freight corridor distances (km)
 */
const CORRIDOR_DISTANCES_KM: Record<string, Record<string, number>> = {
  'hyderabad': { 'chennai': 630, 'bengaluru': 570, 'mumbai': 710, 'pune': 560, 'nagpur': 500, 'vijayawada': 275, 'bhubaneswar': 1050, 'delhi ncr': 1580 },
  'bengaluru': { 'chennai': 350, 'hyderabad': 570, 'mumbai': 980, 'pune': 840, 'nagpur': 1080, 'vijayawada': 770, 'bhubaneswar': 1420, 'delhi ncr': 2150 },
  'chennai': { 'hyderabad': 630, 'bengaluru': 350, 'mumbai': 1330, 'pune': 1180, 'vijayawada': 450, 'bhubaneswar': 1220, 'nagpur': 1100, 'delhi ncr': 2200 },
  'mumbai': { 'pune': 150, 'bengaluru': 980, 'hyderabad': 710, 'chennai': 1330, 'nagpur': 820, 'delhi ncr': 1420, 'bhubaneswar': 1650, 'vijayawada': 980 },
  'pune': { 'mumbai': 150, 'bengaluru': 840, 'hyderabad': 560, 'chennai': 1180, 'nagpur': 730, 'delhi ncr': 1450, 'bhubaneswar': 1520, 'vijayawada': 850 },
  'nagpur': { 'hyderabad': 500, 'mumbai': 820, 'delhi ncr': 1080, 'bengaluru': 1080, 'chennai': 1100, 'bhubaneswar': 840, 'pune': 730, 'vijayawada': 680 },
  'vijayawada': { 'chennai': 450, 'hyderabad': 275, 'bhubaneswar': 780, 'bengaluru': 770, 'mumbai': 980, 'nagpur': 680, 'pune': 850, 'delhi ncr': 1780 },
  'bhubaneswar': { 'chennai': 1220, 'visakhapatnam': 440, 'hyderabad': 1050, 'vijayawada': 780, 'delhi ncr': 1680, 'mumbai': 1650, 'nagpur': 840, 'bengaluru': 1420 },
  'delhi ncr': { 'nagpur': 1080, 'hyderabad': 1580, 'mumbai': 1420, 'chennai': 2200, 'bengaluru': 2150, 'pune': 1450, 'bhubaneswar': 1680, 'vijayawada': 1780 }
};

export function getEstimatedCorridorDistanceKm(origin: string, destination: string): number {
  const o = (origin || '').toLowerCase().trim();
  const d = (destination || '').toLowerCase().trim();
  if (CORRIDOR_DISTANCES_KM[o] && CORRIDOR_DISTANCES_KM[o][d]) {
    return CORRIDOR_DISTANCES_KM[o][d];
  }
  if (CORRIDOR_DISTANCES_KM[d] && CORRIDOR_DISTANCES_KM[d][o]) {
    return CORRIDOR_DISTANCES_KM[d][o];
  }
  return 550; // Default reasonable corridor distance in km
}

/**
 * Calculates deterministic simulated pricing and savings comparison
 */
export function calculateSimulatedPricing(
  truck: Truck,
  criteria: ShipmentSearchCriteria,
  simulatedDetourKm: number = 4
): PricingEstimate {
  const distanceKm = getEstimatedCorridorDistanceKm(criteria.origin, criteria.destination);
  const weightKg = criteria.weightKg || 700;

  // 1. Dedicated Full-Truckload Estimate (Traditional full vehicle booking)
  // Dedicated truck is priced based on vehicle tier & full corridor dispatch
  let dedicatedBaseRate = 3500;
  if (truck.totalCapacityKg >= 14000) dedicatedBaseRate = 5000;
  else if (truck.totalCapacityKg >= 8000) dedicatedBaseRate = 4200;
  else dedicatedBaseRate = 3200;

  const dedicatedPerKmRate = truck.totalCapacityKg >= 14000 ? 11.5 : 9.0;
  const dedicatedRaw = dedicatedBaseRate + (distanceKm * dedicatedPerKmRate);
  const dedicatedTruckEstimateRs = Math.round(dedicatedRaw / 100) * 100;

  // 2. RoadSide Shared Capacity Estimate (Paying only for space used)
  // Base rate per kg-km + small detour handling fee
  const ratePerKgKm = 0.0075; // ~₹4.7 per tonne-km
  let sharedBase = 900;
  
  // Cargo sensitivity adjustment
  let cargoMultiplier = 1.0;
  if (criteria.cargoType === 'Refrigerated Goods') cargoMultiplier = 1.25;
  if (criteria.cargoType === 'Fragile Goods' || criteria.cargoType === 'Electronics') cargoMultiplier = 1.10;

  // Priority adjustment
  let priorityMultiplier = 1.0;
  if (criteria.priority === '⚡ Fastest') priorityMultiplier = 1.08;
  if (criteria.priority === '💰 Cheapest') priorityMultiplier = 0.92;

  const detourFee = simulatedDetourKm * 28; // minor detour overhead

  const sharedRaw = (sharedBase + (weightKg * distanceKm * ratePerKgKm * cargoMultiplier) + detourFee) * priorityMultiplier;
  
  // Ensure shared capacity is substantially cheaper than a dedicated truck (at least 35%-60% savings)
  let sharedCapacityEstimateRs = Math.round(sharedRaw / 50) * 50;
  if (sharedCapacityEstimateRs > dedicatedTruckEstimateRs * 0.7) {
    sharedCapacityEstimateRs = Math.round((dedicatedTruckEstimateRs * 0.52) / 50) * 50;
  }

  // 3. Compute Savings
  const estimatedSavingsRs = Math.max(800, dedicatedTruckEstimateRs - sharedCapacityEstimateRs);
  const savingsPercentage = Math.round((estimatedSavingsRs / dedicatedTruckEstimateRs) * 100);

  return {
    dedicatedTruckEstimateRs,
    sharedCapacityEstimateRs,
    estimatedSavingsRs,
    savingsPercentage
  };
}
