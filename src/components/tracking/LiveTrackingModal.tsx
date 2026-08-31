import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Package,
  Truck as TruckIcon,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowRight,
  ShieldCheck,
  Warehouse,
  Flame,
  Activity
} from 'lucide-react';
import L from 'leaflet';
import { BookingRecord, LiveTrackingData } from '../../types/logistics';
import {
  computeLiveTrackingSnapshot,
  SimulationScenarioId
} from '../../services/shipmentTrackingService';

interface LiveTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: BookingRecord | null;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  isOpen,
  onClose,
  shipment
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const truckMarkerRef = useRef<L.Marker | null>(null);
  const cargoMarkerRef = useRef<L.Marker | null>(null);
  const hubMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const corridorLineRef = useRef<L.Polyline | null>(null);
  const feederLineRef = useRef<L.Polyline | null>(null);

  // Simulation State
  const [progress, setProgress] = useState<number>(0.55); // Start mid-journey for instant visual
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 5x, 10x
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [scenario, setScenario] = useState<SimulationScenarioId>('SHARED_STANDARD');

  // Compute live snapshot based on progress & scenario
  const currentShipment: BookingRecord = shipment || {
    bookingId: 'RSL-SHP-847291',
    mode: 'SHARE_CAPACITY',
    createdAt: 'Today, 02:15 PM',
    status: 'IN TRANSIT',
    origin: 'Hyderabad',
    destination: 'Chennai',
    weightKg: 700,
    cargoType: 'General Cargo',
    totalPriceRs: 4850,
    truckId: 'RSL-5510',
    pickupHubName: 'Hyderabad East Logistics Park (LB Nagar)'
  };

  const trackingData: LiveTrackingData = computeLiveTrackingSnapshot(
    currentShipment,
    progress,
    scenario
  );

  // Sync initial scenario with shipment mode
  useEffect(() => {
    if (shipment) {
      if (shipment.mode === 'FULL_VEHICLE') {
        setScenario('DEDICATED_STANDARD');
      } else {
        setScenario('SHARED_STANDARD');
      }
    }
  }, [shipment]);

  // Real-time smooth GPS ticker loop (slow, natural cruising speed)
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const intervalMs = 100;
    const step = 0.00018; // Realistic, slow real-time GPS telemetry rate

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 1.0) {
          return 1.0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([15.5, 80.0], 7);

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Draw route polylines if not already drawn
    if (corridorLineRef.current) map.removeLayer(corridorLineRef.current);
    corridorLineRef.current = L.polyline(trackingData.truckRoute.polyline, {
      color: '#10b981',
      weight: 4.5,
      opacity: 0.85,
      dashArray: '8, 6',
      lineCap: 'round'
    }).addTo(map);

    // Hub Marker
    if (hubMarkerRef.current) map.removeLayer(hubMarkerRef.current);
    const hubIcon = L.divIcon({
      className: 'custom-hub-marker',
      html: `
        <div style="background:#0f172a; border:2px solid #06b6d4; border-radius:10px; padding:4px 8px; box-shadow:0 0 14px rgba(6,182,212,0.6); display:flex; align-items:center; gap:4px; white-space:nowrap;">
          <div style="width:8px; height:8px; border-radius:50%; background:#06b6d4;"></div>
          <span style="color:#e2e8f0; font-family:monospace; font-size:10px; font-weight:bold;">📍 PICKUP HUB</span>
        </div>
      `,
      iconSize: [110, 30],
      iconAnchor: [55, 15]
    });
    hubMarkerRef.current = L.marker(
      [trackingData.pickupHub.coords.lat, trackingData.pickupHub.coords.lng],
      { icon: hubIcon }
    ).addTo(map);

    // Destination Marker
    if (destMarkerRef.current) map.removeLayer(destMarkerRef.current);
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div style="background:#0f172a; border:2px solid #10b981; border-radius:10px; padding:4px 8px; box-shadow:0 0 14px rgba(16,185,129,0.6); display:flex; align-items:center; gap:4px; white-space:nowrap;">
          <span style="color:#10b981; font-size:12px;">🏁</span>
          <span style="color:#e2e8f0; font-family:monospace; font-size:10px; font-weight:bold;">CHENNAI DESTINATION</span>
        </div>
      `,
      iconSize: [140, 30],
      iconAnchor: [70, 15]
    });
    destMarkerRef.current = L.marker(
      [trackingData.destination.coords.lat, trackingData.destination.coords.lng],
      { icon: destIcon }
    ).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map instance alive during session
    };
  }, [isOpen, trackingData.truckRoute.polyline]);

  // Update Truck & Cargo markers on position change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Truck Marker
    const isDedicated = trackingData.bookingMode === 'FULL_VEHICLE';
    const truckColor = isDedicated ? '#06b6d4' : '#10b981';

    const truckIconHtml = `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
        <div style="background:#020617; border:2px solid ${truckColor}; border-radius:12px; padding:3px 7px; box-shadow:0 0 16px ${truckColor}; display:flex; align-items:center; gap:4px; white-space:nowrap; margin-bottom:2px;">
          <span style="color:${truckColor}; font-weight:bold; font-size:12px;">🚛</span>
          <span style="color:#ffffff; font-family:monospace; font-size:10px; font-weight:bold;">${trackingData.speedKmH} km/h</span>
        </div>
        <div style="width:14px; height:14px; border-radius:50%; background:${truckColor}; box-shadow:0 0 10px ${truckColor}; transform: rotate(${trackingData.truckHeading}deg);">
          <div style="width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:8px solid #ffffff; margin:0 auto; transform:translateY(-2px);"></div>
        </div>
      </div>
    `;

    const truckIcon = L.divIcon({
      className: 'live-truck-marker',
      html: truckIconHtml,
      iconSize: [60, 45],
      iconAnchor: [30, 35]
    });

    if (!truckMarkerRef.current) {
      truckMarkerRef.current = L.marker(
        [trackingData.truckCoords.lat, trackingData.truckCoords.lng],
        { icon: truckIcon, zIndexOffset: 2000 }
      ).addTo(map);
    } else {
      truckMarkerRef.current.setLatLng([
        trackingData.truckCoords.lat,
        trackingData.truckCoords.lng
      ]);
      truckMarkerRef.current.setIcon(truckIcon);
    }

    // 2. Cargo Marker (Only if Cargo is physically separate from Truck!)
    const isCargoOnTruck = trackingData.cargoLocationStatus === 'ON_TRUCK';

    if (isCargoOnTruck) {
      if (cargoMarkerRef.current) {
        map.removeLayer(cargoMarkerRef.current);
        cargoMarkerRef.current = null;
      }
    } else {
      const cargoIconHtml = `
        <div style="background:#020617; border:2px solid #eab308; border-radius:10px; padding:3px 6px; box-shadow:0 0 14px rgba(234,179,8,0.7); display:flex; align-items:center; gap:3px; white-space:nowrap; animation:pulse 2s infinite;">
          <span style="font-size:11px;">📦</span>
          <span style="color:#fef08a; font-family:monospace; font-size:9px; font-weight:bold;">CARGO (${trackingData.cargoLocationStatus})</span>
        </div>
      `;

      const cargoIcon = L.divIcon({
        className: 'live-cargo-marker',
        html: cargoIconHtml,
        iconSize: [110, 26],
        iconAnchor: [55, 13]
      });

      if (!cargoMarkerRef.current) {
        cargoMarkerRef.current = L.marker(
          [trackingData.cargoCoords.lat, trackingData.cargoCoords.lng],
          { icon: cargoIcon, zIndexOffset: 1500 }
        ).addTo(map);
      } else {
        cargoMarkerRef.current.setLatLng([
          trackingData.cargoCoords.lat,
          trackingData.cargoCoords.lng
        ]);
        cargoMarkerRef.current.setIcon(cargoIcon);
      }
    }

    // Auto-Follow
    if (autoFollow) {
      map.panTo([trackingData.truckCoords.lat, trackingData.truckCoords.lng], {
        animate: true,
        duration: 0.3
      });
    }
  }, [trackingData, autoFollow]);

  if (!isOpen) return null;

  const isShared = trackingData.bookingMode === 'SHARE_CAPACITY';
  const isMissed = trackingData.currentState === 'PICKUP_MISSED';

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-7xl h-[92vh] shadow-2xl shadow-black/90 text-white overflow-hidden flex flex-col">
        
        {/* TOP HEADER */}
        <div className="p-3.5 sm:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 font-mono">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isShared ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {isShared ? <Package className="w-5 h-5" /> : <TruckIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                  Live Shipment Telemetry
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isShared ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}>
                  {isShared ? '📦 SHARED CAPACITY' : '🚛 FULL VEHICLE'}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  • {trackingData.shipmentId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentShipment.origin} ➔ {currentShipment.destination} • {currentShipment.weightKg} kg ({currentShipment.cargoType})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-semibold">LIVE CONNECTED</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Close Tracking"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY (MAP LEFT + TELEMETRY RIGHT) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT: INTERACTIVE LIVE TRACKING MAP */}
          <div className="flex-1 relative bg-slate-900 overflow-hidden min-h-[300px]">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* FLOATING OVERLAY: LIVE GPS TELEMETRY & DRIVER CARD (REAL-TIME PRODUCTION UI) */}
            <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-2 font-mono">
              <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-xl flex items-center gap-3 text-xs">
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Corridor Speed</span>
                  <span className="font-extrabold text-white text-sm">
                    {trackingData.speedKmH} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800"></div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400 block">Heading</span>
                  <span className="font-semibold text-cyan-300">
                    {trackingData.truckHeading}° S-SE
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800"></div>
                <button
                  onClick={() => setAutoFollow(!autoFollow)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                    autoFollow
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>{autoFollow ? 'RE-CENTER ON TRUCK' : 'MANUAL PAN'}</span>
                </button>
              </div>
            </div>

            {/* FLOATING OVERLAY: VEHICLE & SATELLITE GPS STATUS */}
            <div className="absolute bottom-3 left-3 z-[1000] font-mono max-w-sm hidden sm:block">
              <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl space-y-2">
                <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>GPS SATELLITE TELEMETRY ACTIVE</span>
                  </span>
                  <span className="text-slate-400">Ping: 14ms</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                      <TruckIcon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        {currentShipment.truckId || 'RSL-5510'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {currentShipment.carrierName || 'Deccan Expressways Fleet'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      AIS-140 GPS CERTIFIED
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: STATUS, JOURNEY STORYTELLING & TIMELINE */}
          <div className="w-full lg:w-[420px] bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 overflow-y-auto custom-scrollbar font-mono space-y-4 shrink-0">
            
            {/* 1. PRIMARY STATUS CARD */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isMissed
                ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-950/30'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[10px] uppercase text-slate-400 tracking-wider">
                  Shipment Status
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isMissed
                    ? 'bg-red-950 text-red-300 border-red-500/40'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-500/40 animate-pulse'
                }`}>
                  {trackingData.currentState.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {isMissed ? '⚠️ Pickup Window Expired' : trackingData.truckLocationName}
                </h3>
                <p className="text-xs text-slate-400">
                  {isMissed
                    ? trackingData.missedPickupInfo?.reason
                    : `Your ${currentShipment.weightKg} kg cargo is en route on the NH corridor.`}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-slate-800/80 text-xs">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] uppercase text-slate-500 block">Distance Remaining</span>
                  <span className="text-sm font-bold text-white">
                    {trackingData.distanceRemainingKm} <span className="text-[10px] font-normal text-slate-400">km</span>
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] uppercase text-slate-500 block">Estimated Arrival</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {trackingData.etaFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. PHYSICAL CARGO VS TRUCK LOCATION BADGE */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                <span className="flex items-center gap-1 text-yellow-400">
                  <Package className="w-3.5 h-3.5" />
                  <span>Physical Cargo State</span>
                </span>
                <span className="text-slate-300 font-bold">
                  {trackingData.cargoLocationStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                📍 {trackingData.cargoLocationName}
              </p>
              <div className="text-[9.5px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                {trackingData.cargoLocationStatus === 'ON_TRUCK'
                  ? '✓ Cargo is securely stowed inside the assigned truck trailer.'
                  : '⏳ Cargo is physically separate from the highway corridor truck.'}
              </div>
            </div>

            {/* 3. SHARED CORRIDOR JOURNEY STORYTELLING */}
            {isShared && (
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Shared Corridor Network Flow
                </span>
                
                {/* Visual diagram */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span>Truck Origin: <strong>Bhubaneswar (Odisha)</strong></span>
                  </div>
                  <div className="pl-2 border-l border-emerald-500/30 ml-0.5 py-1">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-500/40">
                      <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{trackingData.pickupHub.name}</span>
                    </div>
                    <span className="text-[9px] text-emerald-400/80 block mt-0.5 pl-5">
                      ↳ 📦 Your 700 kg cargo joined here (Cutoff: {trackingData.pickupHub.loadingCutoff})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Final Destination: <strong>Chennai Central Hub</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. LIVE EVENT TIMELINE */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Live Event Timeline
              </span>

              <div className="space-y-2 pl-1">
                {trackingData.events.map((evt, idx) => (
                  <div
                    key={evt.id}
                    className={`relative pl-5 pb-2 text-xs border-l transition-all ${
                      evt.isCurrent
                        ? 'border-emerald-500'
                        : evt.isCompleted
                          ? 'border-emerald-700/60'
                          : 'border-slate-800 text-slate-500'
                    }`}
                  >
                    {/* Status Dot */}
                    <div
                      className={`absolute -left-[6px] top-0 w-3 h-3 rounded-full border ${
                        evt.isCurrent
                          ? 'bg-emerald-400 border-white shadow-[0_0_8px_#10b981] animate-ping'
                          : evt.isCompleted
                            ? 'bg-emerald-500 border-emerald-400'
                            : 'bg-slate-900 border-slate-700'
                      }`}
                    />

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{evt.timestamp}</span>
                      <span className="truncate max-w-[140px]">{evt.location}</span>
                    </div>

                    <div className={`font-bold text-[11px] ${evt.isCurrent ? 'text-emerald-300' : evt.isCompleted ? 'text-white' : 'text-slate-500'}`}>
                      {evt.title}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                      {evt.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
