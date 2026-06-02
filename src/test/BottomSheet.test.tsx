import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BottomSheet } from '../components/layout/BottomSheet'
import { useMapStore } from '../stores/useMapStore'

// Mock tabs to render synchronously in JSDOM
vi.mock('@/components/ui/tabs', () => {
  return {
    Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-root">{children}</div>,
    TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
    TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => <button data-testid={`tabs-trigger-${value}`}>{children}</button>,
    TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => <div data-testid={`tabs-content-${value}`}>{children}</div>,
  }
})

// Mock ScrollArea
vi.mock('@/components/ui/scroll-area', () => {
  return {
    ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
  }
})

describe('BottomSheet Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useMapStore.setState({
      selectedCamera: null,
      bottomSheetOpen: false,
    })
  })

  it('renders null when bottom sheet is closed or no camera is selected', () => {
    const { container } = render(<BottomSheet />)
    expect(container.firstChild).toBeNull()
  })

  it('renders camera details correctly for an online camera', () => {
    const mockCamera = {
      id: 'CAM-100',
      name: 'Ngã tư Phan Châu Trinh',
      lng: 108.22,
      lat: 16.06,
      status: 'online' as const,
      zone: 'Hải Châu',
      type: 'Fixed' as const,
      lastSeen: new Date().toISOString(),
      resolution: '1080p' as const,
      area: 'Phan Châu Trinh, Hải Châu',
    }

    useMapStore.setState({
      selectedCamera: mockCamera,
      bottomSheetOpen: true,
    })

    render(<BottomSheet />)

    expect(screen.getByText('CAM-100')).toBeInTheDocument()
    expect(screen.getByText('Ngã tư Phan Châu Trinh')).toBeInTheDocument()
    expect(screen.getByText('STREAM BUFFER ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('LIVE // 1080p FEED')).toBeInTheDocument()
  })

  it('renders maintenance warning for a camera in maintenance status', () => {
    const mockCamera = {
      id: 'CAM-101',
      name: 'Cầu Thuận Phước',
      lng: 108.22,
      lat: 16.09,
      status: 'maintenance' as const,
      zone: 'Hải Châu',
      type: 'PTZ' as const,
      lastSeen: new Date().toISOString(),
      resolution: '4K' as const,
      area: 'Cầu Thuận Phước, Hải Châu',
    }

    useMapStore.setState({
      selectedCamera: mockCamera,
      bottomSheetOpen: true,
    })

    render(<BottomSheet />)

    expect(screen.getByText('BẢO TRÌ ĐỊNH KỲ')).toBeInTheDocument()
    expect(screen.queryByText('STREAM BUFFER ACTIVE')).toBeNull()
  })

  it('renders offline warning for an offline camera', () => {
    const mockCamera = {
      id: 'CAM-102',
      name: 'Đường Bạch Đằng',
      lng: 108.22,
      lat: 16.06,
      status: 'offline' as const,
      zone: 'Hải Châu',
      type: 'Dome' as const,
      lastSeen: new Date().toISOString(),
      resolution: '2K' as const,
      area: 'Bạch Đằng, Hải Châu',
    }

    useMapStore.setState({
      selectedCamera: mockCamera,
      bottomSheetOpen: true,
    })

    render(<BottomSheet />)

    expect(screen.getByText('MẤT TÍN HIỆU CAMERA')).toBeInTheDocument()
    expect(screen.queryByText('STREAM BUFFER ACTIVE')).toBeNull()
  })

  it('toggles stream feed active state on button click', () => {
    const mockCamera = {
      id: 'CAM-100',
      name: 'Ngã tư Phan Châu Trinh',
      lng: 108.22,
      lat: 16.06,
      status: 'online' as const,
      zone: 'Hải Châu',
      type: 'Fixed' as const,
      lastSeen: new Date().toISOString(),
      resolution: '1080p' as const,
      area: 'Phan Châu Trinh, Hải Châu',
    }

    useMapStore.setState({
      selectedCamera: mockCamera,
      bottomSheetOpen: true,
    })

    render(<BottomSheet />)

    const toggleBtn = screen.getByRole('button', { name: 'DỪNG KÊNH' })
    expect(toggleBtn).toBeInTheDocument()

    // Stop channel stream
    act(() => {
      fireEvent.click(toggleBtn)
    })
    expect(screen.queryByText('STREAM BUFFER ACTIVE')).toBeNull()
    expect(toggleBtn).toHaveTextContent('PHÁT LIVE')

    // Start channel stream again
    act(() => {
      fireEvent.click(toggleBtn)
    })
    expect(screen.getByText('STREAM BUFFER ACTIVE')).toBeInTheDocument()
    expect(toggleBtn).toHaveTextContent('DỪNG KÊNH')
  })

  it('closes bottom sheet and resets selection when close button is clicked', () => {
    const mockCamera = {
      id: 'CAM-100',
      name: 'Ngã tư Phan Châu Trinh',
      lng: 108.22,
      lat: 16.06,
      status: 'online' as const,
      zone: 'Hải Châu',
      type: 'Fixed' as const,
      lastSeen: new Date().toISOString(),
      resolution: '1080p' as const,
      area: 'Phan Châu Trinh, Hải Châu',
    }

    useMapStore.setState({
      selectedCamera: mockCamera,
      bottomSheetOpen: true,
    })

    const { container } = render(<BottomSheet />)
    const closeBtn = container.querySelector('button svg.lucide-x')?.parentElement
    expect(closeBtn).toBeDefined()

    if (closeBtn) {
      act(() => {
        fireEvent.click(closeBtn)
      })
    }

    expect(useMapStore.getState().selectedCamera).toBeNull()
    expect(useMapStore.getState().bottomSheetOpen).toBe(false)
  })

  it('handles stream refresh simulation', () => {
    const mockCamera = {
      id: 'CAM-100',
      name: 'Ngã tư Phan Châu Trinh',
      lng: 108.22,
      lat: 16.06,
      status: 'online' as const,
      zone: 'Hải Châu',
      type: 'Fixed' as const,
      lastSeen: new Date().toISOString(),
      resolution: '1080p' as const,
      area: 'Phan Châu Trinh, Hải Châu',
    }

    useMapStore.setState({
      selectedCamera: mockCamera,
      bottomSheetOpen: true,
    })

    vi.useFakeTimers()

    const { container } = render(<BottomSheet />)
    const refreshBtn = container.querySelector('button svg.lucide-refresh-cw')?.parentElement
    expect(refreshBtn).toBeDefined()

    if (refreshBtn) {
      act(() => {
        fireEvent.click(refreshBtn)
      })
      // Stream goes inactive, then becomes active after 500ms
      expect(screen.queryByText('STREAM BUFFER ACTIVE')).toBeNull()

      act(() => {
        vi.advanceTimersByTime(500)
      })
      expect(screen.getByText('STREAM BUFFER ACTIVE')).toBeInTheDocument()
    }

    vi.useRealTimers()
  })

  it('renders coordinate and info details on location and notes tabs, and handles note submission', () => {
    const mockCamera = {
      id: 'CAM-100',
      name: 'Ngã tư Phan Châu Trinh',
      lng: 108.221234,
      lat: 16.065678,
      status: 'online' as const,
      zone: 'Hải Châu',
      type: 'Fixed' as const,
      lastSeen: new Date().toISOString(),
      resolution: '1080p' as const,
      area: 'Phan Châu Trinh, Hải Châu',
    }

    useMapStore.setState({
      selectedCamera: mockCamera,
      bottomSheetOpen: true,
    })

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<BottomSheet />)

    // Check location rendering (longitude / latitude fixed to 6 decimals)
    expect(screen.getByText('108.221234')).toBeInTheDocument()
    expect(screen.getByText('16.065678')).toBeInTheDocument()

    // Notes textarea
    const textarea = screen.getByPlaceholderText('Nhập ghi chú điều phối cho thiết bị này...')
    expect(textarea).toBeInTheDocument()

    act(() => {
      fireEvent.change(textarea, { target: { value: 'New coordinator notes' } })
    })
    expect(textarea).toHaveValue('New coordinator notes')

    const saveBtn = screen.getByRole('button', { name: 'LƯU BÁO CÁO' })
    act(() => {
      fireEvent.click(saveBtn)
    })

    expect(alertSpy).toHaveBeenCalledWith('Ghi chú cho CAM-100 đã được cập nhật hệ thống!')
    expect(textarea).toHaveValue('')
  })
})
