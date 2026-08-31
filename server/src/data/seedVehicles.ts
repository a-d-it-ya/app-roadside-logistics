export interface SeedVehicleData {
  registrationNumber: string;
  vehicleClass: string;
  vehicleType: string;
  totalCapacityKg: number;
  supportedCargoTypes: string[];
  status?: 'AVAILABLE' | 'ON_TRIP' | 'MAINTENANCE' | 'INACTIVE';
}

export const SEED_VEHICLES: SeedVehicleData[] = [
  {
    registrationNumber: 'OD 02 TC 8492',
    vehicleClass: '32ft Multi-Axle Heavy Truck (14T)',
    vehicleType: 'Heavy Truck',
    totalCapacityKg: 14000,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Fragile Goods',
      'FMCG & Packaged Goods'
    ],
    status: 'AVAILABLE'
  },
  {
    registrationNumber: 'AP 31 TT 5510',
    vehicleClass: '28ft Container Truck (10T)',
    vehicleType: 'Container Truck',
    totalCapacityKg: 10000,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'Textiles & Garments',
      'FMCG & Packaged Goods'
    ],
    status: 'AVAILABLE'
  },
  {
    registrationNumber: 'MH 31 CB 7712',
    vehicleClass: '40ft Heavy Multi-Axle Trailer (22T)',
    vehicleType: 'Heavy Truck',
    totalCapacityKg: 22000,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Industrial Materials',
      'Pharma & Medical Supplies',
      'Refrigerated Goods'
    ],
    status: 'AVAILABLE'
  },
  {
    registrationNumber: 'DL 01 AA 9920',
    vehicleClass: '32ft Container Truck (15T)',
    vehicleType: 'Container Truck',
    totalCapacityKg: 15000,
    supportedCargoTypes: [
      'General Cargo',
      'Textiles & Garments',
      'Industrial Materials',
      'Electronics',
      'FMCG & Packaged Goods'
    ],
    status: 'AVAILABLE'
  },
  {
    registrationNumber: 'UP 78 BT 6310',
    vehicleClass: '32ft Multi-Axle Heavy Truck (16T)',
    vehicleType: 'Heavy Truck',
    totalCapacityKg: 16000,
    supportedCargoTypes: [
      'General Cargo',
      'Industrial Materials',
      'FMCG & Packaged Goods',
      'Textiles & Garments'
    ],
    status: 'AVAILABLE'
  },
  {
    registrationNumber: 'TS 08 UB 7712',
    vehicleClass: '14ft Light Commercial Vehicle (3.5T)',
    vehicleType: 'Light Commercial Vehicle',
    totalCapacityKg: 3500,
    supportedCargoTypes: [
      'General Cargo',
      'Electronics',
      'Fragile Goods'
    ],
    status: 'AVAILABLE'
  },
  {
    registrationNumber: 'GJ 06 AX 5080',
    vehicleClass: '22ft Closed Body Truck (7T)',
    vehicleType: 'Closed Body Truck',
    totalCapacityKg: 7000,
    supportedCargoTypes: [
      'Textiles & Garments',
      'Industrial Materials',
      'General Cargo',
      'Electronics'
    ],
    status: 'AVAILABLE'
  }
];
