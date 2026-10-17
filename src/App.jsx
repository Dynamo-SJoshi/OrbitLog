import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Header from './components/Header';
import LiveMap from './components/LiveMap';
import FlightConsole from './components/FlightConsole';
import OrbitTimeline from './components/OrbitTimeline';
import { 
  fetchISSTelemetry, 
  fetchLiveCrew,
  calculateSuratTelemetry
} from './services/issApi';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [trackHistory, setTrackHistory] = useState([]);
  const [crewData, setCrewData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'connected' | 'error'
  const [isFetching, setIsFetching] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds
  const [autoCenter, setAutoCenter] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false); // Collapsed by default for clean full-screen map

  const abortControllerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  // Core telemetry fetching function
  const loadTelemetry = useCallback(async (isManual = false) => {
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
      if (err.name === 'AbortError') return;
      console.error('Telemetry acquisition error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to communicate with ISS tracking satellite server');
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Fetch live astronaut crew manifest on mount
  useEffect(() => {
    const controller = new AbortController();
    fetchLiveCrew(controller.signal).then(setCrewData).catch(() => {});
    return () => controller.abort();
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

  // Calculate live Surat Ground Station vector
  const suratTelemetry = useMemo(() => {
    if (!telemetry) return null;
    return calculateSuratTelemetry(
      telemetry.latitude,
      telemetry.longitude,
      telemetry.altitude,
      telemetry.footprint
    );
  }, [telemetry]);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#070b12] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Compact Tactical Flight Header */}
      <Header
        status={status}
        isFetching={isFetching}
        lastUpdated={lastUpdated}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onManualRefresh={() => loadTelemetry(true)}
        onCenterMap={() => setAutoCenter(true)}
        isStale={isStale}
        isConsoleOpen={isConsoleOpen}
        onToggleConsole={() => setIsConsoleOpen(!isConsoleOpen)}
      />

      {/* Main Full-Viewport Flight Canvas */}
      <div className="relative flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        
        {/* Error notification banner */}
        {status === 'error' && errorMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-rose-950/95 border border-rose-800 text-rose-200 text-xs font-mono shadow-2xl backdrop-blur-md">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Feed Disrupted: {errorMessage}</span>
            <button
              onClick={() => loadTelemetry(true)}
              className="px-2 py-1 rounded bg-rose-900 hover:bg-rose-800 text-rose-100 border border-rose-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              RETRY
            </button>
          </div>
        )}

        {/* Full-Screen Interactive Leaflet Map */}
        <LiveMap
          telemetry={telemetry}
          trackHistory={trackHistory}
          autoCenter={autoCenter}
          setAutoCenter={setAutoCenter}
          isStale={isStale}
        />

        {/* Collapsible Flight Instruments Console (Drawer / Split View) */}
        <FlightConsole
          telemetry={telemetry}
          suratTelemetry={suratTelemetry}
          crewData={crewData}
          isOpen={isConsoleOpen}
          onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
        />

        {/* Bottom Orbit Phase & Timeline Strip */}
        <OrbitTimeline
          telemetry={telemetry}
          suratTelemetry={suratTelemetry}
          isStale={isStale}
        />

      </div>
    </div>
  );
}
