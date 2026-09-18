export interface LocationPoint {
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface RouteData {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lat, lng] array for drawing polyline
}

export type PlatformType = 'uber' | '99' | 'indrive';

export type VehicleCategory = 'standard' | 'comfort' | 'moto';

export interface RideOption {
  id: string;
  platform: PlatformType;
  platformName: string;
  platformColor: string;
  category: VehicleCategory;
  categoryName: string;
  priceMin: number;
  priceMax: number;
  estimatedPrice: number;
  etaMinutes: number; // estimated driver arrival
  tripDurationMinutes: number;
  deepLink: string;
  webFallbackLink: string;
  badges?: ('cheapest' | 'fastest' | 'deal' | 'bidding')[];
  biddingNote?: string;
  discountNote?: string;
}

export interface FareSettings {
  surgeMultiplier: number; // 1.0 = normal, 1.2 = 20% surge, etc.
  uberBaseRate: number;
  uberPerKm: number;
  uberPerMin: number;
  t99BaseRate: number;
  t99PerKm: number;
  t99PerMin: number;
  inDriveDiscountFactor: number; // ~0.80 = 20% lower than standard
}

export interface NominatimPlace {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}
