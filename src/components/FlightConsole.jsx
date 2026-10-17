import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  Gauge, 
  Zap, 
  Sun, 
  Moon, 
  Users, 
  Target, 
  Activity 
} from 'lucide-react';
import { 
  IIIT_SURAT_COORDS, 
  formatCoordinates, 
  formatVelocity, 
  formatAltitude 
} from '../services/issApi';

export default function FlightConsole({
  telemetry,
  suratTelemetry,
  crewData,
  isOpen,
  onToggle
}) {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'station' | 'crew'

  const coords = formatCoordinates(telemetry?.latitude, telemetry?.longitude);
  const velocity = formatVelocity(telemetry?.velocity);
  const altitude = formatAltitude(telemetry?.altitude);

  return (
    <>
      {/* Floating Toggle Pill when sidebar is closed on desktop/mobile */}
      {!isOpen && (
        <button
          onClick={onToggle}
          title="Open Flight Instruments Console"
          className="absolute top-16 left-4 z-30 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-mono font-medium transition-all cursor-pointer group"
        >
          <Activity className="w-4 h-4 text-cyan-400 group-hover:animate-pulse" />
          <span>FLIGHT CONSOLE</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Main Console Drawer */}
      <aside
        className={`fixed md:absolute top-14 bottom-0 left-0 z-30 w-full sm:w-96 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/90 text-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Console Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-mono text-xs font-bold tracking-widest text-slate-200 uppercase">
              Flight Operations Console
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              ORBIT-01
            </span>
            <button
              onClick={onToggle}
              title="Collapse Console"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tactical Sub-Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-mono bg-slate-950/50">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-2 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            TELEMETRY
          </button>
          <button
            onClick={() => setActiveTab('station')}
            className={`py-2 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'station'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            SURAT VECTOR
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={`py-2 text-center transition-colors border-b-2 cursor-pointer ${
              activeTab === 'crew'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            CREW ({crewData?.issCrew?.length || 0})
          </button>
        </div>

        {/* Scrollable Instrument Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          
          {/* TAB 1: Primary Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="space-y-3">
              {/* Geodetic Position Block */}
              <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5 uppercase font-bold text-slate-300">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    Sub-Satellite Point (SSP)
                  </span>
                  <span className="text-[10px] text-slate-400">DATUM: WGS84</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Latitude</span>
                    <span className="text-sm font-bold text-cyan-300">{coords.latStr}</span>
                    <span className="text-[10px] text-slate-400 block">{telemetry ? `${telemetry.latitude.toFixed(4)}°` : '--'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Longitude</span>
                    <span className="text-sm font-bold text-cyan-300">{coords.lonStr}</span>
                    <span className="text-[10px] text-slate-400 block">{telemetry ? `${telemetry.longitude.toFixed(4)}°` : '--'}</span>
                  </div>
                </div>
              </div>

              {/* Speed & Altitude Vectors */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                    <Gauge className="w-3 h-3 text-cyan-400" />
                    Altitude
                  </div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {telemetry?.altitude ? `${telemetry.altitude.toFixed(1)} km` : '--'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{altitude.miles}</div>
                </div>

                <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    Ground Speed
                  </div>
                  <div className="text-base font-bold text-emerald-300 mt-1">
                    {velocity.kmh}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{velocity.kms} &bull; {velocity.mach}</div>
                </div>
              </div>

              {/* Solar State & Horizon Footprint */}
              <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300 uppercase">
                    {telemetry?.visibility === 'eclipsed' ? (
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    Solar Phase
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    telemetry?.visibility === 'eclipsed' 
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' 
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {telemetry?.visibility === 'eclipsed' ? 'In Umbra (Night)' : 'Sunlit (Day)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">LOS Footprint</span>
                    <span className="font-bold text-slate-200">
                      {telemetry?.footprint ? `${Math.round(telemetry.footprint).toLocaleString()} km` : '--'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Power State</span>
                    <span className="font-bold text-slate-200">
                      {telemetry?.visibility === 'eclipsed' ? 'Battery Deplete' : 'Solar Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Orbital Specifications Card */}
              <div className="rounded-lg bg-slate-900/50 border border-slate-800/80 p-3 text-[11px] space-y-1.5 text-slate-400">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Baseline Orbital Parameters
                </div>
                <div className="flex justify-between">
                  <span>Orbital Period:</span>
                  <span className="text-slate-200 font-bold">~92.9 min (15.5 orbits/day)</span>
                </div>
                <div className="flex justify-between">
                  <span>Inclination:</span>
                  <span className="text-slate-200 font-bold">51.64° to Equator</span>
                </div>
                <div className="flex justify-between">
                  <span>NORAD Catalog ID:</span>
                  <span className="text-cyan-400 font-bold">25544 (ZARYA)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IIIT Surat Ground Station Pass Vector */}
          {activeTab === 'station' && (
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-900/70 border border-slate-800 p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-bold text-slate-200 uppercase">{IIIT_SURAT_COORDS.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {IIIT_SURAT_COORDS.lat}°N, {IIIT_SURAT_COORDS.lon}°E
                  </span>
                </div>

                {/* Live Distance Gauge */}
                <div className="py-2 text-center bg-slate-950/70 rounded border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Great-Circle Ground Distance</span>
                  <span className="text-2xl font-black text-slate-100 font-mono">
                    {typeof suratTelemetry?.distanceKm === 'number' ? `${suratTelemetry.distanceKm.toLocaleString()} km` : '--'}
                  </span>
                </div>

                {/* Direct Line-of-Sight Status Banner */}
                <div className={`p-2.5 rounded-lg border text-center font-bold text-[11px] uppercase tracking-wider ${
                  suratTelemetry?.isLineOfSight
                    ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${suratTelemetry?.isLineOfSight ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
                    <span>{suratTelemetry?.elevationStatus || 'CALCULATING...'}</span>
                  </div>
                </div>

                {/* Bearing Vector */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-slate-950/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Azimuth Heading</span>
                    <span className="text-slate-100 font-bold">
                      {typeof suratTelemetry?.bearingDeg === 'number' ? `${suratTelemetry.bearingDeg}° (${suratTelemetry.bearingCardinal})` : '--'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Target Satellite</span>
                    <span className="text-cyan-300 font-bold">ISS (Expedition 72)</span>
                  </div>
                </div>
              </div>

              {/* Informational Callout for Students */}
              <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-300/90 leading-relaxed">
                <strong>ASTRA Club Tip:</strong> When the ground distance drops below ~2,200 km, the ISS climbs above the local horizon at Surat. In clear evening/pre-dawn skies, it is visible to the naked eye as a bright moving star!
              </div>
            </div>
          )}

          {/* TAB 3: Expedition Crew Aboard */}
          {activeTab === 'crew' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5 font-bold uppercase text-slate-300">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Humans in Orbit Right Now
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                  {crewData?.issCrew?.length || 0} on ISS
                </span>
              </div>

              <div className="space-y-1.5">
                {crewData?.issCrew?.map((astronaut, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span className="font-bold text-slate-100">{astronaut.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {astronaut.agency || 'ISS'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 pl-3.5">
                      <span>{astronaut.role || 'Flight Engineer'}</span>
                      <span className="text-slate-500">{astronaut.nation}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 text-right">
                Manifest: {crewData?.source || 'NASA / Roscosmos Official Manifest'}
              </div>
            </div>
          )}

        </div>

        {/* Console Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 flex justify-between items-center font-mono">
          <span>ASTRA &bull; IIIT SURAT</span>
          <span>WGS-84 TELEMETRY</span>
        </div>
      </aside>
    </>
  );
}
