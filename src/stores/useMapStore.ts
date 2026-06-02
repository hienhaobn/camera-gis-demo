import { create } from 'zustand'
import type { Camera } from '../data/cameras'

export type ActiveTool = 'measure' | 'draw' | 'mark' | 'route' | null;
export type DrawShape = 'polygon' | 'line' | 'circle' | null;
export type CameraFilterStatus = 'all' | 'online' | 'offline' | 'maintenance';

export interface CustomMarker {
  id: string;
  name: string;
  type: 'center' | 'guard' | 'restricted' | 'custom';
  lng: number;
  lat: number;
}

export interface CustomDrawing {
  id: string;
  type: 'Feature';
  geometry:
    | { type: 'Point'; coordinates: [number, number]; }
    | { type: 'LineString'; coordinates: [number, number][]; }
    | { type: 'Polygon'; coordinates: [number, number][][]; };
  properties: {
    name: string;
    color: string;
    area?: number;
    distance?: number;
  };
}

export interface MapLayers {
  cameras: boolean;
  zones: boolean;
  infrastructure: boolean;
  buildings: boolean;
}

interface MapState {
  // Selection
  selectedCamera: Camera | null;
  setSelectedCamera: (camera: Camera | null) => void;

  // Global UI & Layers
  isSatellite: boolean;
  setIsSatellite: (isSatellite: boolean) => void;
  visibleLayers: MapLayers;
  toggleLayer: (layer: keyof MapLayers) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: CameraFilterStatus;
  setStatusFilter: (filter: CameraFilterStatus) => void;

  // Active Tool
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  drawShape: DrawShape;
  setDrawShape: (shape: DrawShape) => void;

  // Measure Tool State
  measurePoints: [number, number][];
  addMeasurePoint: (point: [number, number]) => void;
  clearMeasurePoints: () => void;

  // Custom Markers State
  customMarkers: CustomMarker[];
  addCustomMarker: (marker: Omit<CustomMarker, 'id'>) => void;
  removeCustomMarker: (id: string) => void;

  // Custom Drawings State
  customDrawings: CustomDrawing[];
  addCustomDrawing: (drawing: CustomDrawing) => void;
  clearCustomDrawings: () => void;

  // Bottom Sheet
  bottomSheetOpen: boolean;
  setBottomSheetOpen: (open: boolean) => void;

  // Theme support
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedCamera: null,
  setSelectedCamera: (camera) => set({ selectedCamera: camera, bottomSheetOpen: camera !== null }),

  theme: 'dark',
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (nextTheme === 'light') {
        root.classList.add('light')
        root.classList.remove('dark')
      } else {
        root.classList.add('dark')
        root.classList.remove('light')
      }
    }
    return { theme: nextTheme }
  }),

  isSatellite: false,
  setIsSatellite: (isSatellite) => set({ isSatellite }),
  visibleLayers: {
    cameras: true,
    zones: true,
    infrastructure: true,
    buildings: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layer]: !state.visibleLayers[layer],
      },
    })),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  statusFilter: 'all',
  setStatusFilter: (statusFilter) => set({ statusFilter }),

  activeTool: null,
  setActiveTool: (activeTool) =>
    set({
      activeTool,
      drawShape: activeTool === 'draw' ? 'polygon' : null,
      measurePoints: [],
    }),
  drawShape: null,
  setDrawShape: (drawShape) => set({ drawShape }),

  measurePoints: [],
  addMeasurePoint: (point) =>
    set((state) => ({ measurePoints: [...state.measurePoints, point] })),
  clearMeasurePoints: () => set({ measurePoints: [] }),

  customMarkers: [],
  addCustomMarker: (marker) =>
    set((state) => ({
      customMarkers: [
        ...state.customMarkers,
        { ...marker, id: `M-${Date.now()}` },
      ],
    })),
  removeCustomMarker: (id) =>
    set((state) => ({
      customMarkers: state.customMarkers.filter((m) => m.id !== id),
    })),

  customDrawings: [],
  addCustomDrawing: (drawing) =>
    set((state) => ({ customDrawings: [...state.customDrawings, drawing] })),
  clearCustomDrawings: () => set({ customDrawings: [] }),

  bottomSheetOpen: false,
  setBottomSheetOpen: (bottomSheetOpen) => set({ bottomSheetOpen }),
}))
