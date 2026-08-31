import React from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Truck as TruckIcon, MapPin, Sparkles } from 'lucide-react';
import { CargoSearchQuery, Truck } from '../../types/logistics';
import { formatWeight } from '../../utils/geoUtils';

interface SearchFeedbackModalProps {
  query: CargoSearchQuery | null;
  matchingTrucks: Truck[];
  onClose: () => void;
  onSelectTruck: (truck: Truck) => void;
}

export const SearchFeedbackModal: React.FC<SearchFeedbackModalProps> = ({
  query,
  matchingTrucks,
  onClose,
  onSelectTruck
}) => {
  if (!query) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">Network Route Scan</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Corridor Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Query: <span className="text-white font-medium">{query.origin}</span> → <span className="text-white font-medium">{query.destination}</span> • {formatWeight(query.weightKg)} • {query.cargoType}
            </p>
          </div>
        </div>

        {/* Feature 1 Context Note */}
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 mb-5">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200">
              <strong className="text-emerald-300">Feature 1 Home Experience Active:</strong>
              <p className="mt-1 text-emerald-300/80 text-[11px] leading-relaxed">
                The map and real-time visualization layer is active! In Feature 2, the automated capacity matching engine will calculate exact corridor detours, smart pickup points, and dynamic pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Detected Matching Corridor Candidates */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>Active Trucks along this corridor</span>
            <span className="text-emerald-400">{matchingTrucks.length} Active in Network</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {matchingTrucks.map((truck) => (
              <div
                key={truck.id}
                onClick={() => {
                  onSelectTruck(truck);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 group-hover:bg-emerald-950/60 transition">
                    <TruckIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">{truck.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({truck.vehicleClass.split(' ')[0]})</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {truck.origin} → {truck.destination}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {formatWeight(truck.availableCapacityKg)} Avail
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {truck.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Close & Inspect Map
          </button>
        </div>

      </div>
    </div>
  );
};
