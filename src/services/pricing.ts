import type {
  FareSettings,
  LocationPoint,
  RideOption,
  RouteData,
  VehicleCategory,
} from '../types/ride';
import {
  generate99Link,
  generateInDriveLink,
  generateUberLink,
} from './deepLinks';

export const DEFAULT_FARE_SETTINGS: FareSettings = {
  surgeMultiplier: 1.0, // 1.0 = normal (sem tarifa dinâmica)
  uberBaseRate: 4.8,
  uberPerKm: 1.55,
  uberPerMin: 0.28,
  t99BaseRate: 4.3,
  t99PerKm: 1.48,
  t99PerMin: 0.25,
  inDriveDiscountFactor: 0.78, // ~22% de economia inicial sugerida
};

/**
 * Calcula todas as opções de corrida disponíveis para a rota especificada
 */
export function calculateRideOptions(
  origin: LocationPoint,
  destination: LocationPoint,
  route: RouteData,
  settings: FareSettings = DEFAULT_FARE_SETTINGS
): RideOption[] {
  const km = route.distanceKm;
  const min = route.durationMinutes;
  const surge = settings.surgeMultiplier;

  // 1. UBER CÁLCULOS
  // UberX
  const uberXRaw =
    (settings.uberBaseRate + km * settings.uberPerKm + min * settings.uberPerMin) *
    surge;
  const uberXPrice = Math.max(8.5, Math.round(uberXRaw * 10) / 10);
  const uberLinks = generateUberLink(origin, destination);

  // Uber Comfort (~30% a mais)
  const uberComfortPrice = Math.round(uberXPrice * 1.32 * 10) / 10;

  // Uber Moto (~45% mais barato que UberX, mínimo R$ 5.50)
  const uberMotoPrice = Math.max(5.5, Math.round(uberXPrice * 0.54 * 10) / 10);

  // 2. 99 CÁLCULOS
  // 99Pop
  const t99PopRaw =
    (settings.t99BaseRate + km * settings.t99PerKm + min * settings.t99PerMin) *
    surge;
  const t99PopPrice = Math.max(7.9, Math.round(t99PopRaw * 10) / 10);
  const t99Links = generate99Link(origin, destination);

  // 99Plus (~28% a mais)
  const t99PlusPrice = Math.round(t99PopPrice * 1.28 * 10) / 10;

  // 99Moto (~48% mais barato que 99Pop, mínimo R$ 5.00)
  const t99MotoPrice = Math.max(5.0, Math.round(t99PopPrice * 0.52 * 10) / 10);

  // 3. INDRIVE CÁLCULOS (Modelo de Lance / Oferta Justa)
  // Lance inicial sugerido (valor competitivo para motoristas aceitarem rápido)
  const inDriveCarroBase = Math.max(
    7.0,
    Math.round(uberXPrice * settings.inDriveDiscountFactor * 10) / 10
  );
  // Faixa de negociação sugerida
  const inDriveMin = Math.round(inDriveCarroBase * 0.95);
  const inDriveMax = Math.round(inDriveCarroBase * 1.15);

  const inDriveMotoBase = Math.max(
    4.5,
    Math.round(uberMotoPrice * settings.inDriveDiscountFactor * 10) / 10
  );
  const inDriveLinks = generateInDriveLink(origin, destination);

  // Lista base de opções
  const options: RideOption[] = [
    // --- Carro Padrão ---
    {
      id: 'uber-x',
      platform: 'uber',
      platformName: 'Uber',
      platformColor: '#000000',
      category: 'standard',
      categoryName: 'UberX',
      priceMin: Math.round(uberXPrice * 0.95),
      priceMax: Math.round(uberXPrice * 1.1),
      estimatedPrice: uberXPrice,
      etaMinutes: 3,
      tripDurationMinutes: min,
      deepLink: uberLinks.primaryLink,
      webFallbackLink: uberLinks.fallbackLink,
      badges: [],
      discountNote: surge > 1.0 ? `Dinâmica ${(surge).toFixed(1)}x ativa` : undefined,
    },
    {
      id: '99-pop',
      platform: '99',
      platformName: '99',
      platformColor: '#F7A700',
      category: 'standard',
      categoryName: '99Pop',
      priceMin: Math.round(t99PopPrice * 0.94),
      priceMax: Math.round(t99PopPrice * 1.08),
      estimatedPrice: t99PopPrice,
      etaMinutes: 4,
      tripDurationMinutes: min,
      deepLink: t99Links.primaryLink,
      webFallbackLink: t99Links.fallbackLink,
      badges: [],
      discountNote: 'Pode aplicar cupom no app',
    },
    {
      id: 'indrive-car',
      platform: 'indrive',
      platformName: 'inDrive',
      platformColor: '#A0D236',
      category: 'standard',
      categoryName: 'Carro (Sua Oferta)',
      priceMin: inDriveMin,
      priceMax: inDriveMax,
      estimatedPrice: inDriveCarroBase,
      etaMinutes: 5,
      tripDurationMinutes: min,
      deepLink: inDriveLinks.primaryLink,
      webFallbackLink: inDriveLinks.fallbackLink,
      badges: ['bidding'],
      biddingNote: `Oferta recomendada: R$ ${inDriveCarroBase.toFixed(2)} (Faixa R$ ${inDriveMin} - R$ ${inDriveMax})`,
    },

    // --- Carro Conforto / Espaço ---
    {
      id: 'uber-comfort',
      platform: 'uber',
      platformName: 'Uber',
      platformColor: '#000000',
      category: 'comfort',
      categoryName: 'Uber Comfort',
      priceMin: Math.round(uberComfortPrice * 0.96),
      priceMax: Math.round(uberComfortPrice * 1.12),
      estimatedPrice: uberComfortPrice,
      etaMinutes: 6,
      tripDurationMinutes: min,
      deepLink: uberLinks.primaryLink,
      webFallbackLink: uberLinks.fallbackLink,
      badges: [],
      discountNote: 'Carros mais novos e com ar-condicionado garantido',
    },
    {
      id: '99-plus',
      platform: '99',
      platformName: '99',
      platformColor: '#F7A700',
      category: 'comfort',
      categoryName: '99Plus',
      priceMin: Math.round(t99PlusPrice * 0.95),
      priceMax: Math.round(t99PlusPrice * 1.1),
      estimatedPrice: t99PlusPrice,
      etaMinutes: 5,
      tripDurationMinutes: min,
      deepLink: t99Links.primaryLink,
      webFallbackLink: t99Links.fallbackLink,
      badges: [],
    },

    // --- Moto (Econômica & Rápida) ---
    {
      id: 'uber-moto',
      platform: 'uber',
      platformName: 'Uber',
      platformColor: '#000000',
      category: 'moto',
      categoryName: 'Uber Moto',
      priceMin: Math.round(uberMotoPrice * 0.95),
      priceMax: Math.round(uberMotoPrice * 1.05),
      estimatedPrice: uberMotoPrice,
      etaMinutes: 2,
      tripDurationMinutes: Math.max(2, Math.round(min * 0.75)), // moto foge de trânsito
      deepLink: uberLinks.primaryLink,
      webFallbackLink: uberLinks.fallbackLink,
      badges: [],
    },
    {
      id: '99-moto',
      platform: '99',
      platformName: '99',
      platformColor: '#F7A700',
      category: 'moto',
      categoryName: '99Moto',
      priceMin: Math.round(t99MotoPrice * 0.95),
      priceMax: Math.round(t99MotoPrice * 1.05),
      estimatedPrice: t99MotoPrice,
      etaMinutes: 3,
      tripDurationMinutes: Math.max(2, Math.round(min * 0.75)),
      deepLink: t99Links.primaryLink,
      webFallbackLink: t99Links.fallbackLink,
      badges: [],
    },
    {
      id: 'indrive-moto',
      platform: 'indrive',
      platformName: 'inDrive',
      platformColor: '#A0D236',
      category: 'moto',
      categoryName: 'Moto (Oferta)',
      priceMin: Math.round(inDriveMotoBase * 0.9),
      priceMax: Math.round(inDriveMotoBase * 1.1),
      estimatedPrice: inDriveMotoBase,
      etaMinutes: 3,
      tripDurationMinutes: Math.max(2, Math.round(min * 0.75)),
      deepLink: inDriveLinks.primaryLink,
      webFallbackLink: inDriveLinks.fallbackLink,
      badges: ['bidding'],
      biddingNote: `Lance sugerido moto: R$ ${inDriveMotoBase.toFixed(2)}`,
    },
  ];

  // Identifica o menor preço por categoria e marca com badge
  const categories: VehicleCategory[] = ['standard', 'comfort', 'moto'];
  for (const cat of categories) {
    const inCat = options.filter((o) => o.category === cat);
    if (inCat.length > 0) {
      // Menor preço estimado
      const sortedByPrice = [...inCat].sort(
        (a, b) => a.estimatedPrice - b.estimatedPrice
      );
      const cheapest = sortedByPrice[0];
      if (cheapest && !cheapest.badges?.includes('cheapest')) {
        cheapest.badges = [...(cheapest.badges || []), 'cheapest'];
      }

      // Menor tempo de espera (ETA)
      const sortedByEta = [...inCat].sort((a, b) => a.etaMinutes - b.etaMinutes);
      const fastest = sortedByEta[0];
      if (fastest && fastest !== cheapest && !fastest.badges?.includes('fastest')) {
        fastest.badges = [...(fastest.badges || []), 'fastest'];
      }
    }
  }

  return options;
}
