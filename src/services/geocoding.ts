import type { LocationPoint, NominatimPlace } from '../types/ride';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * Busca sugestões de endereço via OpenStreetMap Nominatim
 */
export async function searchPlaces(query: string): Promise<LocationPoint[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=5&countrycodes=br`;

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'User-Agent': 'MobiMatch-RideComparisonApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.statusText}`);
    }

    const data: NominatimPlace[] = await response.json();

    return data.map((item) => {
      // Extrai um nome curto e legível
      const parts = item.display_name.split(',');
      const shortName = parts[0]?.trim() || item.display_name;
      const subInfo = parts.slice(1, 4).map((p) => p.trim()).join(', ');

      return {
        name: shortName,
        address: subInfo || item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    return [];
  }
}

/**
 * Geocodificação reversa para obter nome do local a partir de coordenadas GPS
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationPoint> {
  try {
    const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'User-Agent': 'MobiMatch-RideComparisonApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro no reverse geocode: ${response.statusText}`);
    }

    const data = await response.json();
    const parts = data.display_name ? data.display_name.split(',') : [];
    const name = parts[0]?.trim() || 'Minha Localização';
    const address = parts.slice(1, 4).map((p: string) => p.trim()).join(', ');

    return {
      name,
      address,
      lat,
      lng,
    };
  } catch (error) {
    console.error('Erro na geocodificação reversa:', error);
    return {
      name: 'Minha Localização',
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lat,
      lng,
    };
  }
}
