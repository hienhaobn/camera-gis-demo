import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Camera, generateInitialCameras } from '../data/cameras';

interface CameraState {
  cameras: Camera[];
  addCamera: (camera: Omit<Camera, 'id' | 'lastSeen'>) => void;
  updateCamera: (id: string, updates: Partial<Omit<Camera, 'id'>>) => void;
  deleteCamera: (id: string) => void;
  getCameraById: (id: string) => Camera | undefined;
}

export const useCameraStore = create<CameraState>()(
  persist(
    (set, get) => ({
      cameras: generateInitialCameras(),

      addCamera: (cameraData) => {
        set((state) => {
          // Parse sequential IDs and find the next index
          const indices = state.cameras.map((c) => {
            const match = c.id.match(/^CAM-(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          });
          const nextIndex = Math.max(0, ...indices) + 1;
          const id = `CAM-${String(nextIndex).padStart(3, '0')}`;
          
          const newCamera: Camera = {
            ...cameraData,
            id,
            lastSeen: new Date().toISOString(),
          };

          return {
            cameras: [...state.cameras, newCamera],
          };
        });
      },

      updateCamera: (id, updates) => {
        set((state) => ({
          cameras: state.cameras.map((cam) =>
            cam.id === id ? { ...cam, ...updates } : cam
          ),
        }));
      },

      deleteCamera: (id) => {
        set((state) => ({
          cameras: state.cameras.filter((cam) => cam.id !== id),
        }));
      },

      getCameraById: (id) => {
        return get().cameras.find((cam) => cam.id === id);
      },
    }),
    {
      name: 'camera-ams-storage',
    }
  )
);
