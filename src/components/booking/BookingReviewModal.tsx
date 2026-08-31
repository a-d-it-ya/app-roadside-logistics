import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Package,
  Truck as TruckIcon,
  MapPin,
  ArrowRight,
  Clock,
  Warehouse,
  AlertCircle
} from 'lucide-react';
import {
  BookingMode,
  ScoredTruckMatch,
  DedicatedTruck,
  ShipmentSearchCriteria
} from '../../types/logistics';

interface BookingReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mode: BookingMode;
  criteria: ShipmentSearchCriteria;
  // Shared Mode Truck
  sharedMatch?: ScoredTruckMatch | null;
  // Dedicated Mode Truck
  dedicatedTruck?: DedicatedTruck | null;
}

export const BookingReviewModal: React.FC<BookingReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  mode,
  criteria,
  sharedMatch,
  dedicatedTruck
}) => {
  if (!isOpen) return null;

  const isShared = mode === 'SHARE_CAPACITY';

  // Shared calculations
  const sharedTruck = sharedMatch?.truck;
  const sharedHub = sharedMatch?.hubRecommendation?.recommendedHub?.hub;
  const currentAvailKg = sharedTruck?.availableCapacityKg || 800;
  const reqWeightKg = criteria.weightKg || 700;
  const remainingAfterBookingKg = Math.max(0, currentAvailKg - reqWeightKg);
  const remainingAfterTonnes = (remainingAfterBookingKg / 1000).toFixed(1);
  const sharedPriceRs = sharedMatch?.pricing?.sharedCapacityEstimateRs || 5150;

  // Dedicated calculations
  const dedTruck = dedicatedTruck;
  const dedPriceRs = dedTruck?.pricing?.totalDedicatedPriceRs || 18500;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/90 text-white overflow-hidden space-y-0">
        
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isShared ? 'bg-emerald-950/40 border-emerald-900/40' : 'bg-cyan-950/40 border-cyan-900/40'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isShared ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {isShared ? <Package className="w-4 h-4" /> : <TruckIcon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase font-mono tracking-wider">
                {isShared ? 'Review Shared Shipment' : 'Review Dedicated Booking'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {isShared ? 'Shared Corridor Freight Model' : 'Exclusive Full Vehicle Reservation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[calc(85vh-8rem)] overflow-y-auto custom-scrollbar">
          
          {/* Shipment Overview Pill */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase text-[10px]">Route</span>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{criteria.origin}</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span>{criteria.destination}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-800/80">
              <div className="text-slate-400">
                Cargo: <span className="text-white font-semibold">{criteria.weightKg} kg</span> ({criteria.cargoType})
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isShared ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {isShared ? '📦 SHARE CAPACITY' : '🚛 FULL VEHICLE'}
              </span>
            </div>
          </div>

          {/* SHARED SPECIFICS */}
          {isShared && sharedTruck && (
            <div className="space-y-3">
              {/* Selected Truck Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Selected Corridor Truck</span>
                  <span className="text-emerald-400 font-bold">{sharedTruck.id}</span>
                </div>
                <div className="text-slate-200 font-bold">
                  {sharedTruck.carrierName} ({sharedTruck.registrationNumber})
                </div>
                <div className="text-[11px] text-slate-400">
                  Route: {sharedTruck.origin} ➔ {sharedTruck.destination}
                </div>
              </div>

              {/* Capacity Reserved vs Remaining */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <span className="text-[10px] uppercase text-emerald-400 block">Capacity Reserved</span>
                  <span className="text-base font-bold text-white">{reqWeightKg} kg</span>
                  <span className="text-[10px] text-slate-400 block">Your Shipment</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block">Remaining on Truck</span>
                  <span className="text-base font-bold text-slate-200">{remainingAfterTonnes} Tonnes</span>
                  <span className="text-[10px] text-slate-500 block">Open for public</span>
                </div>
              </div>

              {/* Pickup Hub Info */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] uppercase font-bold">
                  <Warehouse className="w-3 h-3" />
                  <span>Assigned Smart Pickup Hub</span>
                </div>
                <div className="text-white font-bold text-xs">
                  {sharedHub?.name || 'Hyderabad East Logistics Park (LB Nagar)'}
                </div>
                <p className="text-[10px] text-slate-400">
                  Bring cargo before cutoff ({sharedMatch?.hubRecommendation?.recommendedHub?.loadingCutoffFormatted || '07:45 PM'}). Truck arrives on schedule with zero route detours.
                </p>
              </div>
            </div>
          )}

          {/* DEDICATED SPECIFICS */}
          {!isShared && dedTruck && (
            <div className="space-y-3">
              {/* Dedicated Truck Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Dedicated Vehicle</span>
                  <span className="text-cyan-400 font-bold">{dedTruck.id}</span>
                </div>
                <div className="text-slate-200 font-bold">
                  {dedTruck.vehicleType}
                </div>
                <div className="text-[11px] text-slate-400">
                  {dedTruck.registrationNumber} • {dedTruck.carrierName}
                </div>
              </div>

              {/* Total Capacity & Exclusivity */}
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                  <span className="text-[10px] uppercase text-cyan-400 block">Total Capacity</span>
                  <span className="text-base font-bold text-white">{dedTruck.totalCapacityTonnes} Tonnes</span>
                  <span className="text-[10px] text-cyan-400/80 block">100% Reserved For You</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-400 block">Your Cargo</span>
                  <span className="text-base font-bold text-slate-200">{reqWeightKg} kg</span>
                  <span className="text-[10px] text-slate-500 block">Exclusive Haul</span>
                </div>
              </div>

              {/* Exclusivity Guarantees */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] uppercase font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dedicated Vehicle Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>No shared cargo from other shippers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Vehicle status locks to RESERVED across network</span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Total Estimated Price</span>
              <span className="text-xl font-extrabold text-white">
                ₹{isShared ? sharedPriceRs.toLocaleString() : dedPriceRs.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isShared ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {isShared ? 'Shared Corridor Rate' : 'Dedicated Vehicle Rate'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end gap-3 font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 shadow-lg active:scale-[0.98] transition flex items-center gap-2 ${
              isShared
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isShared ? 'Confirm Shared Booking' : 'Confirm Full Vehicle'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
