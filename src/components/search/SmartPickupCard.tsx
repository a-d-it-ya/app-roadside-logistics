import React from 'react';
import { MapPin, Navigation, Clock, Check, ShieldCheck } from 'lucide-react';
import { ScoredHubMatch } from '../../types/logistics';

interface SmartPickupCardProps {
  hubMatch: ScoredHubMatch;
  truckId: string;
  isConfirmed?: boolean;
  onViewOnMap?: (hubId: string) => void;
  onSelectPickup?: (hubId: string) => void;
  onSelectAlternative?: (hubId: string) => void;
  alternativeHubs?: ScoredHubMatch[];
}

export const SmartPickupCard: React.FC<SmartPickupCardProps> = ({
  hubMatch,
  truckId,
  isConfirmed = false,
  onViewOnMap,
  onSelectPickup,
  onSelectAlternative,
  alternativeHubs = []
}) => {
  const {
    hub,
    hubScore,
    stopSequenceNumber,
    customerDistanceKm,
    cargoArrivalTimeFormatted,
    truckEtaFormatted,
    truckEtaMinutes,
    loadingCutoffFormatted,
    safetyTimeBufferFormatted,
    isTimeFeasible,
    explanations
  } = hubMatch;

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-950/80 border border-cyan-500/40 flex flex-col gap-2.5">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[10px] font-mono uppercase font-bold text-cyan-300">
            📍 Conditional Hub Stop Activated
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
            0 km Detour
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            {hubScore}% Optimal
          </span>
        </div>
      </div>

      {/* Hub Title & Location */}
      <div>
        <h4 className="text-xs font-bold text-white flex items-center justify-between">
          <span>{hub.name}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            Optional Stop Activated
          </span>
        </h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
          {hub.address}
        </p>
      </div>

      {/* 4 Route-Locked Timing Metrics Grid */}
      <div className="grid grid-cols-4 gap-1 text-center">
        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[8px] text-slate-400 block font-mono">Truck Arrives</span>
          <span className="text-[11px] font-mono font-bold text-cyan-300">{truckEtaFormatted}</span>
          <span className="text-[8px] text-slate-400 block font-mono">{truckEtaMinutes}m</span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[8px] text-amber-300/80 block font-mono">Cargo Cutoff</span>
          <span className="text-[11px] font-mono font-bold text-amber-300">{loadingCutoffFormatted}</span>
          <span className="text-[8px] text-slate-400 block font-mono">-15m safety</span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[8px] text-slate-400 block font-mono">Cargo Ready</span>
          <span className="text-[11px] font-mono font-bold text-slate-200">{cargoArrivalTimeFormatted}</span>
          <span className="text-[8px] text-slate-400 block font-mono">{customerDistanceKm} km drive</span>
        </div>
        <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40">
          <span className="text-[8px] text-emerald-400 block font-mono">Safety Buffer</span>
          <span className="text-[11px] font-mono font-black text-emerald-300">{safetyTimeBufferFormatted}</span>
          <span className="text-[8px] text-emerald-400/70 block font-mono">
            {isTimeFeasible ? 'Ready early' : 'Late'}
          </span>
        </div>
      </div>

      {/* Why This Hub Explanations */}
      {explanations && explanations.length > 0 && (
        <div className="space-y-1">
          {explanations.slice(0, 3).map((exp, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-cyan-200/90 font-mono">
              <span className="text-cyan-400 font-bold">✓</span>
              <span>{exp}</span>
            </div>
          ))}
        </div>
      )}

      {/* Alternative Stops */}
      {alternativeHubs.length > 0 && (
        <div className="pt-2 border-t border-cyan-500/20">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            Alternative Scheduled Stops on Route:
          </span>
          <div className="flex flex-wrap gap-1">
            {alternativeHubs.map((alt) => (
              <button
                key={alt.hub.id}
                type="button"
                onClick={() => onSelectAlternative?.(alt.hub.id)}
                className="px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition"
              >
                📦 Stop #{alt.stopSequenceNumber}: {alt.hub.name.split(' ')[1] || alt.hub.name} ({alt.hubScore}%)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => onViewOnMap?.(hub.id)}
          className="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 text-[11px] font-mono font-semibold border border-cyan-500/40 transition flex items-center justify-center gap-1"
        >
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>VIEW ON MAP</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPickup?.(hub.id)}
          className={`flex-1 py-1.5 px-2.5 rounded-lg ${
            isConfirmed
              ? 'bg-emerald-500 text-slate-950 font-extrabold'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
          } text-[11px] font-mono transition flex items-center justify-center gap-1 shadow-sm`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isConfirmed ? '✓ POINT CONFIRMED' : 'SELECT PICKUP'}</span>
        </button>
      </div>
    </div>
  );
};
