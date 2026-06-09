import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CameraWall } from '../components/wall/CameraWall';
import { useCameraStore } from '../stores/useCameraStore';
import { useMapStore } from '../stores/useMapStore';
import { generateInitialCameras } from '../data/cameras';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CameraWall Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset stores
    useCameraStore.setState({ cameras: generateInitialCameras() });
    useMapStore.setState({ selectedCamera: null });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <CameraWall />
      </MemoryRouter>
    );
  };

  it('should render the Camera Wall with default grid size of 16', () => {
    renderComponent();
    expect(screen.getByText('TƯỜNG GIÁM SÁT CAMERA')).toBeInTheDocument();
    
    // Check if 16 camera feed cells are rendered
    const cells = screen.getAllByTestId('camera-feed-cell');
    expect(cells.length).toBe(16);
  });

  it('should change grid size and update visible cell count', () => {
    renderComponent();

    // Trigger grid size change via select (we search for the trigger button)
    const gridTrigger = screen.getByText('4 × 4');
    expect(gridTrigger).toBeInTheDocument();

    // Mock changing grid size to 2x2 (renders 4 cells)
    // For shadcn Select component, since it is rendered inside Radix Select:
    // We can directly mock or trigger the change, or just simulate the state update or click options.
    // In our shadcn select implementation in components/ui/select.tsx,
    // let's click on the select trigger and find the item "2 × 2".
    fireEvent.click(gridTrigger);
    
    // In jsdom environment, Radix UI portals can render in document.body.
    // Let's find "2 × 2" option and click it
    const option4 = screen.getByRole('option', { name: '2 × 2' });
    fireEvent.click(option4);

    // Verify grid size displays 4 cells
    const cells = screen.getAllByTestId('camera-feed-cell');
    expect(cells.length).toBe(4);
  });

  it('should paginate items when clicking navigation buttons', () => {
    renderComponent();
    
    // Check initial page indicator
    expect(screen.getByText(/1 \/ \d+/)).toBeInTheDocument();

    // Get the first camera id on page 1
    const firstCamPage1 = screen.getAllByTestId('camera-feed-cell')[0];
    const initialCamText = firstCamPage1.textContent;

    // Find next page button (second Chevron button or search via aria label/icon/disabled classes)
    const buttons = screen.getAllByRole('button');
    // Prev, Next buttons are near the end, let's find the Next button (index 2 in pagination block, or finding by text/chevron)
    // Let's find buttons with ChevronRight or look for button containing ChevronRight.
    // Since buttons have SVG inside, let's find the buttons that are pagination.
    // In our component, ChevronRight is used. We can find the button that is enabled and next to page number.
    const nextButton = buttons.find((btn) => btn.querySelector('svg.lucide-chevron-right') || btn.innerHTML.includes('chevron-right'));
    expect(nextButton).toBeDefined();

    if (nextButton) {
      fireEvent.click(nextButton);
      
      // Page indicator should update to 2
      expect(screen.getByText(/2 \/ \d+/)).toBeInTheDocument();
      
      // Cameras on page 2 should be different
      const firstCamPage2 = screen.getAllByTestId('camera-feed-cell')[0];
      expect(firstCamPage2.textContent).not.toBe(initialCamText);
    }
  });

  it('should click camera cell, set selected camera, and navigate to Map page', () => {
    renderComponent();
    
    const cells = screen.getAllByTestId('camera-feed-cell');
    fireEvent.click(cells[0]);

    // Check store updates
    const selected = useMapStore.getState().selectedCamera;
    expect(selected).not.toBeNull();
    expect(selected?.id).toBe('CAM-001');

    // Check router navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should filter cameras by zone status', () => {
    renderComponent();

    // Find filter selectors
    const statusSelect = screen.getByText('Tất Cả Trạng Thái');
    fireEvent.click(statusSelect);

    const offlineOption = screen.getByRole('option', { name: 'Offline' });
    fireEvent.click(offlineOption);

    // Verify that all visible feeds are offline
    const cells = screen.getAllByTestId('camera-feed-cell');
    cells.forEach((cell) => {
      expect(cell).toHaveAttribute('data-status', 'offline');
    });
  });

  it('should toggle auto rotation mode', () => {
    vi.useFakeTimers();
    renderComponent();

    const autoBtn = screen.getByText('AUTO');
    expect(autoBtn).toBeInTheDocument();

    fireEvent.click(autoBtn);
    expect(screen.getByText('PAUSE')).toBeInTheDocument();

    // Advance time by 10s
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Page should transition to page 2
    expect(screen.getByText(/2 \/ \d+/)).toBeInTheDocument();

    vi.useRealTimers();
  });
});
