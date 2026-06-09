import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  src: string;
  name: string;
  panClass?: string;
}

export function VideoPlayer({ src, name, panClass = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Detect if the stream is HLS (.m3u8)
    const isHls = src.toLowerCase().includes(".m3u8") || src.toLowerCase().includes("playlist");

    let hls: Hls | null = null;

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => console.log("HLS play prevented:", err));
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => console.log("Native HLS play prevented:", err));
          }
        });
      }
    } else {
      // Normal video formats (.mp4, etc.)
      video.src = src;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => console.log("Direct video play prevented:", err));
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-110 transition-transform duration-700 ${panClass}`}
      muted
      loop
      playsInline
      autoPlay
      title={`Live feed of ${name}`}
    />
  );
}
export default VideoPlayer;
