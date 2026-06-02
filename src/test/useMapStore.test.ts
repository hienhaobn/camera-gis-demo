import { describe, it, expect, beforeEach } from 'vitest'
import { useMapStore, type CustomDrawing } from '../stores/useMapStore'

describe('useMapStore Zustand Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useMapStore.setState({
      selectedCamera: null,
      isSatellite: false,
      visibleLayers: {
        cameras: true,
        zones: true,
        infrastructure: true,
        buildings: true,
      },
      searchQuery: '',
      statusFilter: 'all',
      activeTool: null,
      drawShape: null,
      measurePoints: [],
      customMarkers: [],
      customDrawings: [],
      bottomSheetOpen: false,
    })
  })

  it('should initialize with default states', () => {
    const state = useMapStore.getState()
    expect(state.selectedCamera).toBeNull()
    expect(state.isSatellite).toBe(false)
    expect(state.activeTool).toBeNull()
    expect(state.visibleLayers.cameras).toBe(true)
  })

  it('should set selected camera and automatically open bottom sheet', () => {
    const mockCamera = {
      id: 'CAM-001',
      name: 'Camera Dragon Bridge',
      lng: 108.22,
      lat: 16.06,
      status: 'online' as const,
      zone: 'Hải Châu',
      type: 'PTZ' as const,
      lastSeen: new Date().toISOString(),
      resolution: '4K' as const,
      area: 'Bạch Đằng',
    }

    useMapStore.getState().setSelectedCamera(mockCamera)

    const state = useMapStore.getState()
    expect(state.selectedCamera).toEqual(mockCamera)
    expect(state.bottomSheetOpen).toBe(true)
  })

  it('should toggle map layers correctly', () => {
    const store = useMapStore.getState()
    
    // Toggle cameras layer
    store.toggleLayer('cameras')
    expect(useMapStore.getState().visibleLayers.cameras).toBe(false)
    
    // Toggle zones layer
    store.toggleLayer('zones')
    expect(useMapStore.getState().visibleLayers.zones).toBe(false)

    // Toggle back cameras layer
    store.toggleLayer('cameras')
    expect(useMapStore.getState().visibleLayers.cameras).toBe(true)
  })

  it('should switch active tools and clean intermediate states', () => {
    // Add temporary measure points
    useMapStore.setState({ measurePoints: [[108, 16], [109, 17]] })
    expect(useMapStore.getState().measurePoints).toHaveLength(2)

    // Switch tool
    useMapStore.getState().setActiveTool('draw')

    const state = useMapStore.getState()
    expect(state.activeTool).toBe('draw')
    expect(state.drawShape).toBe('polygon') // Defaults to polygon in draw mode
    expect(state.measurePoints).toHaveLength(0) // Cleaned up
  })

  it('should add and remove custom markers', () => {
    const store = useMapStore.getState()

    store.addCustomMarker({
      name: 'Central Bunker',
      type: 'center',
      lng: 108.21,
      lat: 16.05,
    })

    let state = useMapStore.getState()
    expect(state.customMarkers).toHaveLength(1)
    expect(state.customMarkers[0].name).toBe('Central Bunker')
    expect(state.customMarkers[0].id).toBeDefined()

    const addedId = state.customMarkers[0].id
    store.removeCustomMarker(addedId)

    state = useMapStore.getState()
    expect(state.customMarkers).toHaveLength(0)
  })

  it('should handle satellite layer, search query, status filter, draw shape and bottom sheet toggles', () => {
    const store = useMapStore.getState()

    store.setIsSatellite(true)
    expect(useMapStore.getState().isSatellite).toBe(true)

    store.setSearchQuery('test query')
    expect(useMapStore.getState().searchQuery).toBe('test query')

    store.setStatusFilter('offline')
    expect(useMapStore.getState().statusFilter).toBe('offline')

    store.setDrawShape('line')
    expect(useMapStore.getState().drawShape).toBe('line')

    store.setBottomSheetOpen(true)
    expect(useMapStore.getState().bottomSheetOpen).toBe(true)
  })

  it('should handle measure points and custom drawings', () => {
    const store = useMapStore.getState()

    store.addMeasurePoint([108.2, 16.1])
    expect(useMapStore.getState().measurePoints).toEqual([[108.2, 16.1]])

    store.clearMeasurePoints()
    expect(useMapStore.getState().measurePoints).toEqual([])

    const drawing: CustomDrawing = {
      id: 'D-123',
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[108.2, 16.1], [108.3, 16.2]]
      },
      properties: {
        name: 'Test Line',
        color: '#ff0000'
      }
    }

    store.addCustomDrawing(drawing)
    expect(useMapStore.getState().customDrawings).toEqual([drawing])

    store.clearCustomDrawings()
    expect(useMapStore.getState().customDrawings).toEqual([])
  })
})
