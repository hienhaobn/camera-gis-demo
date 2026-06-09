/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from "react";
import Map, { Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMapStore } from "@/stores/useMapStore";
import { useCameraStore } from "@/stores/useCameraStore";
import {
  MapPin,
  AlertCircle,
  Camera as CameraIcon,
  Settings,
  Tv,
  Activity,
  Compass,
  Crosshair,
  Link,
} from "lucide-react";
import type { Camera } from "../../data/cameras";
import type { MapRef } from "react-map-gl/maplibre";

interface CameraFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  camera?: Camera;
}

export function CameraFormDialog({
  isOpen,
  onClose,
  mode,
  camera,
}: CameraFormDialogProps) {
  const theme = useMapStore((state) => state.theme);
  const addCamera = useCameraStore((state) => state.addCamera);
  const updateCamera = useCameraStore((state) => state.updateCamera);

  const mapRef = useRef<MapRef>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<"PTZ" | "Fixed" | "Dome">("Fixed");
  const [resolution, setResolution] = useState<"4K" | "2K" | "1080p">("1080p");
  const [status, setStatus] = useState<"online" | "offline" | "maintenance">(
    "online",
  );
  const [zone, setZone] = useState("Hải Châu");
  const [area, setArea] = useState("");
  const [lng, setLng] = useState(108.2201);
  const [lat, setLat] = useState(16.0594);
  const [streamUrl, setStreamUrl] = useState("");

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes/changes mode
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && camera) {
        setName(camera.name);
        setType(camera.type);
        setResolution(camera.resolution);
        setStatus(camera.status);
        setZone(camera.zone);
        setArea(camera.area);
        setLng(camera.lng);
        setLat(camera.lat);
        setStreamUrl(camera.streamUrl || "");
      } else {
        // Defaults for Create mode
        setName("");
        setType("Fixed");
        setResolution("1080p");
        setStatus("online");
        setZone("Hải Châu");
        setArea("");
        setLng(108.2201);
        setLat(16.0594);
        setStreamUrl("");
      }
      setErrors({});
    }
  }, [isOpen, mode, camera]);

  // Adjust mini map view when coordinates change
  useEffect(() => {
    if (isOpen && mapRef.current) {
      mapRef.current.easeTo({
        center: [lng, lat],
        zoom: 13,
        duration: 500,
      });
    }
  }, [lng, lat, isOpen]);

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Tên camera không được để trống";
    }
    if (!area.trim()) {
      newErrors.area = "Vị trí chi tiết không được để trống";
    }
    if (isNaN(lng) || lng < 102 || lng > 110) {
      newErrors.lng = "Kinh độ không hợp lệ (102.0 - 110.0)";
    }
    if (isNaN(lat) || lat < 8 || lat > 24) {
      newErrors.lat = "Vĩ độ không hợp lệ (8.0 - 24.0)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const cameraData = {
      name: name.trim(),
      type,
      resolution,
      status,
      zone,
      area: area.trim(),
      lng,
      lat,
      streamUrl: streamUrl.trim() || undefined,
    };

    if (mode === "edit" && camera) {
      updateCamera(camera.id, cameraData);
    } else {
      addCamera(cameraData);
    }

    onClose();
  };

  // Click on mini map to select coordinate
  const handleMapClick = (e: { lngLat: { lng: number; lat: number } }) => {
    const { lng, lat } = e.lngLat;
    setLng(parseFloat(lng.toFixed(6)));
    setLat(parseFloat(lat.toFixed(6)));
  };

  const mapStyle =
    theme === "light"
      ? "https://tiles.openfreemap.org/styles/positron"
      : "https://tiles.openfreemap.org/styles/dark";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl sm:max-w-5xl bg-background/95 border border-border/60 shadow-2xl shadow-primary/5 backdrop-blur-xl max-h-[90vh] overflow-y-auto scrollbar-thin select-none p-6">
        <DialogHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30 glow-cyan">
            <CameraIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <DialogTitle className="text-lg font-extrabold tracking-wide text-foreground uppercase">
              {mode === "edit"
                ? `Cập Nhật Camera ${camera?.id}`
                : "Thêm Camera Giám Sát Mới"}
            </DialogTitle>
            <span className="text-xs text-muted-foreground font-mono mt-0.5">
              {mode === "edit"
                ? `ID: ${camera?.id} | CẤU HÌNH HỆ THỐNG`
                : "THIẾT LẬP CAMERA MỚI VÀO CƠ SỞ DỮ LIỆU GIS"}
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-4 text-left">
              {/* Camera Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CameraIcon className="w-3.5 h-3.5 text-primary" />
                  <span>Tên Thiết Bị</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên camera..."
                  className={`h-10 text-sm bg-muted/20 border-border/40 focus-visible:ring-primary focus-visible:bg-muted/10 transition-all ${
                    errors.name
                      ? "border-red-500/50 focus-visible:ring-red-500 bg-red-500/5"
                      : ""
                  }`}
                />
                {errors.name && (
                  <span className="text-[10px] text-red-500 font-mono flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </span>
                )}
              </div>

              {/* Grid 2-cols: Type & Resolution */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-primary" />
                    <span>Loại Thiết Bị</span>
                  </label>
                  <Select
                    value={type}
                    onValueChange={(val) =>
                      setType(val as "PTZ" | "Fixed" | "Dome")
                    }
                  >
                    <SelectTrigger className="h-10 text-sm bg-muted/20 border-border/40 font-mono focus:ring-primary">
                      <SelectValue placeholder="Loại" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border/60">
                      <SelectItem value="PTZ">PTZ (Xoay)</SelectItem>
                      <SelectItem value="Fixed">Fixed (Cố định)</SelectItem>
                      <SelectItem value="Dome">Dome (Bán cầu)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-primary" />
                    <span>Độ Phân Giải</span>
                  </label>
                  <Select
                    value={resolution}
                    onValueChange={(val) =>
                      setResolution(val as "4K" | "2K" | "1080p")
                    }
                  >
                    <SelectTrigger className="h-10 text-sm bg-muted/20 border-border/40 font-mono focus:ring-primary">
                      <SelectValue placeholder="Độ phân giải" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border/60">
                      <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                      <SelectItem value="2K">2K (Quad HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grid 2-cols: Status & Zone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <span>Trạng Thái</span>
                  </label>
                  <Select
                    value={status}
                    onValueChange={(val) =>
                      setStatus(val as "online" | "offline" | "maintenance")
                    }
                  >
                    <SelectTrigger className="h-10 text-sm bg-muted/20 border-border/40 font-mono focus:ring-primary">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border/60">
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="maintenance">Bảo Trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-primary" />
                    <span>Quận / Huyện</span>
                  </label>
                  <Select value={zone} onValueChange={setZone}>
                    <SelectTrigger className="h-10 text-sm bg-muted/20 border-border/40 font-mono focus:ring-primary">
                      <SelectValue placeholder="Quận" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border/60">
                      <SelectItem value="Hải Châu">Hải Châu</SelectItem>
                      <SelectItem value="Thanh Khê">Thanh Khê</SelectItem>
                      <SelectItem value="Sơn Trà">Sơn Trà</SelectItem>
                      <SelectItem value="Ngũ Hành Sơn">Ngũ Hành Sơn</SelectItem>
                      <SelectItem value="Liên Chiểu">Liên Chiểu</SelectItem>
                      <SelectItem value="Cẩm Lệ">Cẩm Lệ</SelectItem>
                      <SelectItem value="Hòa Vang">Hòa Vang</SelectItem>
                      <SelectItem value="Hội An">Hội An</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Area Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Vị Trí Chi Tiết (Địa Chỉ)</span>
                </label>
                <Input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ví dụ: 120 Bạch Đằng, Q. Hải Châu, Đà Nẵng..."
                  className={`h-10 text-sm bg-muted/20 border-border/40 focus-visible:ring-primary focus-visible:bg-muted/10 transition-all ${
                    errors.area
                      ? "border-red-500/50 focus-visible:ring-red-500 bg-red-500/5"
                      : ""
                  }`}
                />
                {errors.area && (
                  <span className="text-[10px] text-red-500 font-mono flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.area}
                  </span>
                )}
              </div>

              {/* Stream URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-primary" />
                  <span>Đường Dẫn Luồng Video (Stream URL)</span>
                </label>
                <Input
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="Ví dụ: https://example.com/stream.mp4 hoặc .m3u8"
                  className="h-10 text-sm bg-muted/20 border-border/40 focus-visible:ring-primary focus-visible:bg-muted/10 transition-all font-mono"
                />
              </div>

              {/* Coordinates Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-primary" />
                    <span>Kinh Độ (Lng)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className={`h-10 text-sm bg-muted/20 border-border/40 focus-visible:ring-primary ${
                      errors.lng
                        ? "border-red-500/50 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.lng && (
                    <span className="text-[9px] text-red-500 font-mono block mt-0.5">
                      {errors.lng}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-primary" />
                    <span>Vĩ Độ (Lat)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className={`h-10 text-sm bg-muted/20 border-border/40 focus-visible:ring-primary ${
                      errors.lat
                        ? "border-red-500/50 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.lat && (
                    <span className="text-[9px] text-red-500 font-mono block mt-0.5">
                      {errors.lat}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Mini Map Preview */}
            <div className="lg:col-span-5 flex flex-col space-y-3 text-left">
              <label className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Bản Đồ Định Vị (Click để chọn)</span>
              </label>

              {/* Mini Map Wrapper with corner lines */}
              <div className="relative flex-1 min-h-[340px] rounded-lg overflow-hidden border border-border/40 bg-muted/10 shadow-inner group/map">
                {/* Tech Bracket Corners */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/60 z-20 pointer-events-none rounded-tl-sm transition-all group-hover/map:border-primary"></div>
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary/60 z-20 pointer-events-none rounded-tr-sm transition-all group-hover/map:border-primary"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary/60 z-20 pointer-events-none rounded-bl-sm transition-all group-hover/map:border-primary"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary/60 z-20 pointer-events-none rounded-br-sm transition-all group-hover/map:border-primary"></div>

                {/* Coordinates Watermark Overlay */}
                <div className="absolute top-4 left-4 z-10 font-mono text-[9px] bg-background/80 border border-border/30 px-2 py-1 rounded backdrop-blur-xs text-muted-foreground select-none pointer-events-none">
                  GPS: {lng.toFixed(5)}, {lat.toFixed(5)}
                </div>

                <Map
                  id="mini-map-form"
                  ref={mapRef}
                  initialViewState={{
                    longitude: lng,
                    latitude: lat,
                    zoom: 13,
                  }}
                  mapLib={maplibregl}
                  mapStyle={mapStyle}
                  onClick={handleMapClick}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Marker longitude={lng} latitude={lat} anchor="center">
                    <div className="relative flex h-8 w-8 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                      <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-primary border-2 border-background shadow-lg shadow-primary/30"></span>
                    </div>
                  </Marker>
                </Map>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono text-center">
                MÚI CHIẾU: WGS-84 (LNG: {lng.toFixed(5)} / LAT: {lat.toFixed(5)}
                )
              </span>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-border/30 mt-6 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 font-bold bg-muted/20 border-border/40 cursor-pointer hover:bg-muted/40 transition-all font-mono text-xs tracking-wider"
            >
              HỦY BỎ
            </Button>
            <Button
              type="submit"
              className="h-10 px-6 font-bold cursor-pointer transition-all bg-primary hover:bg-primary/95 text-primary-foreground font-mono text-xs tracking-wider shadow-lg shadow-primary/25 glow-cyan"
            >
              {mode === "edit" ? "LƯU THAY ĐỔI" : "LƯU CAMERA"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default CameraFormDialog;
