import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CameraManagement } from '../components/ams/CameraManagement';
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

describe('CameraManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset stores
    useCameraStore.setState({ cameras: generateInitialCameras() });
    useMapStore.setState({ selectedCamera: null });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <CameraManagement />
      </MemoryRouter>
    );
  };

  it('should render the management dashboard with stats and camera table', () => {
    renderComponent();

    // Check stats cards
    expect(screen.getByText('TỔNG CAMERA')).toBeInTheDocument();
    expect(screen.getByText('HOẠT ĐỘNG (ON)')).toBeInTheDocument();
    expect(screen.getByText('MẤT TÍN HIỆU (OFF)')).toBeInTheDocument();
    expect(screen.getByText('BẢO TRÌ (MAIN)')).toBeInTheDocument();

    // Check table rows (default itemsPerPage is 20, so 20 rows + header)
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(21); // 20 data rows + 1 header row
  });

  it('should filter cameras in table based on search input', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Tìm camera, vị trí...');
    
    // Type specific search query that matches a small number of cameras
    fireEvent.change(searchInput, { target: { value: 'Bạch Đằng' } });

    // Verify row count reduces
    const rows = screen.getAllByRole('row');
    // Header + filtered rows matching "Bạch Đằng"
    expect(rows.length).toBeLessThan(21);
    
    // Check that all displayed rows contain "Bạch Đằng" or "CAM"
    rows.slice(1).forEach((row) => {
      expect(row.textContent).toContain('Bạch Đằng');
    });
  });

  it('should open Form Dialog and add a new camera successfully', () => {
    renderComponent();

    // Verify store has 200 cameras initially
    expect(useCameraStore.getState().cameras.length).toBe(200);

    // Open creation modal
    const addBtn = screen.getByRole('button', { name: 'THÊM CAMERA' });
    fireEvent.click(addBtn);

    // Verify dialog opened
    expect(screen.getByText('Thêm Camera Giám Sát Mới')).toBeInTheDocument();

    // Fill form fields
    const nameInput = screen.getByPlaceholderText('Nhập tên camera...');
    fireEvent.change(nameInput, { target: { value: 'Camera Ngã Tư Test' } });

    const areaInput = screen.getByPlaceholderText(/Ví dụ: 120 Bạch Đằng/);
    fireEvent.change(areaInput, { target: { value: '456 Võ Nguyên Giáp, Ngũ Hành Sơn' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: 'LƯU CAMERA' });
    fireEvent.click(submitBtn);

    // Dialog should close, store should contain 201 cameras, and new camera ID should be CAM-201
    expect(screen.queryByText('Thêm Camera Giám Sát Mới')).not.toBeInTheDocument();
    
    const storeCameras = useCameraStore.getState().cameras;
    expect(storeCameras.length).toBe(201);
    expect(storeCameras[200].id).toBe('CAM-201');
    expect(storeCameras[200].name).toBe('Camera Ngã Tư Test');
  });

  it('should open Form Dialog in edit mode and update camera properties', () => {
    renderComponent();

    const initialCamera = useCameraStore.getState().cameras[0]; // CAM-001
    expect(initialCamera.name).not.toBe('Camera Edit Mock');

    // Click edit button for first camera row
    // Row contains edit button with class 'bg-muted/40' or title 'Chỉnh sửa camera'
    // Let's query by title
    const editButtons = screen.getAllByTitle('Chỉnh sửa camera');
    fireEvent.click(editButtons[0]);

    // Verify dialog loaded in Edit mode
    expect(screen.getByText(`Cập Nhật Camera ${initialCamera.id}`)).toBeInTheDocument();

    // Change camera name
    const nameInput = screen.getByPlaceholderText('Nhập tên camera...');
    fireEvent.change(nameInput, { target: { value: 'Camera Edit Mock' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: 'LƯU THAY ĐỔI' });
    fireEvent.click(submitBtn);

    // Verify store has updated camera name
    const updated = useCameraStore.getState().getCameraById(initialCamera.id);
    expect(updated?.name).toBe('Camera Edit Mock');
  });

  it('should delete a camera after confirming in Delete Dialog', () => {
    renderComponent();

    expect(useCameraStore.getState().cameras.length).toBe(200);

    // Click delete button for first camera
    const deleteButtons = screen.getAllByTitle('Xóa camera');
    fireEvent.click(deleteButtons[0]);

    // Verify Delete Confirmation Dialog is open
    expect(screen.getByText('Xác Nhận Xóa Camera')).toBeInTheDocument();

    // Click Delete confirm button
    const confirmDeleteBtn = screen.getByRole('button', { name: 'XÓA CAMERA' });
    fireEvent.click(confirmDeleteBtn);

    // Verify store has 199 cameras
    expect(useCameraStore.getState().cameras.length).toBe(199);
  });

  it('should set selected camera and navigate to map when locate is clicked', () => {
    renderComponent();

    const targetCamera = useCameraStore.getState().cameras[0]; // CAM-001
    expect(useMapStore.getState().selectedCamera).toBeNull();

    // Click locate button for first camera row
    const locateButtons = screen.getAllByTitle('Định vị trên bản đồ');
    fireEvent.click(locateButtons[0]);

    // Check store & navigation callbacks
    expect(useMapStore.getState().selectedCamera).toEqual(targetCamera);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
