/**
 * ASTRA Orbit - ISS Data Service
 * Astronomy & Astrophysics Club — IIIT Surat
 * 
 * Handles fetching live telemetry from the ISS public API, validating data,
 * failover fallback to alternative endpoints, and formatting helpers.
 */

const PRIMARY_API = 'https://api.wheretheiss.at/v1/satellites/25544';
const FALLBACK_API = 'https://api.open-notify.org/iss-now.json';

/**
 * Validate and sanitize telemetry data
 * @param {object} raw 
 * @returns {object} Validated telemetry payload
 */
function validateTelemetry(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Received empty or invalid telemetry response');
  }

  // Ensure lat and lon are numbers within realistic earth bounds
  const lat = Number(raw.latitude);
  const lon = Number(raw.longitude);

  if (Number.isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude value: ${raw.latitude}`);
  }
  if (Number.isNaN(lon) || lon < -180 || lon > 180) {
    throw new Error(`Invalid longitude value: ${raw.longitude}`);
  }

  // Altitude in km (typical ISS altitude is 370 - 460 km)
  const altitude = raw.altitude !== undefined ? Number(raw.altitude) : null;
  // Velocity in km/h (typical ISS velocity ~ 27,500 - 27,700 km/h)
  const velocity = raw.velocity !== undefined ? Number(raw.velocity) : null;
  // Timestamp in seconds (Unix epoch)
  const timestamp = raw.timestamp ? Number(raw.timestamp) : Math.floor(Date.now() / 1000);
  const visibility = raw.visibility || (altitude ? 'unknown' : 'daylight');
  const footprint = raw.footprint !== undefined ? Number(raw.footprint) : null;

  return {
    latitude: lat,
    longitude: lon,
    altitude: altitude !== null && !Number.isNaN(altitude) ? altitude : null,
    velocity: velocity !== null && !Number.isNaN(velocity) ? velocity : null,
    visibility: visibility,
    footprint: footprint !== null && !Number.isNaN(footprint) ? footprint : null,
    timestamp: timestamp,
    source: raw.source || 'wheretheiss.at',
    units: raw.units || 'kilometers',
    fetchedAt: Date.now()
  };
}

/**
 * Fetch ISS position from primary endpoint, with automatic fallback
 * @param {AbortSignal} [signal] Optional abort signal for clean component unmounting
 * @returns {Promise<object>}
 */
export async function fetchISSTelemetry(signal) {
  try {
    // Attempt Primary API
    const response = await fetch(PRIMARY_API, {
      signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Primary API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return validateTelemetry({ ...data, source: 'wheretheiss.at' });
  } catch (primaryError) {
    // If request was explicitly aborted by caller (e.g. component unmount), re-throw
    if (primaryError.name === 'AbortError') {
      throw primaryError;
    }

    console.warn('Primary ISS API failed, attempting fallback API:', primaryError.message);

    try {
      // Attempt Fallback API (Open-Notify)
      const fallbackResponse = await fetch(FALLBACK_API, { signal });
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback API HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
      }
      const fbData = await fallbackResponse.json();

      if (fbData.message !== 'success' || !fbData.iss_position) {
        throw new Error('Malformed response from fallback ISS provider');
      }

      // Open-notify supplies lat/lon strings, no altitude/velocity
      return validateTelemetry({
        latitude: parseFloat(fbData.iss_position.latitude),
        longitude: parseFloat(fbData.iss_position.longitude),
        altitude: null, // Open-Notify does not supply altitude
        velocity: null, // Open-Notify does not supply velocity
        visibility: 'unknown',
        footprint: null,
        timestamp: fbData.timestamp,
        source: 'open-notify.org (fallback)',
        units: 'kilometers'
      });
    } catch (fallbackError) {
      if (fallbackError.name === 'AbortError') {
        throw fallbackError;
      }
      throw new Error(
        `Failed to reach both primary (${primaryError.message}) and fallback (${fallbackError.message}) ISS endpoints.`
      );
    }
  }
}

/**
 * Split an array of [lat, lon] coordinates across the International Date Line (-180 / +180)
 * to prevent Leaflet from drawing unwanted horizontal lines across the entire map.
 * @param {Array<{lat: number, lon: number, timestamp: number}>} trackPoints
 * @returns {Array<Array<[number, number]>>} Array of polyline segments
 */
export function segmentTrackAcrossDateLine(trackPoints) {
  if (!trackPoints || trackPoints.length === 0) return [];

  const segments = [];
  let currentSegment = [];

  for (let i = 0; i < trackPoints.length; i++) {
    const pt = trackPoints[i];
    const coord = [pt.lat, pt.lon];

    if (currentSegment.length === 0) {
      currentSegment.push(coord);
    } else {
      const prevPt = trackPoints[i - 1];
      const lonDiff = Math.abs(pt.lon - prevPt.lon);

      // If the longitude jumped by more than 180 degrees, it crossed the antimeridian
      if (lonDiff > 180) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
        }
        currentSegment = [coord];
      } else {
        currentSegment.push(coord);
      }
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * Format geographic latitude/longitude with cardinal designations
 */
export function formatCoordinates(lat, lon) {
  if (lat === null || lon === null || lat === undefined || lon === undefined) {
    return { latStr: '--', lonStr: '--', fullStr: 'Coordinates unavailable' };
  }
  const latCard = lat >= 0 ? 'N' : 'S';
  const lonCard = lon >= 0 ? 'E' : 'W';
  const latStr = `${Math.abs(lat).toFixed(4)}° ${latCard}`;
  const lonStr = `${Math.abs(lon).toFixed(4)}° ${lonCard}`;
  return {
    latStr,
    lonStr,
    fullStr: `${latStr}, ${lonStr}`
  };
}

/**
 * Convert km/h to other common units
 */
export function formatVelocity(kmh) {
  if (kmh === null || kmh === undefined) {
    return { kmh: 'N/A', kms: 'N/A', mph: 'N/A' };
  }
  const kms = kmh / 3600;
  const mph = kmh * 0.621371;
  return {
    kmh: `${Math.round(kmh).toLocaleString()} km/h`,
    kms: `${kms.toFixed(2)} km/s`,
    mph: `${Math.round(mph).toLocaleString()} mph`
  };
}

/**
 * Format altitude in kilometers and miles
 */
export function formatAltitude(km) {
  if (km === null || km === undefined) {
    return { km: 'N/A', miles: 'N/A' };
  }
  const miles = km * 0.621371;
  return {
    km: `${km.toFixed(1)} km`,
    miles: `${miles.toFixed(1)} mi`
  };
}
