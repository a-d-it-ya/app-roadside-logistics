import { Truck, ShipmentSearchCriteria, FilterResult, CargoType, LogisticsHub } from '../types/logistics';
import { calculateHaversineDistanceKm, getCityCoordinates } from '../utils/geoUtils';

/**
 * Normalizes city names for fuzzy/case-insensitive matching.
 */
export function normalizeCity(city: string): string {
  return (city || '').toLowerCase().trim().replace(/[,.-]/g, ' ');
}

/**
 * Checks if a city name matches a target string token
 */
export function isCityMatch(cityName: string, targetName: string): boolean {
  const c = normalizeCity(cityName);
  const t = normalizeCity(targetName);
  if (!c || !t) return false;
  return c.includes(t) || t.includes(c);
}

/**
 * Core Invariant: Validates Two-Sided Route Sequence & Direction.
 * The truck MUST visit the SHIPMENT ORIGIN first, and subsequently visit the SHIPMENT DESTINATION.
 * Origin stop sequence MUST be < Destination stop sequence on future/remaining journey.
 * Reverses (e.g. searching Chennai -> Hyderabad on a Hyderabad -> Chennai truck) are strictly REJECTED.
 */
export function validateRouteSequenceAndDirection(truck: Truck, criteria: ShipmentSearchCriteria): {
  isValid: boolean;
  reason?: string;
  originIndex?: number;
  destIndex?: number;
} {
  const origin = criteria.origin;
  const dest = criteria.destination;

  if (!truck || !origin || !dest) {
    return { isValid: false, reason: 'Missing search parameters' };
  }

  // 1. Explicit Direct Check: Reject Reverse Terminus Routes
  const tOrigin = truck.origin || truck.overallOrigin || '';
  const tDest = truck.dest || truck.destination || truck.overallDestination || '';

  // If truck starts at destination and ends at origin -> 100% REVERSED!
  if (isCityMatch(tOrigin, dest) && isCityMatch(tDest, origin)) {
    return { isValid: false, reason: `Vehicle is traveling in the opposite direction (${tOrigin} -> ${tDest})` };
  }

  // 2. Full Ordered Route Stops Evaluation
  const routeStops = truck.route || truck.routeStops || [];
  let originIdx = -1;
  let destIdx = -1;

  for (let i = 0; i < routeStops.length; i++) {
    const stop = routeStops[i];
    if (originIdx === -1 && isCityMatch(stop, origin)) {
      originIdx = i;
    }
    if (isCityMatch(stop, dest)) {
      destIdx = i;
    }
  }

  // Check overall origin/dest if not found in stops list
  if (originIdx === -1 && isCityMatch(tOrigin, origin)) {
    originIdx = 0;
  }
  if (destIdx === -1 && isCityMatch(tDest, dest)) {
    destIdx = routeStops.length > 0 ? routeStops.length : 99;
  }

  // Both origin and destination must be served on this corridor
  if (originIdx === -1) {
    // Check if truck has optional service hubs in origin city
    const hasOriginHub = (truck.optionalServiceHubs || []).some(h => isCityMatch(h.city, origin) || isCityMatch(h.serviceRegion, origin));
    if (!hasOriginHub) {
      return { isValid: false, reason: `Vehicle corridor does not serve origin ${origin}` };
    }
    originIdx = 0;
  }

  if (destIdx === -1) {
    return { isValid: false, reason: `Vehicle corridor does not continue to destination ${dest}` };
  }

  // CRITICAL INVARIANT: Origin must strictly precede Destination
  if (originIdx >= destIdx) {
    return {
      isValid: false,
      reason: `Route direction invalid: ${dest} is reached before ${origin} on truck's route`
    };
  }

  // 3. Upstream / Passed Check: Has the truck already passed the origin?
  const currentCity = truck.currentLocation?.city || truck.currentCity || truck.currentLocationName || '';
  const currentLocLower = normalizeCity(truck.currentLocationName || currentCity);

  if (currentLocLower.includes('passed') || currentLocLower.includes('departed')) {
    if (isCityMatch(currentLocLower, origin)) {
      return { isValid: false, reason: `Vehicle has already departed ${origin}` };
    }
  }

  // Check if truck's current stop index is past the origin
  if (typeof truck.currentStopIndex === 'number' && truck.currentStopIndex > originIdx) {
    return { isValid: false, reason: `Vehicle has already passed ${origin}` };
  }

  // Check optionalServiceHubs status
  if (truck.optionalServiceHubs && truck.optionalServiceHubs.length > 0) {
    const originHubs = truck.optionalServiceHubs.filter(h => isCityMatch(h.city, origin) || isCityMatch(h.serviceRegion, origin));
    if (originHubs.length > 0) {
      const allPassed = originHubs.every(h => h.pickupWindowStatus === 'passed');
      if (allPassed) {
        return { isValid: false, reason: `All pickup windows in ${origin} have closed` };
      }
    }
  }

  return { isValid: true, originIndex: originIdx, destIndex: destIdx };
}

/**
 * Gate 1 & 2: Combined Two-Sided Corridor Eligibility
 */
export function filterByRouteAndDirection(truck: Truck, criteria: ShipmentSearchCriteria): boolean {
  const result = validateRouteSequenceAndDirection(truck, criteria);
  return result.isValid;
}

/**
 * Gate 3: Available Capacity Check
 */
export function filterByCapacity(truck: Truck, requiredWeightKg: number): boolean {
  if (!truck) return false;
  const avail = truck.availableCapacityKg ?? truck.availCapKg ?? 0;
  return avail >= requiredWeightKg;
}

/**
 * Gate 4: Cargo Compatibility Check
 */
export function filterByCargoCompatibility(truck: Truck, requiredCargoType?: CargoType): boolean {
  if (!truck || !requiredCargoType) return true;
  const supported = truck.supportedCargoTypes || truck.compatibleCargoTypes || truck.supportedCargo || [];
  if (supported.length === 0) return true;
  return supported.includes(requiredCargoType);
}

/**
 * Gate 5: Time Feasibility & Cargo Readiness
 */
export function filterByTimeFeasibility(
  truck: Truck,
  criteria: ShipmentSearchCriteria,
  availableHubs?: LogisticsHub[]
): boolean {
  const origin = criteria.origin;
  let truckEtaMinutes = truck.nextHubEtaMinutes || truck.eta || 45;

  if (truck.optionalServiceHubs && truck.optionalServiceHubs.length > 0) {
    const targetHub = truck.optionalServiceHubs.find(
      h => isCityMatch(h.city, origin) || isCityMatch(h.serviceRegion, origin)
    );
    if (targetHub && typeof targetHub.estimatedArrivalMinutesFromNow === 'number') {
      truckEtaMinutes = targetHub.estimatedArrivalMinutesFromNow;
    }
  }

  const customerTravelTimeMinutes = 15;
  const hubProcessingMinutes = 15;
  const cargoReadyMinutes = customerTravelTimeMinutes + hubProcessingMinutes; // 30 mins

  const safetyBufferMinutes = 15;
  const loadingCutoffMinutes = Math.max(0, truckEtaMinutes - safetyBufferMinutes);

  return cargoReadyMinutes <= loadingCutoffMinutes;
}

/**
 * Master 5-Gate Truck Eligibility Pipeline
 */
export function executeTruckFilter(
  trucks: Truck[],
  criteria: ShipmentSearchCriteria,
  availableHubs?: LogisticsHub[]
): FilterResult {
  const matchingTrucks: Truck[] = [];
  const nonMatchingTrucks: Truck[] = [];

  trucks.forEach(truck => {
    // 1. Two-Sided Route & Direction Validity (Origin -> Destination in forward sequence)
    const hasValidRoute = filterByRouteAndDirection(truck, criteria);
    // 2. Capacity
    const hasCapacity = filterByCapacity(truck, criteria.weightKg);
    // 3. Cargo Type
    const hasCargoFit = filterByCargoCompatibility(truck, criteria.cargoType);
    // 4. Time Feasibility
    const isTimeFeasible = filterByTimeFeasibility(truck, criteria, availableHubs);

    if (hasValidRoute && hasCapacity && hasCargoFit && isTimeFeasible) {
      matchingTrucks.push(truck);
    } else {
      nonMatchingTrucks.push(truck);
    }
  });

  return {
    matchingTrucks,
    nonMatchingTrucks,
    totalScanned: trucks.length,
    activeCriteria: criteria
  };
}
