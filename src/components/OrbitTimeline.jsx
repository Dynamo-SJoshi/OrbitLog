import React from 'react';
import { 
  Sun, 
  Moon, 
  Target 
} from 'lucide-react';
import { formatCoordinates } from '../services/issApi';

export default function OrbitTimeline({
  telemetry,
  suratTelemetry,
  isStale
}) {
  const coords = formatCoordinates(telemetry?.latitude, telemetry?.longitude);
  const isEclipsed = telemetry?.visibility === 'eclipsed';

  return (
    <div className="absolute bottom-4 inset-x-4 md:inset-x-8 z-20 pointer-events-none">
      <div className="max-w-6xl mx-auto rounded-xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-xl p-3 shadow-2xl pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs text-slate-300">
        
        {/* Left: Position & Altitude Badge */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">POSITION:</span>
            <span className="text-cyan-300 font-bold">{coords.fullStr}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">ALT:</span>
            <span className="text-slate-100 font-bold">
              {telemetry?.altitude ? `${telemetry.altitude.toFixed(1)} km` : '--'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">SPEED:</span>
            <span className="text-emerald-400 font-bold">
              {telemetry?.velocity ? `${Math.round(telemetry.velocity).toLocaleString()} km/h` : '--'}
            </span>
          </div>
        </div>

        {/* Center: Orbital Solar Phase Indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-center px-2 py-1 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="flex items-center gap-1.5">
            {isEclipsed ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-[11px] font-bold">
              {isEclipsed ? 'ORBITAL ECLIPSE (NIGHT)' : 'DAYLIGHT TRANSIT (SUN)'}
            </span>
          </div>

          <span className="text-[10px] text-slate-400">
            Orbit Period: <strong className="text-slate-200">92.9 min</strong>
          </span>
        </div>

        {/* Right: Surat Proximity & Stale Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-[11px]">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">IIIT Surat:</span>
            <span className={`font-bold ${suratTelemetry?.isLineOfSight ? 'text-emerald-400' : 'text-slate-200'}`}>
              {typeof suratTelemetry?.distanceKm === 'number' ? `${suratTelemetry.distanceKm.toLocaleString()} km` : '--'}
            </span>
          </div>

          {suratTelemetry?.isLineOfSight && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 animate-pulse">
              DIRECT LOS
            </span>
          )}

          {isStale && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
              STALE
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
