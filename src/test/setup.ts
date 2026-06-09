import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock MapLibre GL
vi.mock('maplibre-gl', () => {
  const MapMock = vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getSource: vi.fn(),
    getLayer: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    resize: vi.fn(),
    addControl: vi.fn(),
    removeControl: vi.fn(),
    getCanvas: vi.fn().mockReturnValue(document.createElement('canvas')),
  }))

  const MarkerMock = vi.fn().mockImplementation(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    getElement: vi.fn(() => document.createElement('div')),
  }))

  const PopupMock = vi.fn().mockImplementation(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  }))

  return {
    Map: MapMock,
    Marker: MarkerMock,
    Popup: PopupMock,
    NavigationControl: vi.fn(),
    ScaleControl: vi.fn(),
    default: {},
  }
})

// Mock react-map-gl/maplibre
vi.mock('react-map-gl/maplibre', async () => {
  const React = await import('react');
  const MapMock = React.default.forwardRef(({ children, onClick, onLoad }: { children?: React.ReactNode; onClick?: () => void; onLoad?: () => void }, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      flyTo: vi.fn(),
      easeTo: vi.fn(),
      getMap: () => ({
        getBounds: () => ({
          getWest: () => 107.8,
          getSouth: () => 15.8,
          getEast: () => 108.5,
          getNorth: () => 16.2,
        }),
        getZoom: () => 11,
      }),
    }), []);
    React.useEffect(() => {
      if (onLoad) onLoad();
    }, [onLoad]);
    return React.default.createElement('div', { 'data-testid': 'mock-map', onClick }, children);
  });

  return {
    default: MapMock,
    Map: MapMock,
    NavigationControl: () => React.default.createElement('div', { 'data-testid': 'mock-nav-control' }),
    ScaleControl: () => React.default.createElement('div', { 'data-testid': 'mock-scale-control' }),
    Marker: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) => React.default.createElement('div', { 'data-testid': 'mock-marker', onClick }, children),
    Popup: ({ children }: { children?: React.ReactNode }) => React.default.createElement('div', { 'data-testid': 'mock-popup' }, children),
    Source: ({ children }: { children?: React.ReactNode }) => React.default.createElement('div', { 'data-testid': 'mock-source' }, children),
    Layer: () => React.default.createElement('div', { 'data-testid': 'mock-layer' }),
  };
})

// Mock HTML Fullscreen API functions
document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined)
document.exitFullscreen = vi.fn().mockResolvedValue(undefined)
window.HTMLElement.prototype.scrollIntoView = vi.fn()


// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
