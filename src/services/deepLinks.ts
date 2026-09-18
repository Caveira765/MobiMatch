import type { LocationPoint, PlatformType } from '../types/ride';

export interface DeepLinkResult {
  primaryLink: string;
  fallbackLink: string;
  platform: PlatformType;
}

/**
 * Detecta se o usuário está acessando em um dispositivo móvel (Android ou iOS)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Detecta se é Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Gera links de abertura para a Uber
 */
export function generateUberLink(origin: LocationPoint, destination: LocationPoint): DeepLinkResult {
  const originName = encodeURIComponent(origin.name || 'Origem');
  const destName = encodeURIComponent(destination.name || 'Destino');

  // Universal Link da Uber - suportado nativamente por iOS e Android
  const universalLink = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&pickup[nickname]=${originName}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}&dropoff[nickname]=${destName}`;

  // Custom scheme nativo
  const customScheme = `uber://?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&pickup[nickname]=${originName}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}&dropoff[nickname]=${destName}`;

  return {
    primaryLink: isMobileDevice() ? customScheme : universalLink,
    fallbackLink: universalLink,
    platform: 'uber',
  };
}

/**
 * Gera links de abertura para a 99 (99App)
 */
export function generate99Link(origin: LocationPoint, destination: LocationPoint): DeepLinkResult {
  const scheme = `taxis99://call?action=order&origin_lat=${origin.lat}&origin_lng=${origin.lng}&dest_lat=${destination.lat}&dest_lng=${destination.lng}`;

  const androidIntent = `intent://call?action=order&origin_lat=${origin.lat}&origin_lng=${origin.lng}&dest_lat=${destination.lat}&dest_lng=${destination.lng}#Intent;scheme=taxis99;package=com.taxis99;end`;

  const webFallback = 'https://99app.com';

  return {
    primaryLink: isAndroid() ? androidIntent : scheme,
    fallbackLink: webFallback,
    platform: '99',
  };
}

/**
 * Gera links de abertura para o inDrive
 */
export function generateInDriveLink(_origin: LocationPoint, _destination: LocationPoint): DeepLinkResult {
  // inDrive utiliza custom schemes indriver:// ou indrive://
  const scheme = `indriver://`;
  const androidIntent = `intent://#Intent;scheme=indriver;package=sinet.startup.inDriver;end`;
  const webFallback = 'https://indrive.com';

  return {
    primaryLink: isAndroid() ? androidIntent : scheme,
    fallbackLink: webFallback,
    platform: 'indrive',
  };
}

/**
 * Abre o app usando o Deep Link apropriado, com tolerância e fallback
 */
export function openApp(primaryLink: string, fallbackLink: string) {
  if (typeof window === 'undefined') return;

  if (isMobileDevice()) {
    // Tenta abrir o scheme nativo. Se não abrir em 1.5s, cai no fallback.
    const start = Date.now();
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = primaryLink;
    document.body.appendChild(iframe);

    // Também dispara window.location para dispositivos onde iframe é bloqueado
    window.location.href = primaryLink;

    setTimeout(() => {
      document.body.removeChild(iframe);
      // Se a página ainda estiver visível após 1500ms, o app provavelmente não está instalado
      if (Date.now() - start < 2000 && document.visibilityState === 'visible') {
        window.open(fallbackLink, '_blank');
      }
    }, 1500);
  } else {
    // No desktop, abre a versão web ou página da plataforma
    window.open(fallbackLink, '_blank');
  }
}
