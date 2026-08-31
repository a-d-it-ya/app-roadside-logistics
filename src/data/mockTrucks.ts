import { Truck } from '../types/logistics';
import { FREIGHT_CORRIDORS } from './freightCorridors';

export const INITIAL_TRUCKS: Truck[] = [
  // ----------------------------------------------------
  // TRUCK 1: RSL-2048 (Odisha -> Chennai, Approaching Hyderabad -> BEST VALUE ✅)
  // ----------------------------------------------------
  {
    id: 'RSL-2048',
    registrationNumber: 'OD 02 TC 8492',
    driverName: 'Rajesh Kumar Verma',
    carrierName: 'Kalinga-Deccan Freight Express',
    vehicleClass: '32ft Multi-Axle Heavy Truck (14T)',
    vehicleType: 'Heavy Truck',
    origin: 'Bhubaneswar, Odisha',
    destination: 'Chennai',
    overallOrigin: 'Bhubaneswar, Odisha',
    overallDestination: 'Chennai, Tamil Nadu',
    currentLocation: { city: 'Hyderabad', landmark: 'NH-163 Warangal Corridor', latitude: 17.4300, longitude: 78.5800 },
    currentLocationName: 'NH-163 Corridor (Entering Hyderabad - Approaching Central Hub)',
    currentCoords: { lat: 17.4300, lng: 78.5800 },
    heading: 235,
    route: ['Bhubaneswar (Odisha)', 'Visakhapatnam', 'Warangal', 'Hyderabad Central Hub', 'Hyderabad East Hub', 'Vijayawada', 'Chennai'],
    routeStops: ['Bhubaneswar Hub', 'Visakhapatnam Node', 'Warangal Interchange', 'Hyderabad Central Hub', 'Hyderabad East Hub', 'Vijayawada', 'Chennai Port Gate'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-HYD-01',
        hubName: 'Hyderabad Central Freight Hub',
        city: 'Hyderabad',
        serviceRegion: 'Hyderabad',
        coordinates: { lat: 17.4420, lng: 78.4410 },
        estimatedArrivalMinutesFromNow: 48,
        pickupWindowStatus: 'approaching'
      },
      {
        hubId: 'HUB-HYD-03',
        hubName: 'Hyderabad East Logistics Park (LB Nagar)',
        city: 'Hyderabad',
        serviceRegion: 'Hyderabad',
        coordinates: { lat: 17.3100, lng: 78.6800 },
        estimatedArrivalMinutesFromNow: 85,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 14000,
    availableCapacityKg: 2400,
    bookedCapacityKg: 11600,
    status: 'Corridor Cruising',
    speedKmH: 64,
    nextHubEtaMinutes: 48,
    estimatedArrival: 'Tomorrow, 10:30 AM',
    rating: 4.9,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Fragile Goods',
      'FMCG & Packaged Goods'
    ],
    compatibleCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Fragile Goods'
    ],
    routePolyline: FREIGHT_CORRIDORS[1].coordinates,
    currentRouteProgress: 0.22,
    simulatedPriceEstimateRs: 4850
  },

  // ----------------------------------------------------
  // TRUCK 2: RSL-5510 (Visakhapatnam -> Hyderabad -> Chennai)
  // ----------------------------------------------------
  {
    id: 'RSL-5510',
    registrationNumber: 'AP 31 TT 5510',
    driverName: 'Suresh Naidu',
    carrierName: 'Coastal Corridors Cargo',
    vehicleClass: '28ft Container Truck (10T)',
    vehicleType: 'Container Truck',
    origin: 'Visakhapatnam',
    destination: 'Chennai',
    overallOrigin: 'Visakhapatnam, Andhra Pradesh',
    overallDestination: 'Chennai, Tamil Nadu',
    currentLocation: { city: 'Hyderabad', landmark: 'Hayathnagar Highway Gate', latitude: 17.3100, longitude: 78.6800 },
    currentLocationName: 'Hayathnagar Gate (At Hyderabad East Logistics Park)',
    currentCoords: { lat: 17.3100, lng: 78.6800 },
    heading: 145,
    route: ['Visakhapatnam', 'Khammam', 'Hyderabad East Hub', 'Suryapet', 'Vijayawada', 'Nellore', 'Chennai'],
    routeStops: ['Vizag Port Node', 'Khammam', 'Hyderabad East Hub', 'Suryapet', 'Vijayawada', 'Nellore', 'Chennai Port Gate'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-HYD-03',
        hubName: 'Hyderabad East Logistics Park (LB Nagar)',
        city: 'Hyderabad',
        serviceRegion: 'Hyderabad',
        coordinates: { lat: 17.3100, lng: 78.6800 },
        estimatedArrivalMinutesFromNow: 0,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 10000,
    availableCapacityKg: 3100,
    bookedCapacityKg: 6900,
    status: 'At Smart Hub',
    speedKmH: 0,
    nextHubEtaMinutes: 0,
    estimatedArrival: 'Tomorrow, 08:15 AM',
    rating: 4.8,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'Textiles & Garments',
      'FMCG & Packaged Goods'
    ],
    compatibleCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'Textiles & Garments'
    ],
    routePolyline: FREIGHT_CORRIDORS[1].coordinates,
    currentRouteProgress: 0.35,
    simulatedPriceEstimateRs: 4600
  },

  // ----------------------------------------------------
  // TRUCK 3: RSL-3190 (Nagpur -> Hyderabad -> Bengaluru -> FASTEST ⚡)
  // ----------------------------------------------------
  {
    id: 'RSL-3190',
    registrationNumber: 'MH 31 CB 7712',
    driverName: 'Mohammad Farooq',
    carrierName: 'Deccan Grand Trunk Logistics',
    vehicleClass: '40ft Heavy Multi-Axle Trailer (22T)',
    vehicleType: 'Heavy Truck',
    origin: 'Nagpur',
    destination: 'Bengaluru',
    overallOrigin: 'Nagpur, Maharashtra',
    overallDestination: 'Bengaluru, Karnataka',
    currentLocation: { city: 'Hyderabad', landmark: 'Shamshabad Outer Ring Road', latitude: 17.2403, longitude: 78.4294 },
    currentLocationName: 'NH-44 Outer Ring Interchange (At Shamshabad Freight Terminal)',
    currentCoords: { lat: 17.2403, lng: 78.4294 },
    heading: 180,
    route: ['Nagpur', 'Nizamabad', 'Hyderabad Central Hub', 'Hyderabad Outer Ring Terminal', 'Kurnool', 'Anantapur', 'Bengaluru'],
    routeStops: ['Nagpur MIHAN', 'Nizamabad', 'Hyderabad Central Hub', 'Hyderabad Outer Ring Terminal', 'Kurnool', 'Bengaluru Hosakote'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-HYD-02',
        hubName: 'Hyderabad Outer Ring Freight Terminal (Shamshabad)',
        city: 'Hyderabad',
        serviceRegion: 'Hyderabad',
        coordinates: { lat: 17.2403, lng: 78.4294 },
        estimatedArrivalMinutesFromNow: 0,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 22000,
    availableCapacityKg: 5200,
    bookedCapacityKg: 16800,
    status: 'Corridor Cruising',
    speedKmH: 72,
    nextHubEtaMinutes: 120,
    estimatedArrival: 'Tonight, 11:45 PM',
    rating: 4.95,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Pharma & Medical Supplies',
      'Refrigerated Goods'
    ],
    compatibleCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Pharma & Medical Supplies'
    ],
    routePolyline: FREIGHT_CORRIDORS[0].coordinates,
    currentRouteProgress: 0.48,
    simulatedPriceEstimateRs: 5200
  },

  // ----------------------------------------------------
  // TRUCK 4: RSL-7420 (Delhi-NCR -> Jaipur -> Ahmedabad -> Mumbai)
  // ----------------------------------------------------
  {
    id: 'RSL-7420',
    registrationNumber: 'DL 01 AA 9920',
    driverName: 'Gurpreet Singh Sandhu',
    carrierName: 'Western Golden Corridor Logistics',
    vehicleClass: '32ft Container Truck (15T)',
    vehicleType: 'Container Truck',
    origin: 'Delhi NCR',
    destination: 'Mumbai',
    overallOrigin: 'Delhi NCR (Manesar Terminal)',
    overallDestination: 'Mumbai (JNPT Maritime Node)',
    currentLocation: { city: 'Jaipur', landmark: 'Bagru Express Toll Concourse', latitude: 26.9124, longitude: 75.7873 },
    currentLocationName: 'NH-48 Expressway (Approaching Jaipur Bagru Logistics Park)',
    currentCoords: { lat: 26.9124, lng: 75.7873 },
    heading: 215,
    route: ['Delhi NCR', 'Neemrana', 'Jaipur', 'Ajmer', 'Udaipur', 'Ahmedabad', 'Surat', 'Mumbai'],
    routeStops: ['Delhi Manesar Hub', 'Jaipur Bagru Terminal', 'Udaipur Node', 'Ahmedabad Sanand Park', 'Surat Concourse', 'Mumbai JNPT'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-JAI-01',
        hubName: 'Jaipur Bagru Industrial Logistics Concourse',
        city: 'Jaipur',
        serviceRegion: 'Jaipur',
        coordinates: { lat: 26.9124, lng: 75.7873 },
        estimatedArrivalMinutesFromNow: 30,
        pickupWindowStatus: 'open'
      },
      {
        hubId: 'HUB-AMD-01',
        hubName: 'Ahmedabad Sanand Multi-Modal Logistics Park',
        city: 'Ahmedabad',
        serviceRegion: 'Ahmedabad',
        coordinates: { lat: 23.0225, lng: 72.5714 },
        estimatedArrivalMinutesFromNow: 310,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 15000,
    availableCapacityKg: 4200,
    bookedCapacityKg: 10800,
    status: 'Corridor Cruising',
    speedKmH: 68,
    nextHubEtaMinutes: 30,
    estimatedArrival: 'Tomorrow, 02:00 PM',
    rating: 4.88,
    supportedCargoTypes: [
      'General Cargo',
      'Textiles & Garments',
      'Industrial Materials',
      'Electronics',
      'FMCG & Packaged Goods'
    ],
    compatibleCargoTypes: [
      'General Cargo',
      'Textiles & Garments',
      'Industrial Materials'
    ],
    routePolyline: FREIGHT_CORRIDORS[4].coordinates,
    currentRouteProgress: 0.28,
    simulatedPriceEstimateRs: 6100
  },

  // ----------------------------------------------------
  // TRUCK 5: RSL-9250 (Delhi-NCR -> Kanpur -> Varanasi -> Kolkata)
  // ----------------------------------------------------
  {
    id: 'RSL-9250',
    registrationNumber: 'UP 78 BT 6310',
    driverName: 'Vikramaditya Pandey',
    carrierName: 'Grand Trunk Expressways Ltd',
    vehicleClass: '32ft Multi-Axle Heavy Truck (16T)',
    vehicleType: 'Heavy Truck',
    origin: 'Delhi NCR',
    destination: 'Kolkata',
    overallOrigin: 'Delhi NCR',
    overallDestination: 'Kolkata (Dankuni Terminal)',
    currentLocation: { city: 'Kanpur', landmark: 'Ganga Bridge Corridor', latitude: 26.8467, longitude: 80.9462 },
    currentLocationName: 'NH-19 Corridor (Passing Lucknow-Kanpur Expressway Concourse)',
    currentCoords: { lat: 26.8467, lng: 80.9462 },
    heading: 125,
    route: ['Delhi NCR', 'Agra', 'Kanpur', 'Prayagraj', 'Varanasi', 'Dhanbad', 'Asansol', 'Kolkata'],
    routeStops: ['Delhi Hub', 'Agra Concourse', 'Lucknow/Kanpur Hub', 'Varanasi Terminal', 'Dhanbad Node', 'Kolkata Dankuni Hub'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-LKO-01',
        hubName: 'Lucknow Trans-Ganga Expressway Logistics Park',
        city: 'Lucknow',
        serviceRegion: 'Lucknow',
        coordinates: { lat: 26.8467, lng: 80.9462 },
        estimatedArrivalMinutesFromNow: 15,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 16000,
    availableCapacityKg: 3800,
    bookedCapacityKg: 12200,
    status: 'Corridor Cruising',
    speedKmH: 62,
    nextHubEtaMinutes: 15,
    estimatedArrival: 'Tomorrow, 06:30 PM',
    rating: 4.85,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'FMCG & Packaged Goods',
      'Textiles & Garments'
    ],
    compatibleCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'FMCG & Packaged Goods'
    ],
    routePolyline: FREIGHT_CORRIDORS[5].coordinates,
    currentRouteProgress: 0.38,
    simulatedPriceEstimateRs: 6800
  },

  // ----------------------------------------------------
  // TRUCK 6: RSL-6012 (Kolkata -> Bhubaneswar -> Vizag -> Chennai)
  // ----------------------------------------------------
  {
    id: 'RSL-6012',
    registrationNumber: 'WB 25 E 4419',
    driverName: 'Subhasish Mondal',
    carrierName: 'Bengal-Coromandel Lines',
    vehicleClass: '28ft Container Truck (12T)',
    vehicleType: 'Container Truck',
    origin: 'Kolkata',
    destination: 'Chennai',
    overallOrigin: 'Kolkata, West Bengal',
    overallDestination: 'Chennai, Tamil Nadu',
    currentLocation: { city: 'Bhubaneswar', landmark: 'Rasulgarh Concourse', latitude: 20.2961, longitude: 85.8245 },
    currentLocationName: 'NH-16 (At Bhubaneswar Eastern Corridor Terminal)',
    currentCoords: { lat: 20.2961, lng: 85.8245 },
    heading: 205,
    route: ['Kolkata', 'Kharagpur', 'Balasore', 'Bhubaneswar', 'Visakhapatnam', 'Vijayawada', 'Chennai'],
    routeStops: ['Kolkata Dankuni Hub', 'Balasore Node', 'Bhubaneswar Hub', 'Vizag Port Hub', 'Vijayawada Hub', 'Chennai Port Gate'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-BBI-01',
        hubName: 'Bhubaneswar Eastern Corridor Terminal',
        city: 'Bhubaneswar',
        serviceRegion: 'Bhubaneswar',
        coordinates: { lat: 20.2961, lng: 85.8245 },
        estimatedArrivalMinutesFromNow: 0,
        pickupWindowStatus: 'open'
      },
      {
        hubId: 'HUB-VTZ-01',
        hubName: 'Visakhapatnam Port Gateway & Gajuwaka Concourse',
        city: 'Visakhapatnam',
        serviceRegion: 'Visakhapatnam',
        coordinates: { lat: 17.6868, lng: 83.2185 },
        estimatedArrivalMinutesFromNow: 240,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 12000,
    availableCapacityKg: 4500,
    bookedCapacityKg: 7500,
    status: 'Corridor Cruising',
    speedKmH: 65,
    nextHubEtaMinutes: 0,
    estimatedArrival: 'Tomorrow, 04:00 PM',
    rating: 4.92,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'Textiles & Garments',
      'Electronics',
      'Refrigerated Goods'
    ],
    compatibleCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'Textiles & Garments'
    ],
    routePolyline: FREIGHT_CORRIDORS[3].coordinates,
    currentRouteProgress: 0.35,
    simulatedPriceEstimateRs: 5900
  },

  // ----------------------------------------------------
  // TRUCK 7: RSL-8104 (Mumbai -> Pune -> Bengaluru -> Chennai)
  // ----------------------------------------------------
  {
    id: 'RSL-8104',
    registrationNumber: 'MH 12 QN 1084',
    driverName: 'Anand Shinde',
    carrierName: 'Sahyadri Inter-State Freightlines',
    vehicleClass: '32ft Multi-Axle Truck (14T)',
    vehicleType: 'Heavy Truck',
    origin: 'Mumbai',
    destination: 'Chennai',
    overallOrigin: 'Mumbai (JNPT Hub)',
    overallDestination: 'Chennai (Madhavaram Terminal)',
    currentLocation: { city: 'Pune', landmark: 'Chakan Auto Corridor Node', latitude: 18.5204, longitude: 73.8567 },
    currentLocationName: 'NH-48 Expressway (Passing Pune Chakan Hub)',
    currentCoords: { lat: 18.5204, lng: 73.8567 },
    heading: 140,
    route: ['Mumbai', 'Pune', 'Satara', 'Kolhapur', 'Belagavi', 'Hubballi', 'Davanagere', 'Bengaluru', 'Vellore', 'Chennai'],
    routeStops: ['Mumbai JNPT Hub', 'Pune Chakan Hub', 'Kolhapur Node', 'Hubballi Concourse', 'Bengaluru Hosakote Hub', 'Chennai Port Gate'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-PNQ-01',
        hubName: 'Pune Chakan Auto-Freight Concourse',
        city: 'Pune',
        serviceRegion: 'Pune',
        coordinates: { lat: 18.5204, lng: 73.8567 },
        estimatedArrivalMinutesFromNow: 10,
        pickupWindowStatus: 'open'
      },
      {
        hubId: 'HUB-BLR-01',
        hubName: 'Bengaluru Trans-Corridor Logistics Terminal',
        city: 'Bengaluru',
        serviceRegion: 'Bengaluru',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        estimatedArrivalMinutesFromNow: 540,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 14000,
    availableCapacityKg: 3500,
    bookedCapacityKg: 10500,
    status: 'Corridor Cruising',
    speedKmH: 70,
    nextHubEtaMinutes: 10,
    estimatedArrival: 'Tomorrow, 09:00 AM',
    rating: 4.89,
    supportedCargoTypes: [
      'Industrial Materials',
      'Electronics',
      'General Cargo',
      'Fragile Goods'
    ],
    compatibleCargoTypes: [
      'Industrial Materials',
      'Electronics',
      'General Cargo'
    ],
    routePolyline: FREIGHT_CORRIDORS[2].coordinates,
    currentRouteProgress: 0.18,
    simulatedPriceEstimateRs: 5400
  },

  // ----------------------------------------------------
  // TRUCK 8: RSL-3890 (Bengaluru -> Coimbatore -> Kochi)
  // ----------------------------------------------------
  {
    id: 'RSL-3890',
    registrationNumber: 'KL 07 CD 3890',
    driverName: 'Mathew Varghese',
    carrierName: 'Malabar Express Transports',
    vehicleClass: '22ft Closed Body Container (8T)',
    vehicleType: 'Closed Body Truck',
    origin: 'Bengaluru',
    destination: 'Kochi',
    overallOrigin: 'Bengaluru, Karnataka',
    overallDestination: 'Kochi (Vallarpadam Port)',
    currentLocation: { city: 'Coimbatore', landmark: 'Salem-Coimbatore Expressway', latitude: 11.0168, longitude: 76.9558 },
    currentLocationName: 'NH-544 (Crossing Coimbatore Industrial Belt towards Kochi)',
    currentCoords: { lat: 11.0168, lng: 76.9558 },
    heading: 220,
    route: ['Bengaluru', 'Hosur', 'Salem', 'Erode', 'Coimbatore', 'Thrissur', 'Kochi'],
    routeStops: ['Bengaluru Hosakote Hub', 'Salem Concourse', 'Coimbatore Node', 'Thrissur Gateway', 'Kochi Vallarpadam Hub'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-COK-01',
        hubName: 'Kochi Vallarpadam Port Logistics Terminal',
        city: 'Kochi',
        serviceRegion: 'Kochi',
        coordinates: { lat: 9.9312, lng: 76.2673 },
        estimatedArrivalMinutesFromNow: 160,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 8000,
    availableCapacityKg: 2800,
    bookedCapacityKg: 5200,
    status: 'Corridor Cruising',
    speedKmH: 60,
    nextHubEtaMinutes: 160,
    estimatedArrival: 'Tonight, 10:15 PM',
    rating: 4.94,
    supportedCargoTypes: [
      'Refrigerated Goods',
      'Textiles & Garments',
      'General Cargo',
      'FMCG & Packaged Goods'
    ],
    compatibleCargoTypes: [
      'Refrigerated Goods',
      'Textiles & Garments',
      'General Cargo'
    ],
    routePolyline: FREIGHT_CORRIDORS[7].coordinates,
    currentRouteProgress: 0.65,
    simulatedPriceEstimateRs: 3800
  },

  // ----------------------------------------------------
  // TRUCK 9: RSL-4415 (Lucknow -> Siliguri -> Guwahati)
  // ----------------------------------------------------
  {
    id: 'RSL-4415',
    registrationNumber: 'AS 01 GC 4415',
    driverName: 'Biren Kalita',
    carrierName: 'Brahmaputra Freight Carriers',
    vehicleClass: '28ft Heavy Cargo Truck (11T)',
    vehicleType: 'Heavy Truck',
    origin: 'Lucknow',
    destination: 'Guwahati',
    overallOrigin: 'Lucknow, Uttar Pradesh',
    overallDestination: 'Guwahati (Changsari Terminal)',
    currentLocation: { city: 'Siliguri', landmark: 'Corridor Gateway Node', latitude: 26.7271, longitude: 88.3953 },
    currentLocationName: 'NH-27 East-West Expressway (Approaching Siliguri Gateway Concourse)',
    currentCoords: { lat: 26.7271, lng: 88.3953 },
    heading: 105,
    route: ['Lucknow', 'Gorakhpur', 'Muzaffarpur', 'Siliguri', 'Alipurduar', 'Guwahati'],
    routeStops: ['Lucknow Logistics Park', 'Gorakhpur Node', 'Siliguri Concourse', 'Guwahati Changsari Hub'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-GAU-01',
        hubName: 'Guwahati North-East Gateway Logistics Hub',
        city: 'Guwahati',
        serviceRegion: 'Guwahati',
        coordinates: { lat: 26.1445, lng: 91.7362 },
        estimatedArrivalMinutesFromNow: 360,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 11000,
    availableCapacityKg: 3400,
    bookedCapacityKg: 7600,
    status: 'Corridor Cruising',
    speedKmH: 58,
    nextHubEtaMinutes: 360,
    estimatedArrival: 'Tomorrow, 07:00 AM',
    rating: 4.87,
    supportedCargoTypes: [
      'FMCG & Packaged Goods',
      'General Cargo',
      'Pharma & Medical Supplies',
      'Textiles & Garments'
    ],
    compatibleCargoTypes: [
      'FMCG & Packaged Goods',
      'General Cargo',
      'Pharma & Medical Supplies'
    ],
    routePolyline: FREIGHT_CORRIDORS[6].coordinates,
    currentRouteProgress: 0.72,
    simulatedPriceEstimateRs: 7200
  },

  // ----------------------------------------------------
  // TRUCK 10: RSL-5080 (Ahmedabad -> Surat -> Mumbai -> Pune)
  // ----------------------------------------------------
  {
    id: 'RSL-5080',
    registrationNumber: 'GJ 06 AX 5080',
    driverName: 'Pareshbhai Patel',
    carrierName: 'Gujarat Super-Corridor Express',
    vehicleClass: '22ft Closed Body Truck (7T)',
    vehicleType: 'Closed Body Truck',
    origin: 'Ahmedabad',
    destination: 'Pune',
    overallOrigin: 'Ahmedabad (Sanand Park)',
    overallDestination: 'Pune (Chakan Concourse)',
    currentLocation: { city: 'Surat', landmark: 'Hazira Expressway Toll', latitude: 21.1702, longitude: 72.8311 },
    currentLocationName: 'NH-48 Golden Corridor (At Surat Hazira Concourse)',
    currentCoords: { lat: 21.1702, lng: 72.8311 },
    heading: 190,
    route: ['Ahmedabad', 'Vadodara', 'Surat', 'Vapi', 'Mumbai', 'Pune'],
    routeStops: ['Ahmedabad Sanand Hub', 'Vadodara Node', 'Surat Hazira Hub', 'Mumbai JNPT Hub', 'Pune Chakan Hub'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-ST-01',
        hubName: 'Surat Hazira Port & Textile Freight Concourse',
        city: 'Surat',
        serviceRegion: 'Surat',
        coordinates: { lat: 21.1702, lng: 72.8311 },
        estimatedArrivalMinutesFromNow: 0,
        pickupWindowStatus: 'open'
      },
      {
        hubId: 'HUB-BOM-01',
        hubName: 'Mumbai JNPT Nava-Sheva Smart Maritime Node',
        city: 'Mumbai',
        serviceRegion: 'Mumbai',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        estimatedArrivalMinutesFromNow: 210,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 7000,
    availableCapacityKg: 2100,
    bookedCapacityKg: 4900,
    status: 'At Smart Hub',
    speedKmH: 0,
    nextHubEtaMinutes: 0,
    estimatedArrival: 'Tonight, 11:30 PM',
    rating: 4.91,
    supportedCargoTypes: [
      'Textiles & Garments',
      'Industrial Materials',
      'General Cargo',
      'Electronics'
    ],
    compatibleCargoTypes: [
      'Textiles & Garments',
      'Industrial Materials',
      'General Cargo'
    ],
    routePolyline: FREIGHT_CORRIDORS[4].coordinates,
    currentRouteProgress: 0.68,
    simulatedPriceEstimateRs: 3400
  },

  // ----------------------------------------------------
  // TRUCK 11: RSL-6640 (Indore -> Dhule -> Nashik -> Mumbai)
  // ----------------------------------------------------
  {
    id: 'RSL-6640',
    registrationNumber: 'MP 09 GG 6640',
    driverName: 'Devendra Joshi',
    carrierName: 'Malwa-Konkan Highway Cargo',
    vehicleClass: '28ft Container Truck (10T)',
    vehicleType: 'Container Truck',
    origin: 'Indore',
    destination: 'Mumbai',
    overallOrigin: 'Indore (Pithampur SEZ)',
    overallDestination: 'Mumbai (JNPT Hub)',
    currentLocation: { city: 'Dhule', landmark: 'NH-52 Crossing', latitude: 20.9042, longitude: 74.7749 },
    currentLocationName: 'NH-52 (Cruising past Dhule towards Nashik & Mumbai)',
    currentCoords: { lat: 20.9042, lng: 74.7749 },
    heading: 210,
    route: ['Indore', 'Mhow', 'Dhule', 'Malegaon', 'Nashik', 'Thane', 'Mumbai'],
    routeStops: ['Indore Pithampur Hub', 'Dhule Node', 'Nashik Concourse', 'Mumbai JNPT Hub'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-IDR-01',
        hubName: 'Indore Pithampur Smart Logistics Dock',
        city: 'Indore',
        serviceRegion: 'Indore',
        coordinates: { lat: 22.7196, lng: 75.8577 },
        estimatedArrivalMinutesFromNow: 0,
        pickupWindowStatus: 'open'
      },
      {
        hubId: 'HUB-BOM-01',
        hubName: 'Mumbai JNPT Nava-Sheva Smart Maritime Node',
        city: 'Mumbai',
        serviceRegion: 'Mumbai',
        coordinates: { lat: 19.0760, lng: 72.8777 },
        estimatedArrivalMinutesFromNow: 280,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 10000,
    availableCapacityKg: 3100,
    bookedCapacityKg: 6900,
    status: 'Corridor Cruising',
    speedKmH: 64,
    nextHubEtaMinutes: 280,
    estimatedArrival: 'Tomorrow, 05:45 AM',
    rating: 4.86,
    supportedCargoTypes: [
      'Pharma & Medical Supplies',
      'Industrial Materials',
      'General Cargo',
      'FMCG & Packaged Goods'
    ],
    compatibleCargoTypes: [
      'Pharma & Medical Supplies',
      'Industrial Materials',
      'General Cargo'
    ],
    routePolyline: FREIGHT_CORRIDORS[4].coordinates,
    currentRouteProgress: 0.45,
    simulatedPriceEstimateRs: 4100
  },

  // ----------------------------------------------------
  // TRUCK 12: RSL-1920 (Ludhiana -> Delhi -> Agra -> Nagpur)
  // ----------------------------------------------------
  {
    id: 'RSL-1920',
    registrationNumber: 'PB 10 Z 1920',
    driverName: 'Harpreet Singh Cheema',
    carrierName: 'Punjab National Freight Line',
    vehicleClass: '40ft Multi-Axle Heavy Truck (20T)',
    vehicleType: 'Heavy Truck',
    origin: 'Ludhiana',
    destination: 'Nagpur',
    overallOrigin: 'Ludhiana (Sahnewal Dry Port)',
    overallDestination: 'Nagpur (MIHAN Hub)',
    currentLocation: { city: 'Agra', landmark: 'Yamuna Expressway Concourse', latitude: 27.1767, longitude: 78.0081 },
    currentLocationName: 'NH-44 North Trunk (Crossing Agra towards Gwalior & Nagpur)',
    currentCoords: { lat: 27.1767, lng: 78.0081 },
    heading: 175,
    route: ['Ludhiana', 'Ambala', 'Delhi NCR', 'Agra', 'Gwalior', 'Jhansi', 'Jabalpur', 'Nagpur'],
    routeStops: ['Ludhiana Hub', 'Delhi Manesar Hub', 'Agra Node', 'Gwalior Node', 'Jhansi Interchange', 'Nagpur MIHAN Hub'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-LUH-01',
        hubName: 'Ludhiana Sahnewal Dry Port & Freight Concourse',
        city: 'Ludhiana',
        serviceRegion: 'Ludhiana',
        coordinates: { lat: 30.9010, lng: 75.8573 },
        estimatedArrivalMinutesFromNow: 0,
        pickupWindowStatus: 'open'
      },
      {
        hubId: 'HUB-DEL-01',
        hubName: 'Delhi NCR Northern Multi-Modal Hub',
        city: 'Delhi NCR',
        serviceRegion: 'Delhi NCR',
        coordinates: { lat: 28.6139, lng: 77.2090 },
        estimatedArrivalMinutesFromNow: 0,
        pickupWindowStatus: 'open'
      },
      {
        hubId: 'HUB-NAG-01',
        hubName: 'Nagpur Central Zero-Mile Intermodal Hub',
        city: 'Nagpur',
        serviceRegion: 'Nagpur',
        coordinates: { lat: 21.1458, lng: 79.0882 },
        estimatedArrivalMinutesFromNow: 480,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 20000,
    availableCapacityKg: 6400,
    bookedCapacityKg: 13600,
    status: 'Corridor Cruising',
    speedKmH: 66,
    nextHubEtaMinutes: 480,
    estimatedArrival: 'Tomorrow, 01:30 PM',
    rating: 4.93,
    supportedCargoTypes: [
      'Textiles & Garments',
      'Industrial Materials',
      'General Cargo',
      'FMCG & Packaged Goods'
    ],
    compatibleCargoTypes: [
      'Textiles & Garments',
      'Industrial Materials',
      'General Cargo'
    ],
    routePolyline: FREIGHT_CORRIDORS[8].coordinates,
    currentRouteProgress: 0.40,
    simulatedPriceEstimateRs: 5800
  },

  // ----------------------------------------------------
  // TRUCK 13: RSL-8840 (Chennai -> Nellore -> Vijayawada -> Hyderabad -> BEST VALUE NORTHBOUND ✅)
  // ----------------------------------------------------
  {
    id: 'RSL-8840',
    registrationNumber: 'TN 04 BC 8840',
    driverName: 'M. Senthil Nathan',
    carrierName: 'Coromandel-Deccan Express Line',
    vehicleClass: '32ft Multi-Axle Heavy Truck (14T)',
    vehicleType: 'Heavy Truck',
    origin: 'Chennai',
    destination: 'Hyderabad',
    overallOrigin: 'Chennai, Tamil Nadu',
    overallDestination: 'Hyderabad, Telangana',
    currentLocation: { city: 'Chennai', landmark: 'Madhavaram Northern Concourse', latitude: 13.1480, longitude: 80.2310 },
    currentLocationName: 'NH-16 Northern Express (At Chennai Port Gateway Hub)',
    currentCoords: { lat: 13.1480, lng: 80.2310 },
    heading: 340,
    route: ['Chennai', 'Nellore', 'Ongole', 'Vijayawada', 'Suryapet', 'Hyderabad Central Hub'],
    routeStops: ['Chennai Port Gateway Hub', 'Nellore Interchange', 'Ongole Node', 'Vijayawada Bypass', 'Suryapet Dock', 'Hyderabad Central Hub'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-MAA-01',
        hubName: 'Chennai Port Gateway & Madhavaram Terminal',
        city: 'Chennai',
        serviceRegion: 'Chennai',
        coordinates: { lat: 13.1480, lng: 80.2310 },
        estimatedArrivalMinutesFromNow: 35,
        pickupWindowStatus: 'approaching'
      },
      {
        hubId: 'HUB-MAA-02',
        hubName: 'Sriperumbudur Auto-Freight Corridor Hub',
        city: 'Chennai',
        serviceRegion: 'Chennai',
        coordinates: { lat: 12.9690, lng: 79.9410 },
        estimatedArrivalMinutesFromNow: 70,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 14000,
    availableCapacityKg: 3800,
    bookedCapacityKg: 10200,
    status: 'Corridor Cruising',
    speedKmH: 62,
    nextHubEtaMinutes: 35,
    estimatedArrival: 'Tomorrow, 07:30 AM',
    rating: 4.92,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Fragile Goods',
      'Textiles & Garments',
      'FMCG & Packaged Goods'
    ],
    compatibleCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Fragile Goods',
      'Textiles & Garments'
    ],
    routePolyline: FREIGHT_CORRIDORS[1].coordinates,
    currentRouteProgress: 0.10,
    simulatedPriceEstimateRs: 4750
  },

  // ----------------------------------------------------
  // TRUCK 14: RSL-4920 (Chennai -> Sriperumbudur -> Vellore -> Bengaluru)
  // ----------------------------------------------------
  {
    id: 'RSL-4920',
    registrationNumber: 'TN 22 AX 4920',
    driverName: 'R. Karthik',
    carrierName: 'Southern Star Logistics',
    vehicleClass: '28ft Container Truck (10T)',
    vehicleType: 'Container Truck',
    origin: 'Chennai',
    destination: 'Bengaluru',
    overallOrigin: 'Chennai (Sriperumbudur Hub)',
    overallDestination: 'Bengaluru (Hosakote Terminal)',
    currentLocation: { city: 'Chennai', landmark: 'Sriperumbudur SIPCOT Gate', latitude: 12.9690, longitude: 79.9410 },
    currentLocationName: 'Sriperumbudur Hub Concourse (Loading at Bay 4)',
    currentCoords: { lat: 12.9690, lng: 79.9410 },
    heading: 260,
    route: ['Chennai', 'Sriperumbudur Hub', 'Vellore', 'Hosur', 'Bengaluru'],
    routeStops: ['Chennai Madhavaram', 'Sriperumbudur Hub', 'Vellore Node', 'Hosur Border', 'Bengaluru Hosakote'],
    optionalServiceHubs: [
      {
        hubId: 'HUB-MAA-02',
        hubName: 'Sriperumbudur Auto-Freight Corridor Hub',
        city: 'Chennai',
        serviceRegion: 'Chennai',
        coordinates: { lat: 12.9690, lng: 79.9410 },
        estimatedArrivalMinutesFromNow: 25,
        pickupWindowStatus: 'open'
      }
    ],
    totalCapacityKg: 10000,
    availableCapacityKg: 2800,
    bookedCapacityKg: 7200,
    status: 'At Smart Hub',
    speedKmH: 0,
    nextHubEtaMinutes: 25,
    estimatedArrival: 'Tonight, 11:30 PM',
    rating: 4.88,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Pharma & Medical Supplies'
    ],
    compatibleCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials'
    ],
    routePolyline: FREIGHT_CORRIDORS[4].coordinates,
    currentRouteProgress: 0.15,
    simulatedPriceEstimateRs: 3900
  }
];
