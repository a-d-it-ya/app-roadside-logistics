import { DedicatedTruck } from '../types/logistics';

export const INITIAL_DEDICATED_FLEET: DedicatedTruck[] = [
  // ----------------------------------------------------
  // LIGHT COMMERCIAL VEHICLES (LCV) - 1.0 - 1.5 Tonnes
  // ----------------------------------------------------
  {
    id: 'RSL-D102',
    registrationNumber: 'TS 07 EQ 4091',
    carrierName: 'Deccan Direct Express',
    driverName: 'K. Narsimha Murthy',
    vehicleType: 'Light Commercial Vehicle',
    vehicleCategory: 'LIGHT',
    totalCapacityKg: 1500,
    totalCapacityTonnes: 1.5,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Fragile Goods',
      'FMCG & Packaged Goods',
      'Pharma & Medical Supplies'
    ],
    currentLocationCity: 'Hyderabad',
    currentLocationLandmark: 'Sanathnagar Intermodal Yard',
    currentCoords: { lat: 17.4350, lng: 78.4480 },
    availabilityStatus: 'AVAILABLE',
    estimatedDeparture: 'Today, 08:30 PM',
    estimatedArrival: 'Tomorrow, 08:00 AM',
    estimatedTransitHours: 11.5,
    baseRateRs: 3500,
    perKmRateRs: 18,
    reservationFeeRs: 1500,
    rating: 4.92,
    ratingCount: 142,
    dimensions: '9ft × 5.5ft × 5ft (Closed Body)'
  },
  {
    id: 'RSL-D101',
    registrationNumber: 'TS 09 DL 1042',
    carrierName: 'Hyderabad Fast-Track Haul',
    driverName: 'Syed Imran',
    vehicleType: 'Light Commercial Vehicle',
    vehicleCategory: 'LIGHT',
    totalCapacityKg: 1200,
    totalCapacityTonnes: 1.2,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Textiles & Garments',
      'FMCG & Packaged Goods'
    ],
    currentLocationCity: 'Hyderabad',
    currentLocationLandmark: 'Moosapet Terminal Bay 2',
    currentCoords: { lat: 17.4500, lng: 78.4300 },
    availabilityStatus: 'AVAILABLE',
    estimatedDeparture: 'Today, 09:15 PM',
    estimatedArrival: 'Tomorrow, 08:45 AM',
    estimatedTransitHours: 11.5,
    baseRateRs: 3200,
    perKmRateRs: 17,
    reservationFeeRs: 1400,
    rating: 4.88,
    ratingCount: 98,
    dimensions: '8.5ft × 5ft × 4.8ft (Covered Tarpaulin)'
  },

  // ----------------------------------------------------
  // MEDIUM FREIGHT TRUCKS - 3.5 - 5.0 Tonnes
  // ----------------------------------------------------
  {
    id: 'RSL-D201',
    registrationNumber: 'TS 08 FX 9022',
    carrierName: 'Telangana Speedlines',
    driverName: 'R. Veerabhadram',
    vehicleType: 'Medium Freight Truck',
    vehicleCategory: 'MEDIUM',
    totalCapacityKg: 5000,
    totalCapacityTonnes: 5.0,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Fragile Goods',
      'Industrial Materials',
      'Textiles & Garments',
      'FMCG & Packaged Goods'
    ],
    currentLocationCity: 'Hyderabad',
    currentLocationLandmark: 'LB Nagar Express Base',
    currentCoords: { lat: 17.3450, lng: 78.5520 },
    availabilityStatus: 'AVAILABLE',
    estimatedDeparture: 'Today, 08:00 PM',
    estimatedArrival: 'Tomorrow, 07:30 AM',
    estimatedTransitHours: 11.5,
    baseRateRs: 5200,
    perKmRateRs: 24,
    reservationFeeRs: 2200,
    rating: 4.95,
    ratingCount: 215,
    dimensions: '17ft × 7ft × 7ft (High-Deck Container)'
  },
  {
    id: 'RSL-D202',
    registrationNumber: 'AP 29 TV 8810',
    carrierName: 'Andhra-Corridor Dedicated',
    driverName: 'Ch. Prasad Rao',
    vehicleType: 'Medium Freight Truck',
    vehicleCategory: 'MEDIUM',
    totalCapacityKg: 3500,
    totalCapacityTonnes: 3.5,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'FMCG & Packaged Goods',
      'Electronics'
    ],
    currentLocationCity: 'Hyderabad',
    currentLocationLandmark: 'Hayathnagar Highway Depot',
    currentCoords: { lat: 17.3100, lng: 78.6800 },
    availabilityStatus: 'AVAILABLE',
    estimatedDeparture: 'Today, 09:30 PM',
    estimatedArrival: 'Tomorrow, 09:00 AM',
    estimatedTransitHours: 11.5,
    baseRateRs: 4600,
    perKmRateRs: 22,
    reservationFeeRs: 1900,
    rating: 4.86,
    ratingCount: 120,
    dimensions: '14ft × 6.5ft × 6.5ft (Closed Metal Box)'
  },

  // ----------------------------------------------------
  // HEAVY FREIGHT TRUCKS - 7.5 - 10.0 Tonnes
  // ----------------------------------------------------
  {
    id: 'RSL-D301',
    registrationNumber: 'TS 12 UB 6500',
    carrierName: 'Bharat Premier Logistics',
    driverName: 'Gurpreet Singh Gill',
    vehicleType: 'Heavy Freight Truck',
    vehicleCategory: 'HEAVY',
    totalCapacityKg: 10000,
    totalCapacityTonnes: 10.0,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'Heavy Machinery',
      'Textiles & Garments',
      'FMCG & Packaged Goods'
    ],
    currentLocationCity: 'Hyderabad',
    currentLocationLandmark: 'Medchal Industrial Concourse',
    currentCoords: { lat: 17.6280, lng: 78.4810 },
    availabilityStatus: 'AVAILABLE',
    estimatedDeparture: 'Today, 07:30 PM',
    estimatedArrival: 'Tomorrow, 07:00 AM',
    estimatedTransitHours: 11.5,
    baseRateRs: 7500,
    perKmRateRs: 32,
    reservationFeeRs: 3000,
    rating: 4.97,
    ratingCount: 340,
    dimensions: '24ft × 8ft × 8ft (All-Weather Heavy Hauler)'
  },
  {
    id: 'RSL-D302',
    registrationNumber: 'AP 16 TA 3044',
    carrierName: 'Krishna Coastal Freighters',
    driverName: 'D. Srinivas',
    vehicleType: 'Heavy Freight Truck',
    vehicleCategory: 'HEAVY',
    totalCapacityKg: 7500,
    totalCapacityTonnes: 7.5,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'Electronics',
      'Refrigerated Goods'
    ],
    currentLocationCity: 'Hyderabad',
    currentLocationLandmark: 'Shamshabad ORR Park',
    currentCoords: { lat: 17.2403, lng: 78.4294 },
    availabilityStatus: 'AVAILABLE',
    estimatedDeparture: 'Today, 10:00 PM',
    estimatedArrival: 'Tomorrow, 09:30 AM',
    estimatedTransitHours: 11.5,
    baseRateRs: 6800,
    perKmRateRs: 29,
    reservationFeeRs: 2600,
    rating: 4.89,
    ratingCount: 165,
    dimensions: '20ft × 7.5ft × 7.5ft (Insulated Closed Body)'
  },

  // ----------------------------------------------------
  // HEAVY DUTY FREIGHT TRUCKS - 14.0+ Tonnes
  // ----------------------------------------------------
  {
    id: 'RSL-D401',
    registrationNumber: 'OD 02 HB 7819',
    carrierName: 'National Logistics Corridors',
    driverName: 'Harjit Singh',
    vehicleType: 'Heavy Duty Freight Truck',
    vehicleCategory: 'HEAVY_DUTY',
    totalCapacityKg: 16000,
    totalCapacityTonnes: 16.0,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'Heavy Machinery',
      'FMCG & Packaged Goods'
    ],
    currentLocationCity: 'Hyderabad',
    currentLocationLandmark: 'ORR Patancheru Gate',
    currentCoords: { lat: 17.5300, lng: 78.2600 },
    availabilityStatus: 'AVAILABLE',
    estimatedDeparture: 'Today, 07:00 PM',
    estimatedArrival: 'Tomorrow, 06:30 AM',
    estimatedTransitHours: 11.5,
    baseRateRs: 9500,
    perKmRateRs: 42,
    reservationFeeRs: 4000,
    rating: 4.98,
    ratingCount: 410,
    dimensions: '32ft Multi-Axle Container Trailer'
  }
];
