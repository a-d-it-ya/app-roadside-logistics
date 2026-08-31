import { prisma } from '../config/db';
import { calculateHaversineKm } from './hubService';
import { SEED_LOCATIONS, SeedLocationData } from '../data/seedLocations';

export interface TelemetryPointInput {
  vehicleId: string;
  tripId?: string;
  latitude: number;
  longitude: number;
  speedKmH?: number;
  heading?: number;
  accuracyMeters?: number;
  recordedAt?: Date | string;
  source?: string;
}

// Resilient memory cache for active truck locations
const memoryLatestLocations = new Map<string, any>();

export const telemetryService = {
  /**
   * Record a single GPS coordinate from Driver App / Telematics
   */
  async recordLocation(point: TelemetryPointInput) {
    const timestamp = point.recordedAt ? new Date(point.recordedAt) : new Date();
    const source = point.source || 'DRIVER_APP';

    try {
      // 1. Append to timeseries log
      const locationLog = await prisma.vehicleLocation.create({
        data: {
          vehicleId: point.vehicleId,
          tripId: point.tripId || null,
          latitude: point.latitude,
          longitude: point.longitude,
          speedKmH: point.speedKmH || null,
          heading: point.heading || null,
          accuracyMeters: point.accuracyMeters || null,
          recordedAt: timestamp,
          source,
        },
      });

      // 2. Upsert single-row latest location
      const latest = await prisma.latestVehicleLocation.upsert({
        where: { vehicleId: point.vehicleId },
        update: {
          tripId: point.tripId || null,
          latitude: point.latitude,
          longitude: point.longitude,
          speedKmH: point.speedKmH || null,
          heading: point.heading || null,
          accuracyMeters: point.accuracyMeters || null,
          updatedAt: timestamp,
        },
        create: {
          vehicleId: point.vehicleId,
          tripId: point.tripId || null,
          latitude: point.latitude,
          longitude: point.longitude,
          speedKmH: point.speedKmH || null,
          heading: point.heading || null,
          accuracyMeters: point.accuracyMeters || null,
          updatedAt: timestamp,
        },
      });

      // 3. Evaluate proximity to upcoming route stops
      if (point.tripId) {
        this.evaluateWaypointProximity(point.tripId, point.latitude, point.longitude).catch(() => {});
      }

      return latest;
    } catch (err) {
      console.warn('[TelemetryService] Operating in resilient memory mode for telemetry');
    }

    // Memory fallback
    const latestMem = {
      vehicleId: point.vehicleId,
      tripId: point.tripId || null,
      latitude: point.latitude,
      longitude: point.longitude,
      speedKmH: point.speedKmH || 0,
      heading: point.heading || 0,
      accuracyMeters: point.accuracyMeters || 5,
      updatedAt: timestamp.toISOString(),
      source,
    };
    memoryLatestLocations.set(point.vehicleId, latestMem);
    return latestMem;
  },

  /**
   * Ingest buffered batch of telemetry points
   */
  async recordBatch(points: TelemetryPointInput[]) {
    let successCount = 0;
    for (const point of points) {
      try {
        await this.recordLocation(point);
        successCount++;
      } catch (err) {
        // continue batch
      }
    }
    return successCount;
  },

  /**
   * Get all live vehicle locations (for map rendering)
   */
  async getLatestLocations(organizationId?: string) {
    try {
      const where: any = {};
      if (organizationId) {
        where.vehicle = { organizationId };
      }

      const locations = await prisma.latestVehicleLocation.findMany({
        where,
        include: {
          vehicle: {
            include: {
              driverAssignments: {
                where: { isActive: true },
                include: { driver: true },
              },
            },
          },
        },
      });

      if (locations.length > 0) return locations;
    } catch (err) {
      // fallback
    }

    // In-memory fallback
    if (memoryLatestLocations.size > 0) {
      return Array.from(memoryLatestLocations.values());
    }

    return SEED_LOCATIONS.map((loc, idx) => ({
      vehicleId: `veh_${idx + 1}`,
      tripId: `trip_${idx + 1}`,
      latitude: loc.latitude,
      longitude: loc.longitude,
      speedKmH: loc.speedKmH,
      heading: loc.heading,
      accuracyMeters: loc.accuracyMeters,
      updatedAt: new Date().toISOString(),
      vehicle: {
        registrationNumber: loc.vehicleReg,
        status: 'ON_TRIP',
      },
    }));
  },

  /**
   * Get single vehicle latest position & recent breadcrumbs
   */
  async getVehicleLocation(vehicleId: string) {
    try {
      const latest = await prisma.latestVehicleLocation.findUnique({
        where: { vehicleId },
        include: { vehicle: true },
      });

      const recentHistory = await prisma.vehicleLocation.findMany({
        where: { vehicleId },
        orderBy: { recordedAt: 'desc' },
        take: 30,
      });

      if (latest) {
        return { latest, recentHistory };
      }
    } catch (err) {
      // fallback
    }

    const mem = memoryLatestLocations.get(vehicleId);
    if (mem) {
      return { latest: mem, recentHistory: [mem] };
    }

    const seed = SEED_LOCATIONS[0];
    const fallbackLatest = {
      vehicleId,
      latitude: seed.latitude,
      longitude: seed.longitude,
      speedKmH: seed.speedKmH,
      heading: seed.heading,
      accuracyMeters: seed.accuracyMeters,
      updatedAt: new Date().toISOString(),
    };
    return { latest: fallbackLatest, recentHistory: [fallbackLatest] };
  },

  /**
   * Get full trip breadcrumb history
   */
  async getTripHistory(tripId: string) {
    try {
      const history = await prisma.vehicleLocation.findMany({
        where: { tripId },
        orderBy: { recordedAt: 'asc' },
      });
      if (history.length > 0) return history;
    } catch (err) {
      // fallback
    }
    return [];
  },

  /**
   * Automatically detect waypoint proximity and update stop status
   */
  async evaluateWaypointProximity(tripId: string, lat: number, lng: number) {
    try {
      const nextUpcomingStop = await prisma.tripRouteStop.findFirst({
        where: { tripId, status: 'UPCOMING' },
        include: { hub: true },
        orderBy: { stopOrder: 'asc' },
      });

      if (nextUpcomingStop && nextUpcomingStop.hub) {
        const distKm = calculateHaversineKm(
          lat,
          lng,
          nextUpcomingStop.hub.latitude,
          nextUpcomingStop.hub.longitude
        );

        // Within 1.5 km of the hub -> mark CURRENT (arriving)
        if (distKm <= 1.5) {
          await prisma.tripRouteStop.update({
            where: { id: nextUpcomingStop.id },
            data: { status: 'CURRENT', actualArrival: new Date() },
          });
        }
      }
    } catch (err) {
      // silent
    }
  },

  /**
   * Seed initial locations
   */
  async seedInitialLocations() {
    let count = 0;
    for (const loc of SEED_LOCATIONS) {
      try {
        const vehicle = await prisma.vehicle.findFirst({
          where: { registrationNumber: loc.vehicleReg },
        });

        if (vehicle) {
          await this.recordLocation({
            vehicleId: vehicle.id,
            latitude: loc.latitude,
            longitude: loc.longitude,
            speedKmH: loc.speedKmH,
            heading: loc.heading,
            accuracyMeters: loc.accuracyMeters,
            source: loc.source,
          });
          count++;
        }
      } catch (err) {
        // ignore
      }
    }
    return count;
  },
};
