import { useCameraStore } from '../stores/useCameraStore';
import { generateInitialCameras } from '../data/cameras';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useCameraStore', () => {
  beforeEach(() => {
    // Reset the store before each test to guarantee test isolation
    useCameraStore.setState({
      cameras: generateInitialCameras(),
    });
  });

  it('should initialize with 200 cameras from seed data', () => {
    const state = useCameraStore.getState();
    expect(state.cameras.length).toBe(200);
    expect(state.cameras[0].id).toBe('CAM-001');
    expect(state.cameras[199].id).toBe('CAM-200');
  });

  it('should add a new camera with an auto-generated sequential ID', () => {
    const newCameraData = {
      name: 'Test Camera Added',
      lng: 108.22,
      lat: 16.06,
      status: 'online' as const,
      zone: 'Hải Châu',
      type: 'Fixed' as const,
      resolution: '1080p' as const,
      area: '123 Test Street, Hải Châu',
    };

    useCameraStore.getState().addCamera(newCameraData);

    const updatedCameras = useCameraStore.getState().cameras;
    expect(updatedCameras.length).toBe(201);
    
    // Check generated ID
    const addedCamera = updatedCameras[updatedCameras.length - 1];
    expect(addedCamera.id).toBe('CAM-201');
    expect(addedCamera.name).toBe('Test Camera Added');
    expect(addedCamera.lastSeen).toBeDefined();
    // Validate ISO string timestamp
    expect(isNaN(Date.parse(addedCamera.lastSeen))).toBe(false);
  });

  it('should update camera properties by ID', () => {
    const targetId = 'CAM-005';
    
    // Perform update
    useCameraStore.getState().updateCamera(targetId, {
      name: 'Updated Camera Name 005',
      status: 'maintenance',
      resolution: '4K',
    });

    const updatedCamera = useCameraStore.getState().getCameraById(targetId);
    expect(updatedCamera).toBeDefined();
    expect(updatedCamera?.name).toBe('Updated Camera Name 005');
    expect(updatedCamera?.status).toBe('maintenance');
    expect(updatedCamera?.resolution).toBe('4K');
    
    // Verify that ID is unchanged
    expect(updatedCamera?.id).toBe(targetId);
  });

  it('should delete a camera by ID', () => {
    const targetId = 'CAM-010';
    
    // Ensure it exists first
    expect(useCameraStore.getState().getCameraById(targetId)).toBeDefined();

    // Perform delete
    useCameraStore.getState().deleteCamera(targetId);

    const state = useCameraStore.getState();
    expect(state.cameras.length).toBe(199);
    expect(state.getCameraById(targetId)).toBeUndefined();
  });

  it('should get camera details by ID', () => {
    const cam = useCameraStore.getState().getCameraById('CAM-150');
    expect(cam).toBeDefined();
    expect(cam?.id).toBe('CAM-150');
    expect(cam?.zone).toBeDefined();
  });
});
