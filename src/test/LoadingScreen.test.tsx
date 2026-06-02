import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LoadingScreen } from '../components/ui/LoadingScreen'

describe('LoadingScreen Component', () => {
  it('renders boot system layout correctly', () => {
    const handleFinished = vi.fn()
    render(<LoadingScreen onFinished={handleFinished} />)

    // Check main branding header
    expect(screen.getByText('SYS_MONITOR_GIS')).toBeInTheDocument()
    expect(screen.getByText('Vietnam Camera Surveillance HUD')).toBeInTheDocument()
  })

  it('progressively displays logs and finishes when progress reaches 100', () => {
    vi.useFakeTimers()
    const handleFinished = vi.fn()
    render(<LoadingScreen onFinished={handleFinished} />)

    // Fast-forward initial progress
    act(() => {
      vi.advanceTimersByTime(2500) // 2500ms should easily hit 100% (20ms * 100 = 2000ms)
    })

    // Advance for fade out timeout (500ms + 500ms)
    act(() => {
      vi.advanceTimersByTime(1100)
    })

    expect(handleFinished).toHaveBeenCalled()
    vi.useRealTimers()
  })
})
