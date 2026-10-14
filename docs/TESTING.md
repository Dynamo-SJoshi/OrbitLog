# ASTRA Orbit — Quality Assurance & Testing Suite

> **Project:** ASTRA Orbit — ISS Satellite Tracker  
> **Target:** Verification of Live Tracking, Map Projections, Failover & Responsive UX  
> **Testing Scope:** Automated Code Quality, Integration Verification, Manual Edge Cases  

---

## 1. Automated Verification Commands

| Check | Command | Expected Output | Status |
| :--- | :--- | :--- | :--- |
| **Static Analysis / Lint** | `npm.cmd run lint` | `Found 0 warnings and 0 errors.` | **PASSED** |
| **Production Build** | `npm.cmd run build` | `✓ built in xxx ms` with zero chunk warnings | **PASSED** |
| **Preview Server** | `npm.cmd run preview` | Serves production build at `http://localhost:4173` | **PASSED** |

---

## 2. Test Cases & Execution Matrix

### TC-01: Cold Boot & Initial Telemetry Load
- **Objective:** Ensure application renders smoothly on initial page visit.
- **Procedure:** Open application in an incognito window with cache disabled.
- **Expected Outcome:**
  - Header displays "Acquiring..." spinner briefly.
  - Telemetry cards display pulse skeleton loaders.
  - Live coordinates, speed, and altitude populate within $\le 2$ seconds.
  - Connection status badge transitions to green: `Telemetry Active`.
- **Status:** **PASS**

---

### TC-02: Map Pan, Zoom & Camera Recenter
- **Objective:** Verify Leaflet interaction and "Center ISS" button functionality.
- **Procedure:**
  1. Drag map view to a different region (e.g., Antarctica).
  2. Click the **Center ISS** button in the header.
- **Expected Outcome:**
  - Map smoothly pans and centers directly on the current ISS latitude/longitude coordinates.
  - The custom SVG satellite marker remains positioned at the exact coordinates.
- **Status:** **PASS**

---

### TC-03: Auto-Refresh Cadence & Interval Switching
- **Objective:** Verify user control over polling frequency.
- **Procedure:**
  1. Change the poll interval dropdown from `5s` to `10s`.
  2. Observe the Network tab in DevTools.
  3. Toggle **Auto Sync** to "Paused".
- **Expected Outcome:**
  - When set to 10s, requests to `wheretheiss.at` occur at 10-second intervals.
  - When paused, polling ceases immediately.
  - Clicking **Sync** performs an immediate on-demand fetch.
- **Status:** **PASS**

---

### TC-04: Ground Track Accumulation & Antimeridian Crossing
- **Objective:** Verify past orbital path rendering without screen-wide wrapping distortion.
- **Procedure:** Let the application track the ISS continuously across multiple polling cycles.
- **Expected Outcome:**
  - Trail points accumulate (up to maximum ring buffer of 80 points).
  - Polyline displays dual-layer styling (subtle outer glow + dashed core line).
  - When longitude crosses $+180^\circ \to -180^\circ$, `segmentTrackAcrossDateLine` splits the track cleanly without drawing horizontal line artifacts across the globe.
- **Status:** **PASS**

---

### TC-05: Stale Data Watchdog Trigger
- **Objective:** Confirm user is warned when data is no longer fresh.
- **Procedure:**
  1. Let the tracker acquire coordinates.
  2. Pause auto-refresh and wait 30 seconds without manually syncing.
- **Expected Outcome:**
  - An amber alert banner appears: *"Telemetry stale: No new signal received for >30s. Showing last known coordinates."*
  - Status indicator changes from green (`Telemetry Active`) to amber (`Telemetry Stale`).
- **Status:** **PASS**

---

### TC-06: Primary API Failure & Graceful Fallback
- **Objective:** Verify zero crash behavior if the primary telemetry provider is unreachable.
- **Procedure:** Simulate failure of `api.wheretheiss.at` (or inspect `issApi.js` failover branch).
- **Expected Outcome:**
  - Service automatically calls `api.open-notify.org/iss-now.json`.
  - Coordinates update with source label `open-notify (fallback)`.
  - Altitude and velocity gracefully display `--` without crashing the user interface.
- **Status:** **PASS**

---

### TC-07: Total Network Disconnection (Offline State)
- **Objective:** Verify UI error presentation under zero-connectivity conditions.
- **Procedure:** In Chrome DevTools -> Network -> Throttling, select **Offline**, then click **Sync**.
- **Expected Outcome:**
  - Red notification banner appears: *"Telemetry Feed Disrupted"*.
  - A **Retry Signal** button is rendered.
  - Existing map view and coordinates remain intact.
- **Status:** **PASS**

---

### TC-08: Responsive Layout (Mobile, Tablet, Desktop)
- **Objective:** Confirm UI usability across various device form factors.
- **Viewport Profiles Tested:**
  - Mobile: 375px (iPhone SE / Android) -> Cards arrange in 2-column grid; header controls stack cleanly.
  - Tablet: 768px (iPad Mini) -> 3-column telemetry grid; map height adjusts to 520px.
  - Desktop: 1280px+ -> 6-column telemetry strip; map height 600px; full mission-control density.
- **Status:** **PASS**

---

### TC-09: Production Build & Asset Bundling
- **Objective:** Ensure final release bundles without warnings or missing dependencies.
- **Procedure:** Run `npm.cmd run build`.
- **Result:**
  ```text
  dist/index.html                   0.78 kB │ gzip:   0.48 kB
  dist/assets/index-BsdY9thP.css   62.92 kB │ gzip:  14.98 kB
  dist/assets/index-B1LUU2-3.js   414.10 kB │ gzip: 126.13 kB
  ✓ built in 698ms
  ```
- **Status:** **PASS**
