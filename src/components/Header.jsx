import { 
  Satellite,
  RefreshCw, 
  Crosshair, 
  WifiOff, 
  Clock, 
  AlertTriangle,
  LayoutDashboard
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
  isStale,
  isConsoleOpen,
  onToggleConsole
}) {
  const [utcTime, setUtcTime] = useState('');

  // Live UTC Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    const timeTooltip = `Last sync: ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Acquiring...'}`;
    if (status === 'error') {
      return (
        <span title={timeTooltip} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
          <WifiOff className="w-3 h-3 text-rose-400" />
          OFFLINE
        </span>
      );
    }
    if (isStale) {
      return (
        <span title={timeTooltip} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          STALE
        </span>
      );
    }
    if (isFetching) {
      return (
        <span title={timeTooltip} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
          <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
          SYNCING
        </span>
      );
    }
    return (
      <span title={timeTooltip} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-slate-900 text-emerald-400 border border-emerald-900/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        LIVE TELEMETRY
      </span>
    );
  };

  return (
    <header className="relative z-30 h-14 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between text-slate-200">
      
      {/* Left: Branding, Toggle Console, & Club Subtitle */}
      <div className="flex items-center gap-3">
        {/* Toggle Flight Console Drawer */}
        <button
          onClick={onToggleConsole}
          title={isConsoleOpen ? 'Hide Flight Console' : 'Show Flight Console'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-mono font-semibold transition-all cursor-pointer ${
            isConsoleOpen
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-600 shadow-sm'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">CONSOLE</span>
        </button>

        {/* Satellite Logo & Title */}
        <div className="flex items-center gap-2">
          <Satellite className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
          <h1 className="text-base sm:text-lg font-black tracking-tight flex items-baseline">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Orbit</span>
            <span className="text-white font-extrabold">Log</span>
          </h1>
          <span className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            NORAD 25544
          </span>
        </div>

        <div className="hidden lg:block pl-2 border-l border-slate-800 text-[11px] text-slate-400">
          Astronomy &amp; Astrophysics Club &bull; <span className="text-slate-300">IIIT Surat</span>
        </div>
      </div>

      {/* Center: Live UTC Flight Clock */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-300">
        <Clock className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-400 font-semibold">UTC:</span>
        <span className="text-slate-100">{utcTime || '--:--:--'}</span>
      </div>

      {/* Right: Status Badges & Quick Action Controls */}
      <div className="flex items-center gap-2 text-xs">
        {/* Status Indicator */}
        {getStatusBadge()}

        {/* Center ISS Shortcut */}
        <button
          onClick={onCenterMap}
          title="Center Map on ISS"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors cursor-pointer text-[11px] font-mono"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">CENTER</span>
        </button>

        {/* Interval Dropdown */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <label htmlFor="poll-sel" className="text-slate-500">POLL:</label>
          <select
            id="poll-sel"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={!autoRefresh}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value={5} className="bg-slate-900">5s</option>
            <option value={10} className="bg-slate-900">10s</option>
            <option value={30} className="bg-slate-900">30s</option>
          </select>
        </div>

        {/* Auto Refresh Toggle */}
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          title="Toggle Auto Refresh"
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer border ${
            autoRefresh 
              ? 'bg-cyan-950/50 text-cyan-300 border-cyan-800 hover:bg-cyan-900/50' 
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className="hidden md:inline">{autoRefresh ? 'AUTO' : 'MANUAL'}</span>
        </button>

        {/* Manual Sync Button */}
        <button
          onClick={onManualRefresh}
          disabled={isFetching}
          title="Fetch Immediate Telemetry"
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] font-mono transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          <span>SYNC</span>
        </button>
      </div>
    </header>
  );
}
