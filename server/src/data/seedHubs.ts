export interface SeedHubData {
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  hubType: 'PRIMARY_GATEWAY' | 'REGIONAL_CROSSDOCK' | 'TRANSIT_TERMINAL' | 'CORRIDOR_HUB' | 'WAREHOUSE';
  supportedCargoTypes: string[];
  capacityStatus?: 'Available' | 'Limited' | 'Full';
}

export const SEED_HUBS: SeedHubData[] = [
  // ----------------------------------------------------
  // HYDERABAD REGION
  // ----------------------------------------------------
  {
    code: 'HUB-HYD-01',
    name: 'Hyderabad Central Freight Hub',
    address: 'Moosapet Main Road, Sanathnagar Industrial Area, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.4420,
    longitude: 78.4410,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['General Cargo', 'Electronics', 'Industrial Materials', 'Pharma & Medical Supplies', 'FMCG & Packaged Goods'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-HYD-02',
    name: 'Hyderabad Outer Ring Freight Terminal',
    address: 'Outer Ring Road Junction, Shamshabad Cargo Terminal, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.2403,
    longitude: 78.4294,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['General Cargo', 'Electronics', 'Industrial Materials', 'Refrigerated Goods', 'Pharma & Medical Supplies'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-HYD-03',
    name: 'Hyderabad East Logistics Park',
    address: 'NH-65 Highway Junction, Hayathnagar Gate (Near LB Nagar), Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.3100,
    longitude: 78.6800,
    hubType: 'CORRIDOR_HUB',
    supportedCargoTypes: ['General Cargo', 'Industrial Materials', 'Textiles & Garments', 'Fragile Goods', 'FMCG & Packaged Goods'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-HYD-04',
    name: 'Hyderabad North Express Dock',
    address: 'NH-44 Medchal Industrial Corridor, North Entry Gate, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.6280,
    longitude: 78.4810,
    hubType: 'TRANSIT_TERMINAL',
    supportedCargoTypes: ['General Cargo', 'Industrial Materials', 'Heavy Machinery', 'Automotive Parts'],
    capacityStatus: 'Available'
  },

  // ----------------------------------------------------
  // BENGALURU REGION
  // ----------------------------------------------------
  {
    code: 'HUB-BLR-01',
    name: 'Bengaluru Whitefield Multi-Modal Hub',
    address: 'Export Promotion Industrial Park, Whitefield, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9698,
    longitude: 77.7500,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['Electronics', 'General Cargo', 'Pharma & Medical Supplies', 'Fragile Goods', 'FMCG & Packaged Goods'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-BLR-02',
    name: 'Bengaluru Electronic City Trans-Corridor Terminal',
    address: 'Hosur Road, Bommasandra Industrial Area, Electronic City, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.8399,
    longitude: 77.6770,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['General Cargo', 'Electronics', 'Textiles & Garments', 'Automotive Parts'],
    capacityStatus: 'Available'
  },

  // ----------------------------------------------------
  // CHENNAI REGION
  // ----------------------------------------------------
  {
    code: 'HUB-MAA-01',
    name: 'Chennai Port Smart Logistics Gateway',
    address: 'Ennore High Road, Port Access Concourse, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['General Cargo', 'Automotive Parts', 'Industrial Materials', 'Textiles & Garments', 'Electronics'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-MAA-02',
    name: 'Chennai Sriperumbudur Industrial Hub',
    address: 'SIPCOT Industrial Park, Sriperumbudur, Chennai West',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 12.9675,
    longitude: 79.9404,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['Automotive Parts', 'Electronics', 'Heavy Machinery', 'Industrial Materials'],
    capacityStatus: 'Available'
  },

  // ----------------------------------------------------
  // MUMBAI & PUNE REGION
  // ----------------------------------------------------
  {
    code: 'HUB-BOM-01',
    name: 'Mumbai JNPT Nava-Sheva Smart Maritime Node',
    address: 'JNPT SEZ Sector 4, Nhava Sheva, Navi Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['General Cargo', 'Industrial Materials', 'Pharma & Medical Supplies', 'Chemicals & Hazardous', 'Textiles & Garments'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-BOM-02',
    name: 'Bhiwandi Mega Freight Consolidation Terminal',
    address: 'Mankoli Naka, Mumbai-Nashik Highway, Bhiwandi',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.2967,
    longitude: 73.0631,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['FMCG & Packaged Goods', 'Textiles & Garments', 'General Cargo', 'Electronics'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-PUN-01',
    name: 'Pune Chakan Auto & Heavy Freight Terminal',
    address: 'MIDC Phase 2, Chakan Industrial Area, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.7562,
    longitude: 73.8580,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['Automotive Parts', 'Industrial Materials', 'Heavy Machinery', 'General Cargo'],
    capacityStatus: 'Available'
  },

  // ----------------------------------------------------
  // GUJARAT & WESTERN CORRIDOR
  // ----------------------------------------------------
  {
    code: 'HUB-AMD-01',
    name: 'Ahmedabad Sanand Multi-Modal Logistics Park',
    address: 'Sanand GIDC Industrial Estate, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    latitude: 22.9868,
    longitude: 72.3812,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['Automotive Parts', 'Textiles & Garments', 'Chemicals & Hazardous', 'General Cargo'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-ST-01',
    name: 'Surat Hazira Port & Textile Freight Concourse',
    address: 'Hazira Industrial Belt, Ichhapore, Surat',
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    latitude: 21.1702,
    longitude: 72.8311,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['Textiles & Garments', 'Industrial Materials', 'General Cargo', 'Chemicals & Hazardous'],
    capacityStatus: 'Available'
  },

  // ----------------------------------------------------
  // DELHI NCR & NORTHERN CORRIDOR
  // ----------------------------------------------------
  {
    code: 'HUB-DEL-01',
    name: 'Delhi-NCR Manesar Industrial Freight Gateway',
    address: 'Sector 8 IMT Manesar, Delhi-Jaipur Expressway, Gurugram',
    city: 'Delhi NCR',
    state: 'Haryana',
    country: 'India',
    latitude: 28.3588,
    longitude: 76.9405,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['Electronics', 'Automotive Parts', 'FMCG & Packaged Goods', 'General Cargo', 'Pharma & Medical Supplies'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-JAI-01',
    name: 'Jaipur Bagru Industrial Logistics Concourse',
    address: 'RIICO Industrial Area, Bagru, Ajmer Road, Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    latitude: 26.8124,
    longitude: 75.5473,
    hubType: 'CORRIDOR_HUB',
    supportedCargoTypes: ['Textiles & Garments', 'General Cargo', 'Industrial Materials'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-LKO-01',
    name: 'Lucknow Trans-Ganga Expressway Logistics Park',
    address: 'Agra-Lucknow Expressway Interchange, Mohan Road, Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    latitude: 26.8467,
    longitude: 80.9462,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['General Cargo', 'FMCG & Packaged Goods', 'Textiles & Garments', 'Industrial Materials'],
    capacityStatus: 'Available'
  },

  // ----------------------------------------------------
  // CENTRAL & EASTERN CORRIDORS
  // ----------------------------------------------------
  {
    code: 'HUB-NAG-01',
    name: 'Nagpur MIHAN Multi-Modal Logistics Hub',
    address: 'MIHAN SEZ Cargo City, Wardha Road, Nagpur',
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    latitude: 21.0560,
    longitude: 79.0320,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['General Cargo', 'Industrial Materials', 'Pharma & Medical Supplies', 'Refrigerated Goods'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-IDR-01',
    name: 'Indore Pithampur Smart Logistics Dock',
    address: 'Sector 3 Pithampur Industrial Belt, Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    latitude: 22.6196,
    longitude: 75.6877,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['Pharma & Medical Supplies', 'Automotive Parts', 'General Cargo'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-CCU-01',
    name: 'Kolkata Dankuni Logistics Hub',
    address: 'Dankuni Multi-Modal Freight Complex, Hooghly, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    latitude: 22.6865,
    longitude: 88.2917,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['General Cargo', 'FMCG & Packaged Goods', 'Industrial Materials', 'Textiles & Garments'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-BBI-01',
    name: 'Bhubaneswar Eastern Corridor Terminal',
    address: 'NH-16 Rasulgarh Industrial Concourse, Bhubaneswar',
    city: 'Bhubaneswar',
    state: 'Odisha',
    country: 'India',
    latitude: 20.2961,
    longitude: 85.8245,
    hubType: 'CORRIDOR_HUB',
    supportedCargoTypes: ['Industrial Materials', 'General Cargo', 'Heavy Machinery'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-VTZ-01',
    name: 'Visakhapatnam Port Express Logistics Node',
    address: 'Port Area, NH-16 Cargo Terminal, Visakhapatnam',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    country: 'India',
    latitude: 17.6868,
    longitude: 83.2185,
    hubType: 'REGIONAL_CROSSDOCK',
    supportedCargoTypes: ['Industrial Materials', 'General Cargo', 'Chemicals & Hazardous', 'Textiles & Garments'],
    capacityStatus: 'Available'
  },
  {
    code: 'HUB-GAU-01',
    name: 'Guwahati North-East Gateway Logistics Hub',
    address: 'Changsari Multi-Modal Freight Terminal, Kamrup, Guwahati',
    city: 'Guwahati',
    state: 'Assam',
    country: 'India',
    latitude: 26.2445,
    longitude: 91.6862,
    hubType: 'PRIMARY_GATEWAY',
    supportedCargoTypes: ['General Cargo', 'FMCG & Packaged Goods', 'Textiles & Garments', 'Pharma & Medical Supplies'],
    capacityStatus: 'Available'
  }
];
