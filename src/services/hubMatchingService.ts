import {
  LogisticsHub,
  Truck,
  ShipmentSearchCriteria,
  ScoredHubMatch,
  HubRecommendationResult,
  PlannedRouteStop
} from '../types/logistics';
import {
  calculateHaversineDistanceKm,
  getCityCoordinates
} from '../utils/geoUtils';
import { isCityMatch, normalizeCity } from './truckFilterService';

export const ROUTE_LOCKED_HUB_WEIGHTS = {
  CUSTOMER_CONVENIENCE: 0.40,
  TIME_BUFFER: 0.30,
  HUB_CAPABILITY: 0.20,
  OPERATIONAL_EFFICIENCY: 0.10
};

export const SAFETY_BUFFER_MINUTES = 15;
export const HUB_PROCESSING_MINUTES = 15;

/**
 * Formats minutes from now into a readable 12-hour clock string (simulated)
 */
export function formatSimulatedTime(minutesFromNow: number): string {
  const baseTime = new Date();
  baseTime.setMinutes(baseTime.getMinutes() + minutesFromNow);
  return baseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats time buffer into friendly text
 */
export function formatTimeBuffer(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `+${hrs} hr ${mins} min` : `+${hrs} hr`;
  }
  return `+${minutes} min`;
}

/**
 * Finds explicit upcoming planned pickup stops for the truck.
 * ABSOLUTE INVARIANT: The pickup hub MUST strictly belong to the shipment ORIGIN city/region.
 * Destination hubs (or hubs beyond destination) are NEVER allowed as pickup points.
 */
export function getUpcomingPlannedStops(
  truck: Truck,
  criteria: ShipmentSearchCriteria,
  availableHubs: LogisticsHub[]
): { plannedStop: PlannedRouteStop; hub: LogisticsHub }[] {
  const stops: { plannedStop: PlannedRouteStop; hub: LogisticsHub }[] = [];
  const originCity = criteria.origin;
  const destCity = criteria.destination;

  // 1. Check explicit optionalServiceHubs on truck for ORIGIN-matching hubs
  if (truck.optionalServiceHubs && truck.optionalServiceHubs.length > 0) {
    truck.optionalServiceHubs.forEach(opt => {
      if (opt.pickupWindowStatus === 'passed') return;
      if (!isCityMatch(opt.city, originCity) && !isCityMatch(opt.serviceRegion, originCity)) {
        return; // Reject: not in shipment origin region!
      }

      const hub = availableHubs.find(h => h.id === opt.hubId) ||
                  availableHubs.find(h => isCityMatch(h.city, originCity));

      if (hub && isCityMatch(hub.city, originCity)) {
        const eta = opt.estimatedArrivalMinutesFromNow || truck.nextHubEtaMinutes || 45;
        const synthStop: PlannedRouteStop = {
          stopIndex: 0,
          hubId: hub.id,
          hubName: hub.name,
          city: hub.city,
          coordinates: hub.coordinates,
          estimatedArrivalMinutesFromNow: eta,
          scheduledTimeFormatted: formatSimulatedTime(eta),
          status: 'upcoming'
        };
        stops.push({ plannedStop: synthStop, hub });
      }
    });
  }

  // 2. Check plannedStops on truck
  if (truck.plannedStops && truck.plannedStops.length > 0) {
    truck.plannedStops.forEach(stop => {
      if (stop.status === 'passed') return;
      if (!isCityMatch(stop.city, originCity)) return; // Strict origin check!

      const hub = availableHubs.find(h => h.id === stop.hubId) ||
                  availableHubs.find(h => isCityMatch(h.city, originCity));

      if (hub && isCityMatch(hub.city, originCity)) {
        stops.push({ plannedStop: stop, hub });
      }
    });
  }

  // 3. If truck route passes through origin, find available hubs in the origin city
  if (stops.length === 0) {
    const originHubs = availableHubs.filter(h => isCityMatch(h.city, originCity));
    originHubs.forEach(hub => {
      const eta = truck.status === 'At Smart Hub' ? 20 : (truck.nextHubEtaMinutes || 45);
      const synthStop: PlannedRouteStop = {
        stopIndex: 0,
        hubId: hub.id,
        hubName: hub.name,
        city: hub.city,
        coordinates: hub.coordinates,
        estimatedArrivalMinutesFromNow: eta,
        scheduledTimeFormatted: formatSimulatedTime(eta),
        status: 'upcoming'
      };
      stops.push({ plannedStop: synthStop, hub });
    });
  }

  return stops;
}

/**
 * Scores an explicit planned stop on a locked truck route
 */
export function scoreRouteLockedHub(
  plannedStop: PlannedRouteStop,
  hub: LogisticsHub,
  truck: Truck,
  criteria: ShipmentSearchCriteria
): ScoredHubMatch {
  const originCoord = getCityCoordinates(criteria.origin);

  // 1. Customer Distance & Travel Time
  const customerDistanceKm = calculateHaversineDistanceKm(originCoord, hub.coordinates);
  const customerTravelTimeMinutes = Math.max(10, Math.round((customerDistanceKm / 32) * 60) + 5);
  
  // 2. Cargo Arrival Time at Hub
  const cargoArrivalTimeMinutes = customerTravelTimeMinutes + HUB_PROCESSING_MINUTES;
  const cargoArrivalTimeFormatted = formatSimulatedTime(cargoArrivalTimeMinutes);

  // 3. Truck ETA & Loading Cutoff (Zero Detour Model)
  const truckEtaMinutes = Math.max(15, plannedStop.estimatedArrivalMinutesFromNow || truck.nextHubEtaMinutes || 45);
  const truckEtaFormatted = formatSimulatedTime(truckEtaMinutes);
  
  const loadingCutoffMinutes = Math.max(0, truckEtaMinutes - SAFETY_BUFFER_MINUTES);
  const loadingCutoffFormatted = formatSimulatedTime(loadingCutoffMinutes);

  // 4. Time Feasibility & Safety Buffer
  const safetyTimeBufferMinutes = loadingCutoffMinutes - cargoArrivalTimeMinutes;
  const isTimeFeasible = safetyTimeBufferMinutes >= 0;
  const safetyTimeBufferFormatted = isTimeFeasible ? formatTimeBuffer(safetyTimeBufferMinutes) : `Late by ${Math.abs(safetyTimeBufferMinutes)} min`;

  // Factor 1: Customer Convenience (40% weight)
  let customerConvenienceScore = 80;
  if (customerDistanceKm <= 4.0) customerConvenienceScore = 98;
  else if (customerDistanceKm <= 10.0) customerConvenienceScore = 92;
  else if (customerDistanceKm <= 18.0) customerConvenienceScore = 84;
  else customerConvenienceScore = 70;

  // Factor 2: Time Buffer Safety (30% weight)
  let timeBufferScore = 70;
  if (safetyTimeBufferMinutes >= 45) timeBufferScore = 98;
  else if (safetyTimeBufferMinutes >= 25) timeBufferScore = 92;
  else if (safetyTimeBufferMinutes >= 10) timeBufferScore = 84;
  else if (safetyTimeBufferMinutes >= 0) timeBufferScore = 74;
  else timeBufferScore = 20;

  // Factor 3: Hub Capability / Handling (20% weight)
  let hubCapabilityScore = 85;
  const activeCount = hub.activeVehiclesCount || 20;
  if (activeCount >= 25) hubCapabilityScore = 96;
  else if (activeCount >= 15) hubCapabilityScore = 90;
  else hubCapabilityScore = 80;

  // Factor 4: Operational Efficiency (10% weight)
  let operationalEfficiencyScore = 90;
  if (hub.capacityStatus === 'Available') operationalEfficiencyScore = 96;
  else if (hub.capacityStatus === 'Limited') operationalEfficiencyScore = 80;

  // Composite Weighted Score
  const compositeRaw =
    customerConvenienceScore * ROUTE_LOCKED_HUB_WEIGHTS.CUSTOMER_CONVENIENCE +
    timeBufferScore * ROUTE_LOCKED_HUB_WEIGHTS.TIME_BUFFER +
    hubCapabilityScore * ROUTE_LOCKED_HUB_WEIGHTS.HUB_CAPABILITY +
    operationalEfficiencyScore * ROUTE_LOCKED_HUB_WEIGHTS.OPERATIONAL_EFFICIENCY;

  const hubScore = isTimeFeasible ? Math.min(99, Math.max(60, Math.round(compositeRaw))) : 40;

  const explanations: string[] = [];
  explanations.push(`Scheduled pickup point in ${criteria.origin} along vehicle corridor`);
  if (isTimeFeasible) {
    explanations.push(`Your cargo can reach the hub ${safetyTimeBufferFormatted} before cutoff`);
  } else {
    explanations.push(`Warning: Cargo may arrive after the ${loadingCutoffFormatted} cutoff`);
  }
  explanations.push(`Direct onward highway transit to ${criteria.destination}`);

  return {
    hub,
    hubScore,
    stopIndex: plannedStop.stopIndex,
    stopSequenceNumber: plannedStop.stopIndex + 1,
    customerDistanceKm,
    customerTravelTimeMinutes,
    hubProcessingMinutes: HUB_PROCESSING_MINUTES,
    cargoArrivalTimeMinutes,
    cargoArrivalTimeFormatted,
    truckEtaMinutes,
    truckEtaFormatted,
    loadingCutoffMinutes,
    loadingCutoffFormatted,
    safetyTimeBufferMinutes,
    safetyTimeBufferFormatted,
    isTimeFeasible,
    scores: {
      customerConvenience: customerConvenienceScore,
      timeBuffer: timeBufferScore,
      hubCapability: hubCapabilityScore,
      operationalEfficiency: operationalEfficiencyScore
    },
    explanations,
    rank: 1,
    isRecommended: false
  };
}

/**
 * Recommends optimal Route-Locked Smart Pickup Hubs for a specific truck.
 * Strictly guarantees that recommendedHub is at the ORIGIN city and deliveryHub is at DESTINATION.
 */
export function recommendRouteLockedHubsForTruck(
  truck: Truck,
  criteria: ShipmentSearchCriteria,
  availableHubs: LogisticsHub[]
): HubRecommendationResult {
  const upcomingPairs = getUpcomingPlannedStops(truck, criteria, availableHubs);

  // Filter cargo compatibility & operational status
  const compatiblePairs = upcomingPairs.filter(({ hub }) => {
    if (hub.status && hub.status !== 'Operational') return false;
    if (criteria.cargoType && hub.supportedCargoTypes) {
      if (!hub.supportedCargoTypes.includes(criteria.cargoType)) return false;
    }
    // Strict safeguard: Hub MUST match shipment origin!
    return isCityMatch(hub.city, criteria.origin);
  });

  // Find corresponding delivery hub at destination
  const deliveryHub = availableHubs.find(h => isCityMatch(h.city, criteria.destination)) || null;

  if (compatiblePairs.length === 0) {
    return {
      truckId: truck.id,
      hasReachablePickupHub: false,
      recommendedHub: null,
      deliveryHub,
      alternativeHubs: []
    };
  }

  // Score candidate stops
  const scoredStops = compatiblePairs.map(({ plannedStop, hub }) =>
    scoreRouteLockedHub(plannedStop, hub, truck, criteria)
  );

  const feasibleStops = scoredStops.filter(s => s.isTimeFeasible);
  const candidatesToRank = feasibleStops.length > 0 ? feasibleStops : scoredStops;

  candidatesToRank.sort((a, b) => b.hubScore - a.hubScore);

  const ranked = candidatesToRank.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    isRecommended: idx === 0 && item.isTimeFeasible
  }));

  const recommendedHub = ranked.find(r => r.isTimeFeasible) || ranked[0] || null;
  const alternativeHubs = ranked.filter(r => r.hub.id !== (recommendedHub ? recommendedHub.hub.id : ''));

  return {
    truckId: truck.id,
    hasReachablePickupHub: !!recommendedHub,
    recommendedHub,
    deliveryHub,
    alternativeHubs: alternativeHubs.slice(0, 3)
  };
}
