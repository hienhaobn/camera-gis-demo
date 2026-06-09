import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Ruler,
  Edit,
  MapPin,
  Navigation,
  Search,
  Eye,
  EyeOff,
  ShieldCheck,
  Globe,
  Shield,
  Database,
  Building,
} from "lucide-react";
import { useMapStore } from "@/stores/useMapStore";
import type { ActiveTool } from "@/stores/useMapStore";
import { useCameraStore } from "@/stores/useCameraStore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppSidebar() {
  const cameras = useCameraStore((state) => state.cameras);
  const {
    selectedCamera,
    setSelectedCamera,
    visibleLayers,
    toggleLayer,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    activeTool,
    setActiveTool,
  } = useMapStore();

  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      const matchesSearch =
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.area.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || cam.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, cameras]);

  // Count results
  const cameraCount = filteredCameras.length;

  const handleToolChange = (val: string) => {
    setActiveTool((val || null) as ActiveTool);
  };

  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <Sidebar
        collapsible="icon"
        className="border-r border-border/50 bg-sidebar select-none"
      >
        {/* Collapsed Header */}
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/30 px-0">
          <div
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary glow-cyan cursor-pointer hover:bg-primary/20 transition-all"
            title="Mở thanh bên"
          >
            <Video className="w-5 h-5" />
          </div>
        </SidebarHeader>

        {/* Collapsed Content */}
        <SidebarContent className="gap-0 py-4 flex flex-col items-center select-none overflow-y-auto no-scrollbar">
          {/* Layer toggles */}
          <div className="flex flex-col items-center gap-4 py-2 w-full">
            {/* satellite toggle (Vô hiệu hóa vì chưa có bản quyền/funding) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  disabled
                  pressed={false}
                  size="sm"
                  aria-label="Toggle Satellite Style"
                  className="h-8 w-8 p-0 flex items-center justify-center border border-border/40 bg-muted/20 text-muted-foreground opacity-50 cursor-not-allowed rounded-md"
                >
                  <Globe className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Bản đồ vệ tinh (Chưa kích hoạt)
              </TooltipContent>
            </Tooltip>

            {/* nodes camera toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={visibleLayers.cameras}
                  onPressedChange={() => toggleLayer("cameras")}
                  size="sm"
                  aria-label="Toggle Cameras Layer"
                  className={`h-8 w-8 p-0 flex items-center justify-center border border-border/40 hover:bg-muted cursor-pointer transition-all rounded-md ${
                    visibleLayers.cameras
                      ? "bg-primary/20 text-primary border-primary/40 glow-cyan"
                      : "bg-muted/20"
                  }`}
                >
                  <Video className="w-4 h-4 text-primary" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Nodes Camera
              </TooltipContent>
            </Tooltip>

            {/* zones toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={visibleLayers.zones}
                  onPressedChange={() => toggleLayer("zones")}
                  size="sm"
                  aria-label="Toggle Zones Layer"
                  className={`h-8 w-8 p-0 flex items-center justify-center border border-border/40 hover:bg-muted cursor-pointer transition-all rounded-md ${
                    visibleLayers.zones
                      ? "bg-primary/20 text-primary border-primary/40 glow-cyan"
                      : "bg-muted/20"
                  }`}
                >
                  <Shield className="w-4 h-4 text-primary" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Vùng Giám Sát
              </TooltipContent>
            </Tooltip>

            {/* infrastructure toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={visibleLayers.infrastructure}
                  onPressedChange={() => toggleLayer("infrastructure")}
                  size="sm"
                  aria-label="Toggle Infrastructure Layer"
                  className={`h-8 w-8 p-0 flex items-center justify-center border border-border/40 hover:bg-muted cursor-pointer transition-all rounded-md ${
                    visibleLayers.infrastructure
                      ? "bg-primary/20 text-primary border-primary/40 glow-cyan"
                      : "bg-muted/20"
                  }`}
                >
                  <Database className="w-4 h-4 text-primary" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Cơ Sở Hạ Tầng
              </TooltipContent>
            </Tooltip>

            {/* buildings toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={visibleLayers.buildings}
                  onPressedChange={() => toggleLayer("buildings")}
                  size="sm"
                  aria-label="Toggle Buildings Layer"
                  className={`h-8 w-8 p-0 flex items-center justify-center border border-border/40 hover:bg-muted cursor-pointer transition-all rounded-md ${
                    visibleLayers.buildings
                      ? "bg-primary/20 text-primary border-primary/40 glow-cyan"
                      : "bg-muted/20"
                  }`}
                >
                  <Building className="w-4 h-4 text-primary" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Khối 3D
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-8 h-[1px] bg-border/30 my-2" />

          {/* GIS Interactive Tools */}
          <div className="flex flex-col items-center gap-2 py-2">
            <ToggleGroup
              type="single"
              value={activeTool || ""}
              onValueChange={handleToolChange}
              className="flex flex-col gap-2"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="measure"
                    aria-label="Toggle Measure Tool"
                    className="h-8 w-8 border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary data-[state=on]:glow-cyan rounded-md flex items-center justify-center"
                  >
                    <Ruler className="w-4 h-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Đo Khoảng Cách
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="draw"
                    aria-label="Toggle Draw Tool"
                    className="h-8 w-8 border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary data-[state=on]:glow-cyan rounded-md flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Vẽ Bản Đồ
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="mark"
                    aria-label="Toggle Mark Tool"
                    className="h-8 w-8 border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary data-[state=on]:glow-cyan rounded-md flex items-center justify-center"
                  >
                    <MapPin className="w-4 h-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Đánh Dấu
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="route"
                    aria-label="Toggle Route Tool"
                    className="h-8 w-8 border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary data-[state=on]:glow-cyan rounded-md flex items-center justify-center"
                  >
                    <Navigation className="w-4 h-4" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Tìm Đường Đi
                </TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </div>

          <div className="w-8 h-[1px] bg-border/30 my-2" />

          {/* Search Button / Expand */}
          <div className="flex flex-col items-center py-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebar}
                  aria-label="Toggle Search Sidebar"
                  className="h-8 w-8 flex items-center justify-center rounded-md border border-border/40 bg-muted/20 hover:bg-muted cursor-pointer transition-all"
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Tìm kiếm & Danh sách camera
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border/30 bg-muted/20 flex flex-col items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help" aria-label="Security Badge Info">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              BẢN ĐỒ AN TOÀN ĐÀ NẴNG
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-sidebar select-none"
    >
      {/* Sidebar Header */}
      {/* <SidebarHeader className="h-16 flex items-center justify-between px-4 border-b border-border/30">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary glow-cyan">
            <Video className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-bold text-sm text-foreground tracking-wide">
              CCTV GIS HUD
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              v1.2.0-STAGING
            </span>
          </div>
        </div>
      </SidebarHeader> */}

      {/* Sidebar Content */}
      <SidebarContent className="gap-0 py-2 overflow-hidden">
        {/* Layer Controls */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-mono text-[10px] tracking-widest uppercase">
            Lớp Bản Đồ
          </SidebarGroupLabel>
          <SidebarGroupContent className="pt-1.5 flex flex-col gap-2">
            {/* Map Theme Toggle (Vô hiệu hóa vì chưa có bản quyền/funding) */}
            <div className="flex items-center justify-between px-2 py-1 bg-muted/10 border border-border/20 rounded-md opacity-60">
              <span className="text-xs font-medium text-muted-foreground">
                Bản đồ vệ tinh (Chưa kích hoạt)
              </span>
              <Toggle
                disabled
                pressed={false}
                size="sm"
                aria-label="Toggle Satellite Style"
                className="h-7 w-12 border border-border/40 cursor-not-allowed opacity-50"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </Toggle>
            </div>

            {/* Individual Layers */}
            <div className="grid grid-cols-2 gap-2">
              <Toggle
                pressed={visibleLayers.cameras}
                onPressedChange={() => toggleLayer("cameras")}
                className="h-8 justify-start gap-1.5 px-2 bg-muted/20 hover:bg-muted/40 text-xs border border-border/30 rounded-md cursor-pointer"
              >
                {visibleLayers.cameras ? (
                  <Eye className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span>Nodes Camera</span>
              </Toggle>

              <Toggle
                pressed={visibleLayers.zones}
                onPressedChange={() => toggleLayer("zones")}
                className="h-8 justify-start gap-1.5 px-2 bg-muted/20 hover:bg-muted/40 text-xs border border-border/30 rounded-md cursor-pointer"
              >
                {visibleLayers.zones ? (
                  <Eye className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span>Vùng Giám Sát</span>
              </Toggle>

              <Toggle
                pressed={visibleLayers.infrastructure}
                onPressedChange={() => toggleLayer("infrastructure")}
                className="h-8 justify-start gap-1.5 px-2 bg-muted/20 hover:bg-muted/40 text-xs border border-border/30 rounded-md cursor-pointer"
              >
                {visibleLayers.infrastructure ? (
                  <Eye className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span>Cơ Sở Hạ Tầng</span>
              </Toggle>

              <Toggle
                pressed={visibleLayers.buildings}
                onPressedChange={() => toggleLayer("buildings")}
                className="h-8 justify-start gap-1.5 px-2 bg-muted/20 hover:bg-muted/40 text-xs border border-border/30 rounded-md cursor-pointer"
              >
                {visibleLayers.buildings ? (
                  <Eye className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span>Khối 3D</span>
              </Toggle>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* GIS Interactive Tools */}
        <SidebarGroup className="pt-2">
          <SidebarGroupLabel className="text-primary font-mono text-[10px] tracking-widest uppercase">
            Công Cụ GIS
          </SidebarGroupLabel>
          <SidebarGroupContent className="pt-1.5">
            <ToggleGroup
              type="single"
              value={activeTool || ""}
              onValueChange={handleToolChange}
              className="grid grid-cols-4 gap-1 bg-muted/30 border border-border/40 p-1 rounded-md w-full"
            >
              <ToggleGroupItem
                value="measure"
                className="w-full h-12 border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary data-[state=on]:glow-cyan rounded flex flex-col items-center justify-center p-1.5"
                title="Đo Khoảng Cách"
              >
                <Ruler className="w-4 h-4" />
                <span className="text-[8px] mt-0.5">Đo</span>
              </ToggleGroupItem>

              <ToggleGroupItem
                value="draw"
                className="w-full h-12 border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary data-[state=on]:glow-cyan rounded flex flex-col items-center justify-center p-1.5"
                title="Vẽ Bản Đồ"
              >
                <Edit className="w-4 h-4" />
                <span className="text-[8px] mt-0.5">Vẽ</span>
              </ToggleGroupItem>

              <ToggleGroupItem
                value="mark"
                className="w-full h-12 border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary data-[state=on]:glow-cyan rounded flex flex-col items-center justify-center p-1.5"
                title="Đánh Dấu"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-[8px] mt-0.5">Đánh Dấu</span>
              </ToggleGroupItem>

              <ToggleGroupItem
                value="route"
                className="w-full h-12 border border-transparent hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:border-primary data-[state=on]:glow-cyan rounded flex flex-col items-center justify-center p-1.5"
                title="Tìm Đường Đi"
              >
                <Navigation className="w-4 h-4" />
                <span className="text-[8px] mt-0.5">Đường Đi</span>
              </ToggleGroupItem>
            </ToggleGroup>
            {activeTool && (
              <div className="mt-2 text-[10px] text-muted-foreground/80 px-1 bg-primary/5 border border-primary/10 rounded py-1 font-mono text-center">
                Công cụ{" "}
                <span className="text-primary font-bold uppercase">
                  {activeTool}
                </span>{" "}
                đang bật
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Camera List Search and Filters */}
        <SidebarGroup className="pt-2 flex-1 flex flex-col min-h-0 h-0">
          <SidebarGroupLabel className="text-primary font-mono text-[10px] tracking-widest uppercase flex justify-between items-center w-full">
            <span>Danh Sách Camera</span>
            <Badge
              variant="outline"
              className="font-mono text-[9px] h-4 py-0 text-primary border-primary/20 bg-primary/5"
            >
              {cameraCount} Nodes
            </Badge>
          </SidebarGroupLabel>
          <SidebarGroupContent className="pt-1.5 flex flex-col gap-2 min-h-0 flex-1 h-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm camera, tuyến đường..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs bg-muted/30 border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-md"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1.5 text-[9px] font-mono">
              {(["all", "online", "offline", "maintenance"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`flex-1 py-1 rounded border uppercase text-center cursor-pointer transition-all ${
                      statusFilter === filter
                        ? "bg-primary/10 text-primary border-primary/30 font-bold"
                        : "bg-muted/10 text-muted-foreground border-border/30 hover:bg-muted/30"
                    }`}
                  >
                    {filter === "all"
                      ? "TẤT CẢ"
                      : filter === "online"
                        ? "ON"
                        : filter === "offline"
                          ? "OFF"
                          : "BT"}
                  </button>
                ),
              )}
            </div>

            {/* Scrollable Camera List */}
            <ScrollArea className="flex-1 h-0 border border-border/30 rounded-md bg-muted/5 mt-1">
              <div className="p-1.5 flex flex-col gap-1.5">
                {cameraCount === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Không tìm thấy camera
                  </div>
                ) : (
                  filteredCameras.map((cam) => {
                    const isSelected = selectedCamera?.id === cam.id;
                    return (
                      <div
                        key={cam.id}
                        onClick={() =>
                          setSelectedCamera(isSelected ? null : cam)
                        }
                        className={`flex items-start gap-2.5 p-2 rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary/10 border-primary/40 shadow-sm"
                            : "bg-card/40 border-border/20 hover:bg-muted/20"
                        }`}
                      >
                        {/* Status Icon Indicator */}
                        <div className="mt-1 relative flex h-2 w-2 items-center justify-center shrink-0">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                              cam.status === "online"
                                ? "bg-green-500"
                                : cam.status === "offline"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          ></span>
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              cam.status === "online"
                                ? "bg-green-500"
                                : cam.status === "offline"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          ></span>
                        </div>

                        {/* Name & Location Details */}
                        <div className="flex flex-col text-left min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 justify-between w-full min-w-0">
                            <span className="font-bold text-xs text-foreground truncate">
                              {cam.name}
                            </span>
                            <span className="text-[8px] font-mono bg-muted border border-border/40 text-muted-foreground px-1 py-0.5 rounded leading-none shrink-0">
                              {cam.id}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {cam.area}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="p-3 border-t border-border/30 bg-muted/20 font-mono text-[9px] text-muted-foreground flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>BẢN ĐỒ AN TOÀN ĐÀ NẴNG</span>
        </div>
        <div className="mt-1 opacity-50">COORDS: WGS_84 / EPSG:3857</div>
      </SidebarFooter>
    </Sidebar>
  );
}
