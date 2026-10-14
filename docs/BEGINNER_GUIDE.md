# ASTRA Orbit — Complete Beginner's Build Guide

> **Created for:** ASTRA — The Astronomy and Astrophysics Club at IIIT Surat  
> **Level:** Beginner to Intermediate  
> **Estimated Reading & Build Time:** 2 – 3 hours  
> **Target Audience:** Engineering and science students curious about space informatics, real-time satellite telemetry, and modern web application development.

---

## Table of Contents

1. [Chapter 1 — What Are We Building?](#chapter-1--what-are-we-building)
2. [Chapter 2 — Tools & Installation](#chapter-2--tools--installation)
3. [Chapter 3 — Create the Project from Scratch](#chapter-3--create-the-project-from-scratch)
4. [Chapter 4 — Fetch Real ISS Telemetry](#chapter-4--fetch-real-iss-telemetry)
5. [Chapter 5 — Build the Live Map](#chapter-5--build-the-live-map)
6. [Chapter 6 — Build the Mission Control Dashboard](#chapter-6--build-the-mission-control-dashboard)
7. [Chapter 7 — Testing, Stale States & Edge Cases](#chapter-7--testing-stale-states--edge-cases)
8. [Chapter 8 — Run, Preview & Deploy](#chapter-8--run-preview--deploy)
9. [Chapter 9 — Comprehensive Troubleshooting Table](#chapter-9--troubleshooting-table)
10. [Chapter 10 — What to Build Next](#chapter-10--what-to-build-next)

---

## Chapter 1 — What Are We Building?

### 1.1 The International Space Station (ISS)
The **International Space Station (ISS)** is the largest artificial object in space. Orbiting the Earth in Low Earth Orbit (LEO) at an average altitude of approximately **420 km** above sea level, it travels at a staggering speed of **~27,600 km/h** (~7.66 km per second). At this velocity, the ISS circles our planet once every **~92.9 minutes**, giving astronauts aboard 16 sunrises and sunsets every single Earth day.

### 1.2 What ASTRA Orbit Does
**ASTRA Orbit** is an interactive, browser-based satellite tracker. It connects directly to public aerospace telemetry feeds to show:
- The exact geodetic latitude and longitude of the space station in real time.
- The station's current altitude in kilometers and miles.
- Its orbital velocity and daylight vs. Earth-shadow eclipse state.
- An interactive world map featuring a custom ISS marker, line-of-sight communication horizon footprint, and recent orbital ground track.
- Failover support and a stale-data watchdog if telemetry updates drop out.

### 1.3 System Architecture
Here is how your browser, the open internet, the telemetry API, and the map library work together:

```text
  +-------------------------------------------------------------+
  |              WhereTheISS / Open-Notify API Servers          |
  +-------------------------------------------------------------+
                                 ^
                                 |  HTTPS GET (JSON)
                                 v
  +-------------------------------------------------------------+
  |                   ASTRA Orbit Web App (React)               |
  |                                                             |
  |   +-----------------------+     +-----------------------+   |
  |   |   issApi.js Service   | <-> |  Stale Data Watchdog  |   |
  |   | (Validate & Convert)  |     |   (Checks >30s gap)   |   |
  |   +-----------------------+     +-----------------------+   |
  |               |                                             |
  |               v                                             |
  |   +-----------------------+     +-----------------------+   |
  |   |   LiveMap (Leaflet)   |     |    Telemetry Cards    |   |
  |   | - Antimeridian Split  |     | - Altitude, Velocity  |   |
  |   | - SVG Satellite Icon  |     | - Latitude, Longitude |   |
  |   | - CartoDB Dark Tiles  |     | - Daylight / Shadow   |   |
  |   +-----------------------+     +-----------------------+   |
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
npm create vite@latest astra-orbit -- --template react

# 2. Enter directory
cd astra-orbit

# 3. Install baseline dependencies
npm install

# 4. Install production dependencies for maps and icons
npm install leaflet react-leaflet lucide-react

# 5. Install Tailwind CSS v4 and its Vite plugin
npm install @tailwindcss/vite tailwindcss
```

### 3.3 Folder Structure
After installation, your project structure looks like this:

```text
astra-orbit/
├── public/               # Static assets (favicons, manifest)
├── src/
│   ├── components/       # UI Components
│   │   ├── Header.jsx          # Mission control bar & status
│   │   ├── LiveMap.jsx         # Leaflet interactive map
│   │   ├── TelemetryCard.jsx   # Metrics cards
│   │   └── ISSInfoPanel.jsx    # Science facts & references
│   ├── services/
│   │   └── issApi.js           # Fetch, validate & format API data
│   ├── App.jsx           # Main orchestrator component
│   ├── main.jsx          # React DOM entry point
│   └── index.css         # Tailwind & Leaflet styles
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

---

## Chapter 5 — Build the Live Map

### 5.1 Map Coordinates & Leaflet
Leaflet is a lightweight mapping library. In React, we use `react-leaflet`, which wraps Leaflet inside declarative React components:
- `<MapContainer>` initializes the map canvas.
- `<TileLayer>` loads map tiles (we use free unauthenticated tile layers from Esri Dark Canvas, Esri Satellite, and OpenStreetMap).
- `<Marker>` renders a pin at `[latitude, longitude]`.
- `<Polyline>` draws the recent orbital path.
- `<Circle>` displays the visual horizon footprint.

### 5.2 The Antimeridian (International Date Line) Problem
The Earth is round, but standard flat maps project longitude from $-180^\circ$ to $+180^\circ$. When the ISS crosses the 180th meridian in the Pacific Ocean (jumping from $+179^\circ$ to $-179^\circ$), standard path drawing algorithms will draw a horizontal line across the entire screen!

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
Rather than using generic Leaflet pins (which often have broken image paths in modern bundlers), we construct a custom SVG satellite with solar arrays and an animated radar ping:

```javascript
const issIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-12 h-12">
      <div class="absolute inset-0 rounded-full border border-cyan-400 bg-cyan-400/20 animate-ping"></div>
      <svg class="w-8 h-8 text-cyan-300" viewBox="0 0 40 40">
        <!-- SVG truss and solar panel vectors -->
      </svg>
    </div>
  `,
  className: 'iss-marker',
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});
```

---

## Chapter 6 — Build the Mission Control Dashboard

### 6.1 Creating Reusable Telemetry Cards
Instead of repeating HTML for Latitude, Longitude, Speed, and Altitude, build a reusable `TelemetryCard.jsx`:

```jsx
export default function TelemetryCard({ icon: Icon, label, value, subValue, unit, badge }) {
  return (
    <div className="rounded-xl bg-slate-900/70 border border-cyan-500/20 p-4 backdrop-blur-sm shadow-lg">
      <div className="flex items-center justify-between text-xs text-slate-400 uppercase">
        <span className="flex items-center gap-1.5 font-semibold">
          <Icon className="w-4 h-4 text-cyan-400" />
          {label}
        </span>
        {badge && <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">{badge}</span>}
      </div>
      <div className="mt-2 text-2xl font-mono font-bold text-slate-50">
        {value} <span className="text-sm font-normal text-slate-400">{unit}</span>
      </div>
      <div className="mt-1 text-xs font-mono text-slate-400">{subValue}</div>
    </div>
  );
}
```

### 6.2 Polling with Safe Interval Cleanup
In React, timers must always be cleaned up when a component unmounts to prevent memory leaks and zombie network requests:

```jsx
useEffect(() => {
  if (!autoRefresh) return;

  const intervalId = setInterval(() => {
    loadTelemetry();
  }, refreshInterval * 1000);

  // Clean up timer on unmount or interval change
  return () => clearInterval(intervalId);
}, [autoRefresh, refreshInterval, loadTelemetry]);
```

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
5. **Simulated Offline:** In Chrome DevTools (`F12` -> Network tab), select **Offline**. Verify the error banner appears and shows a retry button.

---

## Chapter 8 — Run, Preview & Deploy

### 8.1 Local Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open your browser to `http://localhost:5173/`.

### 8.2 Production Build
Compile and bundle optimized assets:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

### 8.3 Deploying to Free Static Hosting
Because ASTRA Orbit is a purely client-side static application, it can be hosted for free on:
- **GitHub Pages:** Use `gh-pages` or GitHub Actions. Set `base: './'` in `vite.config.js`.
- **Vercel / Netlify:** Connect your GitHub repository, choose Vite preset, and click Deploy.
- **Cloudflare Pages:** Connect repository, build command `npm run build`, output directory `dist`.

---

## Chapter 9 — Troubleshooting Table

| Symptom / Error | Likely Cause | Diagnostic Step | Fix | How to Verify |
| :--- | :--- | :--- | :--- | :--- |
| **`npm.ps1 cannot be loaded`** | Windows PowerShell security policy | Run `Get-ExecutionPolicy` | Use `npm.cmd` or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` | `npm.cmd -v` outputs version number |
| **Map displays "API KEY REQUIRED" watermark** | CartoDB recently instituted an API key requirement on `cartocdn.com/dark_all` tiles | Inspect tile image URLs in DevTools Network tab | Switch to Esri Dark Canvas (`services/Canvas/World_Dark_Gray_Base`), Esri Satellite, or OpenStreetMap | Map tiles render without watermarks or keys |
| **Map shows grey strips or broken tiles** | Missing Leaflet CSS stylesheet | Inspect DOM `<head>` for `leaflet.css` | Add `@import "leaflet/dist/leaflet.css";` to `src/index.css` | World map renders smooth continuous tiles |
| **Straight horizontal line across the map** | ISS crossed antimeridian ($180^\circ$) | Check ground track coordinates across $+179^\circ \to -179^\circ$ | Use `segmentTrackAcrossDateLine` to split polylines | Ground track splits cleanly at map borders |
| **Telemetry stuck or showing stale warning** | Network offline or API rate limit exceeded | Check browser DevTools Network tab for HTTP 429 | Increase poll interval to 10s or click **Sync** button | Status badge turns green; coordinates update |
| **`AbortError` in browser console** | Normal component re-fetch / unmount signal | Check if fetch is being cancelled intentionally | Treat `err.name === 'AbortError'` as expected cancellation | No unhandled exception logs in console |
| **Vite build fails on build step** | Syntax error or invalid import | Run `npm run build` | Check terminal output for exact file and line number | `✓ built in xxx ms` with zero errors |

---

## Chapter 10 — What to Build Next

Once you have mastered the basic tracker, consider these exciting enhancements for ASTRA club projects:

### 1. ISS Pass Predictions for Surat, India
- **Concept:** Calculate when the ISS will fly directly over Surat (Coordinates: $21.1702^\circ\text{ N}, 72.8311^\circ\text{ E}$).
- **Tools:** Use SGP4 orbit propagation libraries or query the Heavens-Above / Open-Notify pass prediction API to show upcoming visual sighting times and maximum elevation angles.

### 2. Live Crew Manifest
- **Concept:** Show the names and national space agencies of the astronauts currently aboard the station.
- **Data Source:** Open-Notify `http://api.open-notify.org/astros.json`.

### 3. Audio Downlink Frequency Guide
- **Concept:** Display the amateur radio (ARISS) frequencies used by astronauts aboard the station (e.g. FM voice: 145.800 MHz downlink, APRS packet radio: 145.825 MHz).

---

*Clear skies and happy tracking from the ASTRA team at IIIT Surat!*
