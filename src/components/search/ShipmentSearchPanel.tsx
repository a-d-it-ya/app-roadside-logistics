import React, { useState } from 'react';
import {
  MapPin,
  ArrowUpDown,
  Weight,
  Box,
  Search,
  Sparkles,
  Truck as TruckIcon,
  Package,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { CargoType, CargoSearchQuery, BookingMode } from '../../types/logistics';

const COMMON_CITIES = [
  'Hyderabad',
  'Chennai',
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Kolkata',
  'Ahmedabad',
  'Pune',
  'Surat',
  'Jaipur',
  'Lucknow',
  'Nagpur',
  'Indore',
  'Kochi',
  'Visakhapatnam',
  'Bhubaneswar',
  'Guwahati',
  'Ludhiana',
  'Vijayawada'
];

const CARGO_TYPES: CargoType[] = [
  'General Cargo',
  'Industrial Materials',
  'FMCG & Packaged Goods',
  'Electronics',
  'Textiles & Garments',
  'Fragile Goods',
  'Refrigerated Goods',
  'Pharma & Medical Supplies'
];

interface ShipmentSearchPanelProps {
  onSearch: (query: CargoSearchQuery) => void;
  isSearching?: boolean;
  initialMode?: BookingMode;
  initialOrigin?: string;
  initialDestination?: string;
  initialWeight?: number;
  initialCargoType?: CargoType;
}

export const ShipmentSearchPanel: React.FC<ShipmentSearchPanelProps> = ({
  onSearch,
  isSearching = false,
  initialMode = 'SHARE_CAPACITY',
  initialOrigin = 'Hyderabad',
  initialDestination = 'Chennai',
  initialWeight = 700,
  initialCargoType = 'General Cargo'
}) => {
  const [bookingMode, setBookingMode] = useState<BookingMode>(initialMode);
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [weight, setWeight] = useState(String(initialWeight));
  const [cargoType, setCargoType] = useState<CargoType>(initialCargoType);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      origin,
      destination,
      weightKg: Number(weight) || 700,
      cargoType,
      bookingMode
    });
  };

  return (
    <div className="absolute top-[4.75rem] left-3 sm:left-5 z-[900] w-full max-w-[380px] sm:max-w-[420px] pointer-events-auto">
      <div className="bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-5 shadow-2xl shadow-black/90 text-white transition-all duration-300">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <h2 className="text-xs uppercase tracking-widest font-mono font-semibold text-slate-300">
              Freight Network Booking
            </h2>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
            bookingMode === 'SHARE_CAPACITY'
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
              : 'bg-cyan-950/80 text-cyan-400 border-cyan-800/40'
          }`}>
            {bookingMode === 'SHARE_CAPACITY' ? 'Shared Corridor Mode' : 'Dedicated Fleet Mode'}
          </span>
        </div>

        {/* SECTION: BOOKING MODE SELECTOR */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono mb-2">
            <span>How would you like to ship?</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Mode 1: Share Capacity */}
            <button
              type="button"
              onClick={() => setBookingMode('SHARE_CAPACITY')}
              className={`text-left p-3 rounded-xl border transition-all relative ${
                bookingMode === 'SHARE_CAPACITY'
                  ? 'bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Package className={`w-3.5 h-3.5 ${bookingMode === 'SHARE_CAPACITY' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold font-mono ${bookingMode === 'SHARE_CAPACITY' ? 'text-white' : 'text-slate-300'}`}>
                  SHARE CAPACITY
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mb-1.5">
                Book only the space you need on active corridor routes.
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                  ✓ Lower cost
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                  ✓ Smart hubs
                </span>
              </div>
              {bookingMode === 'SHARE_CAPACITY' && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></div>
              )}
            </button>

            {/* Mode 2: Full Vehicle */}
            <button
              type="button"
              onClick={() => setBookingMode('FULL_VEHICLE')}
              className={`text-left p-3 rounded-xl border transition-all relative ${
                bookingMode === 'FULL_VEHICLE'
                  ? 'bg-cyan-500/15 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <TruckIcon className={`w-3.5 h-3.5 ${bookingMode === 'FULL_VEHICLE' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-bold font-mono ${bookingMode === 'FULL_VEHICLE' ? 'text-white' : 'text-slate-300'}`}>
                  FULL VEHICLE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mb-1.5">
                Reserve an entire dedicated truck exclusively.
              </p>
              <div className="flex flex-wrap gap-1">
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                  ✓ 100% Dedicated
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                  ✓ No shared cargo
                </span>
              </div>
              {bookingMode === 'FULL_VEHICLE' && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]"></div>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Section 1: Route */}
          <div>
            <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono block mb-1.5">
              Where are you sending cargo?
            </label>

            <div className="relative bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-2">
              
              {/* Origin */}
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <div className="flex-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">From</span>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    {COMMON_CITIES.map((city) => (
                      <option key={city} value={city} className="bg-slate-900 text-white">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Divider & Swap */}
              <div className="relative flex items-center justify-center py-0.5">
                <div className="w-full border-t border-slate-800"></div>
                <button
                  type="button"
                  onClick={handleSwap}
                  className="absolute p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                  title="Swap Origin & Destination"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination */}
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">To</span>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    {COMMON_CITIES.map((city) => (
                      <option key={city} value={city} className="bg-slate-900 text-white">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Cargo Details */}
          <div>
            <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono block mb-1.5">
              What are you moving?
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Weight Input */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-400 font-mono mb-1">
                  <span>Weight</span>
                  <Weight className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="50"
                    max="20000"
                    step="50"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none"
                    placeholder="700"
                  />
                  <span className="text-xs text-slate-400 font-mono ml-1">kg</span>
                </div>
              </div>

              {/* Cargo Type Selector */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-400 font-mono mb-1">
                  <span>Cargo Type</span>
                  <Box className="w-3 h-3 text-slate-400" />
                </div>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value as CargoType)}
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none truncate cursor-pointer"
                >
                  {CARGO_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-slate-900 text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSearching}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider font-mono shadow-lg active:scale-[0.99] transition flex items-center justify-center gap-2 ${
              bookingMode === 'SHARE_CAPACITY'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 stroke-[2.5] animate-spin" />
            ) : (
              <Search className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>
              {isSearching
                ? 'Scoring Active Network...'
                : bookingMode === 'SHARE_CAPACITY'
                ? 'Find Available Shared Capacity'
                : 'Find Available Dedicated Trucks'}
            </span>
          </button>

          {/* Micro Helper Note */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {bookingMode === 'SHARE_CAPACITY' ? 'Smart Hub Handover' : 'Full Vehicle Reservation'}
            </span>
            <span className={bookingMode === 'SHARE_CAPACITY' ? 'text-emerald-400' : 'text-cyan-400'}>
              {bookingMode === 'SHARE_CAPACITY' ? 'Zero Empty Detours' : 'Zero Shared Cargo'}
            </span>
          </div>

        </form>

      </div>
    </div>
  );
};
