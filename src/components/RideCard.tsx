import React from 'react';
import {
  ExternalLink,
  Clock,
  Zap,
  TrendingDown,
  Car,
  Bike,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import type { RideOption } from '../types/ride';
import { openApp } from '../services/deepLinks';

interface RideCardProps {
  ride: RideOption;
}

export const RideCard: React.FC<RideCardProps> = ({ ride }) => {
  const isUber = ride.platform === 'uber';
  const is99 = ride.platform === '99';

  const isCheapest = ride.badges?.includes('cheapest');
  const isFastest = ride.badges?.includes('fastest');
  const isBidding = ride.badges?.includes('bidding');

  const handleOpenRide = () => {
    openApp(ride.deepLink, ride.webFallbackLink);
  };

  // Ícone da categoria do veículo
  const getCategoryIcon = () => {
    if (ride.category === 'moto') return <Bike className="w-4 h-4" />;
    if (ride.category === 'comfort') return <Sparkles className="w-4 h-4" />;
    return <Car className="w-4 h-4" />;
  };

  // Cor de destaque do botão
  const getButtonStyles = () => {
    if (isUber) {
      return 'bg-white hover:bg-slate-200 text-black shadow-md';
    }
    if (is99) {
      return 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/20 shadow-lg';
    }
    return 'bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold shadow-lime-500/20 shadow-lg';
  };

  // Badge da marca
  const getBrandBadge = () => {
    if (isUber) {
      return (
        <span className="bg-black text-white font-extrabold text-xs px-2 py-0.5 rounded border border-slate-700 tracking-wider">
          UBER
        </span>
      );
    }
    if (is99) {
      return (
        <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded tracking-tight">
          99
        </span>
      );
    }
    return (
      <span className="bg-lime-400 text-slate-950 font-extrabold text-xs px-2 py-0.5 rounded tracking-tight">
        inDrive
      </span>
    );
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between gap-3 ${
        isCheapest
          ? 'bg-slate-900/95 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Badges superiores flutuantes */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {getBrandBadge()}
          <span className="text-sm font-semibold text-white flex items-center gap-1.5">
            {getCategoryIcon()}
            {ride.categoryName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCheapest && (
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3" />
              Menor Preço
            </span>
          )}
          {isFastest && !isCheapest && (
            <span className="inline-flex items-center gap-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" />
              Mais Rápido
            </span>
          )}
          {isBidding && (
            <span className="inline-flex items-center gap-1 bg-lime-500/20 text-lime-400 border border-lime-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <DollarSign className="w-3 h-3" />
              Sua Oferta
            </span>
          )}
        </div>
      </div>

      {/* Preço e Tempo */}
      <div className="flex items-end justify-between py-1">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-white">
              R$ {ride.estimatedPrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              (R$ {ride.priceMin} - {ride.priceMax})
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Chega em ~{ride.etaMinutes} min
            </span>
            <span className="text-slate-600">•</span>
            <span>Viagem: ~{ride.tripDurationMinutes} min</span>
          </div>
        </div>

        {/* Botão de abrir aplicativo com Deep Link */}
        <button
          onClick={handleOpenRide}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shrink-0 ${getButtonStyles()}`}
          title={`Abrir ${ride.platformName} com rota pronta`}
        >
          <span>Abrir {ride.platformName}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Notas ou dicas informativas */}
      {(ride.biddingNote || ride.discountNote) && (
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="truncate">
            {ride.biddingNote || ride.discountNote}
          </span>
          <span className="text-slate-500 text-[10px] shrink-0 ml-2">
            Deep Link oficial
          </span>
        </div>
      )}
    </div>
  );
};
