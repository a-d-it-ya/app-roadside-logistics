import React from 'react';
import {
  X,
  Package,
  Truck as TruckIcon,
  MapPin,
  ArrowRight,
  Clock,
  ShieldCheck,
  Warehouse,
  CheckCircle2,
  Lock,
  Radio,
  User as UserIcon
} from 'lucide-react';
import { BookingRecord } from '../../types/logistics';
import { useAuth } from '../../context/AuthContext';

interface MyShipmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipments: BookingRecord[];
  onTrackShipment: (shipment: BookingRecord) => void;
}

export const MyShipmentsModal: React.FC<MyShipmentsModalProps> = ({
  isOpen,
  onClose,
  shipments,
  onTrackShipment
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  if (!isOpen) return null;

  // Filter strictly by authenticated user ID
  const userShipments = isAuthenticated && user
    ? shipments.filter((s) => s.userId === user.id)
    : [];

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl shadow-black/90 text-white overflow-hidden space-y-0 font-mono">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                My Active Shipments & Bookings
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAuthenticated
                  ? `${userShipments.length} Active Reservation${userShipments.length === 1 ? '' : 's'} (${user?.name})`
                  : 'Authentication Required'}
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

        {/* Unauthenticated Prompt */}
        {!isAuthenticated ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                🔐 Sign In Required
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Sign in to your RoadSide Logistics account to view and manage your shipments, freight capacity allocations, and live GPS tracking.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('SIGN_IN', 'MY_SHIPMENTS');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition"
              >
                SIGN IN
              </button>
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('SIGN_UP', 'MY_SHIPMENTS');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition"
              >
                CREATE ACCOUNT
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated Shipments List */
          <div className="p-5 space-y-3.5 max-h-[calc(80vh-6rem)] overflow-y-auto custom-scrollbar">
            {userShipments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <Package className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="font-bold text-slate-400">No shipments found for {user?.name}.</p>
                <p className="text-[10px] text-slate-600">
                  Book a Shared Capacity slot or reserve a Full Vehicle to start tracking your cargo.
                </p>
              </div>
            ) : (
              userShipments.map((shp) => {
              const isShared = shp.mode === 'SHARE_CAPACITY';
              return (
                <div
                  key={shp.bookingId}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-3 font-mono"
                >
                  {/* Card Top Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        isShared
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {isShared ? <Package className="w-3 h-3" /> : <TruckIcon className="w-3 h-3" />}
                        {isShared ? 'SHARED CAPACITY' : 'FULL VEHICLE'}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {shp.bookingId}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      shp.status === 'VEHICLE RESERVED'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    }`}>
                      {shp.status}
                    </span>
                  </div>

                  {/* Route & Cargo */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Route</span>
                      <div className="flex items-center gap-1 font-bold text-white text-[11px]">
                        <span>{shp.origin}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{shp.destination}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Cargo</span>
                      <span className="text-slate-200 font-semibold text-[11px]">
                        {shp.weightKg} kg • {shp.cargoType}
                      </span>
                    </div>
                  </div>

                  {/* Mode Specifics & Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <div className="text-slate-400">
                      {isShared ? (
                        <span>Hub: <span className="text-emerald-300 font-semibold">{shp.pickupHubName || 'Central Hub'}</span></span>
                      ) : (
                        <span>Vehicle: <span className="text-cyan-300 font-semibold">{shp.vehicleType || 'Dedicated Truck'}</span></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">
                        ₹{shp.totalPriceRs.toLocaleString()}
                      </span>
                      <button
                        onClick={() => onTrackShipment(shp)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] font-mono transition flex items-center gap-1 shadow-md ${
                          isShared
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/20'
                        }`}
                      >
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>TRACK LIVE</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
