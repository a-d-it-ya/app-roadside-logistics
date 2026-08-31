export interface SeedLocationData {
  vehicleReg: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  heading: number;
  accuracyMeters: number;
  source: string;
}

export const SEED_LOCATIONS: SeedLocationData[] = [
  // 1. OD 02 TC 8492: On NH-65 in-transit toward Chennai (Suryapet Bypass)
  {
    vehicleReg: 'OD 02 TC 8492',
    latitude: 17.1400,
    longitude: 79.6200,
    speedKmH: 62.5,
    heading: 135.0,
    accuracyMeters: 4.5,
    source: 'DRIVER_APP'
  },
  // 2. AP 31 TT 5510: At Hyderabad East Logistics Park (Hayathnagar)
  {
    vehicleReg: 'AP 31 TT 5510',
    latitude: 17.3100,
    longitude: 78.6800,
    speedKmH: 12.0,
    heading: 120.0,
    accuracyMeters: 3.2,
    source: 'DRIVER_APP'
  },
  // 3. MH 31 CB 7712: On Shamshabad Outer Ring Road heading toward Bengaluru
  {
    vehicleReg: 'MH 31 CB 7712',
    latitude: 17.2403,
    longitude: 78.4294,
    speedKmH: 56.0,
    heading: 190.0,
    accuracyMeters: 5.0,
    source: 'DRIVER_APP'
  },
  // 4. DL 01 AA 9920: Near Jaipur Bagru Terminal
  {
    vehicleReg: 'DL 01 AA 9920',
    latitude: 26.8124,
    longitude: 75.5473,
    speedKmH: 48.0,
    heading: 215.0,
    accuracyMeters: 4.0,
    source: 'DRIVER_APP'
  }
];
