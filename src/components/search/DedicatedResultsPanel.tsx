import React from 'react';
import {
  Truck as TruckIcon,
  ShieldCheck,
  Package,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Zap,
  Star
} from 'lucide-react';
import {
  DedicatedTruck,
  DedicatedSearchResult,
  ShipmentSearchCriteria
} from '../../types/logistics';

interface DedicatedResultsPanelProps {
  searchResult: DedicatedSearchResult;
  onSelectDedicatedTruck: (truck: DedicatedTruck) => void;
  onSwitchToSharedMode: () => void;
  onModifySearch: () => void;
}

export const DedicatedResultsPanel: React.FC<DedicatedResultsPanelProps> = ({
  searchResult,
  onSelectDedicatedTruck,
  onSwitchToSharedMode,
  onModifySearch
}) => {
  const { availableTrucks, bestFitTruck, criteria, sharedPriceEstimateRs } = searchResult;
  const bestFit = bestFitTruck || availableTrucks[0];
  const otherTrucks = availableTrucks.filter(t => t.id !== (bestFit ? bestFit.id : ''));

  return (
    <aside className="absolute top-20 left-4 lg:left-8 z-[900] w-full max-w-[420px] sm:max-w-[460px] pointer-events-auto max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl shadow-black/90 text-white space-y-4">
        
        {/* Panel Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]"></span>
            <div>
              <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-white">
                Dedicated Vehicle Fleet
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {availableTrucks.length} Exclusive Trucks Available
              </p>
            </div>
          </div>
          <button
            onClick={onModifySearch}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Search Criteria Pill */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">From:</span>
            <span className="font-bold text-white">{criteria.origin}</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">To:</span>
            <span className="font-bold text-white">{criteria.destination}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[10px]">
            <span>{criteria.weightKg} kg</span>
            <span>•</span>
            <span className="truncate max-w-[80px]">{criteria.cargoType}</span>
          </div>
        </div>

        {/* MODE PRICING COMPARISON CARD */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 font-semibold border-b border-slate-800/80 pb-1.5">
            <span>Mode Comparison</span>
            <span className="text-emerald-400">Save with Shared</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Shared Option */}
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-semibold">
                <Package className="w-3 h-3" />
                <span>SHARE CAPACITY</span>
              </div>
              <div className="text-sm font-bold font-mono text-white">
                ₹{sharedPriceEstimateRs.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-300 font-mono">
                Save ₹{bestFit?.pricing ? bestFit.pricing.sharedSavingsRs.toLocaleString() : '13,350'}
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Uses available space on existing corridor.
              </p>
              <button
                onClick={onSwitchToSharedMode}
                className="w-full mt-1 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold transition"
              >
                Switch to Shared ➔
              </button>
            </div>

            {/* Dedicated Option (Active) */}
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono font-semibold">
                <TruckIcon className="w-3 h-3" />
                <span>FULL VEHICLE</span>
              </div>
              <div className="text-sm font-bold font-mono text-cyan-300">
                ₹{bestFit?.pricing ? bestFit.pricing.totalDedicatedPriceRs.toLocaleString() : '18,500'}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                100% Dedicated
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Entire vehicle reserved exclusively for you.
              </p>
              <div className="text-[9px] text-cyan-300 font-mono font-semibold pt-1 flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />
                Selected Mode
              </div>
            </div>
          </div>
        </div>

        {/* HERO RECOMMENDATION: BEST FIT DEDICATED TRUCK */}
        {bestFit && (
          <div className="relative rounded-xl border border-cyan-500/50 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 shadow-xl shadow-cyan-950/20 space-y-3.5 ring-1 ring-cyan-500/30">
            
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                  BEST FIT
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                  {bestFit.id}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{bestFit.rating}</span>
                <span className="text-slate-500">({bestFit.ratingCount})</span>
              </div>
            </div>

            {/* Vehicle Title & Details */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                {bestFit.vehicleType}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {bestFit.registrationNumber} • {bestFit.carrierName}
              </p>
              {bestFit.dimensions && (
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Dimensions: {bestFit.dimensions}
                </p>
              )}
            </div>

            {/* Capacity vs Your Cargo Card */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Total Capacity</span>
                <span className="text-sm font-bold text-white">{bestFit.totalCapacityTonnes} Tonnes</span>
                <span className="text-[10px] text-slate-400 block">({bestFit.totalCapacityKg.toLocaleString()} kg)</span>
              </div>
              <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/30">
                <span className="text-[9px] uppercase tracking-wider text-cyan-400 block">Your Cargo</span>
                <span className="text-sm font-bold text-cyan-300">{criteria.weightKg} kg</span>
                <span className="text-[10px] text-cyan-400/80 block">Exclusive Haul</span>
              </div>
            </div>

            {/* Dedicated For You Value Points */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                Dedicated For You
              </span>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Entire vehicle reserved exclusively</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>No shared cargo • Direct destination transit</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Suitable for {criteria.cargoType}</span>
              </div>
            </div>

            {/* Schedule & Route */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[9px] uppercase text-slate-500 block">Est. Departure</span>
                <span className="font-semibold text-slate-200 text-[11px]">{bestFit.estimatedDeparture}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-500 block">Est. Arrival</span>
                <span className="font-semibold text-cyan-300 text-[11px]">{bestFit.estimatedArrival}</span>
              </div>
            </div>

            {/* Price & Action Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <span className="text-[9px] uppercase text-slate-400 font-mono block">Total Dedicated Price</span>
                <span className="text-lg font-extrabold font-mono text-white">
                  ₹{bestFit.pricing ? bestFit.pricing.totalDedicatedPriceRs.toLocaleString() : '18,500'}
                </span>
              </div>
              <button
                onClick={() => onSelectDedicatedTruck(bestFit)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition flex items-center gap-1.5"
              >
                <span>Select Full Vehicle</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

          </div>
        )}

        {/* OTHER COMPATIBLE DEDICATED OPTIONS */}
        {otherTrucks.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
              <span>Other Dedicated Fleet Options</span>
              <span>{otherTrucks.length} Available</span>
            </div>

            {otherTrucks.map((truck) => (
              <div
                key={truck.id}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {truck.id}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {truck.vehicleType}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {truck.totalCapacityTonnes} Tonnes
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">
                    {truck.fitReason || 'More capacity than required'}
                  </span>
                  <span className="text-white font-bold">
                    ₹{truck.pricing ? truck.pricing.totalDedicatedPriceRs.toLocaleString() : '22,500'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Departure: {truck.estimatedDeparture}
                  </span>
                  <button
                    onClick={() => onSelectDedicatedTruck(truck)}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold transition"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </aside>
  );
};
