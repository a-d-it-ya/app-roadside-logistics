import { FreightCorridor } from '../types/logistics';

export const FREIGHT_CORRIDORS: FreightCorridor[] = [
  // 1. NH-44 North-South Grand Trunk (Nagpur - Hyderabad - Bengaluru)
  {
    id: 'CORR-NH44-SOUTH',
    name: 'NH-44 North-South Expressway (Nagpur - Hyd - Blr)',
    highwayCode: 'NH-44',
    color: '#06b6d4', // cyan-500
    coordinates: [
      [21.1458, 79.0882], // Nagpur
      [19.6766, 78.5320], // Adilabad
      [18.6725, 78.0941], // Nizamabad
      [17.3850, 78.4867], // Hyderabad
      [16.7488, 77.9944], // Jadcherla
      [15.8281, 78.0373], // Kurnool
      [14.6819, 77.6006], // Anantapur
      [13.6288, 77.7126], // Chikkaballapur
      [12.9716, 77.5946]  // Bengaluru
    ]
  },
  // 2. NH-65 / NH-16 (Hyderabad - Vijayawada - Chennai)
  {
    id: 'CORR-NH65-HYD-MAA',
    name: 'NH-65 / NH-16 (Hyderabad - Vijayawada - Chennai)',
    highwayCode: 'NH-65/16',
    color: '#10b981', // emerald-500
    coordinates: [
      [17.3850, 78.4867], // Hyderabad
      [17.1883, 79.6239], // Suryapet
      [16.5062, 80.6480], // Vijayawada
      [16.2997, 80.4439], // Guntur
      [15.5057, 80.0499], // Ongole
      [14.4426, 79.9865], // Nellore
      [13.0827, 80.2707]  // Chennai
    ]
  },
  // 3. NH-48 Golden Western Corridor (Mumbai - Pune - Blr - Chennai)
  {
    id: 'CORR-NH48-WEST',
    name: 'NH-48 Golden Western Corridor (Mumbai - Pune - Blr - Chennai)',
    highwayCode: 'NH-48',
    color: '#3b82f6', // blue-500
    coordinates: [
      [19.0760, 72.8777], // Mumbai
      [18.5204, 73.8567], // Pune
      [17.6805, 74.0183], // Satara
      [16.7050, 74.2433], // Kolhapur
      [15.8497, 74.4977], // Belagavi
      [15.3647, 75.1240], // Hubballi
      [14.4644, 75.9218], // Davanagere
      [13.3409, 77.1010], // Tumakuru
      [12.9716, 77.5946], // Bengaluru
      [12.9165, 79.1325], // Vellore
      [13.0827, 80.2707]  // Chennai
    ]
  },
  // 4. NH-16 East Coast Freight Spine (Kolkata - Bhubaneswar - Vizag - Chennai)
  {
    id: 'CORR-NH16-EAST',
    name: 'NH-16 East Coast Freight Spine (Kolkata - Vizag - Chennai)',
    highwayCode: 'NH-16',
    color: '#f59e0b', // amber-500
    coordinates: [
      [22.5726, 88.3639], // Kolkata
      [22.3302, 87.3237], // Kharagpur
      [21.4934, 86.9135], // Balasore
      [20.2961, 85.8245], // Bhubaneswar
      [19.3149, 84.7941], // Berhampur
      [18.2949, 83.8938], // Srikakulam
      [17.6868, 83.2185], // Visakhapatnam
      [17.0005, 81.8040], // Rajahmundry
      [16.5062, 80.6480], // Vijayawada
      [14.4426, 79.9865], // Nellore
      [13.0827, 80.2707]  // Chennai
    ]
  },
  // 5. NH-48 Western Industrial Corridor (Delhi - Jaipur - Ahmedabad - Mumbai)
  {
    id: 'CORR-NH48-DEL-MUM',
    name: 'NH-48 Western Spine (Delhi - Jaipur - Ahmedabad - Mumbai)',
    highwayCode: 'NH-48',
    color: '#ec4899', // pink-500
    coordinates: [
      [28.6139, 77.2090], // Delhi
      [27.8974, 76.2800], // Neemrana / Behror
      [26.9124, 75.7873], // Jaipur
      [26.4499, 74.6399], // Ajmer
      [24.5854, 73.7125], // Udaipur
      [23.0225, 72.5714], // Ahmedabad
      [22.3072, 73.1812], // Vadodara
      [21.1702, 72.8311], // Surat
      [20.3893, 72.9106], // Vapi
      [19.0760, 72.8777]  // Mumbai
    ]
  },
  // 6. NH-19 Grand Trunk Corridor (Delhi - Kanpur - Varanasi - Kolkata)
  {
    id: 'CORR-NH19-GT',
    name: 'NH-19 Grand Trunk Corridor (Delhi - Kanpur - Varanasi - Kolkata)',
    highwayCode: 'NH-19',
    color: '#8b5cf6', // violet-500
    coordinates: [
      [28.6139, 77.2090], // Delhi
      [27.1767, 78.0081], // Agra
      [26.8467, 80.9462], // Lucknow/Kanpur
      [25.4358, 81.8463], // Prayagraj
      [25.3176, 82.9739], // Varanasi
      [24.7914, 85.0002], // Gaya
      [23.7957, 86.4304], // Dhanbad
      [23.6889, 86.9661], // Asansol
      [22.5726, 88.3639]  // Kolkata
    ]
  },
  // 7. NH-27 North-East Gateway (Lucknow - Gorakhpur - Siliguri - Guwahati)
  {
    id: 'CORR-NH27-NE',
    name: 'NH-27 North-East Express Corridor (Lucknow - Siliguri - Guwahati)',
    highwayCode: 'NH-27',
    color: '#14b8a6', // teal-500
    coordinates: [
      [26.8467, 80.9462], // Lucknow
      [26.7606, 83.3732], // Gorakhpur
      [26.1209, 85.3647], // Muzaffarpur
      [26.7271, 88.3953], // Siliguri
      [26.1445, 91.7362]  // Guwahati
    ]
  },
  // 8. NH-544 / NH-44 South Western Terminal (Bengaluru - Coimbatore - Kochi)
  {
    id: 'CORR-NH544-SOUTH',
    name: 'NH-544 Malabar & Kaveri Corridor (Bengaluru - Coimbatore - Kochi)',
    highwayCode: 'NH-544',
    color: '#eab308', // yellow-500
    coordinates: [
      [12.9716, 77.5946], // Bengaluru
      [12.5186, 78.2138], // Hosur
      [11.6643, 78.1460], // Salem
      [11.3410, 77.7172], // Erode
      [11.0168, 76.9558], // Coimbatore
      [10.5276, 76.2144], // Thrissur
      [9.9312, 76.2673]   // Kochi
    ]
  },
  // 9. NH-44 Northern Trunk (Ludhiana - Delhi - Gwalior - Nagpur)
  {
    id: 'CORR-NH44-NORTH',
    name: 'NH-44 North Trunk (Ludhiana - Delhi - Gwalior - Nagpur)',
    highwayCode: 'NH-44',
    color: '#a855f7', // purple-500
    coordinates: [
      [30.9010, 75.8573], // Ludhiana
      [29.9695, 76.8783], // Kurukshetra
      [28.6139, 77.2090], // Delhi
      [27.1767, 78.0081], // Agra
      [26.2183, 78.1828], // Gwalior
      [25.4484, 78.5685], // Jhansi
      [23.1815, 79.9864], // Jabalpur
      [21.1458, 79.0882]  // Nagpur
    ]
  }
];
