import { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import useSupercluster from "use-supercluster";
import { useMapStore } from "@/stores/useMapStore";
import { useCameraStore } from "@/stores/useCameraStore";
import type { Camera } from "@/data/cameras";
import type { MapRef } from "react-map-gl/maplibre";

interface CameraPointProperties {
  cluster: false;
  camera: Camera;
  camId: string;
}

interface CameraClusterProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string | number;
}

interface CameraClusterMarkersProps {
  bounds: [number, number, number, number] | null;
  zoom: number;
  mapRef: React.RefObject<MapRef | null>;
}

export function CameraClusterMarkers({
  bounds,
  zoom,
  mapRef,
}: CameraClusterMarkersProps) {
  const cameras = useCameraStore((state) => state.cameras);
  const {
    selectedCamera,
    setSelectedCamera,
    visibleLayers,
    searchQuery,
    statusFilter,
  } = useMapStore();

  const filteredCameraPoints = useMemo(() => {
    return cameras.filter((cam) => {
      const matchesSearch =
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || cam.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, cameras]);

  // Convert filtered cameras to GeoJSON for supercluster
  const points = useMemo(() => {
    return filteredCameraPoints.map((cam) => ({
      type: "Feature" as const,
      properties: { cluster: false, camera: cam, camId: cam.id },
      geometry: {
        type: "Point" as const,
        coordinates: [cam.lng, cam.lat],
      },
    }));
  }, [filteredCameraPoints]);

  // Get clusters using supercluster hook
  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds || [107.8, 15.8, 108.5, 16.2],
    zoom,
    options: { radius: 60, maxZoom: 14 },
  });

  if (!visibleLayers.cameras) return null;

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const properties = cluster.properties || {};
        const isCluster = "cluster" in properties && !!properties.cluster;
        const pointCount = isCluster
          ? (properties as unknown as CameraClusterProperties).point_count
          : 0;
        const camera = !isCluster
          ? (properties as unknown as CameraPointProperties).camera
          : null;

        if (isCluster) {
          // Standard cluster marker styling
          let clusterColor = "bg-[#00d4ff]/90 text-[#070a10]";
          if (pointCount > 20) clusterColor = "bg-[#7c3aed]/90 text-white";
          else if (pointCount > 50)
            clusterColor = "bg-[#ef4444]/90 text-white";

          return (
            <Marker
              key={`cluster-${cluster.id}`}
              longitude={longitude}
              latitude={latitude}
              anchor="center"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const expansionZoom = Math.min(
                    supercluster
                      ? supercluster.getClusterExpansionZoom(
                          cluster.id as number,
                        )
                      : 18,
                    18,
                  );
                  mapRef.current?.flyTo({
                    center: [longitude, latitude],
                    zoom: expansionZoom,
                    duration: 1000,
                  });
                }}
                className={`w-9 h-9 rounded-full ${clusterColor} border border-white/30 flex items-center justify-center font-mono font-bold text-xs shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer glow-cyan`}
              >
                {pointCount}
              </button>
            </Marker>
          );
        }

        if (!camera) return null;

        // Unclustered Camera marker (pulsing)
        const isSelected = selectedCamera?.id === camera.id;
        const statusColor =
          camera.status === "online"
            ? "var(--cam-online)"
            : camera.status === "offline"
              ? "var(--cam-offline)"
              : "var(--cam-maintenance)";

        return (
          <Marker
            key={`camera-${camera.id}`}
            longitude={longitude}
            latitude={latitude}
            anchor="center"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCamera(isSelected ? null : camera);
              }}
              className="relative cursor-pointer select-none"
              data-testid="camera-marker"
            >
              {/* High-visibility active locator reticle */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1]">
                  {/* Outer spinning target crosshair */}
                  <div className="absolute w-8 h-8 rounded-full border border-dashed border-[#00d4ff] animate-[spin_6s_linear_infinite]" />
                  {/* Inner breathing halo */}
                  <div className="absolute w-6 h-6 rounded-full bg-[#00d4ff]/25 animate-ping" />
                  {/* Glowing neon shadow */}
                  <div className="absolute w-5 h-5 rounded-full border border-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.7)] animate-pulse" />
                </div>
              )}

              <div className="pulsing-dot-container transition-transform hover:scale-125">
                {/* Pulse Ring */}
                <div
                  className="pulsing-dot-ring animate-ping"
                  style={{
                    backgroundColor: statusColor,
                    animationDuration: isSelected ? "1s" : "2s",
                  }}
                />
                {/* Core Indicator */}
                <div
                  className="pulsing-dot-core"
                  style={{
                    backgroundColor: isSelected ? "#ffffff" : statusColor,
                    borderColor: isSelected ? "#00d4ff" : "#ffffff",
                    boxShadow: isSelected
                      ? "0 0 15px #00d4ff, 0 0 25px rgba(0, 212, 255, 0.5)"
                      : "none",
                    transform: isSelected ? "scale(1.35)" : "none",
                  }}
                />
              </div>
            </div>
          </Marker>
        );
      })}
    </>
  );
}
export default CameraClusterMarkers;
