import {
  BookingRecord,
  LiveTrackingData,
  ShipmentTrackingState,
  ShipmentEvent,
  CargoPhysicalLocationStatus,
  Coordinates
} from '../types/logistics';
import { CITY_COORDINATES } from '../data/corridors';
import { MOCK_HUBS } from '../data/mockHubs';

export type SimulationScenarioId = 'SHARED_STANDARD' | 'DEDICATED_STANDARD' | 'MISSED_PICKUP';

// Corridor polyline for Bhubaneswar -> Hyderabad -> Chennai
export const SHARED_CORRIDOR_POLYLINE: [number, number][] = [
  // Upstream: Bhubaneswar to Hyderabad (NH-16 / NH-65 / NH-163)
  [20.2961, 85.8245], // Bhubaneswar
  [19.3149, 84.7941], // Berhampur
  [18.2949, 83.8938], // Srikakulam
  [17.6868, 83.2185], // Visakhapatnam
  [16.9891, 82.2475], // Kakinada
  [17.0005, 81.8040], // Rajahmundry
  [17.9689, 79.5941], // Warangal
  [17.4300, 78.5800], // Hyderabad NH-163 Entry
  [17.3450, 78.5520], // Hyderabad East Logistics Park (LB Nagar Hub)
  // Downstream: Hyderabad to Chennai (NH-65 & NH-16)
  [17.1500, 78.7800], // Choutuppal
  [17.0500, 79.2700], // Nalgonda Node
  [16.8000, 79.8800], // Suryapet
  [16.5062, 80.6480], // Vijayawada
  [16.3067, 80.4365], // Guntur
  [15.5057, 80.0499], // Ongole
  [14.4426, 79.9865], // Nellore
  [13.6288, 79.4192], // Tirupati Junction
  [13.3300, 80.0200], // Gummidipoondi Industrial Node
  [13.0827, 80.2707]  // Chennai Central Freight Terminal
];

// Dedicated Route Polyline: Direct Hyderabad -> Chennai
export const DEDICATED_CORRIDOR_POLYLINE: [number, number][] = [
  [17.4350, 78.4480], // Sanathnagar Yard (Base)
  [17.3450, 78.5520], // LB Nagar Expressway
  [17.1500, 78.7800], // Choutuppal
  [16.8000, 79.8800], // Suryapet
  [16.5062, 80.6480], // Vijayawada Bypass
  [15.5057, 80.0499], // Ongole
  [14.4426, 79.9865], // Nellore
  [13.3300, 80.0200], // Gummidipoondi
  [13.0827, 80.2707]  // Chennai
];

// Feeder route for Cargo: Customer location in Hyderabad -> Hub
export const CARGO_FEEDER_POLYLINE: [number, number][] = [
  [17.4100, 78.3900], // Customer Pickup Location (Madhapur/Hitec)
  [17.3900, 78.4500], // Central Corridor
  [17.3450, 78.5520]  // Hyderabad East Logistics Park (Hub)
];

// Helper to interpolate along polyline
function interpolateAlongPolyline(polyline: [number, number][], progress01: number): { lat: number; lng: number; heading: number } {
  const p = Math.max(0, Math.min(1, progress01));
  if (polyline.length < 2) {
    return { lat: polyline[0][0], lng: polyline[0][1], heading: 145 };
  }

  const totalSegments = polyline.length - 1;
  const scaled = p * totalSegments;
  const segIdx = Math.min(Math.floor(scaled), totalSegments - 1);
  const segT = scaled - segIdx;

  const start = polyline[segIdx];
  const end = polyline[segIdx + 1];

  const lat = start[0] + (end[0] - start[0]) * segT;
  const lng = start[1] + (end[1] - start[1]) * segT;

  const dy = end[0] - start[0];
  const dx = end[1] - start[1];
  let heading = Math.round((Math.atan2(dx, dy) * 180) / Math.PI);
  if (heading < 0) heading += 360;

  return { lat, lng, heading };
}

export function computeLiveTrackingSnapshot(
  shipment: BookingRecord,
  progress: number, // 0.0 to 1.0
  scenario: SimulationScenarioId = 'SHARED_STANDARD'
): LiveTrackingData {
  const isDedicated = shipment.mode === 'FULL_VEHICLE' || scenario === 'DEDICATED_STANDARD';
  const isMissedPickup = scenario === 'MISSED_PICKUP';

  const defaultHub = MOCK_HUBS.find(h => h.id === 'HUB-HYD-02') || MOCK_HUBS[0];
  const hubCoords: Coordinates = { lat: defaultHub.coords.lat, lng: defaultHub.coords.lng };
  const destCoords: Coordinates = CITY_COORDINATES['Chennai'] || { lat: 13.0827, lng: 80.2707 };

  // DEDICATED SCENARIO
  if (isDedicated) {
    const truckInterp = interpolateAlongPolyline(DEDICATED_CORRIDOR_POLYLINE, progress);
    let state: ShipmentTrackingState = 'BOOKING_CONFIRMED';
    let cargoStatus: CargoPhysicalLocationStatus = 'ON_TRUCK';
    let speed = 68;

    if (progress < 0.05) {
      state = 'BOOKING_CONFIRMED';
      speed = 0;
    } else if (progress < 0.15) {
      state = 'LOADING';
      speed = 0;
    } else if (progress < 0.90) {
      state = 'IN_TRANSIT';
      speed = 72;
    } else if (progress < 0.98) {
      state = 'ARRIVED_AT_DESTINATION';
      speed = 20;
    } else {
      state = 'DELIVERED';
      cargoStatus = 'AT_DESTINATION';
      speed = 0;
    }

    const totalDistKm = 630;
    const distRemaining = Math.max(0, Math.round(totalDistKm * (1 - progress)));
    const transitMinsRemaining = speed > 0 ? Math.round((distRemaining / speed) * 60) : 0;
    const etaFormatted = progress >= 0.98 ? 'Delivered' : `In ${Math.floor(transitMinsRemaining / 60)}h ${transitMinsRemaining % 60}m (Today, 10:30 PM)`;

    const events: ShipmentEvent[] = [
      {
        id: 'evt-1',
        timestamp: 'Today, 02:30 PM',
        state: 'BOOKING_CONFIRMED',
        title: 'Dedicated Vehicle Reserved',
        description: `Full vehicle booked exclusively (${shipment.vehicleType || 'Medium Freight Truck'}). Status set to RESERVED.`,
        location: 'Hyderabad Express Operations Center',
        isCompleted: progress >= 0.05,
        isCurrent: progress < 0.05
      },
      {
        id: 'evt-2',
        timestamp: 'Today, 03:15 PM',
        state: 'LOADING',
        title: 'Direct Bay Loading Complete',
        description: '700 kg cargo loaded onto dedicated truck. Cargo seals verified.',
        location: 'Sanathnagar Intermodal Yard',
        isCompleted: progress >= 0.15,
        isCurrent: progress >= 0.05 && progress < 0.15
      },
      {
        id: 'evt-3',
        timestamp: 'Today, 04:00 PM',
        state: 'IN_TRANSIT',
        title: 'Departed on Express Corridor',
        description: 'Direct transit without intermediate hub consolidation stops.',
        location: 'NH-65 Highway Tollway',
        isCompleted: progress >= 0.50,
        isCurrent: progress >= 0.15 && progress < 0.90
      },
      {
        id: 'evt-4',
        timestamp: 'Today, 09:45 PM',
        state: 'ARRIVED_AT_DESTINATION',
        title: 'Arrived at Destination City',
        description: 'Vehicle reached destination perimeter dock.',
        location: 'Chennai Central Freight Hub',
        isCompleted: progress >= 0.98,
        isCurrent: progress >= 0.90 && progress < 0.98
      },
      {
        id: 'evt-5',
        timestamp: 'Today, 10:30 PM',
        state: 'DELIVERED',
        title: 'Shipment Delivered',
        description: 'Consignee signed and proof of delivery confirmed.',
        location: 'Chennai Delivery Dock',
        isCompleted: progress >= 0.98,
        isCurrent: progress >= 0.98
      }
    ];

    return {
      shipmentId: shipment.bookingId,
      bookingMode: 'FULL_VEHICLE',
      currentState: state,
      progressPercentage: Math.round(progress * 100),
      distanceRemainingKm: distRemaining,
      etaFormatted,
      speedKmH: speed,
      truckCoords: { lat: truckInterp.lat, lng: truckInterp.lng },
      truckHeading: truckInterp.heading,
      truckLocationName: progress > 0.8 ? 'NH-16 Chennai Expressway' : progress > 0.4 ? 'NH-65 Suryapet Node' : 'Hyderabad Outer Ring Road',
      cargoCoords: { lat: truckInterp.lat, lng: truckInterp.lng },
      cargoLocationStatus: cargoStatus,
      cargoLocationName: 'Dedicated Vehicle Container',
      pickupHub: {
        id: defaultHub.id,
        name: defaultHub.name,
        address: defaultHub.address,
        coords: hubCoords,
        loadingCutoff: '07:30 PM'
      },
      destination: {
        city: 'Chennai',
        coords: destCoords
      },
      truckRoute: {
        originCity: 'Hyderabad',
        destinationCity: 'Chennai',
        polyline: DEDICATED_CORRIDOR_POLYLINE
      },
      events
    };
  }

  // MISSED PICKUP SCENARIO
  if (isMissedPickup) {
    // In missed pickup, truck continues moving forward along corridor [0.2 -> 0.8]
    // while cargo gets stuck at hub past cutoff
    const truckProgress = Math.min(1.0, 0.35 + progress * 0.55);
    const truckInterp = interpolateAlongPolyline(SHARED_CORRIDOR_POLYLINE, truckProgress);

    return {
      shipmentId: shipment.bookingId,
      bookingMode: 'SHARE_CAPACITY',
      currentState: 'PICKUP_MISSED',
      progressPercentage: 35,
      distanceRemainingKm: 520,
      etaFormatted: 'Pickup Missed',
      speedKmH: 64,
      truckCoords: { lat: truckInterp.lat, lng: truckInterp.lng },
      truckHeading: truckInterp.heading,
      truckLocationName: 'NH-65 Southbound (Past Hyderabad)',
      cargoCoords: hubCoords,
      cargoLocationStatus: 'AT_HUB',
      cargoLocationName: defaultHub.name,
      pickupHub: {
        id: defaultHub.id,
        name: defaultHub.name,
        address: defaultHub.address,
        coords: hubCoords,
        loadingCutoff: '07:45 PM'
      },
      destination: {
        city: 'Chennai',
        coords: destCoords
      },
      truckRoute: {
        originCity: 'Bhubaneswar',
        destinationCity: 'Chennai',
        polyline: SHARED_CORRIDOR_POLYLINE
      },
      events: [
        {
          id: 'evt-m1',
          timestamp: 'Today, 02:15 PM',
          state: 'BOOKING_CONFIRMED',
          title: 'Shared Capacity Reserved',
          description: 'Corridor slot locked on truck RSL-5510 en route from Bhubaneswar.',
          location: 'Hyderabad East Freight Network',
          isCompleted: true,
          isCurrent: false
        },
        {
          id: 'evt-m2',
          timestamp: 'Today, 07:55 PM',
          state: 'PICKUP_MISSED',
          title: '⚠️ Pickup Window Missed',
          description: 'Cargo did not arrive before truck cutoff (07:45 PM). Truck continued forward on southbound highway vector to maintain on-time SLA.',
          location: defaultHub.name,
          isCompleted: true,
          isCurrent: true
        }
      ],
      missedPickupInfo: {
        reason: 'Cargo arrived at dock at 07:55 PM (10 mins after 07:45 PM loading cutoff).',
        truckContinuedToward: 'Truck RSL-5510 maintained south highway heading toward Vijayawada & Chennai without reverse detour.',
        timePassed: 'Cutoff expired 15 mins ago.'
      }
    };
  }

  // SHARED CAPACITY STANDARD SCENARIO
  // Truck moves along whole corridor (0 to 1). Hub is at index 8 of 18 points (~40% progress point).
  // Hub waypoint index = 8 / 18 = ~0.44
  const hubProgressThreshold = 0.44;

  const truckInterp = interpolateAlongPolyline(SHARED_CORRIDOR_POLYLINE, progress);

  let state: ShipmentTrackingState = 'BOOKING_CONFIRMED';
  let cargoStatus: CargoPhysicalLocationStatus = 'AT_ORIGIN';
  let cargoCoords: Coordinates = { lat: CARGO_FEEDER_POLYLINE[0][0], lng: CARGO_FEEDER_POLYLINE[0][1] };
  let cargoLocationName = 'Shipper Warehouse (Madhapur)';
  let speed = 64;

  if (progress < 0.12) {
    state = 'BOOKING_CONFIRMED';
    cargoStatus = 'AT_ORIGIN';
    speed = 65;
  } else if (progress < 0.28) {
    state = 'INBOUND_TO_HUB';
    cargoStatus = 'IN_TRANSIT_TO_HUB';
    const feederP = (progress - 0.12) / 0.16;
    const cInterp = interpolateAlongPolyline(CARGO_FEEDER_POLYLINE, feederP);
    cargoCoords = { lat: cInterp.lat, lng: cInterp.lng };
    cargoLocationName = 'En Route to Smart Hub via ORR Feeder';
    speed = 68;
  } else if (progress < 0.40) {
    state = 'READY_AT_HUB';
    cargoStatus = 'AT_HUB';
    cargoCoords = hubCoords;
    cargoLocationName = `${defaultHub.name} (Bay 4 Dock)`;
    speed = 70;
  } else if (progress < 0.46) {
    state = 'LOADING';
    cargoStatus = 'ON_TRUCK';
    cargoCoords = hubCoords;
    cargoLocationName = `Loaded on Truck RSL-5510 at ${defaultHub.name}`;
    speed = 0; // Truck stopped at hub bay!
  } else if (progress < 0.90) {
    state = 'IN_TRANSIT';
    cargoStatus = 'ON_TRUCK';
    cargoCoords = { lat: truckInterp.lat, lng: truckInterp.lng };
    cargoLocationName = 'On Truck RSL-5510 (NH-65 / NH-16 Corridor)';
    speed = 74;
  } else if (progress < 0.98) {
    state = 'ARRIVED_AT_DESTINATION';
    cargoStatus = 'ON_TRUCK';
    cargoCoords = destCoords;
    cargoLocationName = 'Chennai Freight Terminal Area';
    speed = 25;
  } else {
    state = 'DELIVERED';
    cargoStatus = 'AT_DESTINATION';
    cargoCoords = destCoords;
    cargoLocationName = 'Chennai Consignee Warehouse';
    speed = 0;
  }

  const totalDistFromHubKm = 580;
  const sharedDistRemaining = progress < hubProgressThreshold
    ? totalDistFromHubKm
    : Math.max(0, Math.round(totalDistFromHubKm * (1 - (progress - hubProgressThreshold) / (1 - hubProgressThreshold))));

  const minsRemaining = speed > 0 ? Math.round((sharedDistRemaining / speed) * 60) : 0;
  const etaFormatted = progress >= 0.98 ? 'Delivered' : `In ${Math.floor(minsRemaining / 60)}h ${minsRemaining % 60}m (Today, 10:45 PM)`;

  const events: ShipmentEvent[] = [
    {
      id: 'evt-s1',
      timestamp: 'Today, 02:15 PM',
      state: 'BOOKING_CONFIRMED',
      title: 'Shared Capacity Confirmed',
      description: '700 kg slot reserved on corridor truck RSL-5510 en route from Bhubaneswar.',
      location: 'Hyderabad East Freight Base',
      isCompleted: progress >= 0.12,
      isCurrent: progress < 0.12
    },
    {
      id: 'evt-s2',
      timestamp: 'Today, 03:10 PM',
      state: 'INBOUND_TO_HUB',
      title: 'Cargo Dispatched to Smart Hub',
      description: 'Feeder vehicle dispatched cargo to assigned highway consolidation hub.',
      location: 'Madhapur ➔ LB Nagar Feeder Link',
      isCompleted: progress >= 0.28,
      isCurrent: progress >= 0.12 && progress < 0.28
    },
    {
      id: 'evt-s3',
      timestamp: 'Today, 03:30 PM',
      state: 'READY_AT_HUB',
      title: 'Cargo Staged at Hub Bay',
      description: `Cargo arrived 45 mins before cutoff (${defaultHub.name}). Awaiting truck arrival.`,
      location: defaultHub.name,
      isCompleted: progress >= 0.40,
      isCurrent: progress >= 0.28 && progress < 0.40
    },
    {
      id: 'evt-s4',
      timestamp: 'Today, 03:52 PM',
      state: 'LOADING',
      title: 'Truck Arrival & Cargo Loaded',
      description: 'Truck RSL-5510 entered bay. 700 kg loaded into shared trailer bay 2 with zero highway detours.',
      location: `${defaultHub.name} (Bay 4)`,
      isCompleted: progress >= 0.46,
      isCurrent: progress >= 0.40 && progress < 0.46
    },
    {
      id: 'evt-s5',
      timestamp: 'Today, 04:00 PM',
      state: 'IN_TRANSIT',
      title: 'Departed on Southbound Corridor',
      description: 'Travelling at 74 km/h along NH-65 toward Vijayawada and Chennai.',
      location: 'NH-65 Highway Corridor',
      isCompleted: progress >= 0.90,
      isCurrent: progress >= 0.46 && progress < 0.90
    },
    {
      id: 'evt-s6',
      timestamp: 'Today, 10:15 PM',
      state: 'ARRIVED_AT_DESTINATION',
      title: 'Arrived at Destination City',
      description: 'Truck reached Chennai freight boundary concourse.',
      location: 'Chennai Intermodal Terminal',
      isCompleted: progress >= 0.98,
      isCurrent: progress >= 0.90 && progress < 0.98
    },
    {
      id: 'evt-s7',
      timestamp: 'Today, 10:45 PM',
      state: 'DELIVERED',
      title: 'Shipment Successfully Delivered',
      description: 'Cargo handed over to recipient dock. Handover verification complete.',
      location: 'Chennai Consignee Depot',
      isCompleted: progress >= 0.98,
      isCurrent: progress >= 0.98
    }
  ];

  return {
    shipmentId: shipment.bookingId,
    bookingMode: 'SHARE_CAPACITY',
    currentState: state,
    progressPercentage: Math.round(progress * 100),
    distanceRemainingKm: sharedDistRemaining,
    etaFormatted,
    speedKmH: speed,
    truckCoords: { lat: truckInterp.lat, lng: truckInterp.lng },
    truckHeading: truckInterp.heading,
    truckLocationName: progress > 0.75 ? 'NH-16 Nellore Expressway' : progress > 0.44 ? 'NH-65 Vijayawada Corridor' : progress > 0.20 ? 'NH-163 Approaching Hyderabad' : 'NH-16 Warangal Node',
    cargoCoords,
    cargoLocationStatus: cargoStatus,
    cargoLocationName,
    pickupHub: {
      id: defaultHub.id,
      name: defaultHub.name,
      address: defaultHub.address,
      coords: hubCoords,
      loadingCutoff: '07:45 PM'
    },
    destination: {
      city: 'Chennai',
      coords: destCoords
    },
    truckRoute: {
      originCity: 'Bhubaneswar',
      destinationCity: 'Chennai',
      polyline: SHARED_CORRIDOR_POLYLINE
    },
    events
  };
}
