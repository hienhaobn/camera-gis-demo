import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/stores/useMapStore";
import type { DrawShape } from "@/stores/useMapStore";

interface DrawHUDProps {
  drawingPoints: [number, number][];
  setDrawingPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
  handleCompleteDrawing: () => void;
}

export function DrawHUD({
  drawingPoints,
  setDrawingPoints,
  handleCompleteDrawing,
}: DrawHUDProps) {
  const { drawShape, setDrawShape } = useMapStore();

  return (
    <Card className="absolute top-4 right-4 z-10 w-64 bg-card/85 backdrop-blur-md border border-border/50 select-none shadow-xl">
      <CardContent className="p-3.5 flex flex-col gap-2.5 text-left">
        <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
          CÔNG CỤ VẼ BẢN ĐỒ
        </span>
        <div className="flex flex-col gap-2 border-t border-border/40 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Hình dạng:</span>
            <Select
              value={drawShape || "polygon"}
              onValueChange={(val) => setDrawShape(val as DrawShape)}
            >
              <SelectTrigger className="h-7 w-28 text-xs bg-muted/30 border-border">
                <SelectValue placeholder="Shape" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="line">LineString</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {drawingPoints.length > 0 && (
            <div className="text-[10px] font-mono text-primary/80 mt-1 bg-primary/5 p-1.5 border border-primary/10 rounded">
              Đã vẽ {drawingPoints.length} điểm
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-border/40 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
            onClick={() => setDrawingPoints([])}
            disabled={drawingPoints.length === 0}
          >
            Hủy Vẽ
          </Button>
          <Button
            size="sm"
            className="flex-1 text-[10px] h-7 cursor-pointer bg-primary text-primary-foreground font-bold hover:bg-primary/95"
            onClick={handleCompleteDrawing}
            disabled={
              drawingPoints.length < (drawShape === "polygon" ? 3 : 2)
            }
          >
            Xác Nhận
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
