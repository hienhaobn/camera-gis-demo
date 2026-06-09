import { useMemo, useState, useEffect, memo } from 'react';
import { AlertOctagon, Settings, Wifi } from 'lucide-react';
import type { Camera } from '../../data/cameras';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

interface CameraFeedCellProps {
  camera: Camera;
  onClick: (camera: Camera) => void;
}

export const CameraFeedCell = memo(function CameraFeedCell({
  camera,
  onClick,
}: CameraFeedCellProps) {
  const { id, name, status, resolution, streamUrl } = camera;

  // Format last seen timestamp for offline/maintenance cameras
  const formattedLastSeen = useMemo(() => {
    if (!camera.lastSeen) return '';
    try {
      const date = new Date(camera.lastSeen);
      const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      return `${timeStr} ${dateStr}`;
    } catch {
      return '';
    }
  }, [camera.lastSeen]);

  // Dynamic CCTV running clock
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    if (status !== 'online') return;
    const updateTime = () => {
      const date = new Date();
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const timeStr = date.toLocaleTimeString('vi-VN', { hour12: false });
      setCurrentTime(`${yyyy}-${mm}-${dd} ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Stable pseudo-random base FPS
  const stableFPS = useMemo(() => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 28.5 + (sum % 1.5);
  }, [id]);

  // Fluctuating FPS simulation
  const [fps, setFps] = useState(stableFPS);
  useEffect(() => {
    if (status !== 'online') return;
    const timer = setInterval(() => {
      setFps(stableFPS + (Math.random() * 0.6 - 0.3));
    }, 800 + Math.random() * 600);
    return () => clearInterval(timer);
  }, [status, stableFPS]);

  // Pan and scan animation class selection
  const panClass = useMemo(() => {
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = (sum % 3) + 1;
    return `animate-cctv-pan-${index}`;
  }, [id]);

  // AI Bounding Box target configuration
  const aiBoxConfig = useMemo(() => {
    if (status !== 'online') return null;
    const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const typeIndex = sum % 3;
    const animIndex = (sum % 3) + 1;
    const label = typeIndex === 0 ? 'CAR' : typeIndex === 1 ? 'PERSON' : 'TRUCK';
    const confidence = (90 + (sum % 10)).toFixed(0);
    return { label, confidence, animClass: `animate-ai-target-${animIndex}` };
  }, [id, status]);

  return (
    <div
      onClick={() => onClick(camera)}
      className="relative aspect-video rounded-md overflow-hidden bg-black/40 border border-border/40 hover:border-primary/60 hover:shadow-[0_0_12px_rgba(0,212,255,0.25)] transition-all duration-300 group cursor-pointer select-none"
      data-testid="camera-feed-cell"
      data-status={status}
    >
      {/* CCTV Feed Image */}
      {status === 'online' ? (
        streamUrl ? (
          <VideoPlayer src={streamUrl} name={name} panClass={panClass} />
        ) : (
          <img
            src="/cctv_active.png"
            alt={`CCTV active stream for ${name}`}
            className={`absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-110 transition-transform duration-700 ${panClass}`}
            loading="lazy"
          />
        )
      ) : (
        <img
          src="/cctv_inactive.png"
          alt={`CCTV inactive stream for ${name}`}
          className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale"
          loading="lazy"
        />
      )}

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-25 z-10" />

      {/* CCTV Horizontal Sweep Line */}
      {status === 'online' && (
        <div className="absolute left-0 w-full h-[2px] bg-white/10 shadow-[0_0_6px_rgba(255,255,255,0.2)] pointer-events-none z-10 animate-sweep-line" />
      )}

      {/* AI Bounding Box overlay */}
      {status === 'online' && aiBoxConfig && (
        <div
          className={`absolute border border-green-500/60 bg-green-500/5 text-green-400 font-mono text-[7px] pointer-events-none rounded select-none shadow-[0_0_4px_rgba(34,197,94,0.3)] z-10 ${aiBoxConfig.animClass}`}
          style={{ animationIterationCount: 'infinite' }}
        >
          <div className="absolute top-0 left-0 -translate-y-full bg-green-500/85 text-[6px] text-white px-1 py-0.5 rounded-t leading-none font-bold whitespace-nowrap">
            {aiBoxConfig.label}: {aiBoxConfig.confidence}%
          </div>
        </div>
      )}

      {/* Top Left: ID & Status Dot */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1.5 font-mono text-[9px] font-bold text-white z-10 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === 'online'
                ? 'bg-green-400'
                : status === 'offline'
                ? 'bg-red-400'
                : 'bg-amber-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              status === 'online'
                ? 'bg-green-500'
                : status === 'offline'
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`}
          />
        </span>
        <span>{id}</span>
      </div>

      {/* Top Right: Status Badge & Live Indicator */}
      <div className="absolute top-1.5 right-1.5 font-mono text-[8px] z-10 flex flex-col items-end gap-1">
        {status === 'online' ? (
          <>
            <div className="flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded animate-pulse">
              <Wifi className="w-2.5 h-2.5" />
              <span>LIVE {resolution}</span>
            </div>
            <div className="font-mono text-[7px] text-white/90 bg-black/65 px-1 py-0.5 rounded border border-white/10 select-none pointer-events-none mt-0.5">
              {currentTime}
            </div>
          </>
        ) : status === 'offline' ? (
          <div className="flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
            <span>OFFLINE</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
            <span>BẢO TRÌ</span>
          </div>
        )}
      </div>

      {/* Center Screen Overlays (Offline or Maintenance status details) */}
      {status === 'offline' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-red-500/70 z-10 pointer-events-none">
          <AlertOctagon className="w-6 h-6 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest bg-black/45 px-2 py-0.5 rounded border border-red-500/10">
            LOSS OF SIGNAL
          </span>
        </div>
      )}

      {status === 'maintenance' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-amber-500/70 z-10 pointer-events-none">
          <Settings className="w-6 h-6 animate-spin-slow" style={{ animationDuration: '6s' }} />
          <span className="text-[10px] font-mono font-bold tracking-widest bg-black/45 px-2 py-0.5 rounded border border-amber-500/10">
            MAINTENANCE
          </span>
        </div>
      )}

      {status === 'online' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/5 via-transparent to-blue-950/5 pointer-events-none" />
      )}

      {/* Bottom Left: Camera Name */}
      <div className="absolute bottom-1.5 left-1.5 font-mono text-[9px] text-muted-foreground z-10 bg-black/60 px-1.5 py-0.5 rounded border border-white/5 truncate max-w-[70%]">
        {name}
      </div>

      {/* Bottom Right: FPS or Last Seen timestamp */}
      <div className="absolute bottom-1.5 right-1.5 font-mono text-[9px] z-10">
        {status === 'online' ? (
          <span className="text-green-400 bg-black/60 px-1.5 py-0.5 rounded border border-green-500/10">
            FPS: {fps.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground bg-black/60 px-1.5 py-0.5 rounded border border-white/5">
            LST: {formattedLastSeen}
          </span>
        )}
      </div>

      {/* Futuristic corner frame lines (HUD style) */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/10 group-hover:border-primary/60 transition-colors pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/10 group-hover:border-primary/60 transition-colors pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/10 group-hover:border-primary/60 transition-colors pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/10 group-hover:border-primary/60 transition-colors pointer-events-none" />
    </div>
  );
});
