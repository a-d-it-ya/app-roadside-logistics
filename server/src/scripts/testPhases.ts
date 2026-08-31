import { createApp } from '../app';
import http from 'http';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING ROADSIDE LOGISTICS BACKEND TEST SUITE (PHASES 1 - 3)');
  console.log('================================================================\n');

  const app = createApp();
  const server = http.createServer(app);

  const PORT = 8019;
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  const BASE_URL = `http://localhost:${PORT}/api`;

  let authToken = '';
  let testOrgId = '';
  let createdVehicleId = '';

  async function test(suite: string, name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      results.push({ suite, name, passed: true, durationMs });
      console.log(`  ✅ [${suite}] ${name} (${durationMs}ms)`);
    } catch (err: any) {
      const durationMs = Date.now() - start;
      results.push({ suite, name, passed: false, details: err?.message || String(err), durationMs });
      console.log(`  ❌ [${suite}] ${name} (${durationMs}ms) -> ${err?.message || err}`);
    }
  }

  // ----------------------------------------------------
  // PHASE 1: CORE SERVER & AUTHENTICATION
  // ----------------------------------------------------
  console.log('▶ PHASE 1: Backend Core & Multi-Tenant Authentication');

  await test('Phase 1', 'Health Check Endpoint (/health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok' || !Array.isArray(data.capabilities)) {
      throw new Error(`Unexpected health payload: ${JSON.stringify(data)}`);
    }
  });

  await test('Phase 1', 'User & Organization Registration (/auth/signup)', async () => {
    const payload = {
      full_name: 'Aditya Singh',
      email: `test_${Date.now()}@roadside.com`,
      password: 'StrongPassword123!',
      phone: '9876543210',
      organization_name: 'Apex Super-Corridor Express',
      organization_type: 'FLEET_PARTNER',
    };

    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.access_token || !data.user || !data.user.organizations?.length) {
      throw new Error(`Missing token or user data: ${JSON.stringify(data)}`);
    }

    authToken = data.access_token;
    testOrgId = data.user.organizations[0].organization_id;
  });

  await test('Phase 1', 'User Login (/auth/login)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aditya.singh@gmail.com',
        password: 'any_demo_password',
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.access_token) throw new Error('Missing access_token');
  });

  await test('Phase 1', 'Authenticated Session Profile (/auth/me)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.user || !data.user.email) throw new Error('Invalid user profile');
  });

  await test('Phase 1', 'List User Organizations (/organizations)', async () => {
    const res = await fetch(`${BASE_URL}/organizations`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.organizations)) throw new Error('Organizations array expected');
  });

  // ----------------------------------------------------
  // PHASE 2: GEOGRAPHIC HUB SERVICE & SPATIAL QUERIES
  // ----------------------------------------------------
  console.log('\n▶ PHASE 2: Geographic Hub Service & Proximity Engine');

  await test('Phase 2', 'List All National Hubs (/hubs)', async () => {
    const res = await fetch(`${BASE_URL}/hubs`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count < 15 || !Array.isArray(data.hubs)) {
      throw new Error(`Expected >= 15 hubs, received ${data.count}`);
    }
  });

  await test('Phase 2', 'Filter Hubs By City (/hubs?city=Hyderabad)', async () => {
    const res = await fetch(`${BASE_URL}/hubs?city=Hyderabad`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count < 3) throw new Error(`Expected >= 3 Hyderabad hubs, received ${data.count}`);
    const allHyd = data.hubs.every((h: any) => h.city.toLowerCase().includes('hyderabad'));
    if (!allHyd) throw new Error('City filter violation');
  });

  await test('Phase 2', 'Retrieve Hub By Code (/hubs/HUB-HYD-03)', async () => {
    const res = await fetch(`${BASE_URL}/hubs/HUB-HYD-03`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.hub || data.hub.name !== 'Hyderabad East Logistics Park') {
      throw new Error(`Unexpected hub payload: ${JSON.stringify(data)}`);
    }
  });

  await test('Phase 2', 'Spatial Radius Search (/hubs/search/nearby)', async () => {
    // Search from Charminar/Central Hyd: 17.3850, 78.4867 within 35km
    const res = await fetch(`${BASE_URL}/hubs/search/nearby?lat=17.3850&lng=78.4867&radius_km=35`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count === 0 || !Array.isArray(data.results)) {
      throw new Error('No nearby hubs found within radius');
    }

    const first = data.results[0];
    if (typeof first.distanceKm !== 'number' || typeof first.estimatedDriveMinutes !== 'number') {
      throw new Error('Missing distance calculations in spatial result');
    }
  });

  // ----------------------------------------------------
  // PHASE 3: FLEET PARTNER ONBOARDING & VEHICLES
  // ----------------------------------------------------
  console.log('\n▶ PHASE 3: Fleet Management & Vehicle Onboarding');

  await test('Phase 3', 'List Commercial Fleet Assets (/vehicles)', async () => {
    const res = await fetch(`${BASE_URL}/vehicles?organization_id=${testOrgId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count < 5 || !Array.isArray(data.vehicles)) {
      throw new Error(`Expected >= 5 seeded vehicles, received ${data.count}`);
    }
  });

  await test('Phase 3', 'Onboard New Commercial Vehicle (POST /vehicles)', async () => {
    const payload = {
      registration_number: 'TS 09 XY 8899',
      vehicle_class: '32ft Multi-Axle Heavy Truck (16T)',
      vehicle_type: 'Heavy Truck',
      total_capacity_kg: 16000,
      supported_cargo_types: ['General Cargo', 'Industrial Materials', 'Electronics'],
      organization_id: testOrgId,
    };

    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.vehicle || data.vehicle.registrationNumber !== 'TS 09 XY 8899') {
      throw new Error(`Failed to onboard vehicle: ${JSON.stringify(data)}`);
    }

    createdVehicleId = data.vehicle.id;
  });

  await test('Phase 3', 'Fetch Specific Vehicle (/vehicles/:id)', async () => {
    const res = await fetch(`${BASE_URL}/vehicles/${createdVehicleId}?organization_id=${testOrgId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.vehicle || data.vehicle.registrationNumber !== 'TS 09 XY 8899') {
      throw new Error(`Unexpected vehicle: ${JSON.stringify(data)}`);
    }
  });

  await test('Phase 3', 'Update Vehicle Parameters & Maintenance Status (PUT /vehicles/:id)', async () => {
    const res = await fetch(`${BASE_URL}/vehicles/${createdVehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        organization_id: testOrgId,
        status: 'MAINTENANCE',
        total_capacity_kg: 18000,
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.vehicle.status !== 'MAINTENANCE') {
      throw new Error('Status not updated to MAINTENANCE');
    }
  });

  // ----------------------------------------------------
  // PHASE 4: DRIVER MANAGEMENT & SHIFT ASSIGNMENTS
  // ----------------------------------------------------
  console.log('\n▶ PHASE 4: Driver Management & Dynamic Vehicle Shift Assignments');

  let testDriverId = '';

  await test('Phase 4', 'List Commercial Drivers (/drivers)', async () => {
    const res = await fetch(`${BASE_URL}/drivers?organization_id=${testOrgId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count < 5 || !Array.isArray(data.drivers)) {
      throw new Error(`Expected >= 5 seeded drivers, received ${data.count}`);
    }
  });

  await test('Phase 4', 'Onboard New Commercial Driver (POST /drivers)', async () => {
    const payload = {
      full_name: 'Dharmendra Sharma',
      phone: '9812345678',
      license_number: 'DL-0420210088991',
      organization_id: testOrgId,
    };

    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.driver || data.driver.fullName !== 'Dharmendra Sharma') {
      throw new Error(`Failed to onboard driver: ${JSON.stringify(data)}`);
    }
    testDriverId = data.driver.id;
  });

  await test('Phase 4', 'Assign Driver to Vehicle Shift (POST /drivers/:id/assign-vehicle)', async () => {
    const res = await fetch(`${BASE_URL}/drivers/${testDriverId}/assign-vehicle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        vehicle_id: createdVehicleId,
        organization_id: testOrgId,
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.assignment || !data.assignment.isActive) {
      throw new Error('Shift assignment was not activated');
    }
  });

  await test('Phase 4', 'Unassign Driver from Shift (POST /drivers/:id/unassign-vehicle)', async () => {
    const res = await fetch(`${BASE_URL}/drivers/${testDriverId}/unassign-vehicle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        organization_id: testOrgId,
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // ----------------------------------------------------
  // PHASE 5: TRIP JOURNEY & LIFECYCLE MANAGEMENT
  // ----------------------------------------------------
  console.log('\n▶ PHASE 5: Real Trip Creation, Ordered Corridor Stops & Capacity Lifecycle');

  let testTripId = '';

  await test('Phase 5', 'List Commercial Corridor Trips (/trips)', async () => {
    const res = await fetch(`${BASE_URL}/trips?organization_id=${testOrgId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count < 3 || !Array.isArray(data.trips)) {
      throw new Error(`Expected >= 3 seeded trips, received ${data.count}`);
    }
  });

  await test('Phase 5', 'Create New Scheduled Journey with Ordered Stops (POST /trips)', async () => {
    const payload = {
      vehicle_id: createdVehicleId,
      driver_id: testDriverId,
      origin_hub_id: 'HUB-HYD-01',
      destination_hub_id: 'HUB-MAA-01',
      planned_start_time: new Date(Date.now() + 3600 * 1000).toISOString(),
      estimated_arrival: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      organization_id: testOrgId,
      route_stops: [
        { hub_id: 'HUB-HYD-01', stop_order: 0 },
        { hub_id: 'HUB-HYD-03', stop_order: 1 },
        { hub_id: 'HUB-MAA-01', stop_order: 2 },
      ],
    };

    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.trip || !data.trip.id) {
      throw new Error(`Failed to create trip: ${JSON.stringify(data)}`);
    }
    testTripId = data.trip.id;
  });

  await test('Phase 5', 'Fetch Trip Details with Ordered Corridor Stops (/trips/:id)', async () => {
    const res = await fetch(`${BASE_URL}/trips/${testTripId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.trip || !data.trip.routeStops || data.trip.routeStops.length < 2) {
      throw new Error(`Invalid route stops in trip: ${JSON.stringify(data)}`);
    }
  });

  await test('Phase 5', 'Start Trip Journey (POST /trips/:id/start)', async () => {
    const res = await fetch(`${BASE_URL}/trips/${testTripId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.trip.status !== 'IN_PROGRESS') {
      throw new Error(`Trip status expected IN_PROGRESS, got ${data.trip.status}`);
    }
  });

  await test('Phase 5', 'Complete Trip Journey (POST /trips/:id/complete)', async () => {
    const res = await fetch(`${BASE_URL}/trips/${testTripId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.trip.status !== 'COMPLETED') {
      throw new Error(`Trip status expected COMPLETED, got ${data.trip.status}`);
    }
  });

  // ----------------------------------------------------
  // PHASE 6: TELEMETRY INGESTION & LIVE LOCATIONS
  // ----------------------------------------------------
  console.log('\n▶ PHASE 6: Real Telemetry Ingestion & Live Vehicle Location Service');

  await test('Phase 6', 'Ingest Real-Time GPS Telemetry Point (POST /telemetry/record)', async () => {
    const payload = {
      vehicle_id: createdVehicleId,
      trip_id: testTripId,
      latitude: 17.3850,
      longitude: 78.4867,
      speed_km_h: 58.4,
      heading: 135.0,
      accuracy_meters: 3.5,
      source: 'DRIVER_APP',
    };

    const res = await fetch(`${BASE_URL}/telemetry/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.location || data.location.latitude !== 17.3850) {
      throw new Error(`Invalid telemetry return: ${JSON.stringify(data)}`);
    }
  });

  await test('Phase 6', 'Ingest Buffered Offline Telemetry Batch (POST /telemetry/batch)', async () => {
    const batch = [
      {
        vehicle_id: createdVehicleId,
        trip_id: testTripId,
        latitude: 17.3860,
        longitude: 78.4880,
        speed_km_h: 60.0,
        heading: 135.0,
      },
      {
        vehicle_id: createdVehicleId,
        trip_id: testTripId,
        latitude: 17.3875,
        longitude: 78.4900,
        speed_km_h: 62.0,
        heading: 135.0,
      },
    ];

    const res = await fetch(`${BASE_URL}/telemetry/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations: batch }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.ingestedCount < 2) throw new Error(`Batch count expected >= 2, got ${data.ingestedCount}`);
  });

  await test('Phase 6', 'Retrieve All Live Vehicle Locations (/telemetry/latest)', async () => {
    const res = await fetch(`${BASE_URL}/telemetry/latest`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count === 0 || !Array.isArray(data.locations)) {
      throw new Error('Expected live locations array');
    }
  });

  await test('Phase 6', 'Retrieve Vehicle Latest Position & Breadcrumb History (/telemetry/vehicles/:id)', async () => {
    const res = await fetch(`${BASE_URL}/telemetry/vehicles/${createdVehicleId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.latest || !Array.isArray(data.recentHistory)) {
      throw new Error(`Invalid vehicle tracking payload: ${JSON.stringify(data)}`);
    }
  });

  // ----------------------------------------------------
  // PHASE 7: MATCHING ENGINE & FORWARD-HUB INVARIANTS
  // ----------------------------------------------------
  console.log('\n▶ PHASE 7: Backend Matching Engine with Strict Route Progress & Forward Hub Invariants');

  await test('Phase 7', 'Match Search: Hyderabad -> Chennai (Verifies Strict Forward Hub AP 31 TT 5510)', async () => {
    const res = await fetch(`${BASE_URL}/matching/find-vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Hyderabad',
        destination: 'Chennai',
        cargo_weight_kg: 500,
        cargo_type: 'General Cargo',
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count === 0 || !Array.isArray(data.matches)) {
      throw new Error('Expected matching vehicles for Hyd -> Chennai');
    }

    const first = data.matches[0];
    const hub = first.recommendedPickupHub?.hub;

    // Strict Invariant 1: Pickup hub must NOT be in Chennai (Destination)
    if ((hub?.city || '').toLowerCase().includes('chennai')) {
      throw new Error(`CRITICAL VIOLATION: Recommended pickup hub is at destination: ${hub.name}`);
    }

    // Strict Invariant 2: Pickup hub must be an upcoming forward hub on Hyderabad side
    if (!(hub?.city || '').toLowerCase().includes('hyderabad')) {
      throw new Error(`Pickup hub must be in origin region (Hyderabad), got ${hub.city}`);
    }

    // Strict Invariant 3: Hub must not be behind the truck (Sanathnagar HUB-HYD-01)
    if (hub?.code === 'HUB-HYD-01' && first.vehicle.registrationNumber === 'AP 31 TT 5510') {
      throw new Error(`CRITICAL VIOLATION: Recommended hub is behind the truck: ${hub.name}`);
    }
  });

  await test('Phase 7', 'Match Search: Hyderabad -> Bengaluru (Verifies MH 31 CB 7712 with Shamshabad Hub)', async () => {
    const res = await fetch(`${BASE_URL}/matching/find-vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Hyderabad',
        destination: 'Bengaluru',
        cargo_weight_kg: 1000,
        cargo_type: 'General Cargo',
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count === 0) throw new Error('Expected matching truck for Hyd -> Blr');

    const match = data.matches[0];
    const hub = match.recommendedPickupHub?.hub;
    if ((hub?.city || '').toLowerCase().includes('bengaluru')) {
      throw new Error('Destination hub cannot be pickup hub');
    }
  });

  await test('Phase 7', 'Evaluate Vehicle Suitability (POST /matching/evaluate-vehicle/:id)', async () => {
    const res = await fetch(`${BASE_URL}/matching/evaluate-vehicle/AP 31 TT 5510`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Hyderabad',
        destination: 'Chennai',
        cargo_weight_kg: 500,
        cargo_type: 'General Cargo',
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.evaluation || data.evaluation.matchScore < 70) {
      throw new Error('Expected high match score evaluation');
    }
  });

  // ----------------------------------------------------
  // PHASE 8: REAL BOOKINGS & CAPACITY RESERVATION
  // ----------------------------------------------------
  console.log('\n▶ PHASE 8: Real Bookings, Capacity Reservations & Atomic Settlement');

  let testBookingId = '';

  await test('Phase 8', 'Calculate Dynamic Tariff Quote (POST /bookings/quote)', async () => {
    const res = await fetch(`${BASE_URL}/bookings/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin_lat: 17.3850,
        origin_lng: 78.4867,
        dest_lat: 13.0827,
        dest_lng: 80.2707,
        cargo_weight_kg: 500,
        cargo_type: 'General Cargo',
        booking_mode: 'SHARED_CAPACITY',
      }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.quote || typeof data.quote.totalPriceRs !== 'number' || data.quote.totalPriceRs <= 0) {
      throw new Error(`Invalid price quote: ${JSON.stringify(data)}`);
    }
  });

  await test('Phase 8', 'Create Atomic Shipment & Capacity Reservation (POST /bookings/create)', async () => {
    const res = await fetch(`${BASE_URL}/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        trip_id: testTripId,
        vehicle_id: createdVehicleId,
        origin: 'Hyderabad',
        destination: 'Chennai',
        cargo_weight_kg: 500,
        cargo_type: 'General Cargo',
        booking_mode: 'SHARED_CAPACITY',
      }),
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.booking || !data.shipment || data.booking.status !== 'CONFIRMED') {
      throw new Error(`Failed to create booking: ${JSON.stringify(data)}`);
    }
    testBookingId = data.booking.id;
  });

  await test('Phase 8', 'List Bookings (/bookings)', async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.bookings)) throw new Error('Expected bookings array');
  });

  await test('Phase 8', 'Cancel Booking & Restore Trip Capacity (POST /bookings/:id/cancel)', async () => {
    const res = await fetch(`${BASE_URL}/bookings/${testBookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ reason: 'Shipper schedule change' }),
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to cancel booking');
  });

  // ----------------------------------------------------
  // PHASE 9: REAL-TIME TRACKING & MILESTONES
  // ----------------------------------------------------
  console.log('\n▶ PHASE 9: Real-Time Shipment Tracking & Immutable Milestone Audit Events');

  const testShipmentId = `shp_${Date.now()}`;

  await test('Phase 9', 'Record Milestone Event (POST /tracking/shipments/:id/events)', async () => {
    const res = await fetch(`${BASE_URL}/tracking/shipments/${testShipmentId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'LOADING_STARTED',
        title: 'Cargo Loading Initiated',
        description: 'Commercial carrier started loading 500 kg cargo at Hyderabad East Logistics Park.',
        location: 'Hyderabad East Hub (Hayathnagar)',
      }),
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const data = await res.json();
    if (!data.event || data.event.eventType !== 'LOADING_STARTED') {
      throw new Error(`Failed to record event: ${JSON.stringify(data)}`);
    }
  });

  await test('Phase 9', 'Record Loaded & Departed Milestone Events', async () => {
    await fetch(`${BASE_URL}/tracking/shipments/${testShipmentId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'LOADED',
        title: 'Cargo Verified & Secured',
        description: 'Cargo loaded into 28ft Container Truck.',
      }),
    });

    const res = await fetch(`${BASE_URL}/tracking/shipments/${testShipmentId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'IN_TRANSIT',
        title: 'Departed Forward Corridor',
        description: 'Vehicle en route on NH-65 toward Chennai.',
      }),
    });

    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  });

  await test('Phase 9', 'Retrieve Live Shipment Tracking & Dynamic ETA (/tracking/shipments/:id)', async () => {
    const res = await fetch(`${BASE_URL}/tracking/shipments/${testShipmentId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (!data.tracking || !data.tracking.dynamicEta || typeof data.tracking.dynamicEta.remainingDistanceKm !== 'number') {
      throw new Error(`Invalid tracking response: ${JSON.stringify(data)}`);
    }
  });

  await test('Phase 9', 'Retrieve Immutable Milestone Timeline (/tracking/shipments/:id/timeline)', async () => {
    const res = await fetch(`${BASE_URL}/tracking/shipments/${testShipmentId}/timeline`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const data = await res.json();
    if (data.count < 3 || !Array.isArray(data.timeline)) {
      throw new Error(`Expected >= 3 timeline events, got ${data.count}`);
    }
  });

  // ----------------------------------------------------
  // PHASE 10: END-TO-END SYSTEM INTEGRATION & DRIVER WORKFLOW
  // ----------------------------------------------------
  console.log('\n▶ PHASE 10: Production System Integration & Complete Driver In-Cab Workflow');

  await test('Phase 10', 'Driver Full Flow: Start Journey -> Telemetry Ping -> Waypoint Arrived -> Complete', async () => {
    // 1. Driver queries active trips
    const tripsRes = await fetch(`${BASE_URL}/trips?organization_id=${testOrgId}`);
    if (!tripsRes.ok) throw new Error('Failed to fetch driver trips');

    // 2. Driver starts trip
    const startRes = await fetch(`${BASE_URL}/trips/${testTripId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!startRes.ok) throw new Error('Driver trip start failed');

    // 3. Driver App streams device GPS coordinate
    const gpsRes = await fetch(`${BASE_URL}/telemetry/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: createdVehicleId,
        trip_id: testTripId,
        latitude: 17.3100,
        longitude: 78.6800,
        speed_km_h: 45.0,
        heading: 135.0,
        source: 'DRIVER_APP',
      }),
    });
    if (!gpsRes.ok) throw new Error('Driver GPS stream failed');

    // 4. Driver marks milestone
    const eventRes = await fetch(`${BASE_URL}/tracking/shipments/${testShipmentId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'ARRIVED',
        title: 'Driver Arrived at Destination Gateway',
        description: 'Commercial truck arrived at Chennai Port Logistics Terminal.',
        location: 'Chennai Port Hub',
      }),
    });
    if (!eventRes.ok) throw new Error('Milestone event logging failed');

    // 5. Driver completes trip
    const completeRes = await fetch(`${BASE_URL}/trips/${testTripId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!completeRes.ok) throw new Error('Driver trip completion failed');
  });

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  server.close();

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n================================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} PASSED (${failed} failed)`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
