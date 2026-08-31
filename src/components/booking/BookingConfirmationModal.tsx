import React from 'react';
import {
  CheckCircle2,
  Package,
  Truck as TruckIcon,
  MapPin,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Layers,
  Sparkles
} from 'lucide-react';
import { BookingRecord } from '../../types/logistics';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord | null;
  onViewMyShipments: () => void;
  onNewSearch: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  booking,
  onViewMyShipments,
  onNewSearch
}) => {
  if (!isOpen || !booking) return null;

  const isShared = booking.mode === 'SHARE_CAPACITY';

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl shadow-black/90 text-white overflow-hidden space-y-0 text-center">
        
        {/* Success Icon Header */}
        <div className={`p-6 border-b flex flex-col items-center justify-center space-y-2 ${
          isShared ? 'bg-gradient-to-b from-emerald-950/60 to-slate-950' : 'bg-gradient-to-b from-cyan-950/60 to-slate-950'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-1 ${
            isShared
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-cyan-500/20'
          }`}>
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className={`text-[10px] font-bold font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
            isShared
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
              : 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
          }`}>
            {isShared ? '✓ Shared Shipment Confirmed' : '✓ Dedicated Vehicle Reserved'}
          </span>

          <h3 className="text-base font-extrabold uppercase font-mono tracking-wide text-white">
            {isShared ? 'Capacity Reserved on Corridor' : 'Exclusive Truck Locked'}
          </h3>
        </div>

        {/* Details Content */}
        <div className="p-5 space-y-3.5 text-left font-mono text-xs">
          
          {/* Booking ID Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">
                {isShared ? 'Shipment Reference ID' : 'Dedicated Booking ID'}
              </span>
              <span className="text-sm font-bold text-white tracking-wider">
                {booking.bookingId}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isShared ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              {booking.status}
            </span>
          </div>

          {/* Route & Cargo Info */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase">Route</span>
              <div className="flex items-center gap-1 font-bold text-white">
                <span>{booking.origin}</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
                <span>{booking.destination}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400">Cargo Reserved</span>
              <span className="text-white font-semibold">
                {booking.weightKg} kg ({booking.cargoType})
              </span>
            </div>

            {isShared && booking.pickupHubName && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">Pickup Hub</span>
                <span className="text-emerald-300 font-semibold truncate max-w-[200px]">
                  {booking.pickupHubName}
                </span>
              </div>
            )}

            {!isShared && booking.vehicleType && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">Vehicle Type</span>
                <span className="text-cyan-300 font-semibold">
                  {booking.vehicleType}
                </span>
              </div>
            )}
          </div>

          {/* Total Paid / Confirmed */}
          <div className="flex items-center justify-between px-1">
            <span className="text-slate-400 uppercase text-[10px]">Total Price</span>
            <span className="text-base font-extrabold text-white">
              ₹{booking.totalPriceRs.toLocaleString()}
            </span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2 font-mono">
          <button
            onClick={onNewSearch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>New Search</span>
          </button>
          
          <button
            onClick={onViewMyShipments}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 shadow-lg transition ${
              isShared
                ? 'bg-emerald-400 hover:bg-emerald-300'
                : 'bg-cyan-400 hover:bg-cyan-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View My Shipments</span>
          </button>
        </div>

      </div>
    </div>
  );
};
