import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onFinished: () => void;
}

const logs = [
  "CONNECTING TO CENTRAL GIS SERVER...",
  "DATANANG OSM OVERLAY TILES LOADED [OK]",
  "INITIALIZING CAMERA PROTOCOLS...",
  "SYNCING PTZ & FIXED NODE STATIONS...",
  "RESOLVING FIBER OPTIC PATH ROUTINGS...",
  "MAPPING 200 CAMERA NODES TO GEOGRAPHIC COORDS...",
  "CALCULATING SECURE ZONE POLYGONS...",
  "ESTABLISHING COMMAND CENTER HUD INTEGRATION...",
  "DECRYPTING VIDEO FEED BUFFER PREVIEWS...",
  "SYSTEM READY. ENABLING HUD...",
];

export function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  const logIndex = Math.min(
    logs.length - 1,
    Math.floor((progress / 100) * logs.length),
  );

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        setVisible(false);
        setTimeout(onFinished, 500); // Wait for fade out animation
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onFinished]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 bg-[#020617] z-[9999] flex flex-col items-center justify-center font-mono transition-opacity duration-500 ease-out select-none crt-flicker cyber-grid ${
        progress === 100 ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Scanline CRT overlay */}
      <div className="scanlines" />

      {/* Futuristic Command center loading card */}
      <div className="relative flex flex-col items-center p-8 border border-[#00d4ff]/30 bg-[#0b1329]/80 backdrop-blur-xl rounded-2xl w-[90%] max-w-[550px] overflow-hidden cyber-glow-border">
        {/* Technology bracket corners */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00d4ff]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#00d4ff]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#00d4ff]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#00d4ff]" />

        {/* Decorative Grid Lines / Coordinates */}
        <div className="absolute top-3 left-4 text-[7px] text-[#00d4ff]/40 select-none tracking-widest font-mono">
          SECURE CONNECTION: ACTIVE
        </div>
        <div className="absolute top-3 right-4 text-[7px] text-[#00d4ff]/40 select-none tracking-widest font-mono">
          LOC: 16.0544° N, 108.2022° E
        </div>

        {/* Animated Cyberpunk Radar/Scanner */}
        <div className="relative w-32 h-32 mb-6 rounded-full border border-[#00d4ff]/25 bg-black/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.05)]">
          {/* Radar grids */}
          <div className="absolute w-[80%] h-[80%] rounded-full border border-[#00d4ff]/10" />
          <div className="absolute w-[50%] h-[50%] rounded-full border border-[#00d4ff]/5 border-dashed" />

          {/* Radar axis lines */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#00d4ff]/10" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#00d4ff]/10" />

          {/* Sweeping line */}
          <div className="absolute inset-0 rounded-full border-t-2 border-r border-[#00d4ff]/60 animate-radar-sweep origin-center" />

          {/* Central flashing dot */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#00d4ff] border border-white glow-cyan animate-pulse z-10" />

          {/* Pulsing targets */}
          <div className="absolute top-7 left-10 w-2 h-2 rounded-full bg-[#10b981] border border-white/40 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <div className="absolute bottom-10 right-8 w-2 h-2 rounded-full bg-[#ef4444] border border-white/40 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-ping" />
          <div className="absolute top-16 right-8 w-1.5 h-1.5 rounded-full bg-[#f59e0b] border border-white/20 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-[#00d4ff] text-glow-cyan glow-text-pulse mb-1 text-center font-mono">
          SYS_MONITOR_GIS
        </h1>
        <p className="text-[10px] text-slate-400 tracking-[0.35em] uppercase mb-6 font-bold">
          Vietnam Camera Surveillance HUD
        </p>

        {/* Log feed styled as a real dark terminal */}
        <div className="w-full h-24 bg-black/90 border border-[#00d4ff]/20 rounded-lg p-4 mb-6 overflow-hidden flex flex-col justify-end text-[10px] md:text-xs text-[#00ffcc] font-mono leading-relaxed shadow-inner">
          <div className="text-slate-500/70 mb-1 flex justify-between">
            <span>&gt; SYSTEM_BOOT_SEQUENCE: v1.1.0</span>
            <span className="animate-pulse">ONLINE</span>
          </div>
          {logs.slice(0, logIndex + 1).map((log, index) => {
            const isLast = index === logIndex;
            return (
              <div
                key={index}
                className={`${isLast ? "text-[#00ffff] font-bold" : "text-[#00ffcc]/60"}`}
              >
                {isLast ? "> " : "  "} {log}
                {isLast && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-[#00ffff] animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress percent */}
        <div className="flex justify-between w-full text-[10px] font-bold text-slate-400 mb-2 font-mono tracking-wider">
          <span>INITIALIZING HUD CONNECTIONS</span>
          <span className="font-mono text-[#00d4ff] font-bold">{progress}%</span>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-[#00d4ff]/20 p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0284c7] via-[#00d4ff] to-[#00ffcc] shadow-[0_0_8px_rgba(0,212,255,0.6)] transition-all duration-75 ease-out bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[pulse_1.5s_infinite_linear]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Small bottom status decor */}
        <div className="w-full mt-4 flex justify-between items-center text-[7px] text-[#00d4ff]/30 font-mono tracking-widest border-t border-[#00d4ff]/10 pt-3">
          <span>SYSTEM STATE: ACTIVE</span>
          <span>DEV_COUNT: 200 NODES</span>
          <span>SEC_LEVEL: MAX</span>
        </div>
      </div>

      {/* Decorative background grid center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.06)_0%,rgba(0,0,0,0)_75%)] pointer-events-none" />
    </div>
  );
}
export default LoadingScreen;
