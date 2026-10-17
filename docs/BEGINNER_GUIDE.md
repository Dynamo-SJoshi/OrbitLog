# OrbitLog — Complete Beginner's Build Guide

> **Created for:** ASTRA — The Astronomy and Astrophysics Club at IIIT Surat  
> **Level:** Beginner to Intermediate  
> **Estimated Reading & Build Time:** 2 – 3 hours  
> **Target Audience:** Engineering and science students curious about space informatics, real-time satellite telemetry, spherical trigonometry, and modern aerospace web applications.

---

## Table of Contents

1. [Chapter 1 — What Are We Building?](#chapter-1--what-are-we-building)
2. [Chapter 2 — Tools & Installation](#chapter-2--tools--installation)
3. [Chapter 3 — Create the Project from Scratch](#chapter-3--create-the-project-from-scratch)
4. [Chapter 4 — Fetch Real ISS Telemetry & Crew Feeds](#chapter-4--fetch-real-iss-telemetry--crew-feeds)
5. [Chapter 5 — Build the Live Flight Deck Map](#chapter-5--build-the-live-flight-deck-map)
6. [Chapter 6 — Build the Tactical Flight Console & HUD](#chapter-6--build-the-tactical-flight-console--hud)
7. [Chapter 7 — Testing, Stale States & Edge Cases](#chapter-7--testing-stale-states--edge-cases)
8. [Chapter 8 — Run, Preview & Deploy](#chapter-8--run-preview--deploy)
9. [Chapter 9 — Comprehensive Troubleshooting Table](#chapter-9--troubleshooting-table)
10. [Chapter 10 — What to Build Next](#chapter-10--what-to-build-next)

---

## Chapter 1 — What Are We Building?

### 1.1 The International Space Station (ISS)
The **International Space Station (ISS)** is the largest artificial object in space. Orbiting the Earth in Low Earth Orbit (LEO) at an average altitude of approximately **420 km** above sea level, it travels at a staggering speed of **~27,600 km/h** (~7.66 km per second). At this velocity, the ISS circles our planet once every **~92.9 minutes**, giving astronauts aboard 16 sunrises and sunsets every single Earth day.

### 1.2 What OrbitLog Does
**OrbitLog** is a full-viewport (`100vw × 100vh`) aerospace operations deck built for the ASTRA Astronomy Club at IIIT Surat, functioning as a real-time mission-control interface:
- **Full-Viewport Interactive Map:** High-precision Leaflet canvas with Esri Dark Canvas, Esri Satellite imagery, and OpenStreetMap tiles (100% free with zero API keys).
- **Sub-Second Orbital Telemetry:** Live geodetic WGS-84 coordinates, altitude, orbital velocity (km/h, km/s, Mach), line-of-sight footprint radius, and day/night orbital eclipse state.
- **IIIT Surat Ground Station Vector:** Real-time great-circle distance (km / miles), forward azimuth bearing, and line-of-sight elevation tracking between the ISS and the IIIT Surat campus ($21.1702^\circ\text{ N}, 72.8311^\circ\text{ E}$) via spherical trigonometry (Haversine formula).
- **Automated Live Astronaut Manifest:** Live expedition roster querying an active REST API (`corquaid.github.io/international-space-station-APIs`), dynamically displaying astronaut names, roles, launch spacecraft, and space agencies with zero manual updates.
- **Collapsible Tactical Avionics Console:** Side drawer with three dedicated flight tabs (*Telemetry*, *Surat Vector*, *Crew Manifest*).
- **Floating Orbital HUD Strip:** Bottom telemetry status bar providing quick-glance flight metrics without obstructing the orbital map.
- **Resilient Engineering:** Failover API redundancy, antimeridian ($\pm 180^\circ$) polyline date-line split algorithm, and a stale-data watchdog (>30s alert).

### 1.3 System Architecture
Here is how the browser, telemetry APIs, spherical geometry engine, and Leaflet layer operate together:

```text
  +-------------------------------------------------------------+
  |              WhereTheISS / Corquaid APIs (Public)           |
  +-------------------------------------------------------------+
                   ^                               ^
                   | Telemetry (5s)                | Crew Manifest (on mount)
                   v                               v
  +-------------------------------------------------------------+
  |                   OrbitLog Flight Deck (React 19)           |
  |                                                             |
  |   +-----------------------+     +-----------------------+   |
  |   |   issApi.js Service   | <-> |  Stale Data Watchdog  |   |
  |   | - Fallback Redundancy |     |   (Checks >30s gap)   |   |
  |   | - Haversine Geodesy   |     +-----------------------+   |
  |   | - Automated Crew Feed |                                 |
  |   +-----------------------+                                 |
  |               |                                             |
  |               +-----------------------+                     |
  |               v                       v                     |
  |   +-----------------------+     +-----------------------+   |
  |   |   LiveMap (Leaflet)   |     | FlightConsole (Drawer)|   |
  |   | - Esri Dark / Sat /OSM|     | [Tab 1] Telemetry     |   |
  |   | - Antimeridian Split  |     | [Tab 2] Surat Vector  |   |
  |   | - SVG Satellite Pulse |     | [Tab 3] Live Crew     |   |
  |   | - IIIT Surat Station  |     +-----------------------+   |
  |   | - Horizon LOS Circle  |     | OrbitTimeline (HUD)   |   |
  |   +-----------------------+     | - Day/Night & Gauges  |   |
  |                                 +-----------------------+   |
  +-------------------------------------------------------------+
```

---

## Chapter 2 — Tools & Installation

Before writing code, verify that you have the necessary development tools installed on your computer.

### 2.1 Node.js & npm
Node.js is a JavaScript runtime that allows you to run development servers and build tools locally. npm is the Node Package Manager used to install third-party libraries.

Open your terminal (PowerShell on Windows, Terminal on macOS/Linux) and run:

```bash
node -v
npm -v
```

**Expected output:**
```text
v18.x.x (or v20.x.x / v24.x.x)
9.x.x (or 10.x.x / 11.x.x)
```

> [!IMPORTANT]
> **Windows PowerShell Execution Policy Note:**  
> If running `npm` produces the error `File npm.ps1 cannot be loaded because running scripts is disabled on this system`, Windows is blocking unsigned PowerShell scripts.  
> **Solution:** Either use `npm.cmd` instead of `npm`, or open PowerShell as an Administrator and execute:  
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

### 2.2 Git Version Control
Git lets you track code changes and save milestones.

```bash
git --version
```
**Expected output:** `git version 2.x.x`

### 2.3 Recommended Code Editor
We recommend **Visual Studio Code (VS Code)** with the following extensions:
- *Tailwind CSS IntelliSense*
- *ESLint* / *Oxlint*
- *Prettier - Code Formatter*

---

## Chapter 3 — Create the Project from Scratch

### 3.1 Why Vite?
Historically, React beginners used `create-react-app`. However, `create-react-app` is outdated and slow. **Vite** (French for "quick", pronounced *veet*) leverages native ES modules in the browser, providing instant server start and lightning-fast Hot Module Replacement (HMR).

### 3.2 Initialize the Application
Run these commands in your projects folder:

```bash
# 1. Create the project folder and scaffold Vite React
npm create vite@latest OrbitLog -- --template react

# 2. Enter directory
cd OrbitLog

# 3. Install baseline dependencies
npm install

# 4. Install production dependencies for maps and icons
npm install leaflet react-leaflet lucide-react

# 5. Install Tailwind CSS v4 and its Vite plugin
npm install @tailwindcss/vite tailwindcss
```

### 3.3 Folder Structure
After building OrbitLog, your project structure looks like this:

```text
OrbitLog/
├── public/               # Static assets (favicons, manifests)
├── src/
│   ├── components/       # UI Components
│   │   ├── Header.jsx          # Tactical flight bar, UTC clock & quick actions
│   │   ├── LiveMap.jsx         # Full-viewport Leaflet map (Esri Dark/Sat/OSM)
│   │   ├── FlightConsole.jsx   # Collapsible avionics sidebar (Telemetry, Surat, Crew)
│   │   └── OrbitTimeline.jsx   # Bottom orbital phase & telemetry HUD
│   ├── services/
│   │   └── issApi.js           # Telemetry, Haversine geodesy & automated crew API
│   ├── App.jsx           # Main orchestrator & state manager
│   ├── main.jsx          # React DOM entry point
│   └── index.css         # Tailwind & Leaflet styles
├── docs/                 # System architecture, QA test suite & beginner guide
├── index.html            # Webpage shell
├── package.json          # Project manifest & scripts
├── vite.config.js        # Vite bundler configuration
└── README.md
```

### 3.4 Configure Tailwind & Leaflet Styles
In `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

In `src/index.css`:
```css
@import "tailwindcss";
@import "leaflet/dist/leaflet.css";

/* Ensure map fills its container properly */
.leaflet-container {
  width: 100%;
  height: 100%;
  background: #030712;
}
```

> [!WARNING]
> If you forget `@import "leaflet/dist/leaflet.css";`, the world map will render as disjointed, vertical grey strips! Always ensure Leaflet CSS is imported.

---

## Chapter 4 — Fetch Real ISS Telemetry

### 4.1 Understanding the API
The primary data source is the free public endpoint from *Where the ISS at?*:
`https://api.wheretheiss.at/v1/satellites/25544`

When you issue an HTTP `GET` request, the server responds with a JSON payload:
```json
{
  "name": "iss",
  "id": 25544,
  "latitude": 33.1799,
  "longitude": 148.7251,
  "altitude": 425.66,
  "velocity": 27570.56,
  "visibility": "daylight",
  "footprint": 4536.14,
  "timestamp": 1792004903,
  "units": "kilometers"
}
```

### 4.2 Handling Failures Gracefully (Fallback Architecture)
What happens if the primary API server goes down? A robust aerospace tracker should never crash. Instead, we implement a fallback to Open-Notify (`http://api.open-notify.org/iss-now.json`).

Here is the clean implementation in `src/services/issApi.js`:

```javascript
const PRIMARY_API = 'https://api.wheretheiss.at/v1/satellites/25544';
const FALLBACK_API = 'https://api.open-notify.org/iss-now.json';

export async function fetchISSTelemetry(signal) {
  try {
    const response = await fetch(PRIMARY_API, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return validateTelemetry({ ...data, source: 'wheretheiss.at' });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('Primary API failed, switching to fallback...');
    
    const fallbackRes = await fetch(FALLBACK_API, { signal });
    const fbData = await fallbackRes.json();
    return validateTelemetry({
      latitude: parseFloat(fbData.iss_position.latitude),
      longitude: parseFloat(fbData.iss_position.longitude),
      altitude: null,
      velocity: null,
      source: 'open-notify (fallback)',
      timestamp: fbData.timestamp
    });
  }
}
```

### 4.3 Data Validation & Unit Conversion
Always validate incoming numbers before rendering:
- **Latitude:** must be a number between $-90^\circ$ and $+90^\circ$.
- **Longitude:** must be a number between $-180^\circ$ and $+180^\circ$.
- **Speed conversion:** $v_{\text{km/s}} = \frac{v_{\text{km/h}}}{3600}$.
- **Distance conversion:** $d_{\text{miles}} = d_{\text{km}} \times 0.621371$.

### 4.4 Automated Astronaut Manifest API
Many tutorials rely on `open-notify.org/astros.json`. However, that community endpoint is static and unmaintained — it frequently reports landed astronauts who returned to Earth months ago.

In OrbitLog, we connect to an automated, actively maintained API:
`https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json`

```javascript
export async function fetchCrewManifest(signal) {
  try {
    const res = await fetch('https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json', { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // Filter astronauts specifically aboard the ISS
    const issCrew = (data.people || [])
      .filter(p => !p.spacecraft || p.spacecraft.toLowerCase().includes('iss') || p.iss)
      .map(p => ({
        name: p.name,
        role: p.role || 'Flight Engineer',
        spacecraft: p.launch_spacecraft || p.spacecraft || 'ISS',
        agency: p.agency || 'NASA',
        country: p.country || 'USA',
        daysInSpace: p.days_in_space || null
      }));

    return { total: issCrew.length, crew: issCrew, timestamp: Date.now() };
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('Live crew feed failed, loading cached fallback manifest...');
    return getFallbackCrew();
  }
}
```

---

## Chapter 5 — Build the Live Flight Deck Map

### 5.1 Zero-Key Geospatial Tile Providers
Leaflet relies on raster or vector image tiles divided into a grid at various zoom levels ($z/x/y$). While many map services require credit card registrations or inject "API KEY REQUIRED" watermarks (such as CartoDB), OrbitLog uses three 100% free, unwatermarked providers:

1. **Esri Dark Canvas (Tactical Default):**
   `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`
2. **Esri World Imagery (Satellite Mode):**
   `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
3. **OpenStreetMap (Geographic Cartography):**
   `https://tile.openstreetmap.org/{z}/{x}/{y}.png`

### 5.2 The Antimeridian (International Date Line) Problem
The Earth is round, but standard flat maps project longitude from $-180^\circ$ to $+180^\circ$. When the ISS crosses the 180th meridian in the Pacific Ocean (jumping from $+179^\circ$ to $-179^\circ$), standard polyline drawing algorithms will draw a horizontal line across the entire screen!

**The Mathematical Fix:**
Whenever $|\text{lon}_i - \text{lon}_{i-1}| > 180^\circ$, break the polyline into a new segment:

```javascript
export function segmentTrackAcrossDateLine(trackPoints) {
  const segments = [];
  let currentSegment = [];

  for (let i = 0; i < trackPoints.length; i++) {
    const pt = trackPoints[i];
    const coord = [pt.lat, pt.lon];

    if (currentSegment.length === 0) {
      currentSegment.push(coord);
    } else {
      const prevPt = trackPoints[i - 1];
      if (Math.abs(pt.lon - prevPt.lon) > 180) {
        // Crossed the date line: split path!
        segments.push(currentSegment);
        currentSegment = [coord];
      } else {
        currentSegment.push(coord);
      }
    }
  }
  if (currentSegment.length > 0) segments.push(currentSegment);
  return segments;
}
```

### 5.3 Custom Satellite SVG Marker
Rather than using generic Leaflet pins (which often have broken image paths in modern bundlers), we construct a clean custom SVG satellite with solar arrays and an animated radar ping:

```javascript
const issIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-12 h-12">
      <div class="absolute inset-0 rounded-full border border-cyan-400 bg-cyan-400/20 animate-ping"></div>
      <svg class="w-8 h-8 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" viewBox="0 0 40 40">
        <!-- SVG solar arrays and pressurized modules -->
      </svg>
    </div>
  `,
  className: 'iss-marker',
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});
```

### 5.4 IIIT Surat Ground Station Marker
To track proximity to IIIT Surat ($21.1702^\circ\text{ N}, 72.8311^\circ\text{ E}$), a ground station icon with an animated amber beacon is rendered on the map:

```javascript
const suratIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute inset-0 rounded-full border border-amber-400/60 bg-amber-400/10 animate-ping"></div>
      <div class="w-4 h-4 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
    </div>
  `,
  className: 'surat-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});
```

---

## Chapter 6 — Build the Tactical Flight Console & HUD

### 6.1 Architecture of the Avionics Drawer (`FlightConsole.jsx`)
OrbitLog uses a collapsible avionics console drawer inspired by modern aerospace operations software. It mounts on the right side of the screen with three dedicated tabs:

1. **Telemetry Tab:** High-density monospace telemetry:
   - Latitude and Longitude (WGS-84 decimal and directional format).
   - Altitude in km and miles.
   - Orbital Velocity in km/h, km/s, and Mach speed ($v_{\text{Mach}} \approx \frac{v_{\text{km/h}}}{1234.8}$).
   - Communication footprint horizon radius.
   - Day / Night solar eclipse state.
2. **Surat Vector Tab:** Real-time spherical distance and forward azimuth to IIIT Surat ($21.1702^\circ\text{ N}, 72.8311^\circ\text{ E}$).
3. **Crew Tab:** Real-time expedition manifest showing active astronauts, launch spacecraft, agencies, and flight roles.

### 6.2 Spherical Geodesy: Great-Circle Distance & Azimuth
How do we calculate the distance between the ISS and the IIIT Surat ground station across Earth's curved surface?

#### The Haversine Formula
For two points $(\phi_1, \lambda_1)$ and $(\phi_2, \lambda_2)$ on a sphere of radius $R \approx 6371\text{ km}$:

$$\Delta \phi = \phi_2 - \phi_1, \quad \Delta \lambda = \lambda_2 - \lambda_1$$
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$
$$d = R \cdot c$$

#### Forward Azimuth (Bearing)
$$\theta = \text{atan2}\left(\sin(\Delta \lambda)\cos(\phi_2), \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta \lambda)\right)$$

Normalized to a $0^\circ \to 360^\circ$ compass heading.

```javascript
export function calculateSuratDistance(issLat, issLon) {
  const SURAT_LAT = 21.1702;
  const SURAT_LON = 72.8311;
  const R = 6371; // Earth radius in km

  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(issLat - SURAT_LAT);
  const dLon = toRad(issLon - SURAT_LON);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(SURAT_LAT)) * Math.cos(toRad(issLat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Forward azimuth bearing
  const y = Math.sin(dLon) * Math.cos(toRad(issLat));
  const x = Math.cos(toRad(SURAT_LAT)) * Math.sin(toRad(issLat)) -
            Math.sin(toRad(SURAT_LAT)) * Math.cos(toRad(issLat)) * Math.cos(dLon);
  const bearing = Math.round((toRad(Math.atan2(y, x)) * (180 / Math.PI) + 360) % 360);

  return {
    distanceKm,
    distanceMiles: Math.round(distanceKm * 0.621371),
    bearing,
    isWithinFootprint: distanceKm <= 2200 // Visible horizon range
  };
}
```

### 6.3 Defensive Rendering & Safe Null Checks in JSX
A crucial engineering lesson in React:
When an asynchronous telemetry object is `null` on cold boot:
```jsx
// ❌ DANGEROUS BUG:
// In JavaScript, (undefined !== null) evaluates to true!
// If suratTelemetry is null, suratTelemetry?.distanceKm is undefined.
// Calling .toLocaleString() on undefined crashes the application with a white screen!
{suratTelemetry?.distanceKm !== null && (
  <div>{suratTelemetry.distanceKm.toLocaleString()} km</div>
)}

//  SAFE DEFENSIVE CHECK:
{typeof suratTelemetry?.distanceKm === 'number' && (
  <div>{suratTelemetry.distanceKm.toLocaleString()} km</div>
)}
```

### 6.4 Floating Bottom HUD (`OrbitTimeline.jsx`)
`OrbitTimeline.jsx` floats cleanly along the bottom of the map without blocking satellite viewports:
- Day / Night orbital phase indicator (Direct Sun / Earth Shadow).
- Live sub-satellite geodetic coordinates.
- Surat ground station range and line-of-sight elevation status.

---

## Chapter 7 — Testing, Stale States & Edge Cases

### 7.1 Stale Data Watchdog
In space tracking, stale coordinates can lead observers to look at the wrong patch of sky. If a user loses internet connectivity, the app shouldn't silently show an outdated position as "live".

We implement an automatic watchdog:
- If `Date.now() - lastUpdated > 30000` (30 seconds), an amber warning banner appears: *"Telemetry stale: No new signal received for >30s. Showing last known coordinates."*
- The status badge switches from **Telemetry Active** to **Telemetry Stale**.

### 7.2 Manual Verification Checklist
1. **Initial Load:** Check that the map centers and telemetry loads within 1–2 seconds.
2. **Auto-refresh:** Verify that coordinates update every 5 seconds.
3. **Map Dragging:** Pan around the map and verify that dragging is smooth.
4. **Recenter Button:** Click **Center ISS** to ensure the camera smoothly tracks the satellite.
5. **Console Drawer:** Click the avionics console toggle in the header; verify Telemetry, Surat Vector, and Crew Manifest tabs switch smoothly.
6. **Simulated Offline:** In Chrome DevTools (`F12` -> Network tab), select **Offline**. Verify the error banner appears and shows a retry button.

---

## Chapter 8 — Run, Preview & Deploy

### 8.1 Local Development Server
Start the local Vite development server:
```bash
npm.cmd run dev
```
Open your browser to `http://localhost:5173/`.

### 8.2 Production Build
Compile and bundle optimized assets:
```bash
npm.cmd run build
```
Preview the production build locally:
```bash
npm.cmd run preview
```

### 8.3 Deploying to Free Static Hosting
Because OrbitLog is a purely client-side static application, it can be hosted for free on:
- **GitHub Pages:** Use `gh-pages` or GitHub Actions. Set `base: './'` in `vite.config.js`.
- **Vercel / Netlify:** Connect your GitHub repository, choose Vite preset, and click Deploy.
- **Cloudflare Pages:** Connect repository, build command `npm run build`, output directory `dist`.

---

## Chapter 9 — Comprehensive Troubleshooting Table

| Symptom / Error | Likely Cause | Diagnostic Step | Fix | How to Verify |
| :--- | :--- | :--- | :--- | :--- |
| **`npm.ps1 cannot be loaded`** | Windows PowerShell security policy | Run `Get-ExecutionPolicy` | Use `npm.cmd` or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` | `npm.cmd -v` outputs version number |
| **Blank Screen: `ReferenceError: useState is not defined`** | Missing React hook import during refactoring | Check browser DevTools console | Add `import React, { useState, useEffect } from 'react';` to the affected component | Console is clean; page renders immediately |
| **Blank Screen: `TypeError: Cannot read properties of null`** | Unsafe `?.prop !== null` check in JSX (since `undefined !== null` is true in JS) | Check stack trace in browser console | Use strict type guard: `typeof prop === 'number'` or `Boolean(prop)` | Zero crashes during cold boot initial render |
| **Map displays "API KEY REQUIRED" watermark** | CartoDB recently instituted an API key requirement on `cartocdn.com/dark_all` tiles | Inspect tile image URLs in DevTools Network tab | Switch to Esri Dark Canvas (`services/Canvas/World_Dark_Gray_Base`), Esri Satellite, or OpenStreetMap | Map tiles render without watermarks or keys |
| **Map shows grey strips or broken tiles** | Missing Leaflet CSS stylesheet | Inspect DOM `<head>` for `leaflet.css` | Add `@import "leaflet/dist/leaflet.css";` to `src/index.css` | World map renders smooth continuous tiles |
| **Straight horizontal line across the map** | ISS crossed antimeridian ($180^\circ$) | Check ground track coordinates across $+179^\circ \to -179^\circ$ | Use `segmentTrackAcrossDateLine` to split polylines | Ground track splits cleanly at map borders |
| **Outdated astronaut roster (e.g. landed astronauts listed)** | Static or unmaintained API endpoint (`open-notify.org/astros.json`) | Inspect returned JSON payload timestamps | Connect to automated live API: `corquaid.github.io/international-space-station-APIs` | Active Expedition crew displayed with spacecraft tags |
| **Telemetry stuck or showing stale warning** | Network offline or API rate limit exceeded | Check browser DevTools Network tab for HTTP 429 | Increase poll interval to 10s or click **Sync** button | Status badge turns green; coordinates update |
| **`AbortError` in browser console** | Normal component re-fetch / unmount signal | Check if fetch is being cancelled intentionally | Treat `err.name === 'AbortError'` as expected cancellation | No unhandled exception logs in console |
| **Vite build fails on build step** | Syntax error or invalid import | Run `npm.cmd run build` | Check terminal output for exact file and line number | `✓ built in xxx ms` with zero errors |

---

## Chapter 10 — What to Build Next

Now that OrbitLog includes live tracking, the IIIT Surat ground station vector, and automated crew manifests, here are exciting next steps for ASTRA club projects:

### 1. 3D WebGL Globe Visualization
- **Concept:** Render a real-time 3D Earth globe using **Three.js** or **CesiumJS**, projecting the ISS orbital altitude ring in actual 3D space with Earth day/night terminator shading.

### 2. SGP4 Orbital Propagation & TLE Modeling
- **Concept:** In addition to live REST coordinates, fetch Two-Line Element (TLE) sets from CelesTrak (`celestrak.org`) and propagate the next 3 future orbits using the SGP4 mathematical orbit model.

### 3. ARISS Amateur Radio Doppler & Pass Alarms
- **Concept:** Calculate upcoming line-of-sight passes over Gujarat/Surat with audio alerts, displaying Doppler frequency shift for FM voice (145.800 MHz) and APRS packet radio (145.825 MHz).

---

*Clear skies and happy tracking from the ASTRA team at IIIT Surat!* 🚀

