import { useMemo } from "react";
import * as turf from "@turf/turf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/stores/useMapStore";

interface RouteHUDProps {
  routeStart: [number, number] | null;
  routeEnd: [number, number] | null;
  routeStep: "start" | "end" | "done";
  handleClearRoute: () => void;
}

export function RouteHUD({
  routeStart,
  routeEnd,
  routeStep,
  handleClearRoute,
}: RouteHUDProps) {
  const { setActiveTool } = useMapStore();

  const routeDistance = useMemo(() => {
    if (!routeStart || !routeEnd) return 0;
    const line = turf.lineString([routeStart, routeEnd]);
    return turf.length(line, { units: "kilometers" });
  }, [routeStart, routeEnd]);

  return (
    <Card className="absolute top-4 right-4 z-10 w-64 bg-card/85 backdrop-blur-md border border-border/50 select-none shadow-xl">
      <CardContent className="p-3.5 flex flex-col gap-2.5 text-left">
        <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
          BỘ ĐIỀU HƯỚNG / TÌM ĐƯỜNG
        </span>

        <div className="flex flex-col gap-2 border-t border-border/40 pt-2 font-mono text-xs">
          <div className="flex items-center gap-2 justify-between">
            <span className="text-muted-foreground">Điểm đầu:</span>
            <span className="font-bold truncate max-w-[120px] text-green-400">
              {routeStart ? "Đã ghim (Click Map)" : "Chưa đặt"}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            <span className="text-muted-foreground">Điểm cuối:</span>
            <span className="font-bold truncate max-w-[120px] text-red-400">
              {routeEnd ? "Đã ghim (Click Map)" : "Chưa đặt"}
            </span>
          </div>

          {routeStep === "start" && (
            <div className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 p-1.5 rounded text-center mt-1 animate-pulse">
              Click bản đồ để chọn điểm BẮT ĐẦU
            </div>
          )}
          {routeStep === "end" && (
            <div className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 p-1.5 rounded text-center mt-1 animate-pulse">
              Click bản đồ để chọn điểm KẾT THÚC
            </div>
          )}

          {routeStep === "done" && (
            <div className="mt-1 border-t border-border/40 pt-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Độ dài tuyến:</span>
                <span className="font-bold text-primary">
                  {routeDistance.toFixed(2)} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Thời gian ước tính:
                </span>
                <span className="font-bold text-foreground">
                  {Math.ceil(routeDistance * 1.5)} phút
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-border/40 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
            onClick={handleClearRoute}
          >
            Xóa Lộ Trình
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
            onClick={() => setActiveTool(null)}
          >
            Đóng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
