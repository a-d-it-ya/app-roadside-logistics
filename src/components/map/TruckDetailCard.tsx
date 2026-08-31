import React from 'react';
import {
  X,
  Truck as TruckIcon,
  Navigation,
  Gauge,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Box,
  MapPin,
  ArrowRight,
  Radio
} from 'lucide-react';
import { Truck } from '../../types/logistics';
import { CapacityBar } from '../ui/CapacityBar';
import { formatWeight } from '../../utils/geoUtils';

interface TruckDetailCardProps {
  truck: Truck | null;
  onClose: () => void;
}

export const TruckDetailCard: React.FC<TruckDetailCardProps> = ({ truck, onClose }) => {
  if (!truck) return null;

  return (
    <div className="absolute bottom-6 right-4 lg:right-8 z-[950] w-full max-w-[380px] sm:max-w-[420px] pointer-events-auto animate-slideUp">
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl shadow-black/90 text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <TruckIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-base text-white tracking-wide">
                  {truck.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {truck.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {truck.registrationNumber} • {truck.carrierName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Details */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mb-3.5">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{truck.origin}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{truck.destination}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Corridor Location:
            </span>
            <span className="text-slate-200 font-medium truncate max-w-[200px]">
              {truck.currentLocationName}
            </span>
          </div>
        </div>

        {/* Available Capacity Gauge */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mb-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2 flex justify-between">
            <span>Cargo Capacity Gauge</span>
            <span className="text-emerald-400 font-bold">{formatWeight(truck.availableCapacityKg)} Available</span>
          </div>
          <CapacityBar
            availableKg={truck.availableCapacityKg}
            totalKg={truck.totalCapacityKg}
            size="md"
          />
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-0.5">
              <Gauge className="w-3 h-3 text-cyan-400 mr-1" />
              <span className="text-[9px] uppercase font-mono">Speed</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">{truck.speedKmH} km/h</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-0.5">
              <Clock className="w-3 h-3 text-emerald-400 mr-1" />
              <span className="text-[9px] uppercase font-mono">Hub ETA</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">{truck.nextHubEtaMinutes} mins</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-0.5">
              <ShieldCheck className="w-3 h-3 text-amber-400 mr-1" />
              <span className="text-[9px] uppercase font-mono">Rating</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">★ {truck.rating}</span>
          </div>
        </div>

        {/* Supported Cargo Types */}
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-1.5">
            Compatible Cargo Classes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {truck.compatibleCargoTypes.map((cargo) => (
              <span
                key={cargo}
                className="px-2 py-0.5 rounded-md text-[10px] bg-slate-900 text-slate-300 border border-slate-800"
              >
                {cargo}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 font-mono">Vehicle: {truck.vehicleClass}</span>
          <span className="text-[11px] text-emerald-400 font-medium">Ready for Matching</span>
        </div>

      </div>
    </div>
  );
};
