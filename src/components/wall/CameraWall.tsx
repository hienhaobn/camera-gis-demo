import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, ChevronLeft, ChevronRight, Monitor, Filter, RefreshCw, ShieldAlert } from 'lucide-react';
import { useCameraStore } from '../../stores/useCameraStore';
import { useMapStore } from '../../stores/useMapStore';
import { CameraFeedCell } from './CameraFeedCell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import type { Camera } from '../../data/cameras';

type GridSize = 4 | 9 | 16 | 36;
type StatusFilter = 'all' | 'online' | 'offline' | 'maintenance';

export function CameraWall() {
  const navigate = useNavigate();
  const cameras = useCameraStore((state) => state.cameras);
  const setSelectedCamera = useMapStore((state) => state.setSelectedCamera);

  // Filter states
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  // Grid and Page states
  const [gridSize, setGridSize] = useState<GridSize>(16); // Default 4x4
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);

  // Extract unique zones dynamically
  const zones = useMemo(() => {
    const unique = Array.from(new Set(cameras.map((c) => c.zone))).filter(Boolean);
    return unique.sort();
  }, [cameras]);

  // Filter cameras
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      const matchesZone = selectedZone === 'all' || cam.zone === selectedZone;
      const matchesStatus = selectedStatus === 'all' || cam.status === selectedStatus;
      return matchesZone && matchesStatus;
    });
  }, [cameras, selectedZone, selectedStatus]);

  // Pagination bounds
  const totalItems = filteredCameras.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / gridSize));

  const handleZoneChange = (zone: string) => {
    setSelectedZone(zone);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: StatusFilter) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleGridSizeChange = (size: GridSize) => {
    setGridSize(size);
    setCurrentPage(1);
  };

  // Auto-rotate effect
  useEffect(() => {
    if (!isAutoRotate) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev >= totalPages ? 1 : prev + 1));
    }, 10000); // 10 seconds auto rotate

    return () => clearInterval(timer);
  }, [isAutoRotate, totalPages]);

  // Handle cell click
  const handleCellClick = useCallback(
    (camera: Camera) => {
      setSelectedCamera(camera);
      navigate('/');
    },
    [setSelectedCamera, navigate]
  );

  // Paginated data slice
  const paginatedCameras = useMemo(() => {
    const start = (currentPage - 1) * gridSize;
    return filteredCameras.slice(start, start + gridSize);
  }, [filteredCameras, currentPage, gridSize]);

  // Grid styling utility
  const gridClass = useMemo(() => {
    switch (gridSize) {
      case 4:
        return 'grid-cols-2';
      case 9:
        return 'grid-cols-3';
      case 16:
        return 'grid-cols-2 sm:grid-cols-4';
      case 36:
        return 'grid-cols-3 sm:grid-cols-6';
      default:
        return 'grid-cols-2 sm:grid-cols-4';
    }
  }, [gridSize]);

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground select-none overflow-hidden">
      {/* Top Controller Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between p-3.5 bg-card/80 border-b border-border/40 backdrop-blur-xl shrink-0 gap-3 md:gap-0">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary glow-cyan">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-sm tracking-wide text-primary">TƯỜNG GIÁM SÁT CAMERA</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              HIỂN THỊ: {filteredCameras.length} NODES
            </span>
          </div>
        </div>

        {/* Controls Container */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono">
          {/* Zone Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-primary/75" />
            <Select value={selectedZone} onValueChange={handleZoneChange}>
              <SelectTrigger className="w-[125px] h-8 text-[11px] bg-muted/40 border-border/40 font-mono">
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/60">
                <SelectItem value="all">Tất Cả Zones</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => handleStatusChange(val as StatusFilter)}
          >
            <SelectTrigger className="w-[120px] h-8 text-[11px] bg-muted/40 border-border/40 font-mono">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/60">
              <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="maintenance">Bảo Trì</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-[1px] h-5 bg-border/40 hidden sm:block" />

          {/* Grid Layout Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">GRID:</span>
            <Select
              value={String(gridSize)}
              onValueChange={(val) => handleGridSizeChange(Number(val) as GridSize)}
            >
              <SelectTrigger className="w-[80px] h-8 text-[11px] bg-muted/40 border-border/40 font-bold">
                <SelectValue placeholder="Grid Size" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/60 font-bold">
                <SelectItem value="4">2 × 2</SelectItem>
                <SelectItem value="9">3 × 3</SelectItem>
                <SelectItem value="16">4 × 4</SelectItem>
                <SelectItem value="36">6 × 6</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[1px] h-5 bg-border/40" />

          {/* Auto rotate controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`h-8 gap-1 px-2.5 font-bold ${
              isAutoRotate
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-muted/40 border-border/40 hover:bg-muted'
            }`}
          >
            {isAutoRotate ? (
              <>
                <Pause className="w-3.5 h-3.5 animate-pulse" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>AUTO</span>
              </>
            )}
          </Button>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                setIsAutoRotate(false);
              }}
              className="w-8 h-8 bg-muted/40 border-border/40 hover:bg-muted disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2 font-bold min-w-[70px] text-center text-[10px]">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                setIsAutoRotate(false);
              }}
              className="w-8 h-8 bg-muted/40 border-border/40 hover:bg-muted disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Canvas Content */}
      <div className="flex-1 w-full p-3.5 overflow-y-auto scrollbar-thin">
        {paginatedCameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-muted-foreground border border-dashed border-border/30 rounded-lg p-6">
            <ShieldAlert className="w-12 h-12 mb-3 text-primary/40 animate-bounce" />
            <p className="font-mono text-xs">KHÔNG TÌM THẤY CAMERA PHÙ HỢP BỘ LỌC</p>
          </div>
        ) : (
          <div className={`grid ${gridClass} gap-2.5`}>
            {paginatedCameras.map((cam) => (
              <CameraFeedCell key={cam.id} camera={cam} onClick={handleCellClick} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Hud */}
      <div className="p-2 border-t border-border/30 bg-muted/10 font-mono text-[9px] text-muted-foreground flex justify-between px-4 shrink-0">
        <span>MODE: MATRIX FEED MONITORING</span>
        <span className="flex items-center gap-1.5 uppercase">
          <RefreshCw className={`w-2.5 h-2.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          STATUS: {isAutoRotate ? 'AUTO CYCLE ACTIVE' : 'MANUAL'}
        </span>
      </div>
    </div>
  );
}
export default CameraWall;
