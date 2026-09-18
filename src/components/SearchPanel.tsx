import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  X,
  Loader2,
  Building,
  Plane,
  ShoppingBag,
} from 'lucide-react';
import type { LocationPoint } from '../types/ride';
import { searchPlaces, reverseGeocode } from '../services/geocoding';

interface SearchPanelProps {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  onSelectOrigin: (point: LocationPoint) => void;
  onSelectDestination: (point: LocationPoint) => void;
  onSwapLocations: () => void;
  isLoadingRoute: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  origin,
  destination,
  onSelectOrigin,
  onSelectDestination,
  onSwapLocations,
  isLoadingRoute,
}) => {
  const [originInput, setOriginInput] = useState('');
  const [destInput, setDestInput] = useState('');

  const [originSuggestions, setOriginSuggestions] = useState<LocationPoint[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationPoint[]>([]);

  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  const [activeField, setActiveField] = useState<'origin' | 'dest' | null>(null);

  const originDebounceRef = useRef<number | null>(null);
  const destDebounceRef = useRef<number | null>(null);

  // Sincroniza campos quando origin/dest externos mudam
  useEffect(() => {
    if (origin) {
      setOriginInput(origin.name || origin.address || '');
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      setDestInput(destination.name || destination.address || '');
    }
  }, [destination]);

  // Debounce search para Origem
  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOriginInput(value);
    setActiveField('origin');

    if (originDebounceRef.current) clearTimeout(originDebounceRef.current);

    if (value.trim().length >= 3) {
      setIsSearchingOrigin(true);
      originDebounceRef.current = window.setTimeout(async () => {
        const results = await searchPlaces(value);
        setOriginSuggestions(results);
        setIsSearchingOrigin(false);
      }, 400);
    } else {
      setOriginSuggestions([]);
      setIsSearchingOrigin(false);
    }
  };

  // Debounce search para Destino
  const handleDestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestInput(value);
    setActiveField('dest');

    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);

    if (value.trim().length >= 3) {
      setIsSearchingDest(true);
      destDebounceRef.current = window.setTimeout(async () => {
        const results = await searchPlaces(value);
        setDestSuggestions(results);
        setIsSearchingDest(false);
      }, 400);
    } else {
      setDestSuggestions([]);
      setIsSearchingDest(false);
    }
  };

  // Ação de obter localização atual via GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.');
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const point = await reverseGeocode(latitude, longitude);
        onSelectOrigin(point);
        setOriginInput(point.name);
        setIsLocatingUser(false);
        setActiveField(null);
      },
      (err) => {
        console.error('Erro ao obter GPS:', err);
        setIsLocatingUser(false);
        alert(
          'Não foi possível obter sua localização. Verifique a permissão de GPS.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleQuickDestination = (title: string, query: string) => {
    setDestInput(title);
    setIsSearchingDest(true);
    setActiveField('dest');
    searchPlaces(query).then((results) => {
      setIsSearchingDest(false);
      if (results.length > 0 && results[0]) {
        onSelectDestination(results[0]);
        setDestInput(results[0].name);
        setActiveField(null);
      } else {
        setDestSuggestions(results);
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl relative z-20">
      <div className="space-y-3">
        {/* Campo de Origem */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/30 transition">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <input
              type="text"
              placeholder="Onde você está? (Origem)"
              value={originInput}
              onChange={handleOriginChange}
              onFocus={() => setActiveField('origin')}
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full font-medium"
            />
            {isSearchingOrigin && (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
            )}
            {originInput && !isSearchingOrigin && (
              <button
                onClick={() => {
                  setOriginInput('');
                  setOriginSuggestions([]);
                }}
                className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocatingUser}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1.5 rounded-lg shrink-0 transition border border-emerald-500/20 cursor-pointer disabled:opacity-50"
              title="Usar GPS Atual"
            >
              {isLocatingUser ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>

          {/* Sugestões de Origem */}
          {activeField === 'origin' && originSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {originSuggestions.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectOrigin(place);
                    setOriginInput(place.name);
                    setOriginSuggestions([]);
                    setActiveField(null);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 border-b border-slate-800/60 last:border-0 transition flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate m-0">
                      {place.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate m-0">
                      {place.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Inverter Origem e Destino */}
        <div className="flex items-center justify-center -my-2 relative z-10">
          <button
            onClick={onSwapLocations}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 shadow-md transition cursor-pointer"
            title="Inverter origem e destino"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Campo de Destino */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 transition">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <input
              type="text"
              placeholder="Para onde você vai? (Destino)"
              value={destInput}
              onChange={handleDestChange}
              onFocus={() => setActiveField('dest')}
              className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full font-medium"
            />
            {isSearchingDest && (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
            )}
            {destInput && !isSearchingDest && (
              <button
                onClick={() => {
                  setDestInput('');
                  setDestSuggestions([]);
                }}
                className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sugestões de Destino */}
          {activeField === 'dest' && destSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {destSuggestions.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectDestination(place);
                    setDestInput(place.name);
                    setDestSuggestions([]);
                    setActiveField(null);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 border-b border-slate-800/60 last:border-0 transition flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate m-0">
                      {place.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate m-0">
                      {place.address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Atalhos Rápidos de Destino */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 shrink-0">Sugestões:</span>
          <button
            onClick={() => handleQuickDestination('Aeroporto', 'Aeroporto')}
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 shrink-0 transition cursor-pointer text-xs"
          >
            <Plane className="w-3 h-3 text-sky-400" />
            <span>Aeroporto</span>
          </button>
          <button
            onClick={() => handleQuickDestination('Shopping Center', 'Shopping Center')}
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 shrink-0 transition cursor-pointer text-xs"
          >
            <ShoppingBag className="w-3 h-3 text-pink-400" />
            <span>Shopping</span>
          </button>
          <button
            onClick={() => handleQuickDestination('Centro da Cidade', 'Centro')}
            className="flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 shrink-0 transition cursor-pointer text-xs"
          >
            <Building className="w-3 h-3 text-amber-400" />
            <span>Centro</span>
          </button>
        </div>

        {/* Loading de cálculo de rota */}
        {isLoadingRoute && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Traçando melhor percurso e consultando plataformas...</span>
          </div>
        )}
      </div>
    </div>
  );
};
