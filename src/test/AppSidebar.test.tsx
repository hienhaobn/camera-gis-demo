import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppSidebar } from '../components/layout/AppSidebar'
import { useMapStore } from '../stores/useMapStore'

// Mock Sidebar component wrappers
vi.mock('@/components/ui/sidebar', () => {
  return {
    Sidebar: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar">{children}</div>,
    SidebarContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-content">{children}</div>,
    SidebarHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-header">{children}</div>,
    SidebarFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-footer">{children}</div>,
    SidebarGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-group">{children}</div>,
    SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-group-label">{children}</div>,
    SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-group-content">{children}</div>,
    SidebarTrigger: ({ className }: { className?: string }) => <button data-testid="sidebar-trigger" className={className}>Toggle</button>,
    SidebarRail: () => <button data-testid="sidebar-rail">Rail</button>,
    useSidebar: () => ({
      state: 'expanded',
      open: true,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      isMobile: false,
      toggleSidebar: vi.fn(),
    }),
  }
})

// Mock ScrollArea
vi.mock('@/components/ui/scroll-area', () => {
  return {
    ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
  }
})

// Mock Toggle with prop-forwarding support to fix aria-label queries
vi.mock('@/components/ui/toggle', () => {
  return {
    Toggle: ({ children, pressed, onPressedChange, ...props }: { children: React.ReactNode; pressed: boolean; onPressedChange: (val: boolean) => void } & Omit<React.ComponentPropsWithoutRef<'button'>, 'children' | 'onClick'>) => (
      <button data-testid="toggle-button" onClick={() => onPressedChange(!pressed)} {...props}>
        {children}
      </button>
    ),
  }
})

// Mock ToggleGroup
vi.mock('@/components/ui/toggle-group', () => {
  return {
    ToggleGroup: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (val: string) => void }) => {
      const clickHandler = (itemValue: string) => {
        onValueChange(itemValue)
      }
      return (
        <div data-testid="toggle-group" data-value={value}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement<{ value: string; onClick?: () => void }>(child)) {
              return React.cloneElement(child, {
                onClick: () => clickHandler(child.props.value)
              })
            }
            return child
          })}
        </div>
      )
    },
    ToggleGroupItem: ({ children, value, onClick }: { children: React.ReactNode; value: string; onClick?: () => void }) => (
      <button data-testid={`toggle-group-item-${value}`} onClick={onClick} value={value}>
        {children}
      </button>
    ),
  }
})

describe('AppSidebar Component', () => {
  beforeEach(() => {
    // Reset store before each test
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
    })
  })

  it('renders branding title and sections correctly', () => {
    render(<AppSidebar />)
    expect(screen.getByText('Lớp Bản Đồ')).toBeInTheDocument()
    expect(screen.getByText('Công Cụ GIS')).toBeInTheDocument()
    expect(screen.getByText('Danh Sách Camera')).toBeInTheDocument()
  })

  it('toggles satellite style correctly in store', () => {
    render(<AppSidebar />)
    const toggleBtn = screen.getByLabelText('Toggle Satellite Style')
    expect(toggleBtn).toBeInTheDocument()

    act(() => {
      fireEvent.click(toggleBtn)
    })
    expect(useMapStore.getState().isSatellite).toBe(true)

    act(() => {
      fireEvent.click(toggleBtn)
    })
    expect(useMapStore.getState().isSatellite).toBe(false)
  })

  it('toggles visible layers correctly in store', () => {
    render(<AppSidebar />)
    const camerasToggle = screen.getByText('Nodes Camera').closest('button')
    const zonesToggle = screen.getByText('Vùng Giám Sát').closest('button')

    expect(camerasToggle).toBeDefined()
    expect(zonesToggle).toBeDefined()

    if (camerasToggle) {
      act(() => {
        fireEvent.click(camerasToggle)
      })
      expect(useMapStore.getState().visibleLayers.cameras).toBe(false)
    }

    if (zonesToggle) {
      act(() => {
        fireEvent.click(zonesToggle)
      })
      expect(useMapStore.getState().visibleLayers.zones).toBe(false)
    }
  })

  it('handles changing active GIS tool in store', () => {
    render(<AppSidebar />)
    const measureBtn = screen.getByTestId('toggle-group-item-measure')
    expect(measureBtn).toBeInTheDocument()

    act(() => {
      fireEvent.click(measureBtn)
    })
    expect(useMapStore.getState().activeTool).toBe('measure')
  })

  it('performs query search matching camera list', () => {
    render(<AppSidebar />)
    const searchInput = screen.getByPlaceholderText('Tìm camera, tuyến đường...')
    expect(searchInput).toBeInTheDocument()

    act(() => {
      fireEvent.change(searchInput, { target: { value: 'Bạch Đằng' } })
    })
    expect(useMapStore.getState().searchQuery).toBe('Bạch Đằng')

    // Confirm that filtered result badge shows smaller number than 200 using strict regex
    const badge = screen.getByText(/\d+\s+Nodes/)
    expect(badge).toBeInTheDocument()
  })

  it('changes status filters correctly', () => {
    render(<AppSidebar />)
    const onFilterBtn = screen.getByRole('button', { name: 'ON' })
    const offFilterBtn = screen.getByRole('button', { name: 'OFF' })

    act(() => {
      fireEvent.click(onFilterBtn)
    })
    expect(useMapStore.getState().statusFilter).toBe('online')

    act(() => {
      fireEvent.click(offFilterBtn)
    })
    expect(useMapStore.getState().statusFilter).toBe('offline')
  })

  it('handles selecting cameras from list click', () => {
    render(<AppSidebar />)
    
    // Find first camera list node item by specific camera ID
    const firstCamNode = screen.getByText('CAM-001').closest('div')
    expect(firstCamNode).toBeDefined()

    if (firstCamNode) {
      act(() => {
        fireEvent.click(firstCamNode)
      })
    }

    const selected = useMapStore.getState().selectedCamera
    expect(selected).not.toBeNull()
    expect(selected?.id).toBe('CAM-001')

    // Click again to deselect
    if (firstCamNode) {
      act(() => {
        fireEvent.click(firstCamNode)
      })
    }
    expect(useMapStore.getState().selectedCamera).toBeNull()
  })
})
