import { useEffect, useState } from 'react'
import { X, Wifi, Settings, HardDrive, Clock, AlertOctagon, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMapStore } from '@/stores/useMapStore'

export function BottomSheet() {
  const { selectedCamera, setSelectedCamera, bottomSheetOpen, setBottomSheetOpen } = useMapStore()
  const [streamActive, setStreamActive] = useState(true)
  const [notes, setNotes] = useState('')
  const [fps, setFps] = useState(30)

  // Fluctuating FPS simulation in effect (pure render compliance)
  useEffect(() => {
    if (streamActive && selectedCamera) {
      const interval = setInterval(() => {
        setFps(29 + Math.floor(Math.random() * 2))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [streamActive, selectedCamera])

  // States are reset automatically on camera selection change via the component key prop in App.tsx

  if (!bottomSheetOpen || !selectedCamera) return null

  const handleClose = () => {
    setSelectedCamera(null)
    setBottomSheetOpen(false)
  }

  // Camera status label definitions
  const statusLabels = {
    online: { text: 'HOẠT ĐỘNG (ONLINE)', variant: 'outline' as const, class: 'bg-green-500/10 text-green-400 border-green-500/20' },
    offline: { text: 'MẤT TÍN HIỆU (OFFLINE)', variant: 'destructive' as const, class: 'bg-red-500/10 text-red-400 border-red-500/20' },
    maintenance: { text: 'ĐANG BẢO TRÌ', variant: 'outline' as const, class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  }

  const currentStatus = statusLabels[selectedCamera.status]

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 md:left-6 md:right-6 max-h-[350px] bg-card/90 border border-border/60 rounded-xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-[slide-up_0.3s_ease-out] select-none text-left">
      {/* Header bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <Badge className={`font-mono text-[9px] ${currentStatus.class}`}>
            {selectedCamera.id}
          </Badge>
          <h3 className="font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-[400px]">
            {selectedCamera.name}
          </h3>
        </div>
        <button 
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full p-1 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main panel layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left Side: Live Feed simulator */}
        <div className="w-full md:w-[350px] p-4 flex flex-col border-b md:border-b-0 md:border-r border-border/30 shrink-0 bg-background/30">
          <div className="relative aspect-video w-full bg-black border border-border/60 rounded-md overflow-hidden flex items-center justify-center select-none">
            {/* Visual Background (Fake street vs offline cctv screen) */}
            {streamActive && selectedCamera.status === 'online' ? (
              <img 
                src="/cctv_active.png" 
                alt="CCTV Active Feed" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            ) : (
              <img 
                src="/cctv_inactive.png" 
                alt="CCTV Inactive Feed" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}

            {/* CRT overlay scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-10" />

            {streamActive && selectedCamera.status === 'online' ? (
              <>
                {/* Simulated active telemetry screen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/10 via-transparent to-blue-950/10 animate-pulse" />
                
                {/* 4 Corners HUD Telemetry */}
                <div className="absolute top-2 left-2 flex flex-col gap-0.5 font-mono text-[8px] text-green-400 z-10 bg-black/60 px-1.5 py-0.5 rounded border border-green-500/20">
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-2.5 h-2.5 animate-pulse" />
                    <span>LIVE // {selectedCamera.resolution} FEED</span>
                  </div>
                  <span className="text-[7px] text-green-500/70 border-t border-green-500/10 pt-0.5 mt-0.5">STREAM BUFFER ACTIVE</span>
                </div>
                
                <div className="absolute top-2 right-2 flex items-center gap-1.5 font-mono text-[8px] text-green-400 z-10 bg-black/60 px-1.5 py-0.5 rounded border border-green-500/20">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span>FPS: {fps} // 4.8MB/S</span>
                </div>

                <div className="absolute bottom-2 left-2 font-mono text-[8px] text-muted-foreground z-10 bg-black/60 px-1.5 py-0.5 rounded">
                  {selectedCamera.id} // {selectedCamera.type}
                </div>
                
                <div className="absolute bottom-2 right-2 font-mono text-[8px] text-green-400 z-10 bg-black/60 px-1.5 py-0.5 rounded animate-pulse">
                  REC ●
                </div>
              </>
            ) : selectedCamera.status === 'maintenance' ? (
              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-4 z-10 backdrop-blur-[1px]">
                <Settings className="w-8 h-8 text-amber-500 mb-2 animate-spin-slow" />
                <span className="text-xs text-amber-400 font-bold font-mono uppercase tracking-wider">
                  BẢO TRÌ ĐỊNH KỲ
                </span>
                <span className="text-[10px] text-slate-300 mt-1.5 text-center leading-relaxed">
                  Kênh truyền tạm ngắt kết nối phục vụ nâng cấp phần cứng.
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center p-4 z-10 backdrop-blur-[1px]">
                <AlertOctagon className="w-8 h-8 text-red-500 mb-2 animate-pulse" />
                <span className="text-xs text-red-400 font-bold font-mono uppercase tracking-wider">
                  MẤT TÍN HIỆU CAMERA
                </span>
                <span className="text-[10px] text-slate-300 mt-1.5 text-center leading-relaxed">
                  Lỗi kết nối hoặc mất nguồn cấp. Kiểm tra trạm thu gần nhất.
                </span>
              </div>
            )}
          </div>

          {/* Stream controls */}
          {selectedCamera.status === 'online' && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-[10px] h-7 cursor-pointer"
                onClick={() => setStreamActive(!streamActive)}
              >
                {streamActive ? 'DỪNG KÊNH' : 'PHÁT LIVE'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-[10px] h-7 cursor-pointer"
                onClick={() => {
                  setStreamActive(false)
                  setTimeout(() => setStreamActive(true), 500)
                }}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Right Side: Tab details */}
        <div className="flex-1 min-w-0 p-4">
          <Tabs defaultValue="info" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-muted/40 h-8 p-0.5 rounded-md border border-border/30">
              <TabsTrigger value="info" className="text-[10px] h-7 cursor-pointer">Thông Số Kỹ Thuật</TabsTrigger>
              <TabsTrigger value="location" className="text-[10px] h-7 cursor-pointer">Vị Trí & Phủ Sóng</TabsTrigger>
              <TabsTrigger value="notes" className="text-[10px] h-7 cursor-pointer">Cảnh Báo & Ghi Chú</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 min-h-0 pt-3">
              {/* Tab 1: Info */}
              <TabsContent value="info" className="m-0 h-full">
                <ScrollArea className="h-[210px] pr-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <Card className="bg-muted/10 border-border/30 p-2.5 rounded-lg">
                      <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">
                        Loại Thiết Bị
                      </div>
                      <span className="font-bold text-foreground">{selectedCamera.type} CAMERA</span>
                    </Card>

                    <Card className="bg-muted/10 border-border/30 p-2.5 rounded-lg">
                      <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">
                        Độ phân giải
                      </div>
                      <span className="font-bold text-foreground">{selectedCamera.resolution} CONTRAST</span>
                    </Card>

                    <Card className="bg-muted/10 border-border/30 p-2.5 rounded-lg col-span-2">
                      <div className="text-[10px] text-muted-foreground uppercase font-mono mb-1">
                        Khu Vực Địa Lý
                      </div>
                      <span className="font-bold text-foreground">{selectedCamera.area}</span>
                    </Card>

                    <div className="col-span-2 grid grid-cols-2 gap-2 mt-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Cập nhật lần cuối:</span>
                      </div>
                      <span className="font-mono text-right text-foreground">
                        {new Date(selectedCamera.lastSeen).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <HardDrive className="w-3.5 h-3.5 text-primary" />
                        <span>Trạm Lưu Trữ Gần Nhất:</span>
                      </div>
                      <span className="font-mono text-right text-foreground font-bold">
                        SAN-NVR-{selectedCamera.zone.substring(0, 3).toUpperCase()}-01
                      </span>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Tab 2: Location */}
              <TabsContent value="location" className="m-0 h-full">
                <ScrollArea className="h-[210px] pr-2">
                  <div className="flex flex-col gap-3.5 text-xs font-mono">
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Kinh độ (Longitude):</span>
                      <span className="font-bold text-foreground">{selectedCamera.lng.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Vĩ độ (Latitude):</span>
                      <span className="font-bold text-foreground">{selectedCamera.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Vùng quản lý:</span>
                      <span className="font-bold text-primary">Quận {selectedCamera.zone}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/20 pb-1.5">
                      <span className="text-muted-foreground">Phạm vi quét tối đa:</span>
                      <span className="font-bold text-foreground">150 mét</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Góc quan sát ngang:</span>
                      <span className="font-bold text-foreground">{selectedCamera.type === 'PTZ' ? '360° (Hỗ trợ xoay)' : '95° (Cố định)'}</span>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Tab 3: Notes & Action */}
              <TabsContent value="notes" className="m-0 h-full flex flex-col">
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                  <textarea
                    className="flex-1 w-full bg-muted/20 border border-border/40 rounded p-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 font-mono resize-none focus:outline-none focus:border-primary/50"
                    placeholder="Nhập ghi chú điều phối cho thiết bị này..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground font-bold hover:bg-primary/95 text-[10px] h-7 px-3.5 cursor-pointer"
                      onClick={() => {
                        alert(`Ghi chú cho ${selectedCamera.id} đã được cập nhật hệ thống!`)
                        setNotes('')
                      }}
                    >
                      LƯU BÁO CÁO
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
