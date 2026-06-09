import { useMemo } from "react";
import * as turf from "@turf/turf";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/stores/useMapStore";

export function MeasureHUD() {
  const { measurePoints, clearMeasurePoints, setActiveTool } = useMapStore();

  const measureDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    const line = turf.lineString(measurePoints);
    return turf.length(line, { units: "kilometers" });
  }, [measurePoints]);

  if (measurePoints.length === 0) return null;

  return (
    <Card className="absolute top-4 right-4 z-10 w-64 bg-card/85 backdrop-blur-md border border-border/50 select-none shadow-xl">
      <CardContent className="p-3.5 flex flex-col gap-2.5 text-left">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
            THỐNG KÊ ĐO KHOẢNG CÁCH
          </span>
          <Badge
            variant="outline"
            className="font-mono text-[10px] text-primary border-primary/20 bg-primary/5"
          >
            {measurePoints.length} Points
          </Badge>
        </div>
        <div className="flex flex-col gap-1 border-t border-border/40 pt-2 font-mono">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">KHOẢNG CÁCH:</span>
            <span className="text-primary font-bold">
              {measureDistance < 1
                ? `${(measureDistance * 1000).toFixed(1)} m`
                : `${measureDistance.toFixed(2)} km`}
            </span>
          </div>
        </div>
        <div className="flex gap-2 border-t border-border/40 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
            onClick={clearMeasurePoints}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
            onClick={() => setActiveTool(null)}
          >
            Hoàn Thành
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
