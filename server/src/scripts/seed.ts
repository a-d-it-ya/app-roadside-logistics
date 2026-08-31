import { hubService } from '../services/hubService';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import { tripService } from '../services/tripService';
import { telemetryService } from '../services/telemetryService';
import { prisma } from '../config/db';

async function main() {
  console.log('==================================================');
  console.log('🌱 SEEDING ROADSIDE HUBS, FLEETS, TRIPS & TELEMETRY...');
  console.log('==================================================');

  try {
    const hubCount = await hubService.seedInitialHubs();
    console.log(`✅ Successfully seeded/synced ${hubCount} national logistics hubs.`);

    // Seed default partner organization
    let defaultOrg = await prisma.organization.findFirst({
      where: { name: 'Deccan Grand Trunk Logistics' },
    });

    if (!defaultOrg) {
      defaultOrg = await prisma.organization.create({
        data: {
          name: 'Deccan Grand Trunk Logistics',
          organizationType: 'FLEET_PARTNER',
        },
      });
    }

    const vehCount = await vehicleService.seedVehiclesForOrg(defaultOrg.id);
    console.log(`✅ Successfully seeded/synced ${vehCount} commercial fleet vehicles.`);

    const drvCount = await driverService.seedDriversForOrg(defaultOrg.id);
    console.log(`✅ Successfully seeded/synced ${drvCount} commercial truck drivers.`);

    const tripCount = await tripService.seedTripsForOrg(defaultOrg.id);
    console.log(`✅ Successfully seeded/synced ${tripCount} commercial corridor trips.`);

    const locCount = await telemetryService.seedInitialLocations();
    console.log(`✅ Successfully seeded/synced ${locCount} live telemetry positions.`);
  } catch (err: any) {
    console.error('❌ Error seeding data:', err?.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
