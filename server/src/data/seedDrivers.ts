export interface SeedDriverData {
  fullName: string;
  phone: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'INACTIVE';
  assignedVehicleReg?: string;
}

export const SEED_DRIVERS: SeedDriverData[] = [
  {
    fullName: 'Rajesh Kumar Verma',
    phone: '9871122334',
    licenseNumber: 'DL-0220190084721',
    status: 'ON_TRIP',
    assignedVehicleReg: 'OD 02 TC 8492'
  },
  {
    fullName: 'Suresh Naidu',
    phone: '9848012345',
    licenseNumber: 'DL-3120180055102',
    status: 'AVAILABLE',
    assignedVehicleReg: 'AP 31 TT 5510'
  },
  {
    fullName: 'Mohammad Farooq',
    phone: '9822098765',
    licenseNumber: 'DL-3120170077123',
    status: 'ON_TRIP',
    assignedVehicleReg: 'MH 31 CB 7712'
  },
  {
    fullName: 'Gurpreet Singh Sandhu',
    phone: '9811054321',
    licenseNumber: 'DL-0120160099201',
    status: 'AVAILABLE',
    assignedVehicleReg: 'DL 01 AA 9920'
  },
  {
    fullName: 'Vikramaditya Pandey',
    phone: '9415067890',
    licenseNumber: 'DL-7820150063104',
    status: 'AVAILABLE',
    assignedVehicleReg: 'UP 78 BT 6310'
  },
  {
    fullName: 'Mohd Feroz Khan',
    phone: '9988776655',
    licenseNumber: 'DL-0820200192834',
    status: 'AVAILABLE',
    assignedVehicleReg: 'TS 08 UB 7712'
  },
  {
    fullName: 'Pareshbhai Patel',
    phone: '9898011223',
    licenseNumber: 'DL-0620140050805',
    status: 'AVAILABLE',
    assignedVehicleReg: 'GJ 06 AX 5080'
  }
];
