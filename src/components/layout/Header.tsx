import { useEffect, useState } from 'react'
import { Bell, ShieldAlert, AlertOctagon, Maximize2, Minimize2, Video, Sun, Moon } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useMapStore } from '@/stores/useMapStore'
import { cameras } from '@/data/cameras'

export function Header() {
  const [time, setTime] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { setStatusFilter, setSelectedCamera, theme, toggleTheme } = useMapStore()

  // Realtime clock
  useEffect(() => {
    const updateTime = () => {
      const date = new Date()
      const timeStr = date.toLocaleTimeString('vi-VN', { hour12: false })
      const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      setTime(`${timeStr} | ${dateStr}`)
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }

  // Count camera statuses
  const total = cameras.length
  const online = cameras.filter(c => c.status === 'online').length
  const offline = cameras.filter(c => c.status === 'offline').length
  const maintenance = cameras.filter(c => c.status === 'maintenance').length

  // Simulated alarms list
  const [alarms, setAlarms] = useState([
    { id: 1, camId: 'CAM-012', title: 'Phát hiện xâm nhập', location: 'Đường Bạch Đằng', time: '10:50', priority: 'high' },
    { id: 2, camId: 'CAM-045', title: 'Mất tín hiệu camera', location: 'Cầu Thuận Phước', time: '10:48', priority: 'critical' },
    { id: 3, camId: 'CAM-110', title: 'Phát hiện đỗ xe sai quy định', location: 'Đường Võ Nguyên Giáp', time: '10:42', priority: 'medium' },
  ])

  const handleAlarmClick = (camId: string) => {
    const cam = cameras.find(c => c.id === camId)
    if (cam) {
      setSelectedCamera(cam)
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-4 bg-card/85 backdrop-blur-xl border-b border-border/50 z-10 select-none">
      {/* Left side: Sidebar Trigger & Brand Title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-9 w-9 bg-muted/50 hover:bg-muted text-foreground rounded cursor-pointer border border-border/30" />
        <div className="h-5 w-[1px] bg-border/50" />
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <h2 className="text-base font-bold tracking-wider text-glow-cyan text-primary hidden sm:block">
            GIS SURVEILLANCE
          </h2>
          <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-1.5 py-0.5 rounded uppercase font-mono hidden md:block">
            DEMO HUD
          </span>
        </div>
      </div>

      {/* Middle: Stats Badges (Clicking triggers status filter) */}
      <div className="hidden lg:flex items-center gap-3 font-mono text-[11px]">
        <button 
          onClick={() => setStatusFilter('all')}
          className="flex items-center gap-1.5 bg-muted/40 border border-border/50 hover:bg-muted/80 rounded px-2.5 py-1 text-muted-foreground transition-all cursor-pointer"
        >
          <Video className="w-3.5 h-3.5" />
          <span>TỔNG:</span>
          <span className="font-bold text-foreground">{total}</span>
        </button>

        <button 
          onClick={() => setStatusFilter('online')}
          className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 rounded px-2.5 py-1 text-green-400 transition-all cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>ONLINE:</span>
          <span className="font-bold">{online}</span>
        </button>

        <button 
          onClick={() => setStatusFilter('offline')}
          className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded px-2.5 py-1 text-red-400 transition-all cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>OFFLINE:</span>
          <span className="font-bold">{offline}</span>
        </button>

        <button 
          onClick={() => setStatusFilter('maintenance')}
          className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded px-2.5 py-1 text-amber-400 transition-all cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>BẢO TRÌ:</span>
          <span className="font-bold">{maintenance}</span>
        </button>
      </div>

      {/* Right side: Time, Alarm Bell, Fullscreen */}
      <div className="flex items-center gap-3">
        {/* Realtime clock */}
        <div className="text-[11px] md:text-xs font-mono font-bold text-muted-foreground bg-muted/30 border border-border/30 rounded-md px-3 py-1.5 hidden md:block">
          {time}
        </div>

        {/* Alarm dropdown notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              data-testid="alarm-bell"
              aria-label="Thông báo"
              className="relative cursor-pointer border-border/40 hover:bg-muted"
            >
              <Bell className="w-4 h-4 text-foreground" />
              {alarms.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white font-mono animate-bounce">
                  {alarms.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] bg-card border-border/60 backdrop-blur-xl">
            <DropdownMenuLabel className="flex items-center gap-2 text-red-400 font-mono text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>CẢNH BÁO HỆ THỐNG REAL-TIME</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/40" />
            
            {alarms.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Không có cảnh báo hoạt động
              </div>
            ) : (
              alarms.map((alarm) => (
                <DropdownMenuItem
                  key={alarm.id}
                  onClick={() => handleAlarmClick(alarm.camId)}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer border-b border-border/20 last:border-b-0 hover:bg-muted/50"
                >
                  <div className="flex justify-between w-full text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <AlertOctagon className={`w-3.5 h-3.5 ${alarm.priority === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                      {alarm.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{alarm.time}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Node: <span className="font-mono text-primary font-bold">{alarm.camId}</span> | Vị trí: {alarm.location}
                  </div>
                </DropdownMenuItem>
              ))
            )}
            
            {alarms.length > 0 && (
              <>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem 
                  onClick={() => setAlarms([])}
                  className="w-full text-center text-[10px] text-muted-foreground cursor-pointer hover:text-foreground py-2 justify-center"
                >
                  XÓA TẤT CẢ CẢNH BÁO
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <Button 
          variant="outline" 
          size="icon" 
          data-testid="theme-toggle"
          aria-label="Chuyển chế độ sáng/tối"
          onClick={toggleTheme}
          className="cursor-pointer border-border/40 hover:bg-muted"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </Button>

        {/* Fullscreen Toggle */}
        <Button 
          variant="outline" 
          size="icon" 
          data-testid="fullscreen-toggle"
          aria-label="Toàn màn hình"
          onClick={toggleFullscreen}
          className="cursor-pointer border-border/40 hover:bg-muted"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  )
}
