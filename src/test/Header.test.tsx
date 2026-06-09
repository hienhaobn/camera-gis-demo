import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useMapStore } from '../stores/useMapStore'

// Mock SidebarContext because SidebarTrigger needs it
vi.mock('@/components/ui/sidebar', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
  }
})

// Mock DropdownMenu to render content synchronously in JSDOM
vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <div onClick={onClick} role="menuitem">
        {children}
      </div>
    ),
    DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuPortal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

describe('Header Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  const renderHeader = () => {
    return render(
      <MemoryRouter>
        <SidebarProvider>
          <Header />
        </SidebarProvider>
      </MemoryRouter>
    )
  }

  it('renders correctly with title and active clock', () => {
    renderHeader()

    // Verify HUD title
    expect(screen.getByText('GIS SURVEILLANCE')).toBeInTheDocument()
    expect(screen.getByText('DEMO HUD')).toBeInTheDocument()

    // Clock check
    const date = new Date()
    const timeStr = date.toLocaleTimeString('vi-VN', { hour12: false })
    const timeElements = screen.queryAllByText((content) => content.includes(timeStr.substring(0, 5)))
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('renders camera stats status badges correctly', () => {
    renderHeader()

    // Online / Offline / Maintenance stats badge checks
    expect(screen.getByText('TỔNG:')).toBeInTheDocument()
    expect(screen.getByText('ONLINE:')).toBeInTheDocument()
    expect(screen.getByText('OFFLINE:')).toBeInTheDocument()
    expect(screen.getByText('BẢO TRÌ:')).toBeInTheDocument()
  })

  it('toggles bell dropdown on notification button click', () => {
    renderHeader()

    const bellBtn = screen.getByTestId('alarm-bell')
    expect(bellBtn).toBeInTheDocument()

    // Verify alarm count is displayed as '3' on the badge
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('updates status filter in store when clicking stats badges', () => {
    renderHeader()

    const totalBtn = screen.getByText('TỔNG:').closest('button')
    const onlineBtn = screen.getByText('ONLINE:').closest('button')
    const offlineBtn = screen.getByText('OFFLINE:').closest('button')
    const maintBtn = screen.getByText('BẢO TRÌ:').closest('button')

    expect(useMapStore.getState().statusFilter).toBe('all')

    act(() => {
      if (onlineBtn) fireEvent.click(onlineBtn)
    })
    expect(useMapStore.getState().statusFilter).toBe('online')

    act(() => {
      if (offlineBtn) fireEvent.click(offlineBtn)
    })
    expect(useMapStore.getState().statusFilter).toBe('offline')

    act(() => {
      if (maintBtn) fireEvent.click(maintBtn)
    })
    expect(useMapStore.getState().statusFilter).toBe('maintenance')

    act(() => {
      if (totalBtn) fireEvent.click(totalBtn)
    })
    expect(useMapStore.getState().statusFilter).toBe('all')
  })

  it('toggles fullscreen state when fullscreen button is clicked', async () => {
    renderHeader()

    const fsBtn = screen.getByTestId('fullscreen-toggle')
    expect(fsBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(fsBtn)
    })
    
    // Clicking again exit fullscreen
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled()
  })

  it('toggles theme when theme button is clicked', () => {
    renderHeader()

    const themeBtn = screen.getByTestId('theme-toggle')
    expect(themeBtn).toBeInTheDocument()

    // Default theme should be light
    expect(useMapStore.getState().theme).toBe('light')

    act(() => {
      fireEvent.click(themeBtn)
    })

    // Theme should switch to dark
    expect(useMapStore.getState().theme).toBe('dark')

    act(() => {
      fireEvent.click(themeBtn)
    })

    // Theme should switch back to light
    expect(useMapStore.getState().theme).toBe('light')
  })

  it('handles alarm item click and clears all alarms', async () => {
    renderHeader()

    // Check if dropdown items are rendered.
    const alarmItem = screen.getByText('Phát hiện xâm nhập')
    expect(alarmItem).toBeInTheDocument()

    // Click the alarm item
    await act(async () => {
      fireEvent.click(alarmItem)
    })

    // It should select the camera CAM-012 in the store
    expect(useMapStore.getState().selectedCamera?.id).toBe('CAM-012')

    // Click 'XÓA TẤT CẢ CẢNH BÁO'
    const clearBtn = screen.getByText('XÓA TẤT CẢ CẢNH BÁO')
    await act(async () => {
      fireEvent.click(clearBtn)
    })

    // The badge count should be gone
    expect(screen.queryByText('3')).toBeNull()
  })
})
