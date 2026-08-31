import React from 'react';
import { ScoredTruckMatch } from '../../types/logistics';
import { X, Award, Route, Box, Clock, Compass, Check, ArrowRight } from 'lucide-react';

interface MatchBreakdownModalProps {
  match: ScoredTruckMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onViewTruckOnMap?: (truckId: string) => void;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  match,
  isOpen,
  onClose,
  onViewTruckOnMap
}) => {
  if (!isOpen || !match) return null;

  const { truck, compositeScore, breakdown, pricing, recommendationTag, rank } = match;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Intelligent Match Breakdown</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {recommendationTag || `#${rank} CORRIDOR OPTION`}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {truck.id} • {truck.registrationNumber || truck.carrierName}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono text-emerald-400">
              {compositeScore}%
            </div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Match Score</span>
          </div>
        </div>

        {/* 4 Factor Meters */}
        <div className="space-y-3.5 mb-5">
          <div className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400 flex items-center justify-between">
            <span>Weighted Matching Factors</span>
            <span className="text-slate-500 font-normal">Deterministic Scoring</span>
          </div>

          {/* Route Compatibility (40%) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-200 flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-cyan-400" />
                Route Compatibility (40% Weight)
              </span>
              <span className="font-bold text-cyan-400">{breakdown.routeCompatibilityScore} / 100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${breakdown.routeCompatibilityScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">Corridor directness & stopover alignment</span>
          </div>

          {/* Capacity Fitness (20%) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-200 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-emerald-400" />
                Capacity Fitness (20% Weight)
              </span>
              <span className="font-bold text-emerald-400">{breakdown.capacityFitnessScore} / 100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${breakdown.capacityFitnessScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">Weight-to-available volume utilization ratio</span>
          </div>

          {/* ETA & Delivery (25%) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                ETA & Delivery Compatibility (25% Weight)
              </span>
              <span className="font-bold text-amber-400">{breakdown.etaScore} / 100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${breakdown.etaScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">Alignment with requested delivery window</span>
          </div>

          {/* Detour Efficiency (15%) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-200 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                Detour Efficiency (15% Weight)
              </span>
              <span className="font-bold text-purple-400">{breakdown.detourScore} / 100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-1">
              <div
                className="bg-purple-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${breakdown.detourScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">
              Estimated pickup detour: {breakdown.simulatedDetourKm} km along highway access node
            </span>
          </div>
        </div>

        {/* Pricing & Savings */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-emerald-950/30 border border-emerald-500/30 mb-5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block mb-2 font-bold">
            Simulated Pricing & Cost Efficiency
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-mono text-slate-400 block">Dedicated Truck</span>
              <span className="text-xs font-mono text-slate-400 line-through font-semibold">
                ₹{pricing.dedicatedTruckEstimateRs.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40">
              <span className="text-[9px] font-mono text-emerald-300 block font-bold">Shared Capacity</span>
              <span className="text-sm font-mono text-emerald-400 font-extrabold">
                ₹{pricing.sharedCapacityEstimateRs.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
              <span className="text-[9px] font-mono text-emerald-300 block">You Save</span>
              <span className="text-xs font-mono text-emerald-300 font-bold">
                ₹{pricing.estimatedSavingsRs.toLocaleString()} ({pricing.savingsPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Why This Match */}
        <div className="mb-5">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2 font-bold">
            Why This Vehicle?
          </span>
          <div className="space-y-1.5 text-xs text-slate-300">
            {breakdown.explanations.map((exp, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{exp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
          >
            Close
          </button>
          {onViewTruckOnMap && (
            <button
              onClick={() => {
                onClose();
                onViewTruckOnMap(truck.id);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
            >
              <span>View Truck On Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
