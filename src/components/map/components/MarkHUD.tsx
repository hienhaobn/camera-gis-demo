import { Card, CardContent } from "@/components/ui/card";

export function MarkHUD() {
  return (
    <Card className="absolute top-4 right-4 z-10 w-64 bg-card/85 backdrop-blur-md border border-border/50 select-none shadow-xl">
      <CardContent className="p-3.5 text-left flex flex-col gap-2">
        <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
          CÔNG CỤ ĐÁNH DẤU
        </span>
        <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 leading-relaxed">
          Click vào một địa điểm bất kỳ trên bản đồ để đặt trạm/chốt mới.
        </p>
      </CardContent>
    </Card>
  );
}
