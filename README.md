# OrbitLog &mdash; Real-Time ISS Aerospace Operations Deck

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=flat-square)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-10b981?style=flat-square&logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

> Developed by **ASTRA** &mdash; The Astronomy &amp; Astrophysics Club at the **Indian Institute of Information Technology Surat (IIIT Surat)**.

---

## 🛰️ Project Overview

**OrbitLog** is a full-viewport (`100vw × 100vh`) aerospace operations deck that tracks the real-time orbital trajectory, geodetic position, velocity, and ground station vectors of the **International Space Station (ISS)**.

OrbitLog delivers a modern, high-precision mission-control interface inspired by SpaceX Crew Dragon avionics and Flightradar24. Alongside the tracker, this repository serves as a **comprehensive educational platform** for students to study real-time satellite telemetry, spherical trigonometry (Haversine geodesy), and map projection algorithms.

---

## 📸 Flight Deck Interface Preview

```text
+----------------------------------------------------------------------------------------------------------------+
| [🛰️] ORBITLOG  [● TELEMETRY ACTIVE]  13:42:05 UTC   [Center ISS]   [Poll: 5s v]   [Sync]   [Console Drawer >]  |
+----------------------------------------------------------------------------------------------------------------+
|                                                                                | [AVIONICS CONSOLE DRAWER]     |
|                                                                                | [Telemetry] [Surat] [Crew]    |
|                                                                                |-------------------------------|
|                                                                                | GEODETIC LATITUDE             |
|                                                                                | 46.4308° N (WGS-84)           |
|                          FULL-VIEWPORT INTERACTIVE MAP                         |                               |
|                     (Esri Dark Canvas / Satellite / OSM Tiles)                 | GEODETIC LONGITUDE            |
|                                                                                | 172.0793° E                   |
|                   [● Animated ISS Satellite Vector & Radar Ring]               |                               |
|                   [--- Cyan Dual-Layer Ground Track (Split at 180°) ---]       | ORBITAL VELOCITY              |
|                   [📍 IIIT Surat Ground Station Beacon (21.17° N, 72.83° E)]   | 27,567 km/h · Mach 22.3       |
|                                                                                |                               |
|                                                                                | SURAT GROUND RANGE            |
|                                                                                | 8,412 km · Bearing 042°       |
|                                                                                |                               |
+----------------------------------------------------------------------------------------------------------------+
| [● DAYLIGHT]   LAT: 46.4308° N   LON: 172.0793° E   ALT: 429.3 km   SPEED: 27,567 km/h   SURAT: 8,412 km (LOS) |
+----------------------------------------------------------------------------------------------------------------+
```

---

## ⚡ Core Aerospace Features

- **Full-Viewport Operations Deck:** Immersive `100vw × 100vh` tactical interface with an edge-to-edge Leaflet map canvas and zero page scrolling.
- **Zero-Key Cartography:** Clean, unwatermarked tactical dark and satellite orbital photography layers using Esri Dark Canvas, Esri Satellite, and OpenStreetMap (no accounts or API keys required).
- **Sub-Second Geodetic Telemetry:** Real-time acquisition of WGS-84 Latitude, Longitude, Altitude ($415\text{--}430\text{ km}$), and Velocity ($\sim 27,600\text{ km/h} \approx 7.66\text{ km/s} \approx \text{Mach } 22.3$).
- **IIIT Surat Ground Station Geodesy:** Real-time great-circle range (km & miles), forward azimuth compass bearing ($0^\circ\text{--}360^\circ$), and Line-of-Sight horizon elevation calculation between the ISS and IIIT Surat ($21.1702^\circ\text{ N}, 72.8311^\circ\text{ E}$) via the Haversine spherical formula.
- **Automated Live Astronaut Manifest:** Dynamically queries an automated live endpoint (`corquaid.github.io/international-space-station-APIs`), listing currently orbiting Expedition crew members with launch spacecraft tags (e.g. *Soyuz*, *Crew Dragon*), agencies (`NASA`, `ROSCOSMOS`, `CSA`), and flight roles.
- **Antimeridian Polyline Date-Line Splitting:** Mathematical segmenting across $\pm 180^\circ$ longitude to prevent horizontal wrapping distortion across the map canvas.
- **Failover Redundancy & Watchdog:** Automatic failover between primary (`wheretheiss.at`) and fallback feeds, with an automatic stale watchdog alert (>30s) if connection is interrupted.
- **Collapsible Tactical Avionics Console:** High-density side drawer offering fast switching between primary telemetry metrics, Surat ground vectors, and live crew rosters.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component-driven UI framework with strict null-guarding |
| **Vite 8** | Sub-700ms hot-module replacement and optimized static bundler |
| **Tailwind CSS v4** | Dark aerospace operations theme and responsive styling |
| **Leaflet & React Leaflet** | Full-viewport interactive map canvas and geospatial projection |
| **Lucide React** | Aerospace and avionics vector iconography |
| **Public Telemetry APIs** | Where The ISS At (primary telemetry) & Corquaid ISS APIs (live crew) |

---

## 📋 Prerequisites

Before running the project, verify you have:
- **Node.js** (v18.0 or newer recommended): `node -v`
- **npm** (v9.0 or newer): `npm -v` (or `npm.cmd -v` on Windows)
- **Git**: `git --version`

---

## 🚀 Quickstart Guide

Clone or download the project and launch it in three simple commands:

```bash
# 1. Clone the repository
git clone https://github.com/Dynamo-SJoshi/OrbitLog.git
cd OrbitLog

# 2. Install dependencies (use npm.cmd on Windows if script execution policy is restricted)
npm install

# 3. Start local development server
npm run dev
```

Open your browser and navigate to **`http://localhost:5173/`**.

---

## 📦 Build for Production

To create an optimized, minified production bundle ready for static hosting:

```bash
# Compile and bundle
npm run build

# Preview production build locally
npm run preview
```

The output will be generated in the `dist/` directory.

---

## 📡 Data Source & API Rate Limits

1. **Telemetry Feed:** `https://api.wheretheiss.at/v1/satellites/25544`
   - *Rate Limit:* 350 requests per 5-minute interval ($\approx 1.16\text{ req/s}$).
   - *Default Polling:* 5 seconds ($= 60\text{ req/5 min}$), comfortably within limits.
   - *CORS:* Open (`Access-Control-Allow-Origin: *`).
2. **Telemetry Failover:** `https://api.open-notify.org/iss-now.json`
   - Activated automatically if the primary provider returns an HTTP error or is unreachable.
3. **Automated Live Astronauts API:** `https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json`
   - Automatically updated live crew feed with spacecraft, role, and agency information.

---

## 📚 Educational Documentation

OrbitLog includes an extensive documentation suite designed for engineering students:

- 📖 **[Beginner's Build Guide](docs/BEGINNER_GUIDE.md):** 10-chapter walkthrough covering APIs, Leaflet, Haversine spherical geodesy, and production deployment.
- 📐 **[System Architecture](docs/ARCHITECTURE.md):** System layout, component hierarchy, sequence diagrams, and mathematical formulas.
- 🧪 **[Quality Assurance & Testing](docs/TESTING.md):** 13 verified test cases (TC-01 through TC-13), failover simulations, and static analysis results.

---

## 🔧 Common Troubleshooting

| Issue | Quick Fix |
| :--- | :--- |
| `npm.ps1 cannot be loaded` | Use `npm.cmd` or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| Blank Screen on cold boot | Ensure React hooks are imported and JSX uses safe primitive checks (`typeof prop === 'number'`) |
| Broken or grey map tiles | Ensure `@import "leaflet/dist/leaflet.css";` is present in `src/index.css` |
| Ground track wraps horizontally | The app uses `segmentTrackAcrossDateLine` to split at $\pm 180^\circ$ longitude |

*(See [Chapter 9 of the Beginner Guide](docs/BEGINNER_GUIDE.md#chapter-9--comprehensive-troubleshooting-table) for full troubleshooting matrix.)*

---

## 🤝 Contributing

Contributions from students, club members, and astronomy enthusiasts are welcome!
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/orbital-prediction`).
3. Commit your changes (`git commit -m 'feat: add ISS pass predictor for Surat'`).
4. Push to your branch (`git push origin feature/orbital-prediction`).
5. Open a Pull Request.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).

---

**ASTRA &mdash; Astronomy, AstroTech &amp; Astrophysics Club**  
Indian Institute of Information Technology Surat  
*Ad Astra* 🚀

