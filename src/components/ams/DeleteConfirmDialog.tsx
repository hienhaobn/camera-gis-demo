import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cameraName: string;
  cameraId: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  cameraName,
  cameraId,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border/60 backdrop-blur-xl">
        <DialogHeader className="gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <DialogTitle className="text-base font-bold text-red-500">Xác Nhận Xóa Camera</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Bạn có chắc chắn muốn xóa camera dưới đây khỏi hệ thống? Hành động này sẽ gỡ camera khỏi bản đồ và tường giám sát vĩnh viễn.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Camera Info Card */}
        <div className="p-3 bg-muted/30 border border-border/40 rounded-md font-mono text-xs flex flex-col gap-1 text-left">
          <div>
            <span className="text-muted-foreground">ID CAMERA:</span>{' '}
            <span className="font-bold text-primary">{cameraId}</span>
          </div>
          <div>
            <span className="text-muted-foreground">TÊN THIẾT BỊ:</span>{' '}
            <span className="font-bold text-foreground">{cameraName}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 font-bold bg-muted/20 border-border/40 cursor-pointer">
            HỦY BỎ
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="h-9 font-bold cursor-pointer"
          >
            XÓA CAMERA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default DeleteConfirmDialog;
