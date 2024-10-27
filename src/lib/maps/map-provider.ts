import { MapProvider } from './types';

// Available map providers
const providers = {
  maplibre: {
    name: 'MapLibre GL',
    url: 'https://demotiles.maplibre.org/style.json',
    attribution: '© MapLibre contributors',
    maxZoom: 18
  },
  openlayers: {
    name: 'OpenLayers',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  },
  tomtom: {
    name: 'TomTom',
    url: `https://api.tomtom.com/map/1/tile/basic/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_API_KEY}`,
    attribution: '© TomTom',
    maxZoom: 22
  }
} as const;

export class MapProviderManager {
  private static instance: MapProviderManager;
  private currentProvider: MapProvider;

  private constructor() {
    // Default to MapLibre if TomTom key is not available
    this.currentProvider = import.meta.env.VITE_TOMTOM_API_KEY
      ? providers.tomtom
      : providers.maplibre;
  }

  static getInstance(): MapProviderManager {
    if (!MapProviderManager.instance) {
      MapProviderManager.instance = new MapProviderManager();
    }
    return MapProviderManager.instance;
  }

  getProvider(): MapProvider {
    return this.currentProvider;
  }

  setProvider(name: keyof typeof providers): void {
    if (name === 'tomtom' && !import.meta.env.VITE_TOMTOM_API_KEY) {
      throw new Error('TomTom API key is required');
    }
    this.currentProvider = providers[name];
  }

  getAvailableProviders(): Array<{ name: string; key: keyof typeof providers }> {
    return Object.entries(providers)
      .filter(([key]) => {
        if (key === 'tomtom') {
          return !!import.meta.env.VITE_TOMTOM_API_KEY;
        }
        return true;
      })
      .map(([key, value]) => ({
        name: value.name,
        key: key as keyof typeof providers
      }));
  }
}