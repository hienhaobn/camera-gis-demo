import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onFinished: () => void;
}

const logs = [
  'CONNECTING TO CENTRAL GIS SERVER...',
  'DATANANG OSM OVERLAY TILES LOADED [OK]',
  'INITIALIZING CAMERA PROTOCOLS...',
  'SYNCING PTZ & FIXED NODE STATIONS...',
  'RESOLVING FIBER OPTIC PATH ROUTINGS...',
  'MAPPING 200 CAMERA NODES TO GEOGRAPHIC COORDS...',
  'CALCULATING SECURE ZONE POLYGONS...',
  'ESTABLISHING COMMAND CENTER HUD INTEGRATION...',
  'DECRYPTING VIDEO FEED BUFFER PREVIEWS...',
  'SYSTEM READY. ENABLING HUD...',
]

export function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  const logIndex = Math.min(
    logs.length - 1,
    Math.floor((progress / 100) * logs.length)
  )

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1
      })
    }, 20)

    return () => clearInterval(progressInterval)
  }, [])

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        setVisible(false)
        setTimeout(onFinished, 500) // Wait for fade out animation
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [progress, onFinished])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 bg-[#070a10] z-[9999] flex flex-col items-center justify-center font-mono transition-opacity duration-500 ease-out select-none crt-flicker ${
        progress === 100 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Scanline CRT overlay */}
      <div className="scanlines" />

      {/* Hexagon / Shield outline container */}
      <div className="relative flex flex-col items-center p-8 border border-primary/20 bg-card/45 backdrop-blur-md rounded-2xl w-[90%] max-w-[550px] overflow-hidden">
        {/* Glow corner elements */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

        {/* Animated Cyberpunk Radar/Scanner */}
        <div className="relative w-28 h-28 mb-6 rounded-full border border-primary/30 flex items-center justify-center">
          <div className="absolute inset-2 rounded-full border border-primary/10" />
          <div className="absolute inset-4 rounded-full border border-primary/5 border-dashed" />
          
          {/* Sweeping line */}
          <div className="absolute inset-0 rounded-full border-t-2 border-r border-primary/50 animate-[spin_3s_linear_infinite]" />
          
          {/* Central dot */}
          <div className="w-2.5 h-2.5 rounded-full bg-primary glow-cyan animate-pulse" />
          
          {/* Floating tiny dots (representing nodes) */}
          <div className="absolute top-6 left-8 w-1 h-1 rounded-full bg-primary/80 animate-ping" />
          <div className="absolute bottom-8 right-7 w-1 h-1 rounded-full bg-[#10b981]/60" />
          <div className="absolute top-12 right-6 w-1 h-1 rounded-full bg-[#ef4444]/60" />
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] text-primary text-glow-cyan glow-text-pulse mb-1 text-center">
          SYS_MONITOR_GIS
        </h1>
        <p className="text-xs text-muted-foreground tracking-[0.3em] uppercase mb-6">
          Vietnam Camera Surveillance HUD
        </p>

        {/* Log feed */}
        <div className="w-full h-20 bg-background/80 border border-border/80 rounded p-3 mb-6 overflow-hidden flex flex-col justify-end text-[10px] md:text-xs text-primary/70">
          <div className="text-muted-foreground/50 mb-1">
            &gt; SYSTEM_BOOT_SEQUENCE: v1.0.0
          </div>
          {logs.slice(0, logIndex + 1).map((log, index) => {
            const isLast = index === logIndex
            return (
              <div
                key={index}
                className={`${isLast ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
              >
                {isLast ? '&gt; ' : '  '} {log}
              </div>
            )
          })}
        </div>

        {/* Progress percent */}
        <div className="flex justify-between w-full text-xs text-muted-foreground mb-2">
          <span>INITIALIZING HUD CONNECTIONS</span>
          <span className="font-mono text-primary font-bold">{progress}%</span>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-primary glow-cyan transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Decorative background grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05)_0%,rgba(0,0,0,0)_80%)] pointer-events-none" />
    </div>
  )
}
