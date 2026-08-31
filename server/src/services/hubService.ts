import { prisma } from '../config/db';
import { SEED_HUBS, SeedHubData } from '../data/seedHubs';

export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface HubFilterOptions {
  city?: string;
  hubType?: string;
  cargoType?: string;
  isActive?: boolean;
}

export interface NearbyHubResult {
  hub: any;
  distanceKm: number;
  estimatedDriveMinutes: number;
}

export const hubService = {
  /**
   * List all hubs with optional filters
   */
  async listHubs(filters: HubFilterOptions = {}) {
    try {
      const where: any = {};
      if (filters.city) {
        where.city = { contains: filters.city, mode: 'insensitive' };
      }
      if (filters.hubType) {
        where.hubType = filters.hubType;
      }
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      const dbHubs = await prisma.hub.findMany({
        where,
        orderBy: { city: 'asc' },
      });

      if (dbHubs.length > 0) {
        if (filters.cargoType) {
          return dbHubs.filter((h) =>
            h.supportedCargoTypes.includes(filters.cargoType!)
          );
        }
        return dbHubs;
      }
    } catch (err) {
      console.warn('[HubService] Operating in resilient memory mode for hubs');
    }

    // Fallback to in-memory seed dataset
    let results = [...SEED_HUBS];
    if (filters.city) {
      const c = filters.city.toLowerCase().trim();
      results = results.filter((h) => h.city.toLowerCase().includes(c));
    }
    if (filters.hubType) {
      results = results.filter((h) => h.hubType === filters.hubType);
    }
    if (filters.cargoType) {
      results = results.filter((h) =>
        h.supportedCargoTypes.includes(filters.cargoType!)
      );
    }
    return results.map((h, idx) => ({
      id: h.code,
      ...h,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },

  /**
   * Get single hub by ID or Code
   */
  async getHubById(idOrCode: string) {
    try {
      const hub = await prisma.hub.findFirst({
        where: {
          OR: [{ id: idOrCode }, { code: idOrCode }],
        },
      });
      if (hub) return hub;
    } catch (err) {
      // fallback
    }

    const seed = SEED_HUBS.find(
      (h) => h.code === idOrCode || h.name.toLowerCase().includes(idOrCode.toLowerCase())
    );
    if (!seed) return null;

    return {
      id: seed.code,
      ...seed,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Find nearby hubs within radius from a given point (lat, lng)
   */
  async findNearbyHubs(
    lat: number,
    lng: number,
    radiusKm = 35,
    cargoType?: string
  ): Promise<NearbyHubResult[]> {
    const allHubs = await this.listHubs({ cargoType });
    const nearby: NearbyHubResult[] = [];

    for (const hub of allHubs) {
      const dist = calculateHaversineKm(lat, lng, hub.latitude, hub.longitude);
      if (dist <= radiusKm) {
        // Assume 32 km/h average commercial city transport speed + 5 min buffer
        const driveMins = Math.max(10, Math.round((dist / 32) * 60) + 5);
        nearby.push({
          hub,
          distanceKm: dist,
          estimatedDriveMinutes: driveMins,
        });
      }
    }

    nearby.sort((a, b) => a.distanceKm - b.distanceKm);
    return nearby;
  },

  /**
   * Create a new hub
   */
  async createHub(data: SeedHubData) {
    try {
      const created = await prisma.hub.create({
        data: {
          code: data.code,
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country || 'India',
          latitude: data.latitude,
          longitude: data.longitude,
          hubType: data.hubType as any,
          supportedCargoTypes: data.supportedCargoTypes,
          isActive: true,
        },
      });
      return created;
    } catch (err) {
      return {
        id: data.code,
        ...data,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Seed all initial national hubs to DB
   */
  async seedInitialHubs() {
    let inserted = 0;
    for (const seed of SEED_HUBS) {
      try {
        await prisma.hub.upsert({
          where: { code: seed.code },
          update: {
            name: seed.name,
            address: seed.address,
            city: seed.city,
            state: seed.state,
            latitude: seed.latitude,
            longitude: seed.longitude,
            hubType: seed.hubType as any,
            supportedCargoTypes: seed.supportedCargoTypes,
          },
          create: {
            code: seed.code,
            name: seed.name,
            address: seed.address,
            city: seed.city,
            state: seed.state,
            country: seed.country || 'India',
            latitude: seed.latitude,
            longitude: seed.longitude,
            hubType: seed.hubType as any,
            supportedCargoTypes: seed.supportedCargoTypes,
            isActive: true,
          },
        });
        inserted++;
      } catch (err) {
        // ignore if database is not active yet
      }
    }
    return inserted;
  },
};
