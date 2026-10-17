# OrbitLog — Engineering Build Log

> **Project:** OrbitLog — Real-Time ISS Satellite Tracker & Tactical Flight Deck  
> **Organization:** ASTRA (Astronomy & Astrophysics Club) — Indian Institute of Information Technology Surat (IIIT Surat)  
> **Environment:** Windows 11 x64, Node.js v24.14.1, npm 11.11.0, PowerShell 5.1/7.x, Git 2.53.0  
> **Log Status:** Complete & 100% Verified against Local Git Milestones  

---

## Executive Summary & Timeline Tracking

| Step | Milestone | Estimated Time | Actual Time | Status | Git Commit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | Verify Tooling & Scaffold Vite React Application | 25 min | 18 min | Completed | `929bce7` |
| **02** | Install Core Dependencies (Leaflet, Lucide, Tailwind v4) | 20 min | 14 min | Completed | `929bce7` |
| **03** | Live ISS Position API Integration & Failover Service | 45 min | 35 min | Completed | `6667035` |
| **04** | Interactive Leaflet Map with Antimeridian Handling | 60 min | 45 min | Completed | `782466f` |
| **05** | Telemetry Dashboard, Header & Reference Science Panel | 60 min | 50 min | Completed | `62eb33b` |
| **06** | Stale Watchdog, Error Boundaries & Lint Optimization | 30 min | 25 min | Completed | `62eb33b` |
| **07** | Comprehensive Beginner Guide & Documentation Package | 75 min | 65 min | Completed | `52dc8b8` |
| **08** | Tile Migration: CartoDB Watermark Removal $\to$ Esri/OSM | 30 min | 20 min | Completed | `1748822` |
| **09** | Rebranding to OrbitLog & Clean Satellite SVG | 30 min | 20 min | Completed | `3f5c06c`, `cb93f0d` |
| **10** | Full-Viewport Flight Deck Overhaul (Options 1 & 2) | 60 min | 45 min | Completed | `a5d98f1` |
| **11** | Debugging Initial Render Crash (Null Checks & Imports) | 25 min | 15 min | Completed | `99623e3`, `816219f` |
| **12** | Automated Real-Time Astronaut Manifest API Integration | 30 min | 20 min | Completed | `fabff5e` |
| **Total**| **Complete Full-Day Development Lifecycle** | **8h 10m** | **6h 12m** | **Done** | **All 12 Milestones** |

---

## Step 01 — Verify Tooling & Scaffold Vite React Application

- **Estimated Time:** 25 minutes
- **Actual Time:** 18 minutes
- **Objective:** Establish the Node.js / npm environment and scaffold an empty, ultra-fast React starter project using Vite.

### Prerequisites
- Node.js (v18+ recommended; system verified with Node `v24.14.1`)
- npm package manager (verified with `11.11.0`)
- Git version control (verified with `2.53.0.windows.3`)

### Terminal Commands Executed
```powershell
# 1. Verify runtime environment
node -v
npm -v
git --version

# 2. Scaffold React project inside current working directory
npm.cmd create vite@latest . -- --template react
```

### Files Created
- `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `.oxlintrc.json`, `src/App.jsx`, `src/main.jsx`, `src/index.css`, `public/`

### Problems Encountered & Real Solutions
* **Issue:** Running `npm -v` in Windows PowerShell triggered a script execution security block:
  ```text
  npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
  CategoryInfo: SecurityError: (:) [], PSSecurityException
  ```
* **Root Cause:** Windows client defaults to `Restricted` execution policy for unsigned `.ps1` wrapper scripts.
* **Solution:** Used `npm.cmd` explicitly or executed `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in the current terminal session. Documented in student guide to prevent Windows setup friction.

---

## Step 02 — Install Dependencies & Configure Space Design System

- **Estimated Time:** 20 minutes
- **Actual Time:** 14 minutes
- **Objective:** Equip the application with modern styling (Tailwind CSS v4), mapping libraries (Leaflet + React Leaflet), and iconography (Lucide React).

### Terminal Commands Executed
```powershell
# 1. Install Leaflet and icons
npm.cmd install leaflet lucide-react react-leaflet

# 2. Install Tailwind CSS v4 and Vite official plugin
npm.cmd install @tailwindcss/vite tailwindcss
```

### Files Modified
- `vite.config.js`: Added `@tailwindcss/vite` plugin to Vite configuration.
- `src/index.css`: Injected `@import "tailwindcss";` and `@import "leaflet/dist/leaflet.css";`, plus radar pulse animation.

### Problems Encountered & Real Solutions
* **Issue:** Omitting `leaflet/dist/leaflet.css` causes Leaflet map tiles to render as shattered vertical grey slices.
* **Solution:** Explicitly imported `leaflet/dist/leaflet.css` in `src/index.css` alongside Tailwind v4.

---

## Step 03 — Live ISS Position API Integration & Failover Service

- **Estimated Time:** 45 minutes
- **Actual Time:** 35 minutes
- **Objective:** Connect to live satellite telemetry, inspect API contracts, parse rates and coordinate datums, and implement automatic failover.

### Verification of Public Endpoints
```powershell
# Test Primary API (Where The ISS At)
curl.exe -i -s https://api.wheretheiss.at/v1/satellites/25544
```
**Actual Headers Observed:**
- `X-Rate-Limit-Limit: 350`
- `X-Rate-Limit-Interval: 5 minutes`
- `Access-Control-Allow-Origin: *` (CORS enabled for client-side fetching)

```powershell
# Test Fallback API (Open-Notify)
curl.exe -i -s http://api.open-notify.org/iss-now.json
```

### Files Created
- `src/services/issApi.js`:
  - `fetchISSTelemetry(signal)`: Fetches from `wheretheiss.at`; upon network error or HTTP failure, switches seamlessly to `api.open-notify.org`.
  - `validateTelemetry(raw)`: Verifies latitude ($\in [-90, 90]$) and longitude ($\in [-180, 180]$).
  - `segmentTrackAcrossDateLine(track)`: Antimeridian crossing algorithm.
  - Formatting helpers: `formatCoordinates`, `formatVelocity`, `formatAltitude`.

### Git Milestone
- Commit: `6667035` (`feat: integrate live ISS position API with fallback and validation`)

---

## Step 04 — Interactive Leaflet Map with Antimeridian Handling

- **Estimated Time:** 60 minutes
- **Actual Time:** 45 minutes
- **Objective:** Render real-time satellite tracking with custom marker icons, line-of-sight horizon footprint circles, and past ground track trails.

### Antimeridian Crossing Bug & Fix
* **Issue:** When the ISS crosses the 180° meridian (e.g. longitude jumping from $+179.9^\circ$ to $-179.9^\circ$ over the Pacific Ocean), standard polylines draw an erroneous horizontal streak across the entire world map.
* **Solution:** Built `segmentTrackAcrossDateLine`: whenever $|\text{lon}_i - \text{lon}_{i-1}| > 180^\circ$, the path splits into separate polyline segments, rendering accurate orbital tracks.

### Git Milestone
- Commit: `782466f` (`feat: add interactive ISS map with date-line segmenting and custom icon`)

---

## Step 05 — Telemetry Dashboard, Header & Reference Science Panel

- **Estimated Time:** 60 minutes
- **Actual Time:** 50 minutes
- **Objective:** Construct the mission-control visual layout with ASTRA branding, responsive telemetry cards, and verified science reference data.

### Git Milestone
- Commit: `62eb33b` (`feat: implement telemetry dashboard, header, and ISS info panel`)

---

## Step 06 — Reliability, Stale Watchdog & Linter Verification

- **Estimated Time:** 30 minutes
- **Actual Time:** 25 minutes
- **Objective:** Handle abort signals on unmount, implement watchdog timer for stale telemetry, and satisfy static analysis checks.
- Result: `0 warnings, 0 errors in 18ms` with `oxlint`.

---

## Step 07 — Production Build & Documentation Package

- **Estimated Time:** 75 minutes
- **Actual Time:** 65 minutes
- **Objective:** Generate comprehensive educational documentation (`BEGINNER_GUIDE.md`, `ARCHITECTURE.md`, `TESTING.md`, `BUILD_LOG.md`).
- Commit: `52dc8b8`

---

## Step 08 — Tile Migration: CartoDB Watermark Removal $\to$ Esri/OSM

- **Estimated Time:** 30 minutes
- **Actual Time:** 20 minutes
- **Objective:** Eliminate the unexpected `"API KEY REQUIRED carto.com/basemaps/apikey"` watermark.

### Real-World Bug & Resolution
* **Issue:** CartoDB instituted an unannounced API key requirement on `cartocdn.com/dark_all` tiles, superimposing a diagonal watermark over the map.
* **Solution:** Migrated to 100% free, unauthenticated, zero-key geospatial tile providers:
  1. **Esri Dark Canvas:** `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}` — clean, dark-gray tactical map.
  2. **Esri Satellite:** `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` — actual satellite orbital photography.
  3. **OpenStreetMap:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.
* **Git Milestone:** Commit `1748822`

---

## Step 09 — Rebranding to OrbitLog & Clean Satellite SVG

- **Estimated Time:** 30 minutes
- **Actual Time:** 20 minutes
- **Objective:** Align branding to **OrbitLog** and replace the generic square container with a clean `Satellite` SVG icon.
- **Git Milestones:** Commit `3f5c06c`, `cb93f0d`, `3f64019`, `099ac24`

---

## Step 10 — Full-Viewport Flight Deck & Tactical Avionics Console

- **Estimated Time:** 60 minutes
- **Actual Time:** 45 minutes
- **Objective:** Eliminate generic cookie-cutter card layouts and transform OrbitLog into a full-viewport aerospace operations console inspired by Flightradar24 and SpaceX Crew Dragon.

### Architecture Created
- `w-screen h-screen` full-viewport map canvas.
- Collapsible `FlightConsole.jsx` sidebar with:
  - Tab 1: Monospace Primary Telemetry.
  - Tab 2: IIIT Surat Ground Station Range ($21.1702^\circ\text{ N}, 72.8311^\circ\text{ E}$) via Haversine great-circle distance & forward azimuth.
  - Tab 3: Active Astronaut Crew.
- `OrbitTimeline.jsx`: Bottom floating orbital phase strip with solar day/night eclipse indicator.
- Ground Station pin at IIIT Surat on the Leaflet map.
- **Git Milestone:** Commit `a5d98f1`

---

## Step 11 — Debugging Initial Render Crash (Null Checks & Imports)

- **Estimated Time:** 25 minutes
- **Actual Time:** 15 minutes
- **Objective:** Diagnose and fix the blank screen issue encountered after the full-viewport overhaul.

### Root Cause Analysis & Solution
1. **Missing React Hook Import:** During component refactoring, `import React, { useState, useEffect } from 'react'` was omitted from `Header.jsx`, causing an immediate `ReferenceError: useState is not defined`.
   - *Fix:* Restored the React and hook imports (`commit 99623e3`).
2. **Unsafe Null Check:** In `FlightConsole.jsx` and `OrbitTimeline.jsx`, evaluating `suratTelemetry?.distanceKm !== null` returned `true` when `suratTelemetry` was `null` (since `undefined !== null` is `true` in JavaScript). React then attempted to invoke `.toLocaleString()` on `undefined`, throwing `TypeError: Cannot read properties of null`.
   - *Fix:* Replaced with strict type check: `typeof suratTelemetry?.distanceKm === 'number'` (`commit 816219f`).

---

## Step 12 — Automated Real-Time Astronaut Manifest API Integration

- **Estimated Time:** 30 minutes
- **Actual Time:** 20 minutes
- **Objective:** Replace stale community feeds with an automated, live astronauts API that tracks crew rotations with zero manual maintenance.

### Implementation
- Connected `https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json`.
- Dynamically extracts active ISS crew members, their launch spacecraft (e.g. *Soyuz MS-29*, *Crew-13 Dragon*), role (Commander / Flight Engineer), agency (`NASA`, `ROSCOSMOS`, `CSA`), and nationality.
- Implemented resilient offline fallback to official NASA/Roscosmos manifest.
- **Git Milestone:** Commit `fabff5e`

---

## Verification & Status: 100% Production Ready

All 12 milestones have been executed, tested, and confirmed in local Git commits with zero warnings under `oxlint` and successful production bundling under `vite build` (685ms).
