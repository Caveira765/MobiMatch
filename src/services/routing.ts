import type { LocationPoint, RouteData } from '../types/ride';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Calcula a distância em linha reta (fórmula de Haversine)
 */
function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Consulta a rota real de condução via Open Source Routing Machine (OSRM)
 * Se falhar, utiliza fallback geométrico aproximado por vias urbanas.
 */
export async function fetchRoute(
  origin: LocationPoint,
  destination: LocationPoint
): Promise<RouteData> {
  const coordinatesString = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_BASE}/${coordinatesString}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM response not ok: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceMeters = route.distance;
      const durationSeconds = route.duration;

      // OSRM retorna coordenadas GeoJSON como [lng, lat]. Leaflet espera [lat, lng].
      const leafletCoordinates: [number, number][] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      return {
        distanceMeters,
        distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
        durationSeconds,
        durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
        coordinates: leafletCoordinates,
      };
    }
  } catch (error) {
    console.warn('Falha na API OSRM, usando cálculo urbano estimado:', error);
  }

  // Fallback: cálculo de distância aproximado com fator viário de 1.32x (curvas de trânsito)
  const straightDistanceKm = calculateHaversineDistanceKm(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  );
  const estimatedRoadDistanceKm = Math.round(straightDistanceKm * 1.32 * 10) / 10;
  // Média de velocidade urbana de 25 km/h
  const estimatedMinutes = Math.max(
    3,
    Math.round((estimatedRoadDistanceKm / 25) * 60)
  );

  return {
    distanceMeters: estimatedRoadDistanceKm * 1000,
    distanceKm: estimatedRoadDistanceKm,
    durationSeconds: estimatedMinutes * 60,
    durationMinutes: estimatedMinutes,
    coordinates: [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ],
  };
}
