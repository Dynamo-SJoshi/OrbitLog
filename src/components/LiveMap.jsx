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
  AlertCircle 
} from 'lucide-react';
import { segmentTrackAcrossDateLine, formatCoordinates } from '../services/issApi';

// Custom SVG ISS icon with solar arrays and glowing beacon
const createISSIcon = () => {
  const svgString = `
    <div class="relative flex items-center justify-center w-12 h-12">
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
    <div className="relative w-full h-[450px] sm:h-[520px] lg:h-[600px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      
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
                weight: 5,
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

        {/* ISS Position Marker */}
        {telemetry && (
          <Marker position={[telemetry.latitude, telemetry.longitude]} icon={issIcon}>
            <Popup className="astra-map-popup">
              <div className="p-1 font-sans text-slate-900">
                <div className="font-bold text-sm text-cyan-950 border-b pb-1 mb-1.5 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-700" />
                  International Space Station
                </div>
                <div className="text-xs space-y-1">
                  <div><strong>Coordinates:</strong> {fullStr}</div>
                  {telemetry.altitude && <div><strong>Altitude:</strong> {telemetry.altitude.toFixed(1)} km</div>}
                  {telemetry.velocity && <div><strong>Speed:</strong> {Math.round(telemetry.velocity).toLocaleString()} km/h</div>}
                  <div><strong>Visibility:</strong> <span className="capitalize">{telemetry.visibility}</span></div>
                  <div><strong>Signal Source:</strong> {telemetry.source}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Status / Stale Warning Banner */}
      {isStale && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-950/90 border border-amber-600/60 text-amber-200 text-xs shadow-xl backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Telemetry stale: No new signal received for &gt;30s. Showing last known coordinates.</span>
        </div>
      )}

      {/* Floating Map Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Toggle Auto Center */}
        <button
          onClick={() => setAutoCenter(!autoCenter)}
          title={autoCenter ? 'Lock view onto ISS' : 'Unlock camera pan'}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
            autoCenter
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-cyan-950/40'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/70 hover:bg-slate-800/90'
          }`}
        >
          <Crosshair className={`w-4 h-4 ${autoCenter ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          <span>{autoCenter ? 'Tracking ISS' : 'Free Camera'}</span>
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
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 border border-slate-700/70 backdrop-blur-md transition-all shadow-lg cursor-pointer"
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>{activeTile.label}</span>
        </button>

        {/* Toggle Footprint Circle */}
        <button
          onClick={() => setShowFootprint(!showFootprint)}
          title="Toggle Line-of-Sight Horizon Footprint"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
            showFootprint
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600/40'
              : 'bg-slate-900/90 text-slate-400 border-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Footprint</span>
        </button>

        {/* Toggle Ground Track */}
        <button
          onClick={() => setShowGroundTrack(!showGroundTrack)}
          title="Toggle Ground Track History Trail"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
            showGroundTrack
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600/40'
              : 'bg-slate-900/90 text-slate-400 border-slate-800'
          }`}
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span>Track Trail ({trackHistory.length})</span>
        </button>
      </div>

      {/* Floating Bottom Coordinates HUD */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs font-mono backdrop-blur-md text-slate-300 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-slate-400 uppercase tracking-wider text-[10px]">Position:</span>
          <span className="text-cyan-300 font-bold">{fullStr}</span>
        </div>
      </div>
    </div>
  );
}
