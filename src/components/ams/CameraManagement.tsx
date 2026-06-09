import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Video,
  Activity,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Info,
  Server,
  Database,
  Cpu
} from 'lucide-react';
import { useCameraStore } from '../../stores/useCameraStore';
import { useMapStore } from '../../stores/useMapStore';
import { CameraFormDialog } from './CameraFormDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { Camera } from '../../data/cameras';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'online' | 'offline' | 'maintenance';
type TypeFilter = 'all' | 'PTZ' | 'Fixed' | 'Dome';

export function CameraManagement() {
  const navigate = useNavigate();
  const cameras = useCameraStore((state) => state.cameras);
  const deleteCamera = useCameraStore((state) => state.deleteCamera);
  const setSelectedCamera = useMapStore((state) => state.setSelectedCamera);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeCamera, setActiveCamera] = useState<Camera | undefined>(undefined);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Extract unique zones dynamically
  const zones = useMemo(() => {
    const unique = Array.from(new Set(cameras.map((c) => c.zone))).filter(Boolean);
    return unique.sort();
  }, [cameras]);

  // Compute stat counters
  const stats = useMemo(() => {
    const total = cameras.length;
    const online = cameras.filter((c) => c.status === 'online').length;
    const offline = cameras.filter((c) => c.status === 'offline').length;
    const maintenance = cameras.filter((c) => c.status === 'maintenance').length;
    return { total, online, offline, maintenance };
  }, [cameras]);

  // Filter cameras
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      const matchesSearch =
        cam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cam.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cam.area.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cam.status === statusFilter;
      const matchesZone = zoneFilter === 'all' || cam.zone === zoneFilter;
      const matchesType = typeFilter === 'all' || cam.type === typeFilter;

      return matchesSearch && matchesStatus && matchesZone && matchesType;
    });
  }, [cameras, searchTerm, statusFilter, zoneFilter, typeFilter]);

  // Paginated cameras slice
  const paginatedCameras = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCameras.slice(start, start + itemsPerPage);
  }, [filteredCameras, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredCameras.length / itemsPerPage));

  // Reset pagination when search/filters change
  const handleFilterChange = (type: 'search' | 'status' | 'zone' | 'type', value: string) => {
    if (type === 'search') setSearchTerm(value);
    if (type === 'status') setStatusFilter(value as StatusFilter);
    if (type === 'zone') setZoneFilter(value);
    if (type === 'type') setTypeFilter(value as TypeFilter);
    setCurrentPage(1);
  };

  // Trigger Create dialog
  const handleCreateClick = () => {
    setFormMode('create');
    setActiveCamera(undefined);
    setIsFormOpen(true);
  };

  // Trigger Edit dialog
  const handleEditClick = (camera: Camera) => {
    setFormMode('edit');
    setActiveCamera(camera);
    setIsFormOpen(true);
  };

  // Trigger Delete dialog
  const handleDeleteClick = (camera: Camera) => {
    setActiveCamera(camera);
    setIsDeleteOpen(true);
  };

  // Navigate to map and focus on camera
  const handleLocateClick = (camera: Camera) => {
    setSelectedCamera(camera);
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground select-none overflow-hidden p-4 md:p-6 space-y-6">
      {/* Page Title & Tech Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/20 pb-4 shrink-0 gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2 text-[10px] font-mono text-primary uppercase tracking-widest">
            <Server className="w-3.5 h-3.5 text-primary/80 glow-cyan" />
            <span>Hệ Thống Phân Hệ Trực Quan</span>
            <span className="text-muted-foreground/55">•</span>
            <span>Quản Lý Thiết Bị (AMS)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1 font-sans">
            Danh Mục Thiết Bị Camera
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Đăng ký, kiểm tra trạng thái hoạt động và cấu hình thông số kỹ thuật cho hệ thống camera giám sát GIS.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-muted/40 border border-primary/20 rounded-md px-3 py-1.5 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">DATABASE STATUS:</span>
            <span className="text-green-400 font-bold">ONLINE</span>
          </div>
        </div>
      </div>

      {/* 4 Dashboard Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 font-mono">
        {/* Total Stats */}
        <div className="bg-gradient-to-br from-card to-muted/20 border border-border/40 hover:border-primary/50 p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex flex-col text-left z-10">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
              TỔNG CAMERA
            </span>
            <span className="text-3xl font-bold text-foreground mt-2 tracking-tight group-hover:text-primary transition-colors">{stats.total}</span>
            <span className="text-[10px] text-muted-foreground/60 mt-1">Camera được cấu hình</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-105 shadow-inner">
            <Video className="w-6 h-6 text-primary glow-cyan" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-300" />
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/10 via-primary/60 to-primary/10" />
        </div>

        {/* Online Stats */}
        <div className="bg-gradient-to-br from-card to-muted/20 border border-border/40 hover:border-emerald-500/50 p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex flex-col text-left z-10">
            <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
              HOẠT ĐỘNG (ON)
            </span>
            <span className="text-3xl font-bold text-emerald-400 mt-2 tracking-tight">{stats.online}</span>
            <span className="text-[10px] text-muted-foreground/60 mt-1">Luồng video trực tuyến</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:scale-105 shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300" />
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/60 to-emerald-500/10" />
        </div>

        {/* Offline Stats */}
        <div className="bg-gradient-to-br from-card to-muted/20 border border-border/40 hover:border-rose-500/50 p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex flex-col text-left z-10">
            <span className="text-[10px] font-bold text-rose-400/80 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
              MẤT TÍN HIỆU (OFF)
            </span>
            <span className="text-3xl font-bold text-rose-400 mt-2 tracking-tight">{stats.offline}</span>
            <span className="text-[10px] text-muted-foreground/60 mt-1">Yêu cầu kiểm tra xử lý</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:bg-rose-500/20 group-hover:scale-105 shadow-inner">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all duration-300" />
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-rose-500/10 via-rose-500/60 to-rose-500/10" />
        </div>

        {/* Maintenance Stats */}
        <div className="bg-gradient-to-br from-card to-muted/20 border border-border/40 hover:border-amber-500/50 p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex flex-col text-left z-10">
            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shrink-0" />
              BẢO TRÌ (MAIN)
            </span>
            <span className="text-3xl font-bold text-amber-400 mt-2 tracking-tight">{stats.maintenance}</span>
            <span className="text-[10px] text-muted-foreground/60 mt-1">Lịch bảo trì định kỳ</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 z-10 transition-all duration-300 group-hover:bg-amber-500/20 group-hover:scale-105 shadow-inner">
            <Settings className="w-6 h-6 animate-spin-slow" style={{ animationDuration: '4s' }} />
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all duration-300" />
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500/10 via-amber-500/60 to-amber-500/10" />
        </div>
      </div>

      {/* Control Actions & Table Container */}
      <div className="flex-1 bg-card/85 border border-border/40 rounded-xl flex flex-col min-h-0 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
        
        {/* Futuristic Corner Tech Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary/30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary/30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary/30 pointer-events-none" />

        {/* Table Toolbar controls */}
        <div className="flex flex-col xl:flex-row items-center justify-between p-4 border-b border-border/30 gap-4 shrink-0 bg-muted/30 z-10">
          {/* Left panel filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono w-full xl:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-primary/60" />
              <Input
                type="text"
                placeholder="Tìm camera, vị trí..."
                value={searchTerm}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9.5 h-9 text-xs bg-background/80 border-border/30 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 rounded-lg text-foreground font-sans transition-all duration-200 placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Zone Filter Select */}
            <Select value={zoneFilter} onValueChange={(val) => handleFilterChange('zone', val)}>
              <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs bg-background/80 border-border/30 font-mono rounded-lg focus:ring-1 focus:ring-primary hover:border-border/50 hover:bg-muted/80 transition-all cursor-pointer">
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60 text-foreground font-mono">
                <SelectItem value="all" className="hover:bg-primary/10 cursor-pointer">Tất Cả Zones</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone} className="hover:bg-primary/10 cursor-pointer">
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter Select */}
            <Select value={statusFilter} onValueChange={(val) => handleFilterChange('status', val)}>
              <SelectTrigger className="w-full sm:w-[125px] h-9 text-xs bg-background/80 border-border/30 font-mono rounded-lg focus:ring-1 focus:ring-primary hover:border-border/50 hover:bg-muted/80 transition-all cursor-pointer">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60 text-foreground font-mono">
                <SelectItem value="all" className="hover:bg-primary/10 cursor-pointer">Tất Cả Status</SelectItem>
                <SelectItem value="online" className="hover:bg-primary/10 cursor-pointer">Online</SelectItem>
                <SelectItem value="offline" className="hover:bg-primary/10 cursor-pointer">Offline</SelectItem>
                <SelectItem value="maintenance" className="hover:bg-primary/10 cursor-pointer">Bảo Trì</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter Select */}
            <Select value={typeFilter} onValueChange={(val) => handleFilterChange('type', val)}>
              <SelectTrigger className="w-full sm:w-[125px] h-9 text-xs bg-background/80 border-border/30 font-mono rounded-lg focus:ring-1 focus:ring-primary hover:border-border/50 hover:bg-muted/80 transition-all cursor-pointer">
                <SelectValue placeholder="Loại thiết bị" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/60 text-foreground font-mono">
                <SelectItem value="all" className="hover:bg-primary/10 cursor-pointer">Tất Cả Loại</SelectItem>
                <SelectItem value="PTZ" className="hover:bg-primary/10 cursor-pointer">PTZ</SelectItem>
                <SelectItem value="Fixed" className="hover:bg-primary/10 cursor-pointer">Fixed</SelectItem>
                <SelectItem value="Dome" className="hover:bg-primary/10 cursor-pointer">Dome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Right action button (Add Camera) */}
          <Button
            onClick={handleCreateClick}
            className="w-full xl:w-auto h-9 font-bold bg-primary hover:bg-primary/95 text-primary-foreground font-mono flex items-center justify-center gap-1.5 px-4 shadow-lg hover:shadow-primary/15 cursor-pointer rounded-lg shrink-0 border border-primary/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>THÊM CAMERA</span>
          </Button>
        </div>

        {/* Custom Table Canvas */}
        <div className="flex-1 w-full overflow-auto scrollbar-thin z-10">
          <table className="w-full text-left border-collapse text-xs font-mono relative">
            <thead className="bg-muted/50 border-b border-border/40 text-primary/70 uppercase font-mono text-[10px] tracking-widest sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="p-4 pl-6 w-[90px]">ID</th>
                <th className="p-4 w-[280px]">Tên Thiết Bị</th>
                <th className="p-4 w-[120px]">Quận / Huyện</th>
                <th className="p-4 w-[155px]">Loại / Độ Phân Giải</th>
                <th className="p-4 w-[120px]">Trạng Thái</th>
                <th className="p-4">Khu Vực Địa Lý</th>
                <th className="p-4 pr-6 w-[145px] text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {paginatedCameras.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-muted-foreground bg-muted/5">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-3">
                        <Info className="w-5 h-5 text-primary/60" />
                      </div>
                      <span className="font-semibold text-foreground">Không tìm thấy camera phù hợp bộ lọc</span>
                      <span className="text-[10px] text-muted-foreground/60 mt-1">Vui lòng điều chỉnh từ khóa tìm kiếm hoặc các tiêu chí bộ lọc.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCameras.map((cam, idx) => (
                  <tr
                    key={cam.id}
                    className={cn(
                      "transition-all duration-200 group/row border-b border-border/10 last:border-b-0",
                      idx % 2 === 0 ? "bg-muted/10" : "bg-card/10",
                      "hover:bg-primary/[0.03]"
                    )}
                  >
                    {/* ID */}
                    <td className="p-4 pl-6">
                      <span className="font-mono text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md glow-cyan-sm">
                        {cam.id}
                      </span>
                    </td>

                    {/* Camera Name & Coordinates */}
                    <td className="p-4 w-[280px]">
                      <div className="flex items-center gap-2.5 max-w-[260px]">
                        <div className="h-8 w-8 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-center shrink-0 group-hover/row:border-primary/30 group-hover/row:text-primary transition-all shadow-inner">
                          <Video className="w-4 h-4 text-muted-foreground/80 group-hover/row:text-primary transition-all" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-sans font-semibold text-foreground truncate text-xs group-hover/row:text-primary transition-colors">
                            {cam.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50 font-mono mt-0.5">
                            LAT: {cam.lat.toFixed(4)} • LNG: {cam.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Zone / Quận Huyện */}
                    <td className="p-4">
                      <span className="inline-flex items-center bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] rounded-md px-2 py-0.5">
                        {cam.zone}
                      </span>
                    </td>

                    {/* Type & Resolution */}
                    <td className="p-4 text-muted-foreground">
                      <div className="flex flex-col font-mono text-xs">
                        <span className="text-foreground font-semibold">{cam.type}</span>
                        <span className="text-[10px] text-muted-foreground/60">{cam.resolution}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {cam.status === 'online' ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 font-bold uppercase text-[9px] shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ONLINE
                        </span>
                      ) : cam.status === 'offline' ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-2.5 py-0.5 font-bold uppercase text-[9px] shadow-[0_0_8px_rgba(239,68,68,0.1)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          OFFLINE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 font-bold uppercase text-[9px] shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          BẢO TRÌ
                        </span>
                      )}
                    </td>

                    {/* Coordinates & Area */}
                    <td className="p-4 text-muted-foreground" title={cam.area}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/45 shrink-0" />
                        <span className="truncate font-sans text-xs">{cam.area}</span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 opacity-85 group-hover/row:opacity-100 transition-opacity">
                        {/* Locate Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleLocateClick(cam)}
                          className="w-8 h-8 bg-primary/10 border border-primary/20 text-primary hover:border-primary/50 hover:bg-primary/20 rounded-lg cursor-pointer transition-all duration-200"
                          title="Định vị trên bản đồ"
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>

                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(cam)}
                          className="w-8 h-8 bg-muted/30 border border-border/30 hover:border-foreground/30 hover:bg-muted text-foreground rounded-lg cursor-pointer transition-all duration-200"
                          title="Chỉnh sửa camera"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(cam)}
                          className="w-8 h-8 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-all duration-200"
                          title="Xóa camera"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-3 bg-muted/30 border-t border-border/30 flex items-center justify-between text-xs font-mono shrink-0 z-10">
          <div className="text-muted-foreground">
            Hiển thị <span className="font-bold text-primary">{paginatedCameras.length}</span> /{' '}
            <span className="font-bold text-foreground">{filteredCameras.length}</span> camera
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 bg-muted/40 border-border/40 hover:bg-muted disabled:opacity-30 cursor-pointer rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3.5 py-1 bg-background border border-border/40 rounded-lg font-bold min-w-[75px] text-center text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 bg-muted/40 border-border/40 hover:bg-muted disabled:opacity-30 cursor-pointer rounded-lg transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* CRUD dialogs */}
      <CameraFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
        camera={activeCamera}
      />

      {activeCamera && (
        <DeleteConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() => deleteCamera(activeCamera.id)}
          cameraName={activeCamera.name}
          cameraId={activeCamera.id}
        />
      )}

      {/* Footer Hud */}
      <div className="text-[9px] font-mono text-muted-foreground flex justify-between shrink-0">
        <span className="flex items-center gap-1">
          <HardDrive className="w-2.5 h-2.5 text-primary" />
          STORAGE SYSTEM: LOCAL STORAGE DATABASE SYNCED
        </span>
        <span className="flex items-center gap-1.5">
          <Cpu className="w-2.5 h-2.5 text-primary/60" />
          HUD ENGINE: READY
        </span>
      </div>
    </div>
  );
}
export default CameraManagement;
