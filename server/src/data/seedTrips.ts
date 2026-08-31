export interface SeedTripStop {
  hubCode: string;
  stopOrder: number;
  plannedArrivalMinutesFromStart: number;
  plannedDepartureMinutesFromStart: number;
  status: 'UPCOMING' | 'CURRENT' | 'COMPLETED' | 'SKIPPED';
}

export interface SeedTripData {
  vehicleReg: string;
  driverPhone?: string;
  originHubCode: string;
  destinationHubCode: string;
  availableCapacityKg: number;
  status: 'PLANNED' | 'READY_TO_START' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  plannedHoursFromNow: number;
  estimatedDurationHours: number;
  stops: SeedTripStop[];
}

export const SEED_TRIPS: SeedTripData[] = [
  // ----------------------------------------------------
  // TRIP 1: Odisha -> Chennai via Hyderabad Corridor (Active In-Transit)
  // ----------------------------------------------------
  {
    vehicleReg: 'OD 02 TC 8492',
    driverPhone: '9871122334',
    originHubCode: 'HUB-BBI-01',
    destinationHubCode: 'HUB-MAA-01',
    availableCapacityKg: 2400,
    status: 'IN_PROGRESS',
    plannedHoursFromNow: -12,
    estimatedDurationHours: 36,
    stops: [
      { hubCode: 'HUB-BBI-01', stopOrder: 0, plannedArrivalMinutesFromStart: 0, plannedDepartureMinutesFromStart: 60, status: 'COMPLETED' },
      { hubCode: 'HUB-VTZ-01', stopOrder: 1, plannedArrivalMinutesFromStart: 480, plannedDepartureMinutesFromStart: 540, status: 'COMPLETED' },
      { hubCode: 'HUB-HYD-01', stopOrder: 2, plannedArrivalMinutesFromStart: 1020, plannedDepartureMinutesFromStart: 1080, status: 'UPCOMING' },
      { hubCode: 'HUB-HYD-03', stopOrder: 3, plannedArrivalMinutesFromStart: 1140, plannedDepartureMinutesFromStart: 1200, status: 'UPCOMING' },
      { hubCode: 'HUB-MAA-01', stopOrder: 4, plannedArrivalMinutesFromStart: 2160, plannedDepartureMinutesFromStart: 2220, status: 'UPCOMING' }
    ]
  },

  // ----------------------------------------------------
  // TRIP 2: Nagpur -> Bengaluru via Hyderabad ORR (Active In-Transit)
  // ----------------------------------------------------
  {
    vehicleReg: 'MH 31 CB 7712',
    driverPhone: '9822098765',
    originHubCode: 'HUB-NAG-01',
    destinationHubCode: 'HUB-BLR-02',
    availableCapacityKg: 5200,
    status: 'IN_PROGRESS',
    plannedHoursFromNow: -8,
    estimatedDurationHours: 24,
    stops: [
      { hubCode: 'HUB-NAG-01', stopOrder: 0, plannedArrivalMinutesFromStart: 0, plannedDepartureMinutesFromStart: 60, status: 'COMPLETED' },
      { hubCode: 'HUB-HYD-02', stopOrder: 1, plannedArrivalMinutesFromStart: 600, plannedDepartureMinutesFromStart: 660, status: 'CURRENT' },
      { hubCode: 'HUB-BLR-02', stopOrder: 2, plannedArrivalMinutesFromStart: 1440, plannedDepartureMinutesFromStart: 1500, status: 'UPCOMING' }
    ]
  },

  // ----------------------------------------------------
  // TRIP 3: Visakhapatnam -> Chennai via Hyderabad East (At Smart Hub)
  // ----------------------------------------------------
  {
    vehicleReg: 'AP 31 TT 5510',
    driverPhone: '9848012345',
    originHubCode: 'HUB-VTZ-01',
    destinationHubCode: 'HUB-MAA-01',
    availableCapacityKg: 3100,
    status: 'IN_PROGRESS',
    plannedHoursFromNow: -10,
    estimatedDurationHours: 28,
    stops: [
      { hubCode: 'HUB-VTZ-01', stopOrder: 0, plannedArrivalMinutesFromStart: 0, plannedDepartureMinutesFromStart: 60, status: 'COMPLETED' },
      { hubCode: 'HUB-HYD-03', stopOrder: 1, plannedArrivalMinutesFromStart: 540, plannedDepartureMinutesFromStart: 660, status: 'CURRENT' },
      { hubCode: 'HUB-MAA-01', stopOrder: 2, plannedArrivalMinutesFromStart: 1680, plannedDepartureMinutesFromStart: 1740, status: 'UPCOMING' }
    ]
  },

  // ----------------------------------------------------
  // TRIP 4: Delhi NCR -> Mumbai via Jaipur & Ahmedabad (Planned)
  // ----------------------------------------------------
  {
    vehicleReg: 'DL 01 AA 9920',
    driverPhone: '9811054321',
    originHubCode: 'HUB-DEL-01',
    destinationHubCode: 'HUB-BOM-01',
    availableCapacityKg: 4200,
    status: 'READY_TO_START',
    plannedHoursFromNow: 2,
    estimatedDurationHours: 32,
    stops: [
      { hubCode: 'HUB-DEL-01', stopOrder: 0, plannedArrivalMinutesFromStart: 0, plannedDepartureMinutesFromStart: 60, status: 'UPCOMING' },
      { hubCode: 'HUB-JAI-01', stopOrder: 1, plannedArrivalMinutesFromStart: 300, plannedDepartureMinutesFromStart: 360, status: 'UPCOMING' },
      { hubCode: 'HUB-AMD-01', stopOrder: 2, plannedArrivalMinutesFromStart: 1080, plannedDepartureMinutesFromStart: 1140, status: 'UPCOMING' },
      { hubCode: 'HUB-ST-01', stopOrder: 3, plannedArrivalMinutesFromStart: 1440, plannedDepartureMinutesFromStart: 1500, status: 'UPCOMING' },
      { hubCode: 'HUB-BOM-01', stopOrder: 4, plannedArrivalMinutesFromStart: 1920, plannedDepartureMinutesFromStart: 1980, status: 'UPCOMING' }
    ]
  }
];
