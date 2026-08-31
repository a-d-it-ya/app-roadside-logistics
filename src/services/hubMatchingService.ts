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
 * Finds explicit upcoming planned stops on the truck's locked route
 */
export function getUpcomingPlannedStops(
  truck: Truck,
  criteria: ShipmentSearchCriteria,
  availableHubs: LogisticsHub[]
): { plannedStop: PlannedRouteStop; hub: LogisticsHub }[] {
  const stops: { plannedStop: PlannedRouteStop; hub: LogisticsHub }[] = [];
  const currentIdx = truck.currentStopIndex ?? 0;
  const destCity = (criteria.destination || '').toLowerCase().trim();
  const originCity = (criteria.origin || '').toLowerCase().trim();

  // If the truck has explicit plannedStops, evaluate them sequentially
  if (truck.plannedStops && truck.plannedStops.length > 0) {
    // Find index of destination stop to ensure pickup occurs strictly BEFORE destination
    let destStopIndex = 999;
    truck.plannedStops.forEach(stop => {
      if (stop.city.toLowerCase().includes(destCity) || destCity.includes(stop.city.toLowerCase())) {
        if (stop.stopIndex < destStopIndex) destStopIndex = stop.stopIndex;
      }
    });

    truck.plannedStops.forEach(stop => {
      // 1. Must be upcoming (not passed)
      if (stop.status === 'passed' || stop.stopIndex < currentIdx) {
        return;
      }

      // 2. Must occur strictly BEFORE the destination stop
      if (stop.stopIndex >= destStopIndex) {
        return;
      }

      // 3. Must be associated with or proximate to the shipment origin cluster
      const stopCity = stop.city.toLowerCase();
      const isOriginRelated = stopCity.includes(originCity) || originCity.includes(stopCity);
      
      const hub = availableHubs.find(h => h.id === stop.hubId) ||
                  availableHubs.find(h => h.city.toLowerCase().includes(stopCity));

      if (hub && isOriginRelated) {
        // 4. Directional Forward-Path Check: Hub must be ahead of truck toward destination
        const destCoord = getCityCoordinates(destCity);
        const vLat = destCoord.lat - truck.currentCoords.lat;
        const vLng = destCoord.lng - truck.currentCoords.lng;
        const wLat = hub.coordinates.lat - truck.currentCoords.lat;
        const wLng = hub.coordinates.lng - truck.currentCoords.lng;
        const dot = (vLat * wLat) + (vLng * wLng);
        const distKm = calculateHaversineDistanceKm(truck.currentCoords, hub.coordinates);

        if (distKm <= 1.5 || dot > 0) {
          stops.push({ plannedStop: stop, hub });
        }
      }
    });
  } else {
    // Fallback if truck route is string array: synthesize planned stops
    const routeList = truck.route || [];
    const originIdx = routeList.findIndex(r => r.toLowerCase().includes(originCity));
    const destIdx = routeList.findIndex(r => r.toLowerCase().includes(destCity));

    if (originIdx !== -1 && destIdx !== -1 && originIdx < destIdx) {
      const destCoord = getCityCoordinates(destCity);
      // Filter hubs in the origin city that are in the forward travel direction
      const originHubs = availableHubs.filter(h => {
        if (!h.city.toLowerCase().includes(originCity)) return false;
        const vLat = destCoord.lat - truck.currentCoords.lat;
        const vLng = destCoord.lng - truck.currentCoords.lng;
        const wLat = h.coordinates.lat - truck.currentCoords.lat;
        const wLng = h.coordinates.lng - truck.currentCoords.lng;
        const dot = (vLat * wLat) + (vLng * wLng);
        const distKm = calculateHaversineDistanceKm(truck.currentCoords, h.coordinates);
        return distKm <= 1.5 || dot > 0;
      });

      originHubs.forEach((hub, idx) => {
        const synthStop: PlannedRouteStop = {
          stopIndex: originIdx,
          hubId: hub.id,
          hubName: hub.name,
          city: hub.city,
          coordinates: hub.coordinates,
          estimatedArrivalMinutesFromNow: truck.status === 'At Smart Hub' ? 20 : (truck.nextHubEtaMinutes || 45),
          scheduledTimeFormatted: formatSimulatedTime(truck.status === 'At Smart Hub' ? 20 : (truck.nextHubEtaMinutes || 45)),
          status: 'upcoming'
        };
        stops.push({ plannedStop: synthStop, hub });
      });
    }
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

  // --- 4 Scoring Dimensions ---
  // Factor 1: Customer Convenience (40% weight)
  let customerConvenienceScore = 80;
  if (customerDistanceKm <= 3.5) customerConvenienceScore = 98;
  else if (customerDistanceKm <= 7.0) customerConvenienceScore = 92;
  else if (customerDistanceKm <= 14.0) customerConvenienceScore = 84;
  else if (customerDistanceKm <= 22.0) customerConvenienceScore = 72;
  else customerConvenienceScore = 60;

  // Factor 2: Time Buffer Safety (30% weight)
  let timeBufferScore = 70;
  if (safetyTimeBufferMinutes >= 50) timeBufferScore = 98;
  else if (safetyTimeBufferMinutes >= 30) timeBufferScore = 92;
  else if (safetyTimeBufferMinutes >= 15) timeBufferScore = 84;
  else if (safetyTimeBufferMinutes >= 0) timeBufferScore = 74;
  else timeBufferScore = 20; // Infeasible

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

  // Explanations
  const explanations: string[] = [];
  explanations.push(`Scheduled stop on truck ${truck.id}'s locked route (0 km truck detour)`);
  if (isTimeFeasible) {
    explanations.push(`Your cargo can reach the hub ${safetyTimeBufferFormatted} before cutoff`);
  } else {
    explanations.push(`Warning: Cargo may miss the ${loadingCutoffFormatted} loading cutoff`);
  }
  explanations.push(`Truck continues directly along the ${criteria.destination} freight corridor`);

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
 * Recommends optimal Route-Locked Smart Pickup Hubs for a specific truck
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
    return true;
  });

  if (compatiblePairs.length === 0) {
    return {
      truckId: truck.id,
      hasReachablePickupHub: false,
      recommendedHub: null,
      alternativeHubs: []
    };
  }

  // Score all candidate stops
  const scoredStops = compatiblePairs.map(({ plannedStop, hub }) =>
    scoreRouteLockedHub(plannedStop, hub, truck, criteria)
  );

  // Separate time-feasible hubs from late ones
  const feasibleStops = scoredStops.filter(s => s.isTimeFeasible);
  const candidatesToRank = feasibleStops.length > 0 ? feasibleStops : scoredStops;

  candidatesToRank.sort((a, b) => b.hubScore - a.hubScore);

  const ranked = candidatesToRank.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    isRecommended: idx === 0 && item.isTimeFeasible
  }));

  const recommendedHub = ranked.find(r => r.isTimeFeasible) || null;
  const alternativeHubs = ranked.filter(r => r.hub.id !== (recommendedHub ? recommendedHub.hub.id : ''));

  return {
    truckId: truck.id,
    hasReachablePickupHub: !!recommendedHub,
    recommendedHub,
    alternativeHubs: alternativeHubs.slice(0, 3)
  };
}
