import { useMemo } from "react";
import { Source, Layer, Marker } from "react-map-gl/maplibre";
import * as turf from "@turf/turf";
import { useMapStore } from "@/stores/useMapStore";

interface RouteLayersProps {
  routeStart: [number, number] | null;
  routeEnd: [number, number] | null;
}

export function RouteLayers({ routeStart, routeEnd }: RouteLayersProps) {
  const { activeTool, measurePoints } = useMapStore();

  const routeGeoJSON = useMemo(() => {
    if (!routeStart || !routeEnd) return null;
    return turf.lineString([routeStart, routeEnd]);
  }, [routeStart, routeEnd]);

  return (
    <>
      {/* 1. Measurement Line Layer */}
      {activeTool === "measure" && measurePoints.length > 0 && (
        <>
          <Source
            id="measure-line-source"
            type="geojson"
            data={{
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: measurePoints,
              },
              properties: {},
            }}
          >
            <Layer
              id="measure-line-layer"
              type="line"
              paint={{
                "line-color": "#00d4ff",
                "line-width": 3,
              }}
            />
          </Source>

          {/* Render node badges */}
          {measurePoints.map((pt, index) => (
            <Marker
              key={index}
              longitude={pt[0]}
              latitude={pt[1]}
              anchor="bottom"
            >
              <div className="px-1.5 py-0.5 bg-card/90 border border-primary/40 rounded text-[9px] font-mono text-primary font-bold shadow-md -translate-y-1 select-none">
                {index === 0 ? "START" : `P${index}`}
              </div>
            </Marker>
          ))}
        </>
      )}

      {/* 2. Route Finder Line Layer */}
      {activeTool === "route" && routeGeoJSON && (
        <Source id="route-line-source" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line-layer"
            type="line"
            paint={{
              "line-color": "#00d4ff",
              "line-width": 4,
              "line-opacity": 0.85,
            }}
          />
        </Source>
      )}

      {/* Route markers */}
      {activeTool === "route" && (
        <>
          {routeStart && (
            <Marker
              longitude={routeStart[0]}
              latitude={routeStart[1]}
              anchor="bottom"
            >
              <div className="flex flex-col items-center">
                <div className="px-2 py-0.5 bg-green-500 text-white rounded text-[9px] font-bold shadow font-mono">
                  ĐIỂM ĐẦU
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white glow-cyan mt-0.5 animate-pulse" />
              </div>
            </Marker>
          )}
          {routeEnd && (
            <Marker
              longitude={routeEnd[0]}
              latitude={routeEnd[1]}
              anchor="bottom"
            >
              <div className="flex flex-col items-center">
                <div className="px-2 py-0.5 bg-red-500 text-white rounded text-[9px] font-bold shadow font-mono">
                  ĐIỂM CUỐI
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white glow-cyan mt-0.5 animate-pulse" />
              </div>
            </Marker>
          )}
        </>
      )}
    </>
  );
}
export default RouteLayers;
