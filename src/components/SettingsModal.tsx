import React from 'react';
import { X, RotateCcw, Zap, Sliders, Check } from 'lucide-react';
import type { FareSettings } from '../types/ride';
import { DEFAULT_FARE_SETTINGS } from '../services/pricing';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FareSettings;
  onSaveSettings: (settings: FareSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = React.useState<FareSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleReset = () => {
    setLocalSettings(DEFAULT_FARE_SETTINGS);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white m-0">
              Calibração de Tarifas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Controls */}
        <div className="space-y-4 text-xs">
          {/* Tarifa Dinâmica (Surge) */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Tarifa Dinâmica (Horário de Pico / Chuva)
              </span>
              <span className="font-bold text-amber-400 text-sm">
                {localSettings.surgeMultiplier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={localSettings.surgeMultiplier}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  surgeMultiplier: parseFloat(e.target.value),
                })
              }
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.0x (Normal)</span>
              <span>1.5x (Moderada)</span>
              <span>2.5x (Alta procura)</span>
            </div>
          </div>

          {/* Calibração Uber */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
            <p className="font-semibold text-white m-0 flex items-center justify-between">
              <span>Uber - Custo por Km e Minuto</span>
              <span className="text-[10px] text-slate-400">Base Nacional</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400">Valor / km (R$)</label>
                <input
                  type="number"
                  step="0.05"
                  value={localSettings.uberPerKm}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      uberPerKm: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Bandeirada (R$)</label>
                <input
                  type="number"
                  step="0.10"
                  value={localSettings.uberBaseRate}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      uberBaseRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs mt-1"
                />
              </div>
            </div>
          </div>

          {/* Calibração 99 */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
            <p className="font-semibold text-white m-0 flex items-center justify-between">
              <span>99 - Custo por Km e Minuto</span>
              <span className="text-[10px] text-amber-400">99Pop</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400">Valor / km (R$)</label>
                <input
                  type="number"
                  step="0.05"
                  value={localSettings.t99PerKm}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      t99PerKm: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Bandeirada (R$)</label>
                <input
                  type="number"
                  step="0.10"
                  value={localSettings.t99BaseRate}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      t99BaseRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-xs mt-1"
                />
              </div>
            </div>
          </div>

          {/* Desconto Sugerido inDrive */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">
                inDrive - Desconto Médio Sugerido na Oferta
              </span>
              <span className="font-bold text-lime-400 text-sm">
                {Math.round((1 - localSettings.inDriveDiscountFactor) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.65"
              max="0.90"
              step="0.05"
              value={localSettings.inDriveDiscountFactor}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  inDriveDiscountFactor: parseFloat(e.target.value),
                })
              }
              className="w-full accent-lime-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 m-0">
              Controla o ponto de partida do seu lance para aceitação rápida.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>
    </div>
  );
};
