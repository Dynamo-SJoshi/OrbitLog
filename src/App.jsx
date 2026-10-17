import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import LiveMap from './components/LiveMap';
import TelemetryCard from './components/TelemetryCard';
import ISSInfoPanel from './components/ISSInfoPanel';
import { 
  fetchISSTelemetry, 
  formatCoordinates, 
  formatVelocity, 
  formatAltitude 
} from './services/issApi';
import { 
  Compass, 
  MapPin, 
  Gauge, 
  Zap, 
  Sun, 
  Moon, 
  Radio, 
  AlertOctagon, 
  RefreshCw 
} from 'lucide-react';

export default function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [trackHistory, setTrackHistory] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'connected' | 'error'
  const [isFetching, setIsFetching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [autoCenter, setAutoCenter] = useState(false); // allow user freedom by default, with easy toggle
  const [isStale, setIsStale] = useState(false);

  // Store abort controller reference for cleanup
  const abortControllerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  // Core telemetry fetching function
  const loadTelemetry = useCallback(async (isManual = false) => {
    // If a request is currently pending, cancel it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isManual) {
      setIsFetching(true);
    }

    try {
      const data = await fetchISSTelemetry(controller.signal);
      
      hasLoadedRef.current = true;
      setTelemetry(data);
      setLastUpdated(data.fetchedAt);
      setStatus('connected');
      setIsStale(false);
      setErrorMessage(null);

      // Append coordinate to track history (limit history to 80 points)
      setTrackHistory((prev) => {
        const nextPoint = {
          lat: data.latitude,
          lon: data.longitude,
          timestamp: data.timestamp
        };
        // Avoid duplicate consecutive coordinates
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          if (last.lat === nextPoint.lat && last.lon === nextPoint.lon) {
            return prev;
          }
        }
        const updated = [...prev, nextPoint];
        return updated.length > 80 ? updated.slice(updated.length - 80) : updated;
      });

    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Normal abort on unmount/re-fetch
      }
      console.error('Telemetry acquisition error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to communicate with ISS tracking satellite server');
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    loadTelemetry();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadTelemetry]);

  // Periodic polling interval
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      loadTelemetry();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, loadTelemetry]);

  // Stale data watchdog (checks if last update was > 30 seconds ago)
  useEffect(() => {
    const watchdogId = setInterval(() => {
      if (lastUpdated && Date.now() - lastUpdated > 30000) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }
    }, 2000);

    return () => clearInterval(watchdogId);
  }, [lastUpdated]);

  // Helper formatting for card displays
  const coords = formatCoordinates(telemetry?.latitude, telemetry?.longitude);
  const velocity = formatVelocity(telemetry?.velocity);
  const altitude = formatAltitude(telemetry?.altitude);

  // Center Map trigger
  const handleCenterMap = () => {
    setAutoCenter(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      

      {/* Mission Control Header */}
      <Header
        status={status}
        isFetching={isFetching}
        lastUpdated={lastUpdated}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onManualRefresh={() => loadTelemetry(true)}
        onCenterMap={handleCenterMap}
        isStale={isStale}
      />

      {/* Main Mission Dashboard Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Error notification banner */}
        {status === 'error' && errorMessage && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">Telemetry Feed Disrupted</h3>
                <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => loadTelemetry(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-100 border border-rose-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Signal
            </button>
          </div>
        )}

        {/* Telemetry Metrics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Latitude */}
          <TelemetryCard
            icon={Compass}
            label="Latitude"
            value={coords.latStr}
            subValue={telemetry ? `${telemetry.latitude.toFixed(4)}°` : '--'}
            badge="Geodetic"
            badgeColor="cyan"
            accentColor="cyan"
            isLoading={status === 'loading'}
          />

          {/* Longitude */}
          <TelemetryCard
            icon={MapPin}
            label="Longitude"
            value={coords.lonStr}
            subValue={telemetry ? `${telemetry.longitude.toFixed(4)}°` : '--'}
            badge="WGS-84"
            badgeColor="cyan"
            accentColor="cyan"
            isLoading={status === 'loading'}
          />

          {/* Altitude */}
          <TelemetryCard
            icon={Gauge}
            label="Altitude"
            value={telemetry?.altitude ? telemetry.altitude.toFixed(1) : '--'}
            unit="km"
            subValue={altitude.miles}
            badge="LEO Orbit"
            badgeColor="violet"
            accentColor="violet"
            isLoading={status === 'loading'}
          />

          {/* Velocity */}
          <TelemetryCard
            icon={Zap}
            label="Velocity"
            value={telemetry?.velocity ? Math.round(telemetry.velocity).toLocaleString() : '--'}
            unit="km/h"
            subValue={velocity.kms}
            badge="Orbital"
            badgeColor="emerald"
            accentColor="emerald"
            isLoading={status === 'loading'}
          />

          {/* Solar Illumination */}
          <TelemetryCard
            icon={telemetry?.visibility === 'eclipsed' ? Moon : Sun}
            label="Solar State"
            value={
              telemetry?.visibility
                ? telemetry.visibility.charAt(0).toUpperCase() + telemetry.visibility.slice(1)
                : '--'
            }
            subValue={
              telemetry?.visibility === 'eclipsed'
                ? "In Earth's Umbra"
                : 'Direct Sunlight'
            }
            badge={telemetry?.visibility === 'eclipsed' ? 'Night' : 'Daylight'}
            badgeColor={telemetry?.visibility === 'eclipsed' ? 'violet' : 'amber'}
            accentColor={telemetry?.visibility === 'eclipsed' ? 'violet' : 'amber'}
            isLoading={status === 'loading'}
          />

          {/* Horizon Footprint */}
          <TelemetryCard
            icon={Radio}
            label="LOS Footprint"
            value={telemetry?.footprint ? Math.round(telemetry.footprint).toLocaleString() : '--'}
            unit="km"
            subValue="Line-of-sight"
            badge="Coverage"
            badgeColor="cyan"
            accentColor="cyan"
            isLoading={status === 'loading'}
          />
        </section>

        {/* Live Interactive Map Section */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h2 className="text-sm font-bold tracking-wider uppercase text-slate-300">
                Live Sub-Satellite Trajectory
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Signal source: <span className="text-cyan-400">{telemetry?.source || 'Detecting...'}</span>
            </span>
          </div>

          <LiveMap
            telemetry={telemetry}
            trackHistory={trackHistory}
            autoCenter={autoCenter}
            setAutoCenter={setAutoCenter}
            isStale={isStale}
          />
        </section>

        {/* Educational Reference & ISS Science Panel */}
        <section>
          <ISSInfoPanel />
        </section>
      </main>

      {/* Mission Control Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-semibold text-slate-300">
              OrbitLog &bull; ASTRA &mdash; Astronomy &amp; Astrophysics Club
            </p>
            <p className="text-slate-400">
              Indian Institute of Information Technology Surat (IIIT Surat)
            </p>
          </div>

          <div className="flex items-center gap-6 text-[11px] font-mono text-slate-400">
            <span>Data: wheretheiss.at / Open-Notify</span>
            <span>Tiles: Esri / OpenStreetMap</span>
            <span>Coordinates: WGS84 Datum</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
