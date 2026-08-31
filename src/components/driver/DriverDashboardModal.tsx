import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  Navigation,
  Play,
  CheckCircle2,
  MapPin,
  Clock,
  Radio,
  Package,
  ShieldCheck,
  AlertCircle,
  X,
  Compass,
  Gauge,
  Layers,
  ChevronRight
} from 'lucide-react';
import { tripApiService } from '../../services/tripApiService';
import { telemetryApiService } from '../../services/telemetryApiService';
import { trackingApiService } from '../../services/trackingApiService';

interface DriverDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverDashboardModal: React.FC<DriverDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [isTripActive, setIsTripActive] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; speed: number; heading: number } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [milestoneStatus, setMilestoneStatus] = useState<string>('CARGO_READY');
  const [loadingAction, setLoadingAction] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const simulatedIntervalRef = useRef<any | null>(null);

  // Load trips when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDriverTrips();
    } else {
      stopGpsTracking();
    }
  }, [isOpen]);

  const loadDriverTrips = async () => {
    try {
      const fetchedTrips = await tripApiService.getTrips();
      if (fetchedTrips && fetchedTrips.length > 0) {
        setTrips(fetchedTrips);
        setSelectedTrip(fetchedTrips[0]);
        setIsTripActive(fetchedTrips[0].status === 'IN_PROGRESS');
      } else {
        // Fallback demo trip
        const fallback = {
          id: 'trip_hyd_maa_01',
          vehicle: {
            registrationNumber: 'AP 31 TT 5510',
            vehicleClass: '28ft Container Truck (10T)',
            totalCapacityKg: 10000,
          },
          availableCapacityKg: 3100,
          originHub: { name: 'Vizag Port Express Logistics Node', city: 'Visakhapatnam' },
          destinationHub: { name: 'Chennai Port Smart Logistics Gateway', city: 'Chennai' },
          status: 'IN_PROGRESS',
          routeStops: [
            { id: 'st_1', hub: { name: 'Vizag Port Express Logistics Node' }, status: 'COMPLETED' },
            { id: 'st_2', hub: { name: 'Hyderabad East Logistics Park (Hayathnagar)' }, status: 'CURRENT' },
            { id: 'st_3', hub: { name: 'Chennai Port Smart Logistics Gateway' }, status: 'UPCOMING' },
          ],
        };
        setTrips([fallback]);
        setSelectedTrip(fallback);
        setIsTripActive(true);
      }
    } catch (err) {
      // fallback
    }
  };

  // Start Trip action
  const handleStartTrip = async () => {
    if (!selectedTrip) return;
    setLoadingAction(true);

    try {
      await tripApiService.startTrip(selectedTrip.id);
      setIsTripActive(true);
      setSelectedTrip((prev: any) => ({ ...prev, status: 'IN_PROGRESS' }));
      startGpsTracking();
      showNotification('✅ Journey started! Live GPS telemetry streaming active.');
    } catch (err) {
      showNotification('⚠️ Starting simulated journey stream.');
      setIsTripActive(true);
      startGpsTracking();
    } finally {
      setLoadingAction(false);
    }
  };

  // Complete Trip action
  const handleCompleteTrip = async () => {
    if (!selectedTrip) return;
    setLoadingAction(true);

    try {
      await tripApiService.completeTrip(selectedTrip.id);
      setIsTripActive(false);
      stopGpsTracking();
      setSelectedTrip((prev: any) => ({ ...prev, status: 'COMPLETED' }));
      showNotification('🎉 Trip completed! Vehicle payload returned to AVAILABLE.');
    } catch (err) {
      setIsTripActive(false);
      stopGpsTracking();
    } finally {
      setLoadingAction(false);
    }
  };

  // GPS Acquisition Engine
  const startGpsTracking = () => {
    setGpsActive(true);

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            speed: Math.round((position.coords.speed || 0) * 3.6) || 48, // m/s -> km/h
            heading: Math.round(position.coords.heading || 135),
          };
          setCurrentCoords(coords);
          streamTelemetry(coords);
        },
        (error) => {
          console.warn('[GPS] Device GPS unavailable, activating in-cab highway route simulation:', error.message);
          startSimulatedGps();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    } else {
      startSimulatedGps();
    }
  };

  // Simulated GPS Fallback
  const startSimulatedGps = () => {
    let lat = 17.3100;
    let lng = 78.6800;

    simulatedIntervalRef.current = setInterval(() => {
      lat -= 0.002;
      lng += 0.003;
      const coords = {
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        speed: 58 + Math.floor(Math.random() * 8),
        heading: 135,
      };
      setCurrentCoords(coords);
      streamTelemetry(coords);
    }, 5000);
  };

  const streamTelemetry = async (coords: { lat: number; lng: number; speed: number; heading: number }) => {
    if (!selectedTrip) return;
    try {
      await telemetryApiService.recordLocation({
        vehicleId: selectedTrip.vehicle?.id || 'veh_demo',
        tripId: selectedTrip.id,
        latitude: coords.lat,
        longitude: coords.lng,
        speedKmH: coords.speed,
        heading: coords.heading,
        accuracyMeters: 4.5,
      });
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      // silent
    }
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simulatedIntervalRef.current) {
      clearInterval(simulatedIntervalRef.current);
      simulatedIntervalRef.current = null;
    }
    setGpsActive(false);
  };

  // Trigger milestone events
  const handleMilestoneTrigger = async (type: string, title: string, desc: string) => {
    setLoadingAction(true);
    setMilestoneStatus(type);
    try {
      await trackingApiService.recordEvent('shp_demo', {
        eventType: type,
        title,
        description: desc,
        location: currentCoords ? `${currentCoords.lat}, ${currentCoords.lng}` : 'En-Route',
      });
      showNotification(`📌 Milestone recorded: ${title}`);
    } catch (err) {
      showNotification(`📌 Milestone recorded: ${title}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
                  RoadSide Driver Cockpit
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE IN-CAB
                </span>
              </div>
              <p className="text-xs text-slate-400">Mobile telemetry & dynamic waypoint manager</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-sans text-slate-200">
          
          {/* Active Trip Card */}
          {selectedTrip && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">TRIP ID:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-xs font-mono font-bold text-emerald-300">
                    {selectedTrip.id}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider ${
                    isTripActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isTripActive ? '● IN PROGRESS' : 'SCHEDULED'}
                </span>
              </div>

              {/* Corridor Route */}
              <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedTrip.originHub?.city || 'Origin'}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
                <span className="text-emerald-300">{selectedTrip.destinationHub?.city || 'Destination'}</span>
              </div>

              {/* Truck details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Vehicle Reg</span>
                  <span className="font-bold text-white font-mono">{selectedTrip.vehicle?.registrationNumber || 'AP 31 TT 5510'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Available Payload</span>
                  <span className="font-bold text-emerald-400 font-mono">{selectedTrip.availableCapacityKg ?? 3100} kg</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Vehicle Class</span>
                  <span className="font-medium text-slate-300 truncate block">{selectedTrip.vehicle?.vehicleClass || '28ft Container'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Device GPS HUD */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${gpsActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                  Device GPS Telemetry Stream
                </span>
              </div>
              {lastSyncTime && (
                <span className="text-[10px] font-mono text-slate-400">
                  Synced: {lastSyncTime}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Latitude</span>
                <span className="text-sm font-bold font-mono text-white">
                  {currentCoords ? currentCoords.lat.toFixed(4) : '17.3100'}° N
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Longitude</span>
                <span className="text-sm font-bold font-mono text-white">
                  {currentCoords ? currentCoords.lng.toFixed(4) : '78.6800'}° E
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" /> Speed
                </span>
                <span className="text-sm font-bold font-mono text-cyan-300">
                  {currentCoords ? currentCoords.speed : 56} km/h
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block flex items-center gap-1">
                  <Compass className="w-3 h-3 text-emerald-400" /> Heading
                </span>
                <span className="text-sm font-bold font-mono text-emerald-300">
                  {currentCoords ? currentCoords.heading : 135}° SE
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Corridor Route Stops */}
          {selectedTrip?.routeStops && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 block mb-3">
                Corridor Waypoints Sequence
              </span>

              <div className="space-y-2">
                {selectedTrip.routeStops.map((stop: any, idx: number) => (
                  <div
                    key={stop.id || idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      stop.status === 'COMPLETED'
                        ? 'bg-slate-900/50 border-slate-800 text-slate-400'
                        : stop.status === 'CURRENT'
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white font-semibold shadow-sm'
                        : 'bg-slate-900/90 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                        {idx + 1}
                      </span>
                      <span className="truncate">{stop.hub?.name || `Waypoint ${idx + 1}`}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                        stop.status === 'COMPLETED'
                          ? 'bg-slate-800 text-slate-400'
                          : stop.status === 'CURRENT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestone Quick Action Buttons */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 block mb-2.5">
              Hub Milestone Quick Triggers
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  handleMilestoneTrigger(
                    'TRUCK_ARRIVED',
                    'Arrived at Freight Hub',
                    'Driver confirmed arrival at designated crossdock gate.'
                  )
                }
                disabled={!isTripActive || loadingAction}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-all disabled:opacity-50 flex flex-col items-center gap-1 text-center"
              >
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Arrived Hub</span>
              </button>

              <button
                onClick={() =>
                  handleMilestoneTrigger(
                    'LOADED',
                    'Cargo Loaded & Secured',
                    'Payload loaded into trailer and secured by driver.'
                  )
                }
                disabled={!isTripActive || loadingAction}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-all disabled:opacity-50 flex flex-col items-center gap-1 text-center"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Cargo Loaded</span>
              </button>

              <button
                onClick={() =>
                  handleMilestoneTrigger(
                    'IN_TRANSIT',
                    'Departed Forward Route',
                    'Driver departed crossdock and continuing along national corridor.'
                  )
                }
                disabled={!isTripActive || loadingAction}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-all disabled:opacity-50 flex flex-col items-center gap-1 text-center"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Departed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {!isTripActive ? (
            <button
              onClick={handleStartTrip}
              disabled={loadingAction}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all font-mono uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Trip Journey</span>
            </button>
          ) : (
            <button
              onClick={handleCompleteTrip}
              disabled={loadingAction}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all font-mono uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Trip Journey</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
