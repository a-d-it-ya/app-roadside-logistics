import { Truck, ShipmentSearchCriteria, MatchBreakdown, ScoredTruckMatch } from '../types/logistics';
import { calculateSimulatedPricing } from './pricingService';

/**
 * Weights configuration for the intelligent matching engine
 */
export const MATCH_WEIGHTS = {
  ROUTE: 0.40,
  CAPACITY: 0.20,
  ETA: 0.25,
  DETOUR: 0.15
};

/**
 * 1. ROUTE COMPATIBILITY SCORING (0 - 100)
 * Evaluates how directly the truck's highway corridor serves the origin and destination.
 */
export function calculateRouteScore(truck: Truck, criteria: ShipmentSearchCriteria): number {
  const origin = (criteria.origin || '').toLowerCase().trim();
  const dest = (criteria.destination || '').toLowerCase().trim();
  const truckOrigin = (truck.origin || '').toLowerCase();
  const truckDest = (truck.dest || truck.destination || '').toLowerCase();
  const stops = (truck.route || truck.routeStops || []).map(s => s.toLowerCase());

  // Direct exact start and finish
  if (truckOrigin.includes(origin) && truckDest.includes(dest)) {
    return 98;
  }

  // Passing origin as a smart corridor stop directly toward terminus destination
  const originIdx = stops.findIndex(s => s.includes(origin));
  const destIdx = stops.findIndex(s => s.includes(dest));

  if (originIdx !== -1 && destIdx !== -1 && originIdx < destIdx) {
    const intermediateStops = destIdx - originIdx - 1;
    if (intermediateStops === 0) return 96; // Direct segment
    if (intermediateStops === 1) return 92; // 1 waypoint
    return 88; // 2+ waypoints
  }

  if (originIdx !== -1 && truckDest.includes(dest)) {
    return 90;
  }

  return 80;
}

/**
 * 2. CAPACITY FITNESS SCORING (0 - 100)
 * Evaluates available capacity relative to shipment weight.
 * Optimal fits score 90-100. Oversized trucks are not overly penalized.
 */
export function calculateCapacityScore(truck: Truck, criteria: ShipmentSearchCriteria): number {
  const weight = criteria.weightKg || 700;
  const avail = truck.availableCapacityKg || truck.availCapKg || 2000;

  if (avail < weight) return 0; // Incompatible

  const fillRatio = weight / avail;

  // Perfect fractional match (utilizes 40% - 85% of available capacity)
  if (fillRatio >= 0.40 && fillRatio <= 0.85) {
    return 96;
  }

  // Efficient fill (utilizes 25% - 40% or 85% - 95%)
  if ((fillRatio >= 0.25 && fillRatio < 0.40) || (fillRatio > 0.85 && fillRatio <= 0.95)) {
    return 90;
  }

  // Light fill (<25% of available space in a large container)
  if (fillRatio < 0.25) {
    return 82; // Still great and usable, just slightly lower efficiency
  }

  // Near maximum capacity (>95%)
  return 85;
}

/**
 * 3. ETA & DELIVERY COMPATIBILITY SCORING (0 - 100)
 * Evaluates delivery speed and corridor timing against user priority.
 */
export function calculateEtaScore(truck: Truck, criteria: ShipmentSearchCriteria): number {
  const nextEta = truck.nextHubEtaMinutes || truck.eta || 45;
  const status = truck.status || 'Corridor Cruising';

  let baseEtaScore = 85;

  if (status === 'At Smart Hub') {
    baseEtaScore = 95; // Ready to load immediately
  } else if (status === 'Corridor Cruising') {
    if (nextEta <= 30) baseEtaScore = 96;
    else if (nextEta <= 60) baseEtaScore = 91;
    else if (nextEta <= 120) baseEtaScore = 86;
    else baseEtaScore = 80;
  } else {
    baseEtaScore = 82;
  }

  // Priority adjustments
  if (criteria.priority === '⚡ Fastest') {
    if (nextEta <= 30 || status === 'At Smart Hub') return Math.min(100, baseEtaScore + 4);
    return Math.max(75, baseEtaScore - 3);
  }

  return baseEtaScore;
}

/**
 * 4. ROUTE DETOUR ESTIMATE & EFFICIENCY SCORING (0 - 100)
 * Evaluates simulated detour distance (km) for pickup and handover.
 */
export function calculateDetourScore(truck: Truck, criteria: ShipmentSearchCriteria): { detourScore: number; detourKm: number } {
  const loc = (truck.location || truck.currentLocationName || '').toLowerCase();
  
  // Directly on highway bypass / express toll node
  let detourKm = 3;
  if (loc.includes('bypass') || loc.includes('expressway') || loc.includes('entry') || loc.includes('orr')) {
    detourKm = 3;
  } else if (loc.includes('hub') || loc.includes('dock') || loc.includes('node')) {
    detourKm = 5;
  } else if (loc.includes('junction') || loc.includes('ring')) {
    detourKm = 9;
  } else {
    detourKm = 14;
  }

  // Detour Score mapping
  let detourScore = 96;
  if (detourKm <= 4) detourScore = 98;
  else if (detourKm <= 8) detourScore = 91;
  else if (detourKm <= 15) detourScore = 84;
  else detourScore = 72;

  return { detourScore, detourKm };
}

/**
 * Generates transparent, human-readable reasons explaining the match score
 */
export function generateMatchExplanations(
  truck: Truck,
  scores: { route: number; capacity: number; eta: number; detour: number },
  criteria: ShipmentSearchCriteria,
  detourKm: number
): string[] {
  const explanations: string[] = [];
  const availTonnes = ((truck.availableCapacityKg || truck.availCapKg || 2000) / 1000).toFixed(1);
  const dest = criteria.destination || truck.dest || 'destination';

  // Route explanation
  if (scores.route >= 92) {
    explanations.push(`Direct highway corridor traveling toward ${dest}`);
  } else {
    explanations.push(`Corridor passes within proximity of ${dest}`);
  }

  // Capacity explanation
  explanations.push(`${availTonnes} tonnes of compatible capacity available`);

  // ETA explanation
  if (scores.eta >= 90) {
    explanations.push(`Fast turnaround: estimated arrival ${truck.estimatedArrival || 'on schedule'}`);
  } else {
    explanations.push(`Estimated arrival ${truck.estimatedArrival || 'within regular window'}`);
  }

  // Detour explanation
  if (detourKm <= 5) {
    explanations.push(`Minimal pickup detour (${detourKm} km along highway access node)`);
  } else {
    explanations.push(`Standard corridor pickup detour (${detourKm} km)`);
  }

  return explanations;
}

/**
 * Scores a single eligible truck against shipment criteria
 */
export function scoreTruck(truck: Truck, criteria: ShipmentSearchCriteria): ScoredTruckMatch {
  const routeCompatibilityScore = calculateRouteScore(truck, criteria);
  const capacityFitnessScore = calculateCapacityScore(truck, criteria);
  const etaScore = calculateEtaScore(truck, criteria);
  const { detourScore, detourKm } = calculateDetourScore(truck, criteria);

  // Compute weighted composite score (0 - 100)
  const compositeRaw = (
    (routeCompatibilityScore * MATCH_WEIGHTS.ROUTE) +
    (capacityFitnessScore * MATCH_WEIGHTS.CAPACITY) +
    (etaScore * MATCH_WEIGHTS.ETA) +
    (detourScore * MATCH_WEIGHTS.DETOUR)
  );

  const compositeScore = Math.min(99, Math.max(60, Math.round(compositeRaw)));

  const explanations = generateMatchExplanations(
    truck,
    { route: routeCompatibilityScore, capacity: capacityFitnessScore, eta: etaScore, detour: detourScore },
    criteria,
    detourKm
  );

  const breakdown: MatchBreakdown = {
    routeCompatibilityScore,
    capacityFitnessScore,
    etaScore,
    detourScore,
    simulatedDetourKm: detourKm,
    explanations
  };

  const pricing = calculateSimulatedPricing(truck, criteria, detourKm);

  return {
    truck,
    compositeScore,
    breakdown,
    pricing,
    rank: 1
  };
}
