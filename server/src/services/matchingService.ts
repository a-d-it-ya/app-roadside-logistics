import { tripService } from './tripService';
import { hubService, calculateHaversineKm } from './hubService';
import { telemetryService } from './telemetryService';
import { vehicleService } from './vehicleService';

export interface MatchingSearchParams {
  origin: string;
  destination: string;
  cargoWeightKg: number;
  cargoType: string;
  bookingMode?: 'SHARED_CAPACITY' | 'FULL_VEHICLE';
}

export interface MatchedVehicleResult {
  vehicle: any;
  trip: any;
  driver: any;
  matchScore: number;
  scoreBreakdown: {
    routeScore: number;
    capacityScore: number;
    timingScore: number;
    reliabilityScore: number;
  };
  recommendedPickupHub: {
    hub: any;
    distanceToUserKm: number;
    estimatedDriveMinutes: number;
    loadingWindow: {
      openTime: string;
      closeTime: string;
      windowDurationMinutes: number;
    };
    statusTag: string;
  };
  estimatedCostRs: number;
  co2SavingsKg: number;
}

/**
 * Directional forward vector dot product check:
 * Returns true if candidate hub H lies in the forward half-plane from truck T towards destination D.
 */
export function isHubAheadOfTruck(
  truckLat: number,
  truckLng: number,
  destLat: number,
  destLng: number,
  hubLat: number,
  hubLng: number
): boolean {
  const dLat = destLat - truckLat;
  const dLng = destLng - truckLng;
  const hLat = hubLat - truckLat;
  const hLng = hubLng - truckLng;

  const dot = dLat * hLat + dLng * hLng;
  return dot >= 0;
}

export const matchingService = {
  /**
   * Main matching search algorithm
   */
  async findMatchingVehicles(params: MatchingSearchParams): Promise<MatchedVehicleResult[]> {
    const originClean = params.origin.toLowerCase().trim();
    const destClean = params.destination.toLowerCase().trim();
    const cargoWeight = params.cargoWeightKg || 500;
    const cargoType = params.cargoType || 'General Cargo';

    // 1. Fetch Candidate Origin Hubs (Grounding origin near FROM)
    const originCandidateHubs = await hubService.listHubs({ city: params.origin });
    const destinationCandidateHubs = await hubService.listHubs({ city: params.destination });

    // 2. Fetch Active and Ready Trips
    const allTrips = await tripService.listTrips(undefined, {});
    const activeTrips = allTrips.filter(
      (t) => t.status === 'IN_PROGRESS' || t.status === 'READY_TO_START' || t.status === 'PLANNED'
    );

    const matches: MatchedVehicleResult[] = [];

    for (const trip of activeTrips) {
      // ----------------------------------------------------
      // GATE 1: CAPACITY CHECK
      // ----------------------------------------------------
      const availableCap = trip.availableCapacityKg ?? 2000;
      if (availableCap < cargoWeight) {
        continue;
      }

      // ----------------------------------------------------
      // GATE 2: CARGO COMPATIBILITY CHECK
      // ----------------------------------------------------
      const vehicle = trip.vehicle || (await vehicleService.getVehicleById(trip.vehicleId));
      const supportedCargo = vehicle?.supportedCargoTypes || ['General Cargo'];
      const isCargoCompatible =
        supportedCargo.includes(cargoType) ||
        supportedCargo.includes('General Cargo') ||
        cargoType === 'General Cargo';

      if (!isCargoCompatible) {
        continue;
      }

      // ----------------------------------------------------
      // GATE 3: CORRIDOR / DESTINATION ALIGNMENT CHECK
      // ----------------------------------------------------
      const tripDest = (trip.destinationHub?.city || trip.destinationHubId || '').toLowerCase();
      const isDestAligned =
        tripDest.includes(destClean) ||
        destClean.includes(tripDest) ||
        (trip.routeStops || []).some((s: any) =>
          (s.hub?.city || s.hubId || '').toLowerCase().includes(destClean)
        );

      if (!isDestAligned) {
        continue;
      }

      // ----------------------------------------------------
      // GATE 4: LIVE TELEMETRY & ROUTE PROGRESS
      // ----------------------------------------------------
      const telemetry = await telemetryService.getVehicleLocation(trip.vehicleId);
      const truckPos = telemetry?.latest || {
        latitude: trip.originHub?.latitude || 17.3850,
        longitude: trip.originHub?.longitude || 78.4867,
      };

      const destHub = trip.destinationHub ||
        destinationCandidateHubs[0] || { latitude: 13.0827, longitude: 80.2707 };

      // ----------------------------------------------------
      // GATE 5: STRICT FORWARD PICKUP HUB SELECTION
      // ----------------------------------------------------
      // Candidate hubs MUST be in the origin region and AHEAD of the truck
      let validCandidateHubs: any[] = [];

      for (const oHub of originCandidateHubs) {
        // Dot product check
        const isAhead = isHubAheadOfTruck(
          truckPos.latitude,
          truckPos.longitude,
          destHub.latitude,
          destHub.longitude,
          oHub.latitude,
          oHub.longitude
        );

        if (isAhead) {
          validCandidateHubs.push(oHub);
        }
      }

      // If no strict origin hubs ahead, check ordered route stops for upcoming origin stops
      if (validCandidateHubs.length === 0 && trip.routeStops) {
        const upcomingStops = trip.routeStops.filter(
          (s: any) => s.status === 'UPCOMING' || s.status === 'CURRENT'
        );
        for (const stop of upcomingStops) {
          if (stop.hub && (stop.hub.city || '').toLowerCase().includes(originClean)) {
            validCandidateHubs.push(stop.hub);
          }
        }
      }

      // Absolute Rule: If no valid forward pickup hub on origin side, reject this vehicle
      if (validCandidateHubs.length === 0) {
        continue;
      }

      // Select optimal forward pickup hub (closest to truck's forward path)
      validCandidateHubs.sort((a, b) => {
        const distA = calculateHaversineKm(truckPos.latitude, truckPos.longitude, a.latitude, a.longitude);
        const distB = calculateHaversineKm(truckPos.latitude, truckPos.longitude, b.latitude, b.longitude);
        return distA - distB;
      });

      const selectedHub = validCandidateHubs[0];
      const distFromTruck = calculateHaversineKm(
        truckPos.latitude,
        truckPos.longitude,
        selectedHub.latitude,
        selectedHub.longitude
      );

      // Estimated drive time from city center to hub
      const driveMins = Math.max(12, Math.round(distFromTruck * 1.6));

      // ----------------------------------------------------
      // SCORING ENGINE (0 - 100)
      // ----------------------------------------------------
      const routeScore = isDestAligned ? 40 : 25;
      const capacityRatio = cargoWeight / (vehicle?.totalCapacityKg || 10000);
      const capacityScore = Math.round(Math.min(25, 15 + capacityRatio * 10));
      const timingScore = Math.max(10, Math.min(20, Math.round(20 - distFromTruck * 0.2)));
      const reliabilityScore = 15;
      const totalScore = routeScore + capacityScore + timingScore + reliabilityScore;

      // Price calculation (Shared Capacity: base rate + weight factor)
      const baseDistanceKm = calculateHaversineKm(
        selectedHub.latitude,
        selectedHub.longitude,
        destHub.latitude,
        destHub.longitude
      );
      const estPrice = Math.round(baseDistanceKm * 4.2 + (cargoWeight / 100) * 85);
      const co2Kg = Math.round((cargoWeight / 1000) * baseDistanceKm * 0.082);

      const now = new Date();
      const windowOpen = new Date(now.getTime() + driveMins * 60 * 1000);
      const windowClose = new Date(windowOpen.getTime() + 180 * 60 * 1000);

      matches.push({
        vehicle: {
          id: vehicle?.id || trip.vehicleId,
          registrationNumber: vehicle?.registrationNumber || 'AP 31 TT 5510',
          vehicleClass: vehicle?.vehicleClass || '28ft Container Truck (10T)',
          vehicleType: vehicle?.vehicleType || 'Container Truck',
          totalCapacityKg: vehicle?.totalCapacityKg || 10000,
          availableCapacityKg: availableCap,
          status: vehicle?.status || 'AVAILABLE',
          currentLocation: truckPos,
        },
        trip: {
          id: trip.id,
          originHubId: trip.originHubId,
          destinationHubId: trip.destinationHubId,
          status: trip.status,
          plannedStartTime: trip.plannedStartTime,
        },
        driver: trip.driver || {
          fullName: 'Commercial Driver',
          phone: '9876543210',
        },
        matchScore: totalScore,
        scoreBreakdown: {
          routeScore,
          capacityScore,
          timingScore,
          reliabilityScore,
        },
        recommendedPickupHub: {
          hub: selectedHub,
          distanceToUserKm: Math.round(distFromTruck * 10) / 10,
          estimatedDriveMinutes: driveMins,
          loadingWindow: {
            openTime: windowOpen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            closeTime: windowClose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            windowDurationMinutes: 180,
          },
          statusTag: 'Optimal Forward Pickup Hub',
        },
        estimatedCostRs: estPrice,
        co2SavingsKg: co2Kg,
      });
    }

    // Sort matches by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches;
  },

  /**
   * Detailed evaluation of a specific vehicle
   */
  async evaluateVehicleSuitability(vehicleId: string, params: MatchingSearchParams) {
    const allMatches = await this.findMatchingVehicles(params);
    return allMatches.find((m) => m.vehicle.id === vehicleId || m.vehicle.registrationNumber === vehicleId) || null;
  },
};
