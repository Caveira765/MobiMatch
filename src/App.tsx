import React, { useState, useEffect, useCallback } from 'react';
import type { LocationPoint, RouteData, RideOption, FareSettings } from './types/ride';
import { DEFAULT_FARE_SETTINGS, calculateRideOptions } from './services/pricing';
import { fetchRoute } from './services/routing';
import { Header } from './components/Header';
import { SearchPanel } from './components/SearchPanel';
import { MapView } from './components/MapView';
import { RideComparison } from './components/RideComparison';
import { SettingsModal } from './components/SettingsModal';
import { Compass, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Coordenadas iniciais de exemplo (São Paulo: Av. Paulista até Aeroporto de Congonhas)
  const [origin, setOrigin] = useState<LocationPoint | null>({
    name: 'Avenida Paulista, 1000',
    address: 'Bela Vista, São Paulo - SP',
    lat: -23.5654,
    lng: -46.6517,
  });

  const [destination, setDestination] = useState<LocationPoint | null>({
    name: 'Aeroporto de Congonhas',
    address: 'Vila Congonhas, São Paulo - SP',
    lat: -23.6261,
    lng: -46.6564,
  });

  const [route, setRoute] = useState<RouteData | null>(null);
  const [rides, setRides] = useState<RideOption[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [settings, setSettings] = useState<FareSettings>(() => {
    try {
      const saved = localStorage.getItem('mobimatch_fare_settings');
      return saved ? JSON.parse(saved) : DEFAULT_FARE_SETTINGS;
    } catch {
      return DEFAULT_FARE_SETTINGS;
    }
  });

  const handleSaveSettings = (newSettings: FareSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('mobimatch_fare_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  // Atualiza a rota e recalcula as opções de corrida
  const updateRouteAndRides = useCallback(
    async (orig: LocationPoint, dest: LocationPoint, currentSettings: FareSettings) => {
      setIsLoadingRoute(true);
      try {
        const routeData = await fetchRoute(orig, dest);
        setRoute(routeData);

        const rideOptions = calculateRideOptions(orig, dest, routeData, currentSettings);
        setRides(rideOptions);
      } catch (err) {
        console.error('Erro ao calcular rota:', err);
      } finally {
        setIsLoadingRoute(false);
      }
    },
    []
  );

  // Efeito quando origem, destino ou settings mudam
  useEffect(() => {
    if (origin && destination) {
      updateRouteAndRides(origin, destination, settings);
    }
  }, [origin, destination, settings, updateRouteAndRides]);

  // Inverter Origem e Destino
  const handleSwapLocations = () => {
    if (origin && destination) {
      const temp = origin;
      setOrigin(destination);
      setDestination(temp);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Barra de Topo */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        surgeMultiplier={settings.surgeMultiplier}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-5 space-y-4">
        {/* Painel de Busca */}
        <SearchPanel
          origin={origin}
          destination={destination}
          onSelectOrigin={(pt) => setOrigin(pt)}
          onSelectDestination={(pt) => setDestination(pt)}
          onSwapLocations={handleSwapLocations}
          isLoadingRoute={isLoadingRoute}
        />

        {/* Mapa Interativo com Traçado da Rota */}
        <MapView origin={origin} destination={destination} route={route} />

        {/* Seção de Comparação de Corridas */}
        {origin && destination && rides.length > 0 ? (
          <RideComparison
            rides={rides}
            origin={origin}
            destination={destination}
          />
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Compass className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white m-0">
              Selecione o ponto de partida e o destino
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto m-0">
              Digite os endereços ou use seu GPS atual para comparar valores e tempos entre
              Uber, 99 e inDrive instantaneamente.
            </p>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-850 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="m-0 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>MobiMatch • Hub Unificado de Mobilidade Urbana</span>
          </p>
          <p className="m-0 text-[11px] text-slate-600">
            Abre os apps oficiais diretamente via Deep Links seguros
          </p>
        </div>
      </footer>

      {/* Modal de Configuração de Tarifas */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
};

export default App;
