import React from 'react';
import { Sliders, Zap, Car } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  surgeMultiplier: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, surgeMultiplier }) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white m-0">MobiMatch</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                Multi-App
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0">Uber • 99 • inDrive num só lugar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {surgeMultiplier > 1.0 && (
            <div className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg">
              <Zap className="w-3.5 h-3.5" />
              <span>Dinâmica {surgeMultiplier.toFixed(1)}x</span>
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-xl transition border border-slate-700 cursor-pointer shadow-sm"
            title="Ajustar tarifas e dinâmica"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tarifas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
