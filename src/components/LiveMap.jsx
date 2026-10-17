import React, { useEffect, useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  Circle, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Crosshair, 
  Layers, 
  Navigation, 
  Eye, 
  Radio, 
  AlertCircle,
  Target
} from 'lucide-react';
import { 
  segmentTrackAcrossDateLine, 
  formatCoordinates, 
  IIIT_SURAT_COORDS 
} from '../services/issApi';

// Custom SVG ISS icon with solar arrays and glowing beacon
const createISSIcon = () => {
  const svgString = `
    <div class="relative flex items-center justify-center w-12 h-12 pointer-events-auto cursor-pointer">
      <!-- Pulsing radar ring -->
      <div class="absolute inset-0 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-ping opacity-60"></div>
      
      <!-- Static orbital halo -->
      <div class="absolute w-8 h-8 rounded-full border border-cyan-300/40 bg-slate-950/80 shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
      
      <!-- Custom ISS SVG Silhouette -->
      <svg class="relative w-8 h-8 text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2">
        <!-- Main Truss -->
        <line x1="4" y1="20" x2="36" y2="20" stroke="#38bdf8" stroke-width="2.5" />
        <!-- Central Modules -->
        <rect x="17" y="15" width="6" height="10" rx="1.5" fill="#0284c7" stroke="#e0f2fe" stroke-width="1.5" />
        <!-- Left Solar Array Mast -->
        <line x1="10" y1="12" x2="10" y2="28" stroke="#0ea5e9" stroke-width="1.5" />
        <!-- Left Solar Panels -->
        <rect x="6" y="9" width="8" height="8" rx="0.5" fill="#0369a1" stroke="#38bdf8" stroke-width="1" />
        <rect x="6" y="23" width="8" height="8" rx="0.5" fill="#0369a1" stroke="#38bdf8" stroke-width="1" />
        <!-- Right Solar Array Mast -->
        <line x1="30" y1="12" x2="30" y2="28" stroke="#0ea5e9" stroke-width="1.5" />
        <!-- Right Solar Panels -->
        <rect x="26" y="9" width="8" height="8" rx="0.5" fill="#0369a1" stroke="#38bdf8" stroke-width="1" />
        <rect x="26" y="23" width="8" height="8" rx="0.5" fill="#0369a1" stroke="#38bdf8" stroke-width="1" />
        <!-- Center beacon dot -->
        <circle cx="20" cy="20" r="2" fill="#38bdf8" />
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgString,
    className: 'iss-custom-leaflet-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -20]
  });
};

// Ground Station Custom Marker for IIIT Surat
const createSuratStationIcon = () => {
  const svg = `
    <div class="relative flex items-center justify-center w-7 h-7">
      <div class="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"></div>
      <div class="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-slate-950 shadow-[0_0_12px_rgba(244,63,94,0.9)] flex items-center justify-center">
        <div class="w-1 h-1 rounded-full bg-white"></div>
      </div>
    </div>
  `;
  return L.divIcon({
    html: svg,
    className: 'surat-station-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// Component to programmatically adjust the map center
function MapController({ center, autoCenter }) {
  const map = useMap();

  useEffect(() => {
    if (autoCenter && center && center[0] !== undefined && center[1] !== undefined) {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, autoCenter, map]);

  return null;
}

export default function LiveMap({
  telemetry,
  trackHistory,
  autoCenter,
  setAutoCenter,
  isStale
}) {
  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'satellite' | 'street'
  const [showFootprint, setShowFootprint] = useState(true);
  const [showGroundTrack, setShowGroundTrack] = useState(true);

  const issIcon = useMemo(() => createISSIcon(), []);
  const suratIcon = useMemo(() => createSuratStationIcon(), []);

  // Map center coordinates
  const currentPos = telemetry ? [telemetry.latitude, telemetry.longitude] : [20, 0];
  const { fullStr } = formatCoordinates(telemetry?.latitude, telemetry?.longitude);

  // Divide ground track across antimeridian to prevent wrap-around glitch
  const polylineSegments = useMemo(() => {
    if (!showGroundTrack || !trackHistory || trackHistory.length === 0) return [];
    return segmentTrackAcrossDateLine(trackHistory);
  }, [trackHistory, showGroundTrack]);

  // Tile presets (100% free, public, zero API keys required)
  const TILE_LAYERS = {
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      label: 'Dark Canvas'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
      label: 'Satellite'
    },
    street: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      label: 'OpenStreetMap'
    }
  };

  const activeTile = TILE_LAYERS[mapStyle] || TILE_LAYERS.dark;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#070b12]">
      
      {/* Map Container */}
      <MapContainer
        center={currentPos}
        zoom={3}
        minZoom={2}
        maxZoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapController center={currentPos} autoCenter={autoCenter} />

        {/* Tile Layer */}
        <TileLayer
          key={mapStyle}
          attribution={activeTile.attribution}
          url={activeTile.url}
          noWrap={false}
        />

        {/* Ground Track Polyline Segments */}
        {showGroundTrack && polylineSegments.map((segment, idx) => (
          <React.Fragment key={idx}>
            {/* Outer subtle glow */}
            <Polyline
              positions={segment}
              pathOptions={{
                color: '#06b6d4',
                weight: 4,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Core sharp ground line */}
            <Polyline
              positions={segment}
              pathOptions={{
                color: '#38bdf8',
                weight: 2,
                opacity: 0.85,
                dashArray: '4, 6',
                lineCap: 'round'
              }}
            />
          </React.Fragment>
        ))}

        {/* Visibility Footprint Circle */}
        {telemetry && showFootprint && telemetry.footprint && (
          <Circle
            center={[telemetry.latitude, telemetry.longitude]}
            radius={telemetry.footprint * 500} // radius in meters
            pathOptions={{
              color: '#06b6d4',
              fillColor: '#0891b2',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '3, 6'
            }}
          />
        )}

        {/* IIIT Surat Ground Station Marker */}
        <Marker position={[IIIT_SURAT_COORDS.lat, IIIT_SURAT_COORDS.lon]} icon={suratIcon}>
          <Popup className="astra-map-popup">
            <div className="p-1 font-mono text-xs text-slate-900">
              <div className="font-bold text-rose-700 border-b pb-1 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                IIIT Surat Ground Station
              </div>
              <div className="text-[11px] text-slate-700 space-y-0.5">
                <div>Coords: {IIIT_SURAT_COORDS.lat}°N, {IIIT_SURAT_COORDS.lon}°E</div>
                <div>Station: ASTRA Club, IIIT Surat</div>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* ISS Position Marker */}
        {telemetry && (
          <Marker position={[telemetry.latitude, telemetry.longitude]} icon={issIcon}>
            <Popup className="astra-map-popup">
              <div className="p-1 font-mono text-xs text-slate-900">
                <div className="font-bold text-cyan-900 border-b pb-1 mb-1.5 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-700" />
                  International Space Station
                </div>
                <div className="text-[11px] space-y-1">
                  <div><strong>Coords:</strong> {fullStr}</div>
                  {telemetry.altitude && <div><strong>Altitude:</strong> {telemetry.altitude.toFixed(1)} km</div>}
                  {telemetry.velocity && <div><strong>Speed:</strong> {Math.round(telemetry.velocity).toLocaleString()} km/h</div>}
                  <div><strong>Phase:</strong> <span className="capitalize">{telemetry.visibility}</span></div>
                  <div><strong>Feed:</strong> {telemetry.source}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Status / Stale Warning Banner */}
      {isStale && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/90 border border-amber-600/80 text-amber-200 text-xs font-mono shadow-xl backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Telemetry Stale: No signal received for &gt;30s</span>
        </div>
      )}

      {/* Floating Map Controls HUD (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 font-mono">
        {/* Toggle Auto Center */}
        <button
          onClick={() => setAutoCenter(!autoCenter)}
          title={autoCenter ? 'Lock view onto ISS' : 'Unlock camera pan'}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
            autoCenter
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/80 shadow-cyan-950/40'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <Crosshair className={`w-3.5 h-3.5 ${autoCenter ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{autoCenter ? 'TRACKING' : 'FREE PAN'}</span>
        </button>

        {/* Toggle Map Tiles: Dark -> Satellite -> Street */}
        <button
          onClick={() => {
            setMapStyle((prev) => {
              if (prev === 'dark') return 'satellite';
              if (prev === 'satellite') return 'street';
              return 'dark';
            });
          }}
          title="Switch Map Tiles (100% Free - Dark Canvas / Satellite / OSM)"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 backdrop-blur-md transition-all shadow-lg cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">{activeTile.label}</span>
        </button>

        {/* Toggle Footprint Circle */}
        <button
          onClick={() => setShowFootprint(!showFootprint)}
          title="Toggle Line-of-Sight Horizon Footprint"
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
            showFootprint
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60'
              : 'bg-slate-900/90 text-slate-400 border-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">HORIZON</span>
        </button>

        {/* Toggle Ground Track */}
        <button
          onClick={() => setShowGroundTrack(!showGroundTrack)}
          title="Toggle Ground Track History Trail"
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
            showGroundTrack
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60'
              : 'bg-slate-900/90 text-slate-400 border-slate-800'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">TRACK ({trackHistory.length})</span>
        </button>
      </div>
    </div>
  );
}
