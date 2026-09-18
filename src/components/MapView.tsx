import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LocationPoint, RouteData } from '../types/ride';
import { Navigation, Clock } from 'lucide-react';

interface MapViewProps {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  route: RouteData | null;
}

export const MapView: React.FC<MapViewProps> = ({ origin, destination, route }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Posição inicial padrão (Brasil centralizado ou São Paulo como base)
      const initialLat = origin?.lat || -23.55052;
      const initialLng = origin?.lng || -46.633308;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Camada de mapa moderna (CartoDB Dark Matter para combinar com o tema dark moderno)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup ao desmontar
    };
  }, []);

  // Atualiza marcadores e trajeto sempre que origin, destination ou route mudam
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Limpa camadas anteriores
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const bounds = L.latLngBounds([]);

    // Marcador de Origem (Verde)
    if (origin) {
      const originIcon = L.divIcon({
        className: 'custom-origin-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 18px; height: 18px; border-radius: 50%; background: #10B981; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([origin.lat, origin.lng], { icon: originIcon })
        .bindPopup(`<b>Origem:</b><br/>${origin.name}`);
      markersGroupRef.current?.addLayer(marker);
      bounds.extend([origin.lat, origin.lng]);
    }

    // Marcador de Destino (Âmbar/Laranja)
    if (destination) {
      const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `
          <div style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
            <div style="background: #F59E0B; border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); width: 22px; height: 22px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 30],
      });

      const marker = L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindPopup(`<b>Destino:</b><br/>${destination.name}`);
      markersGroupRef.current?.addLayer(marker);
      bounds.extend([destination.lat, destination.lng]);
    }

    // Traçado da Rota
    if (route && route.coordinates.length > 0) {
      const polyline = L.polyline(route.coordinates, {
        color: '#0284c7', // Azul vívido
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(map);

      routeLayerRef.current = polyline;

      route.coordinates.forEach((coord) => bounds.extend(coord));
    }

    // Ajusta o zoom para enquadrar a rota inteira
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 16,
        animate: true,
      });
    }
  }, [origin, destination, route]);

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Route Info Badge */}
      {route && (
        <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 shadow-xl flex items-center gap-3 text-xs text-white">
          <div className="flex items-center gap-1.5 font-semibold text-sky-400">
            <Navigation className="w-3.5 h-3.5" />
            <span>{route.distanceKm} km</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>~{route.durationMinutes} min de trajeto</span>
          </div>
        </div>
      )}
    </div>
  );
};
