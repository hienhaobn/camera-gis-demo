import { Source, Layer, Marker } from "react-map-gl/maplibre";
import { useMapStore } from "@/stores/useMapStore";
import type { Feature } from "geojson";

interface CustomDrawingLayersProps {
  drawingPoints: [number, number][];
}

export function CustomDrawingLayers({ drawingPoints }: CustomDrawingLayersProps) {
  const {
    customDrawings,
    activeTool,
    drawShape,
    customMarkers,
    removeCustomMarker,
  } = useMapStore();

  return (
    <>
      {/* Custom Drawings (Saved) */}
      {customDrawings.map((draw) => (
        <Source
          key={draw.id}
          id={`user-draw-${draw.id}`}
          type="geojson"
          data={draw}
        >
          {draw.geometry.type === "Polygon" ? (
            <Layer
              id={`user-draw-layer-${draw.id}`}
              type="fill"
              paint={{
                "fill-color": draw.properties.color,
                "fill-opacity": 0.2,
              }}
            />
          ) : (
            <Layer
              id={`user-draw-layer-${draw.id}`}
              type="line"
              paint={{ "line-color": draw.properties.color, "line-width": 3 }}
            />
          )}
          {draw.geometry.type === "Polygon" && (
            <Layer
              id={`user-draw-border-${draw.id}`}
              type="line"
              paint={{ "line-color": draw.properties.color, "line-width": 2 }}
            />
          )}
        </Source>
      ))}

      {/* Active Draw Layer (In-progress) */}
      {activeTool === "draw" && drawingPoints.length > 0 && (
        <>
          {/* Active Drawing Line/Polygon Shape */}
          <Source
            id="active-draw-line"
            type="geojson"
            data={
              {
                type: "Feature",
                geometry: {
                  type:
                    drawShape === "polygon" && drawingPoints.length >= 3
                      ? "Polygon"
                      : "LineString",
                  coordinates:
                    drawShape === "polygon" && drawingPoints.length >= 3
                      ? [...drawingPoints, drawingPoints[0]]
                      : drawingPoints,
                },
                properties: {},
              } as unknown as Feature
            }
          >
            {drawShape === "polygon" && drawingPoints.length >= 3 ? (
              <Layer
                id="active-draw-line-render"
                type="fill"
                paint={{ "fill-color": "#00d4ff", "fill-opacity": 0.15 }}
              />
            ) : (
              <Layer
                id="active-draw-line-render"
                type="line"
                paint={{ "line-color": "#a855f7", "line-width": 2.5 }}
              />
            )}
            {drawShape === "polygon" && (
              <Layer
                id="active-draw-border"
                type="line"
                paint={{
                  "line-color": "#00d4ff",
                  "line-width": 1.5,
                  "line-dasharray": [2, 2],
                }}
              />
            )}
          </Source>

          {/* Active Drawing Anchor Markers */}
          {drawingPoints.map((pt, i) => (
            <Marker
              key={i}
              longitude={pt[0]}
              latitude={pt[1]}
              anchor="center"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-primary border border-white glow-cyan" />
            </Marker>
          ))}
        </>
      )}

      {/* Custom User Placed Markers */}
      {customMarkers.map((marker) => (
        <Marker
          key={marker.id}
          longitude={marker.lng}
          latitude={marker.lat}
          anchor="center"
        >
          <div className="relative group cursor-pointer flex flex-col items-center">
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border border-white ${
                marker.type === "center"
                  ? "bg-[#7c3aed]"
                  : marker.type === "guard"
                    ? "bg-[#10b981]"
                    : "bg-[#f59e0b]"
              }`}
            >
              {marker.type === "center"
                ? "🏢"
                : marker.type === "guard"
                  ? "🚨"
                  : "📍"}
            </div>
            <div className="absolute -top-7 bg-card border border-border/80 text-[8px] text-foreground font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1.5">
              <span>{marker.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeCustomMarker(marker.id);
                }}
                className="text-red-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
              >
                X
              </button>
            </div>
          </div>
        </Marker>
      ))}
    </>
  );
}
export default CustomDrawingLayers;
