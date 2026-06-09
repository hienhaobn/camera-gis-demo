import { Protocol } from "pmtiles";
import maplibregl from "maplibre-gl";

// ────────────────────────────────────────────────────────────────
// PMTiles Protocol Registration
// ────────────────────────────────────────────────────────────────
let protocolRegistered = false;

export function registerPMTilesProtocol(): void {
  if (protocolRegistered) return;
  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  protocolRegistered = true;
}

// ────────────────────────────────────────────────────────────────
// Map Style Fetching & Host Resolution
// ────────────────────────────────────────────────────────────────
// Đọc style JSON từ server nội bộ và thay thế placeholder {host}
// bằng origin hiện tại (domain + port) của client.
// Giải pháp này loại bỏ hoàn toàn việc hardcode IP hay biến compile-time.
export async function fetchAndResolveStyle(
  theme: "light" | "dark",
): Promise<any> {
  const url =
    theme === "light" ? "/map/styles/positron.json" : "/map/styles/dark.json";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch map style (${theme}): ${response.statusText}`);
  }

  const styleText = await response.text();
  
  // Thay thế {host} bằng window.location.origin
  // Ví dụ: pmtiles://{host}/map/... -> pmtiles://http://localhost:5173/map/...
  const resolvedText = styleText.replace(/{host}/g, window.location.origin);
  
  return JSON.parse(resolvedText);
}
