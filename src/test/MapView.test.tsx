import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MapView } from '../components/map/MapView'
import { useMapStore } from '../stores/useMapStore'

// Mock react-map-gl/maplibre components to run synchronously in JSDOM with ref API mocks
vi.mock('react-map-gl/maplibre', () => {
  return {
    default: React.forwardRef(({ children, onClick, onLoad }: { children: React.ReactNode; onClick?: (evt: { lngLat: { lng: number; lat: number }; originalEvent: { target: HTMLElement } }) => void; onLoad?: () => void }, ref) => {
      React.useImperativeHandle(ref, () => ({
        flyTo: vi.fn(),
        getMap: () => ({
          getBounds: () => ({
            getWest: () => 107.8,
            getSouth: () => 15.8,
            getEast: () => 108.5,
            getNorth: () => 16.2,
          }),
          getZoom: () => 11,
        }),
      }), [])
      React.useEffect(() => {
        if (onLoad) onLoad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return (
        <div 
          data-testid="mock-map"
          onClick={() => {
            if (onClick) {
              const canvasEl = document.createElement('div')
              canvasEl.className = 'maplibregl-canvas'
              onClick({ 
                lngLat: { lng: 108.2022, lat: 16.0544 },
                originalEvent: { target: canvasEl }
              })
            }
          }}
        >
          {children}
        </div>
      )
    }),
    NavigationControl: () => <div data-testid="mock-nav-control" />,
    ScaleControl: () => <div data-testid="mock-scale-control" />,
    Marker: ({ children, onClick }: { children: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }) => (
      <div data-testid="mock-marker" onClick={onClick}>{children}</div>
    ),
    Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-popup">{children}</div>,
    Source: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-source">{children}</div>,
    Layer: () => <div data-testid="mock-layer" />,
  }
})

describe('MapView Component', () => {
  beforeEach(() => {
    useMapStore.setState({
      selectedCamera: null,
      visibleLayers: {
        cameras: true,
        zones: true,
        infrastructure: true,
        buildings: true,
      },
      isSatellite: false,
      searchQuery: '',
      statusFilter: 'all',
      activeTool: null,
      measurePoints: [],
      customMarkers: [],
      customDrawings: [],
    })
  })

  it('renders MapView base structure and overlays correctly', () => {
    render(<MapView />)
    expect(screen.getByTestId('mock-map')).toBeInTheDocument()
    expect(screen.getByTestId('mock-nav-control')).toBeInTheDocument()
    expect(screen.getByTestId('mock-scale-control')).toBeInTheDocument()
  })

  it('centers map when selected camera is updated', () => {
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

    render(<MapView />)
    
    act(() => {
      useMapStore.getState().setSelectedCamera(mockCamera)
    })
    expect(useMapStore.getState().selectedCamera).toEqual(mockCamera)
  })

  it('renders control center infrastructure markers', () => {
    useMapStore.setState({
      visibleLayers: {
        cameras: false,
        zones: false,
        infrastructure: true,
        buildings: false,
      }
    })

    render(<MapView />)
    expect(screen.getByText('Trung tâm Chỉ huy Hải Châu')).toBeInTheDocument()
    expect(screen.getByText('Chốt Cầu Rồng (Đông)')).toBeInTheDocument()
  })

  it('registers clicks in measure mode and clears them', () => {
    useMapStore.setState({ activeTool: 'measure' })
    render(<MapView />)

    const map = screen.getByTestId('mock-map')
    act(() => {
      fireEvent.click(map)
    })
    expect(useMapStore.getState().measurePoints).toHaveLength(1)

    // Check measure HUD
    expect(screen.getByText('THỐNG KÊ ĐO KHOẢNG CÁCH')).toBeInTheDocument()
    const clearBtn = screen.getByRole('button', { name: 'Reset' })
    act(() => {
      fireEvent.click(clearBtn)
    })
    expect(useMapStore.getState().measurePoints).toHaveLength(0)
  })

  it('displays custom marking popup and handles cancel/save clicks', () => {
    useMapStore.setState({ activeTool: 'mark' })
    render(<MapView />)

    const map = screen.getByTestId('mock-map')
    act(() => {
      fireEvent.click(map)
    })

    // Click Hủy first
    const cancelBtn = screen.getByRole('button', { name: 'Hủy' })
    act(() => {
      fireEvent.click(cancelBtn)
    })

    // Click map again to open popup
    act(() => {
      fireEvent.click(map)
    })

    const input = screen.getByPlaceholderText('Tên Marker...')
    act(() => {
      fireEvent.change(input, { target: { value: 'Bunker X' } })
    })

    const saveBtn = screen.getByRole('button', { name: 'Lưu' })
    act(() => {
      fireEvent.click(saveBtn)
    })

    expect(useMapStore.getState().customMarkers).toHaveLength(1)
    expect(useMapStore.getState().customMarkers[0].name).toBe('Bunker X')
  })

  it('displays drawing tool overlay and handles polygon cancellation and completion', () => {
    useMapStore.setState({ activeTool: 'draw', drawShape: 'polygon' })
    render(<MapView />)

    // Check drawing HUD
    expect(screen.getByText('CÔNG CỤ VẼ BẢN ĐỒ')).toBeInTheDocument()

    const map = screen.getByTestId('mock-map')
    
    // Add point and cancel drawing
    act(() => {
      fireEvent.click(map)
    })
    const cancelDrawBtn = screen.getByRole('button', { name: 'Hủy Vẽ' })
    act(() => {
      fireEvent.click(cancelDrawBtn)
    })

    // Click 3 times to form a polygon
    act(() => {
      fireEvent.click(map)
      fireEvent.click(map)
      fireEvent.click(map)
    })

    const doneBtn = screen.getByRole('button', { name: 'Xác Nhận' })
    act(() => {
      fireEvent.click(doneBtn)
    })

    expect(useMapStore.getState().customDrawings).toHaveLength(1)
    expect(useMapStore.getState().customDrawings[0].geometry.type).toBe('Polygon')
  })

  it('handles route clicks and clears routes correctly', () => {
    useMapStore.setState({ activeTool: 'route' })
    render(<MapView />)

    // Check route HUD
    expect(screen.getByText('BỘ ĐIỀU HƯỚNG / TÌM ĐƯỜNG')).toBeInTheDocument()

    const map = screen.getByTestId('mock-map')
    
    // First click sets routeStart
    act(() => {
      fireEvent.click(map)
    })
    
    // Second click sets routeEnd
    act(() => {
      fireEvent.click(map)
    })

    const clearRouteBtn = screen.getByRole('button', { name: 'Xóa Lộ Trình' })
    expect(clearRouteBtn).toBeInTheDocument()

    act(() => {
      fireEvent.click(clearRouteBtn)
    })
  })

  it('handles click-selection of individual cameras on map', () => {
    render(<MapView />)
    
    // Unclustered camera markers are rendered
    const cameraMarker = screen.getAllByTestId('camera-marker')[0]
    expect(cameraMarker).toBeDefined()

    act(() => {
      fireEvent.click(cameraMarker)
    })
    expect(useMapStore.getState().selectedCamera).not.toBeNull()

    // Click again to deselect
    act(() => {
      fireEvent.click(cameraMarker)
    })
    expect(useMapStore.getState().selectedCamera).toBeNull()
  })
})
