# ASTRA Orbit &mdash; Real-Time ISS Tracker & Telemetry Dashboard

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=flat-square)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-10b981?style=flat-square&logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

> Developed by **ASTRA** &mdash; The Astronomy &amp; Astrophysics Club at the **Indian Institute of Information Technology Surat (IIIT Surat)**.

---

## 🛰️ Project Overview

**ASTRA Orbit** is a modern, responsive, mission-control inspired web application that tracks the live position, orbital velocity, and geodetic altitude of the **International Space Station (ISS)**.

In addition to being a functional tracker, this repository serves as a **complete educational guide for students** to learn how to build real-time satellite telemetry systems from scratch using React, Vite, and Leaflet.

---

## 📸 Mission Control Interface Preview

```text
+---------------------------------------------------------------------------------------------------+
|  [🛰️] ASTRA ORBIT   ISS Live        Astronomy & Astrophysics Club — IIIT Surat    [● Telemetry Active] |
|  Updated: 01:25:00 AM   [Center ISS]   Poll: [5s v]   [● Auto Sync ON]   [Sync]                   |
+---------------------------------------------------------------------------------------------------+
|  [LATITUDE]         [LONGITUDE]        [ALTITUDE]      [VELOCITY]      [SOLAR STATE]   [FOOTPRINT] |
|  46.4308° N         172.0793° E        429.3 km        27,567 km/h     Daylight        4,554 km    |
|  Geodetic           WGS-84             266.7 mi        7.66 km/s       Direct Sun      Horizon LOS |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                                     INTERACTIVE ORBITAL MAP                                       |
|                         (CartoDB Dark Matter / OpenStreetMap Tiles)                               |
|                         [● ISS Marker with Animated Radar Pulse Ring]                             |
|                         [--- Cyan Illuminated Ground Track Trail ---]                             |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
|  MISSION SPECIFICATIONS & SCIENCE REFERENCE                                                       |
|  • Orbital Period: ~92.9 min   • Inclination: 51.64°   • Continuous Crew Since: Nov 2000          |
+---------------------------------------------------------------------------------------------------+
```
*(Screenshot placeholder: Replace with actual capture after running `npm run dev`)*

---

## ⚡ Core Features

- **Live Geospatial Telemetry:** Sub-second coordinate acquisition for Latitude and Longitude using WGS-84 geodetic standards.
- **Orbital Dynamics:** Real-time altitude ($415\text{--}430\text{ km}$) and speed ($\sim 27,600\text{ km/h} \approx 7.66\text{ km/s}$).
- **Day/Night Eclipse Detection:** Live indicator showing whether the station is in direct sunlight or Earth's shadow (umbra).
- **Line-of-Sight Footprint:** Dynamic circular horizon showing the ground footprint from which the ISS is physically above the horizon.
- **Antimeridian Date-Line Segmenting:** Intelligent polyline path splitting across $\pm 180^\circ$ longitude to prevent distortion across the world map.
- **Multi-Source Failover:** Automatically switches from primary (`wheretheiss.at`) to fallback (`open-notify.org`) if connection issues occur.
- **Stale Data Watchdog:** Detects telemetry interruption (>30 seconds) and warns the user with visual indicators.
- **Camera Follow Controls:** Toggle between free camera panning and locked satellite tracking.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component-driven UI framework |
| **Vite 8** | Next-generation bundler and dev server |
| **Tailwind CSS v4** | Space-themed dark mode and responsive layout engine |
| **Leaflet & React Leaflet** | Interactive mapping and geospatial visualization |
| **Lucide React** | Clean aerospace and navigational icons |
| **Public Telemetry APIs** | Where The ISS At (primary) & Open-Notify (fallback) |

---

## 📋 Prerequisites

Before running the project, make sure you have:
- **Node.js** (v18.0 or newer recommended): `node -v`
- **npm** (v9.0 or newer): `npm -v` (or `npm.cmd -v` on Windows)
- **Git**: `git --version`

---

## 🚀 Quickstart Guide

Clone or download the project and run it in three simple commands:

```bash
# 1. Clone the repository
git clone https://github.com/ASTRA-IIITSurat/astra-orbit.git
cd astra-orbit

# 2. Install dependencies
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

1. **Primary Provider:** `https://api.wheretheiss.at/v1/satellites/25544`
   - *Rate Limit:* 350 requests per 5-minute interval ($\approx 1.16\text{ req/s}$).
   - *Default Polling:* 5 seconds ($= 60\text{ req/5 min}$), comfortably within limits.
   - *CORS:* Open (`Access-Control-Allow-Origin: *`).
2. **Fallback Provider:** `https://api.open-notify.org/iss-now.json`
   - Activated automatically if the primary provider returns an HTTP error or is unreachable.

---

## 📚 Educational Documentation

ASTRA Orbit includes comprehensive documentation designed for engineering students:

- 📖 **[Beginner's Build Guide](docs/BEGINNER_GUIDE.md):** 10-chapter educational walkthrough explaining APIs, Leaflet, coordinates, and deployment from scratch.
- 📝 **[Engineering Build Log](docs/BUILD_LOG.md):** Actual step-by-step build journal recording real commands, errors encountered, solutions, and timings.
- 📐 **[System Architecture](docs/ARCHITECTURE.md):** Architectural diagrams, component hierarchy, and antimeridian split algorithms.
- 🧪 **[Quality Assurance & Testing](docs/TESTING.md):** Test scenarios, offline simulation, and verification matrices.

---

## 🔧 Common Troubleshooting

| Issue | Quick Fix |
| :--- | :--- |
| `npm.ps1 cannot be loaded` | Use `npm.cmd` or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| Broken or grey map tiles | Ensure `@import "leaflet/dist/leaflet.css";` is present in `src/index.css` |
| Ground track wraps horizontally | The app uses `segmentTrackAcrossDateLine` to split at $\pm 180^\circ$ longitude |

*(See [Chapter 9 of the Beginner Guide](docs/BEGINNER_GUIDE.md#chapter-9--troubleshooting-table) for full troubleshooting matrix.)*

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

**ASTRA &mdash; Astronomy &amp; Astrophysics Club**  
Indian Institute of Information Technology Surat  
*Ad Astra Per Aspera* 🚀
