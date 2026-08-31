export type CargoType =
  | 'General Cargo'
  | 'Electronics'
  | 'Fragile Goods'
  | 'Refrigerated Goods'
  | 'Industrial Materials'
  | 'FMCG & Packaged Goods'
  | 'Textiles & Garments'
  | 'Pharma & Medical Supplies';

export type DeliveryPriority = '⚡ Fastest' | '💰 Cheapest' | '⚖️ Best Value';

export type VehicleClass =
  | '32ft Multi-Axle Heavy Truck (14T)'
  | '28ft Container Trailer (9T)'
  | '24ft Refrigerated Reefer (8T)'
  | '22ft Closed Body Truck (7T)'
  | '19ft Eicher Open Truck (5T)'
  | '14ft Light Commercial Vehicle (3.5T)';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TruckLocation {
  city: string;
  landmark?: string;
  latitude: number;
  longitude: number;
}

export interface OptionalServiceHub {
  hubId: string;
  hubName: string;
  city: string;
  serviceRegion: string;
  coordinates: Coordinates;
  estimatedArrivalMinutesFromNow: number;
  routeSequence: number;
  pickupWindowStatus: 'open' | 'approaching' | 'passed';
}

export interface PlannedRouteStop {
  stopIndex: number;
  hubId: string;
  hubName: string;
  city: string;
  coordinates: Coordinates;
  estimatedArrivalMinutesFromNow: number;
  scheduledTimeFormatted: string; // e.g. "04:15 PM"
  status: 'passed' | 'current' | 'upcoming';
}

export interface Truck {
  id: string; // e.g., "RSL-2048"
  registrationNumber: string;
  driverName: string;
  carrierName: string;
  vehicleClass: VehicleClass;
  vehicleType: string;
  currentLocation: TruckLocation;
  currentLocationName: string;
  currentCoords: Coordinates;
  heading: number;
  origin: string;
  destination: string;
  overallOrigin?: string;
  overallDestination?: string;
  serviceCorridor?: string;
  currentServiceRegion?: string;
  optionalServiceHubs?: OptionalServiceHub[];
  routeStops: string[];
  route: string[];
  plannedStops?: PlannedRouteStop[];
  currentStopIndex?: number;
  totalCapacityKg: number;
  availableCapacityKg: number;
  bookedCapacityKg: number;
  status: 'In Transit' | 'Corridor Cruising' | 'At Smart Hub' | 'Loading';
  speedKmH: number;
  nextHubEtaMinutes: number;
  estimatedArrival: string; // e.g., "Tomorrow, 10:30 AM"
  compatibleCargoTypes: CargoType[];
  supportedCargoTypes: CargoType[];
  rating: number;
  routePolyline: [number, number][];
  currentRouteProgress?: number;
  simulatedPriceEstimateRs?: number;
}

export interface LogisticsHub {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: Coordinates;
  type: 'Primary Intermodal Hub' | 'Corridor Freight Terminal' | 'Port Gate Hub' | 'Express Gateway';
  activeVehiclesCount: number;
  inboundTonnesToday: number;
  outboundTonnesToday: number;
  connectedCorridors: string[];
  supportedCargoTypes: CargoType[];
  popularRoutes?: string[];
  status?: 'Operational' | 'Maintenance' | 'Congested';
  capacityStatus?: 'Available' | 'Limited' | 'Full';
  address: string;
  isSmartHub: boolean;
  dockBaysCount?: number;
}

export interface FreightCorridor {
  id: string;
  name: string;
  highwayCode: string;
  color: string;
  polyline: [number, number][];
}

export interface ShipmentSearchCriteria {
  origin: string;
  destination: string;
  weightKg: number;
  cargoType: CargoType;
  priority: DeliveryPriority;
  unit: 'kg' | 'tonnes';
  weightRaw?: number;
  bookingMode?: BookingMode;
}

export interface FilterResult {
  matchingTrucks: Truck[];
  nonMatchingTrucks: Truck[];
  totalScanned: number;
  activeCriteria: ShipmentSearchCriteria;
}

export interface MatchBreakdown {
  routeCompatibilityScore: number; // 0 - 100
  capacityFitnessScore: number;     // 0 - 100
  etaScore: number;                 // 0 - 100
  detourScore: number;              // 0 - 100 (Internal highway proximity)
  simulatedDetourKm: number;        // 0 km (Route-locked)
  explanations: string[];           // bullet points
}

export interface PricingEstimate {
  dedicatedTruckEstimateRs: number;
  sharedCapacityEstimateRs: number;
  estimatedSavingsRs: number;
  savingsPercentage: number;
}

export interface ScoredHubMatch {
  hub: LogisticsHub;
  hubScore: number;                 // 0 - 100%
  stopIndex: number;
  stopSequenceNumber: number;
  
  // Timing Model (Route-Locked)
  customerDistanceKm: number;       // e.g. 4.2 km
  customerTravelTimeMinutes: number;// e.g. 15 mins
  hubProcessingMinutes: number;     // 15 mins
  cargoArrivalTimeMinutes: number;  // e.g. 30 mins from now
  cargoArrivalTimeFormatted: string;// e.g. "02:45 PM"
  
  truckEtaMinutes: number;          // e.g. 105 mins from now
  truckEtaFormatted: string;        // e.g. "04:00 PM"
  loadingCutoffMinutes: number;     // e.g. 90 mins from now
  loadingCutoffFormatted: string;   // e.g. "03:45 PM"
  
  safetyTimeBufferMinutes: number;  // e.g. 60 mins
  safetyTimeBufferFormatted: string;// e.g. "+1 hr 00 min"
  isTimeFeasible: boolean;          // cargoArrival <= loadingCutoff
  
  scores: {
    customerConvenience: number;    // 0 - 100 (40% weight)
    timeBuffer: number;             // 0 - 100 (30% weight)
    hubCapability: number;          // 0 - 100 (20% weight)
    operationalEfficiency: number;  // 0 - 100 (10% weight)
  };
  explanations: string[];
  rank: number;
  isRecommended: boolean;
}

export interface HubRecommendationResult {
  truckId: string;
  hasReachablePickupHub: boolean;
  recommendedHub: ScoredHubMatch | null;
  alternativeHubs: ScoredHubMatch[];
}

export interface ScoredTruckMatch {
  truck: Truck;
  compositeScore: number;           // 0 - 100%
  breakdown: MatchBreakdown;
  pricing: PricingEstimate;
  rank: number;
  recommendationTag?: '🥇 BEST VALUE' | '⚡ FASTEST' | '💰 CHEAPEST';
  hubRecommendation?: HubRecommendationResult;
}

export type RecommendationTab = 'best_value' | 'fastest' | 'cheapest';

export interface RecommendationResultSet {
  bestValue: ScoredTruckMatch[];
  fastest: ScoredTruckMatch[];
  cheapest: ScoredTruckMatch[];
  topRecommendation: ScoredTruckMatch;
  activeTab: RecommendationTab;
  criteria: ShipmentSearchCriteria;
}

export type BookingMode = 'SHARE_CAPACITY' | 'FULL_VEHICLE';

export interface CargoSearchQuery {
  origin: string;
  destination: string;
  weightKg: number;
  cargoType: CargoType;
  bookingMode?: BookingMode;
}

export type DedicatedVehicleType =
  | 'Light Commercial Vehicle'
  | 'Medium Freight Truck'
  | 'Heavy Freight Truck'
  | 'Heavy Duty Freight Truck';

export interface DedicatedTruck {
  id: string; // e.g. "RSL-D102"
  registrationNumber: string;
  carrierName: string;
  driverName: string;
  vehicleType: DedicatedVehicleType;
  vehicleCategory: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'HEAVY_DUTY';
  totalCapacityKg: number;
  totalCapacityTonnes: number;
  supportedCargoTypes: CargoType[];
  currentLocationCity: string;
  currentLocationLandmark: string;
  currentCoords: Coordinates;
  availabilityStatus: 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE';
  estimatedDeparture: string;
  estimatedArrival: string;
  estimatedTransitHours: number;
  baseRateRs: number;
  perKmRateRs: number;
  reservationFeeRs: number;
  rating: number;
  ratingCount?: number;
  dimensions?: string;
  isBestFit?: boolean;
  fitTag?: '⭐ BEST FIT' | '⚡ HIGH CAPACITY' | '🛡️ HEAVY DUTY';
  fitReason?: string;
  pricing?: {
    baseCostRs: number;
    distanceCostRs: number;
    reservationFeeRs: number;
    totalDedicatedPriceRs: number;
    sharedEquivalentPriceRs: number;
    sharedSavingsRs: number;
  };
}

export interface DedicatedSearchResult {
  availableTrucks: DedicatedTruck[];
  bestFitTruck: DedicatedTruck | null;
  criteria: ShipmentSearchCriteria;
  distanceKm: number;
  sharedPriceEstimateRs: number;
}

export type ShipmentTrackingState =
  | 'BOOKING_CONFIRMED'
  | 'PREPARING_CARGO'
  | 'INBOUND_TO_HUB'
  | 'READY_AT_HUB'
  | 'TRUCK_APPROACHING'
  | 'LOADING'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_DESTINATION'
  | 'DELIVERED'
  | 'PICKUP_MISSED';

export interface ShipmentEvent {
  id: string;
  timestamp: string;
  state: ShipmentTrackingState;
  title: string;
  description: string;
  location: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export type CargoPhysicalLocationStatus =
  | 'AT_ORIGIN'
  | 'IN_TRANSIT_TO_HUB'
  | 'AT_HUB'
  | 'ON_TRUCK'
  | 'AT_DESTINATION';

export interface LiveTrackingData {
  shipmentId: string;
  bookingMode: BookingMode;
  currentState: ShipmentTrackingState;
  progressPercentage: number;
  distanceRemainingKm: number;
  etaFormatted: string;
  speedKmH: number;
  truckCoords: Coordinates;
  truckHeading: number;
  truckLocationName: string;
  cargoCoords: Coordinates;
  cargoLocationStatus: CargoPhysicalLocationStatus;
  cargoLocationName: string;
  pickupHub: {
    id: string;
    name: string;
    address: string;
    coords: Coordinates;
    loadingCutoff: string;
  };
  destination: {
    city: string;
    coords: Coordinates;
  };
  truckRoute: {
    originCity: string;
    destinationCity: string;
    polyline: [number, number][];
  };
  events: ShipmentEvent[];
  missedPickupInfo?: {
    reason: string;
    truckContinuedToward: string;
    timePassed: string;
  };
}

export interface BookingRecord {
  bookingId: string; // e.g. "RSL-SHP-847291" or "RSL-DED-382104"
  userId: string; // Owner User ID (e.g. "USR-1001")
  userName?: string;
  mode: BookingMode;
  createdAt: string;
  status: ShipmentTrackingState | 'AWAITING HUB PICKUP' | 'VEHICLE RESERVED' | 'IN TRANSIT' | 'DELIVERED';
  origin: string;
  destination: string;
  weightKg: number;
  cargoType: CargoType;
  totalPriceRs: number;
  // Shared Mode Specifics
  truckId?: string;
  truckReg?: string;
  pickupHubId?: string;
  pickupHubName?: string;
  carrierName?: string;
  estimatedArrival?: string;
  progressPercentage?: number;
  // Dedicated Mode Specifics
  vehicleType?: DedicatedVehicleType;
  totalVehicleCapacityKg?: number;
}

