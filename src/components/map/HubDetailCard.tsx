import React from 'react';
import {
  X,
  Warehouse,
  Truck,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  MapPin,
  Sparkles,
  Route
} from 'lucide-react';
import { LogisticsHub } from '../../types/logistics';

interface HubDetailCardProps {
  hub: LogisticsHub | null;
  onClose: () => void;
}

export const HubDetailCard: React.FC<HubDetailCardProps> = ({ hub, onClose }) => {
  if (!hub) return null;

  return (
    <div className="absolute bottom-6 right-4 lg:right-8 z-[950] w-full max-w-[380px] sm:max-w-[420px] pointer-events-auto animate-slideUp">
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl shadow-black/90 text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Warehouse className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-sm text-white">
                  {hub.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {hub.city}, {hub.state} • <span className="text-cyan-400">{hub.type}</span>
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

        {/* Address */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-3.5 flex items-start gap-2 text-xs text-slate-300">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{hub.address}</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-0.5">
              <Truck className="w-3 h-3 text-emerald-400 mr-1" />
              <span className="text-[9px] uppercase font-mono">Active Fleet</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">{hub.activeVehiclesCount} trucks</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-0.5">
              <ArrowDownLeft className="w-3 h-3 text-cyan-400 mr-1" />
              <span className="text-[9px] uppercase font-mono">Inbound</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">{hub.inboundTonnesToday} T/day</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-0.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-400 mr-1" />
              <span className="text-[9px] uppercase font-mono">Outbound</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">{hub.outboundTonnesToday} T/day</span>
          </div>
        </div>

        {/* Connected Freight Corridors */}
        <div className="mb-3.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-1.5 flex items-center gap-1">
            <Route className="w-3 h-3 text-cyan-400" />
            Connected Freight Corridors:
          </span>
          <div className="space-y-1">
            {hub.connectedCorridors.map((corr) => (
              <div
                key={corr}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-200 font-mono flex items-center justify-between"
              >
                <span>{corr}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Hub Notice */}
        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2 text-[11px] text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Zero-detour Smart Handover enabled for partial-capacity bookings.</span>
        </div>

      </div>
    </div>
  );
};
