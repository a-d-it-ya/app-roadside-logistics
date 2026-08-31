import { Truck, ShipmentSearchCriteria, FilterResult, CargoType, LogisticsHub } from '../types/logistics';
import { calculateHaversineDistanceKm, getCityCoordinates } from '../utils/geoUtils';

/**
 * Normalizes city names for fuzzy/case-insensitive matching.
 */
function normalizeCity(city: string): string {
  return (city || '').toLowerCase().trim();
}

/**
 * Gate 1: Destination Direction Compatibility
 * Checks if the truck's continuing journey moves toward the requested destination.
 */
export function filterByDestinationCompatibility(truck: Truck, targetDestination: string): boolean {
  if (!truck || !targetDestination) return false;
  const target = normalizeCity(targetDestination);

  if (normalizeCity(truck.destination).includes(target)) return true;
  if (truck.overallDestination && normalizeCity(truck.overallDestination).includes(target)) return true;

  const stops = truck.route || truck.routeStops || [];
  return stops.some(stop => normalizeCity(stop).includes(target));
}

/**
 * Gate 2: Optional Service Corridor Support
 * Checks if the truck supports the requested origin as an optional service hub on its corridor.
 */
export function filterByOptionalCorridorSupport(truck: Truck, targetOrigin: string): boolean {
  if (!truck || !targetOrigin) return false;
  const origin = normalizeCity(targetOrigin);

  // Check explicit optionalServiceHubs list
  if (truck.optionalServiceHubs && truck.optionalServiceHubs.length > 0) {
    const hasHub = truck.optionalServiceHubs.some(
      h => normalizeCity(h.city).includes(origin) || normalizeCity(h.serviceRegion).includes(origin)
    );
    if (hasHub) return true;
  }

  // Check truck route or origin
  if (normalizeCity(truck.origin).includes(origin)) return true;
  if (truck.overallOrigin && normalizeCity(truck.overallOrigin).includes(origin)) return true;

  const stops = truck.route || truck.routeStops || [];
  return stops.some(stop => normalizeCity(stop).includes(origin));
}

/**
 * Gate 3: Pickup Eligibility Window (Position & Upstream Route Check)
 * Verifies that the truck is UPSTREAM / APPROACHING the pickup hub and has NOT already left/passed it.
 */
export function filterByPickupEligibilityWindow(truck: Truck, targetOrigin: string): boolean {
  if (!truck || !targetOrigin) return false;
  const origin = normalizeCity(targetOrigin);

  // 1. Check explicit optionalServiceHubs window status
  if (truck.optionalServiceHubs && truck.optionalServiceHubs.length > 0) {
    const matchingHubs = truck.optionalServiceHubs.filter(
      h => normalizeCity(h.city).includes(origin) || normalizeCity(h.serviceRegion).includes(origin)
    );

    if (matchingHubs.length > 0) {
      // If all matching hubs are 'passed', the truck has already left the origin
      const anyActive = matchingHubs.some(h => h.pickupWindowStatus === 'open' || h.pickupWindowStatus === 'approaching');
      if (!anyActive) return false;
    }
  }

  // 2. Check location string or currentCity for "passed" indicators
  const locName = normalizeCity(truck.currentLocationName || truck.currentLocation?.city || '');
  if (locName.includes('passed') || locName.includes('departed')) {
    if (locName.includes(origin)) return false;
  }

  // 3. Check sequence order along route
  const stops = (truck.route || truck.routeStops || []).map(s => normalizeCity(s));
  const originIdx = stops.findIndex(s => s.includes(origin));
  
  if (originIdx !== -1) {
    // If truck is currently at a city that appears AFTER the origin in the route sequence, it already left!
    const currentCity = normalizeCity(truck.currentLocation?.city || truck.currentLocationName || '');
    const currentCityIdx = stops.findIndex(s => s.includes(currentCity));
    if (currentCityIdx > originIdx) {
      return false; // Truck is already past the origin hub!
    }
  }

  return true;
}

/**
 * Gate 4: Available Capacity & Cargo Compatibility
 */
export function filterByCapacity(truck: Truck, requiredWeightKg: number): boolean {
  if (!truck || typeof truck.availableCapacityKg !== 'number') return false;
  return truck.availableCapacityKg >= requiredWeightKg;
}

export function filterByCargoCompatibility(truck: Truck, requiredCargoType: CargoType): boolean {
  if (!truck) return false;
  const supported = truck.supportedCargoTypes || truck.compatibleCargoTypes || [];
  return supported.includes(requiredCargoType);
}

/**
 * Gate 5: Time Feasibility & Cargo Readiness
 * Validates that cargo can be delivered to the hub BEFORE the truck enters the hub (Truck ETA - 15m cutoff).
 */
export function filterByTimeFeasibility(
  truck: Truck,
  criteria: ShipmentSearchCriteria,
  availableHubs?: LogisticsHub[]
): boolean {
  const origin = normalizeCity(criteria.origin);

  // Find estimated arrival at the relevant hub
  let truckEtaMinutes = truck.nextHubEtaMinutes || 45;
  if (truck.optionalServiceHubs && truck.optionalServiceHubs.length > 0) {
    const targetHub = truck.optionalServiceHubs.find(
      h => normalizeCity(h.city).includes(origin) || normalizeCity(h.serviceRegion).includes(origin)
    );
    if (targetHub && typeof targetHub.estimatedArrivalMinutesFromNow === 'number') {
      truckEtaMinutes = targetHub.estimatedArrivalMinutesFromNow;
    }
  }

  // If truck has already departed or ETA is under 25 mins, customer cannot physically deliver cargo in time
  const customerTravelTimeMinutes = 15; // Drive to hub
  const hubProcessingMinutes = 15;      // Bay intake & pallet verification
  const cargoReadyMinutes = customerTravelTimeMinutes + hubProcessingMinutes; // 30 mins required

  const safetyBufferMinutes = 15; // Truck loading cutoff before departure
  const loadingCutoffMinutes = Math.max(0, truckEtaMinutes - safetyBufferMinutes);

  // Cargo must be ready at or before cutoff
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
    // Gate 1: Destination Direction
    const hasDestFit = filterByDestinationCompatibility(truck, criteria.destination);
    // Gate 2: Optional Service Corridor
    const hasCorridorFit = filterByOptionalCorridorSupport(truck, criteria.origin);
    // Gate 3: Pickup Eligibility Window (NOT passed)
    const isWindowOpen = filterByPickupEligibilityWindow(truck, criteria.origin);
    // Gate 4: Capacity & Cargo Fit
    const hasCapacity = filterByCapacity(truck, criteria.weightKg);
    const hasCargoFit = filterByCargoCompatibility(truck, criteria.cargoType);
    // Gate 5: Time Feasibility
    const isTimeFeasible = filterByTimeFeasibility(truck, criteria, availableHubs);

    if (hasDestFit && hasCorridorFit && isWindowOpen && hasCapacity && hasCargoFit && isTimeFeasible) {
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
