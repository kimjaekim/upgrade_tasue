// OpenRouteService directions utility
// Reads API key from REACT_APP_ORS_API_KEY

const ORS_ENDPOINT = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

/**
 * Fetch cycling route from OpenRouteService.
 * @param {{lat:number,lng:number}} start
 * @param {{lat:number,lng:number}} dest
 * @returns {Promise<{ routePoints: Array<{lat:number,lng:number}>, distanceKm: number, durationMin: number }>} summary
 */
export async function getORSRoute(start, dest) {
  const apiKey = process.env.REACT_APP_ORS_API_KEY;
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.error('REACT_APP_ORS_API_KEY is not set');
    return { routePoints: [], distanceKm: NaN, durationMin: NaN };
  }

  const body = {
    coordinates: [
      [Number(start.lng), Number(start.lat)],
      [Number(dest.lng), Number(dest.lat)]
    ],
    instructions: false,
    elevation: false,
    // Prefer shorter pedestrian paths and avoid awkward features
    preference: 'shortest',
    options: {
      avoid_features: ['ferries', 'steps']
    }
  };

  try {
    const res = await fetch(ORS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      // eslint-disable-next-line no-console
      console.error('OpenRouteService request failed', res.status, text);
      return { routePoints: [], distanceKm: NaN, durationMin: NaN };
    }

    const data = await res.json();
    // GeoJSON FeatureCollection or Feature
    const feature = data.features && data.features[0] ? data.features[0] : data;
    if (!feature || !feature.geometry || !Array.isArray(feature.geometry.coordinates)) {
      // eslint-disable-next-line no-console
      console.error('Invalid ORS response geometry', data);
      return { routePoints: [], distanceKm: NaN, durationMin: NaN };
    }

    const coords = feature.geometry.coordinates; // [lng, lat]
    const routePoints = coords
      .map((c) => ({ lat: Number(c[1]), lng: Number(c[0]) }))
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    // distance (meters) and duration (seconds) are usually under properties.summary
    const summary = feature.properties && feature.properties.summary
      ? feature.properties.summary
      : (data.routes && data.routes[0] && data.routes[0].summary) || {};
    const distanceKmRaw = Number(summary.distance);
    const durationSecRaw = Number(summary.duration);
    const distanceKm = Number.isFinite(distanceKmRaw) ? distanceKmRaw / 1000 : 0; // meters -> km
    const durationMin = Number.isFinite(durationSecRaw) ? durationSecRaw / 60 : 0;   // seconds -> minutes

    // eslint-disable-next-line no-console
    console.log('[ORS] route len/distance/duration', routePoints.length, distanceKm, durationMin);

    return { routePoints, distanceKm, durationMin };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('OpenRouteService fetch error', e);
    return { routePoints: [], distanceKm: NaN, durationMin: NaN };
  }
}
