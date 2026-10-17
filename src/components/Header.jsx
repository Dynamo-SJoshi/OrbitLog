import React from 'react';
import { 
  RefreshCw, 
  Crosshair, 
  WifiOff, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export default function Header({
  status,
  isFetching,
  lastUpdated,
  autoRefresh,
  setAutoRefresh,
  refreshInterval,
  setRefreshInterval,
  onManualRefresh,
  onCenterMap,
  isStale
}) {
  const getStatusBadge = () => {
    if (status === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <WifiOff className="w-3.5 h-3.5" />
          Offline / Error
        </span>
      );
    }
    if (isStale) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Telemetry Stale
        </span>
      );
    }
    if (isFetching) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Acquiring...
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Telemetry Active
      </span>
    );
  };

  return (
    <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Branding & Club Title */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] group cursor-default">
            {/* Custom SVG OrbitLog Emblem */}
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 32 32" fill="none">
              {/* Planetary / Core Body */}
              <circle cx="16" cy="16" r="4.5" fill="#0891b2" className="animate-pulse" />
              <circle cx="16" cy="16" r="3" fill="#38bdf8" />
              {/* Primary Orbital Ellipse */}
              <ellipse cx="16" cy="16" rx="11" ry="4.5" transform="rotate(-30 16 16)" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.9" />
              {/* Secondary Trajectory Arc */}
              <ellipse cx="16" cy="16" rx="12" ry="5.5" transform="rotate(35 16 16)" stroke="#818cf8" strokeWidth="1.2" opacity="0.6" />
              {/* Satellite Node on Orbit */}
              <circle cx="24" cy="11.5" r="1.8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
              <circle cx="8" cy="20.5" r="1.2" fill="#a5f3fc" />
            </svg>
            <div className="absolute inset-0 rounded-xl pulse-ring border border-cyan-400/30 pointer-events-none"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-200">Orbit</span>
                <span className="text-white font-extrabold tracking-normal">Log</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                ISS LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Astronomy &amp; Astrophysics Club &mdash; <span className="text-slate-300 font-semibold">IIIT Surat</span>
            </p>
          </div>

          <div className="md:hidden">
            {getStatusBadge()}
          </div>
        </div>

        {/* Controls and Telemetry Status */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full md:w-auto text-xs">
          <div className="hidden md:flex items-center">
            {getStatusBadge()}
          </div>

          {/* Last Updated Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Updated:</span>
            <span className="font-mono font-medium text-slate-200">
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--:--'}
            </span>
          </div>

          {/* Center Map Button */}
          <button
            onClick={onCenterMap}
            title="Recenter camera on ISS coordinates"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Center ISS</span>
          </button>

          {/* Refresh Frequency Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <label htmlFor="poll-interval" className="text-slate-400 text-[11px]">Poll:</label>
            <select
              id="poll-interval"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value={5} className="bg-slate-900 text-slate-200">5s</option>
              <option value={10} className="bg-slate-900 text-slate-200">10s</option>
              <option value={15} className="bg-slate-900 text-slate-200">15s</option>
              <option value={30} className="bg-slate-900 text-slate-200">30s</option>
            </select>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer border ${
              autoRefresh 
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/60' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`}></span>
            <span>{autoRefresh ? 'Auto Sync ON' : 'Paused'}</span>
          </button>

          {/* Manual Fetch Button */}
          <button
            onClick={onManualRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-md shadow-cyan-900/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}
