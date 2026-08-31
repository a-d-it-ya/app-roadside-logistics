import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Truck as TruckIcon,
  ArrowRight,
  MapPin,
  Check,
  BarChart3,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { Truck, RecommendationResultSet, ScoredTruckMatch, ShipmentSearchCriteria } from '../../types/logistics';
import { SmartPickupCard } from './SmartPickupCard';

interface MatchingResultsPanelProps {
  recSet: RecommendationResultSet;
  onClose: () => void;
  onReset: () => void;
  onSelectTruck: (truck: Truck) => void;
  onOpenBreakdown: (truckId: string) => void;
  onConfirmPickup?: (hubId: string, truckId: string) => void;
  onViewHubOnMap?: (hubId: string) => void;
  confirmedTruckId?: string | null;
}

export const MatchingResultsPanel: React.FC<MatchingResultsPanelProps> = ({
  recSet,
  onClose,
  onReset,
  onSelectTruck,
  onOpenBreakdown,
  onConfirmPickup,
  onViewHubOnMap,
  confirmedTruckId
}) => {
  const [activeTab, setActiveTab] = useState<'best_value' | 'fastest' | 'cheapest'>(
    (recSet.activeTab as any) || 'best_value'
  );

  const topMatch =
    activeTab === 'fastest'
      ? recSet.fastest[0]
      : activeTab === 'cheapest'
      ? recSet.cheapest[0]
      : recSet.bestValue[0] || recSet.topRecommendation;

  const currentList =
    activeTab === 'fastest'
      ? recSet.fastest
      : activeTab === 'cheapest'
      ? recSet.cheapest
      : recSet.bestValue;

  const otherMatches = topMatch ? currentList.filter((m) => m.truck.id !== topMatch.truck.id) : [];

  if (!topMatch) {
    return (
      <aside className="absolute top-20 left-4 lg:left-8 z-[910] w-[calc(100%-2rem)] sm:w-[440px] pointer-events-auto max-h-[calc(100vh-6.5rem)] flex flex-col animate-slideUp">
        <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl shadow-black/90 text-white">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-amber-400">
              0 Matching Vehicles Found
            </h2>
            <button
              onClick={onReset}
              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            No active trucks along this corridor meet the pickup cutoff or capacity requirements.
          </p>
        </div>
      </aside>
    );
  }

  const topTruck = topMatch.truck;
  const topAvailTonnes = (topTruck.availableCapacityKg / 1000).toFixed(1);
  const recHub = topMatch.hubRecommendation ? topMatch.hubRecommendation.recommendedHub : null;
  const altHubs = topMatch.hubRecommendation ? topMatch.hubRecommendation.alternativeHubs : [];
  const isConfirmed = confirmedTruckId === topTruck.id;

  let tagLabel = '🥇 BEST VALUE MATCH';
  let tagBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (activeTab === 'fastest') {
    tagLabel = '⚡ FASTEST DELIVERY';
    tagBg = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  } else if (activeTab === 'cheapest') {
    tagLabel = '💰 CHEAPEST RATE';
    tagBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  }

  return (
    <aside className="absolute top-20 left-4 lg:left-8 z-[910] w-[calc(100%-2rem)] sm:w-[440px] pointer-events-auto max-h-[calc(100vh-6.5rem)] flex flex-col animate-slideUp">
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl shadow-black/90 text-white flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 mb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-emerald-400">
                Matching Freight Capacity
              </h2>
            </div>
            <p className="text-sm font-extrabold text-white mt-0.5">
              {currentList.length} Vehicles Scored Along Corridor
            </p>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono transition"
            title="Reset Search and View All Trucks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Filter Summary Chips */}
        <div className="flex flex-wrap gap-1.5 mb-2.5 pb-2 border-b border-slate-800/60 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            From: <strong className="text-white">{recSet.criteria.origin}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            To: <strong className="text-white">{recSet.criteria.destination}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-semibold">
            {recSet.criteria.weightKg} kg
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            {recSet.criteria.cargoType}
          </span>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 mb-3.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('best_value')}
            className={`py-1.5 px-1 rounded-lg text-center font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'best_value'
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚖️ Best Value</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fastest')}
            className={`py-1.5 px-1 rounded-lg text-center font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'fastest'
                ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡ Fastest</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cheapest')}
            className={`py-1.5 px-1 rounded-lg text-center font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'cheapest'
                ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💰 Cheapest</span>
          </button>
        </div>

        {/* Scrollable Results List */}
        <div className="overflow-y-auto space-y-3.5 pr-1 flex-1 max-h-[calc(100vh-19rem)]">
          {/* Top Hero Card */}
          <div
            onClick={() => onSelectTruck(topTruck)}
            className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/10 cursor-pointer transition-all duration-300 flex flex-col gap-3 group relative overflow-hidden"
          >
            {/* Badge Bar */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tagBg} flex items-center gap-1 shadow-sm`}>
                <Sparkles className="w-3 h-3" />
                {tagLabel}
              </span>

              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 font-mono font-black text-xs shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {topMatch.compositeScore}% MATCH
              </div>
            </div>

            {/* Vehicle Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                  <TruckIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white group-hover:text-emerald-300 transition">
                      {topTruck.id}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {topTruck.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">
                    {topTruck.registrationNumber} • {topTruck.carrierName}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-extrabold text-emerald-400 block">
                  {topAvailTonnes}T Avail
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Rating: ★ {topTruck.rating}
                </span>
              </div>
            </div>

            {/* Route & Location */}
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                <span>{topTruck.origin}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-cyan-300 font-bold">{topTruck.destination}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="truncate max-w-[210px]">📍 {topTruck.currentLocationName}</span>
                <span className="text-emerald-400 font-semibold">ETA: {topTruck.estimatedArrival}</span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-400 block">
                  Dedicated: <span className="line-through">₹{topMatch.pricing.dedicatedTruckEstimateRs.toLocaleString()}</span>
                </span>
                <span className="text-xs font-mono font-extrabold text-white">
                  Shared: ₹{topMatch.pricing.sharedCapacityEstimateRs.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold block">
                  Save ₹{topMatch.pricing.estimatedSavingsRs.toLocaleString()} ({topMatch.pricing.savingsPercentage}%)
                </span>
              </div>
            </div>

            {/* Why This Match */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Why This Truck Match?
              </span>
              <div className="space-y-1">
                {topMatch.breakdown.explanations.slice(0, 3).map((exp, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{exp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Pickup Point (Feature 4) */}
            {recHub && (
              <SmartPickupCard
                hubMatch={recHub}
                truckId={topTruck.id}
                isConfirmed={isConfirmed}
                onViewOnMap={onViewHubOnMap}
                onSelectPickup={(hubId) => onConfirmPickup?.(hubId, topTruck.id)}
                alternativeHubs={altHubs}
              />
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTruck(topTruck);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>VIEW TRUCK DETAILS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBreakdown(topTruck.id);
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition flex items-center gap-1 border border-slate-700"
                title="View Score Breakdown"
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Breakdown</span>
              </button>
            </div>
          </div>

          {/* Other Matches */}
          {otherMatches.length > 0 && (
            <div className="space-y-2">
              <div className="pt-2 pb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <span>Other Available Corridor Trucks</span>
                <span>{otherMatches.length} Available</span>
              </div>
              {otherMatches.map((match) => (
                <div
                  key={match.truck.id}
                  onClick={() => onSelectTruck(match.truck)}
                  className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                      <TruckIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">{match.truck.id}</span>
                        <span className="text-[10px] font-mono text-emerald-400">{match.compositeScore}% Match</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {match.truck.origin} → {match.truck.destination} • {((match.truck.availableCapacityKg) / 1000).toFixed(1)}T Avail
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white block">
                      ₹{match.pricing.sharedCapacityEstimateRs.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">
                      Save ₹{match.pricing.estimatedSavingsRs.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
