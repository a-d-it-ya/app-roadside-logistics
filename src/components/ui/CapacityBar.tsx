import React from 'react';
import { formatWeight } from '../../utils/geoUtils';

interface CapacityBarProps {
  availableKg: number;
  totalKg: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CapacityBar: React.FC<CapacityBarProps> = ({
  availableKg,
  totalKg,
  showLabels = true,
  size = 'md'
}) => {
  const bookedKg = Math.max(0, totalKg - availableKg);
  const availablePct = Math.min(100, Math.max(0, Math.round((availableKg / totalKg) * 100)));
  const bookedPct = 100 - availablePct;

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Available: <strong>{formatWeight(availableKg)}</strong> ({availablePct}%)
          </span>
          <span className="text-slate-400">
            Total: {formatWeight(totalKg)}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden flex border border-slate-700/50 ${heightClass}`}>
        <div
          className="bg-slate-600/60 transition-all duration-500"
          style={{ width: `${bookedPct}%` }}
          title={`Booked: ${formatWeight(bookedKg)}`}
        />
        <div
          className="bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-500"
          style={{ width: `${availablePct}%` }}
          title={`Available Capacity: ${formatWeight(availableKg)}`}
        />
      </div>
    </div>
  );
};
