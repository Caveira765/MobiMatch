import React, { useState } from 'react';
import type { RideOption, VehicleCategory, LocationPoint } from '../types/ride';
import { RideCard } from './RideCard';
import {
  Car,
  Sparkles,
  Bike,
  Layers,
  ArrowDownUp,
  MapPin,
  ExternalLink,
  Info,
} from 'lucide-react';

interface RideComparisonProps {
  rides: RideOption[];
  origin: LocationPoint;
  destination: LocationPoint;
}

export const RideComparison: React.FC<RideComparisonProps> = ({
  rides,
  origin,
  destination,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    VehicleCategory | 'all'
  >('all');
  const [sortBy, setSortBy] = useState<'price' | 'eta'>('price');

  // Filtragem por categoria
  const filteredRides = rides.filter((ride) => {
    if (selectedCategory === 'all') return true;
    return ride.category === selectedCategory;
  });

  // Ordenação
  const sortedRides = [...filteredRides].sort((a, b) => {
    if (sortBy === 'price') {
      return a.estimatedPrice - b.estimatedPrice;
    }
    return a.etaMinutes - b.etaMinutes;
  });

  // Economia máxima calculada
  const prices = rides.map((r) => r.estimatedPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const maxSavings = Math.round((maxPrice - minPrice) * 10) / 10;

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Barra de Economia e Destaque */}
      {maxSavings > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300 shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Comparando agora você pode economizar até{' '}
              <strong className="text-emerald-400 font-bold">
                R$ {maxSavings.toFixed(2).replace('.', ',')}
              </strong>{' '}
              nesta mesma rota!
            </span>
          </div>
        </div>
      )}

      {/* Filtros de Categoria e Ordenação */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Abas de Categoria */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos ({rides.length})</span>
          </button>
          <button
            onClick={() => setSelectedCategory('standard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              selectedCategory === 'standard'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Carro</span>
          </button>
          <button
            onClick={() => setSelectedCategory('comfort')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              selectedCategory === 'comfort'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Conforto</span>
          </button>
          <button
            onClick={() => setSelectedCategory('moto')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
              selectedCategory === 'moto'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Moto</span>
          </button>
        </div>

        {/* Alternador de Ordenação */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 self-end sm:self-auto">
          <ArrowDownUp className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] text-slate-500">Ordenar por:</span>
          <button
            onClick={() => setSortBy('price')}
            className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
              sortBy === 'price'
                ? 'bg-slate-800 text-white border-slate-700 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Menor Preço
          </button>
          <button
            onClick={() => setSortBy('eta')}
            className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
              sortBy === 'eta'
                ? 'bg-slate-800 text-white border-slate-700 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Mais Rápido
          </button>
        </div>
      </div>

      {/* Lista de Cards de Corridas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedRides.map((ride) => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </div>

      {/* Link de fallback para o Google Maps */}
      <div className="text-center pt-2">
        <button
          onClick={handleOpenGoogleMaps}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span>Ver rota detalhada no Google Maps</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </div>
  );
};
