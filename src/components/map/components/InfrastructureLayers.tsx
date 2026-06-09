import { Source, Layer, Marker } from "react-map-gl/maplibre";
import { useMapStore } from "@/stores/useMapStore";
import {
  controlCenters,
  checkpoints,
  restrictedAreas,
  fiberRoutes,
} from "@/data/infrastructure";

export function InfrastructureLayers() {
  const visibleInfrastructure = useMapStore(
    (state) => state.visibleLayers.infrastructure,
  );

  if (!visibleInfrastructure) return null;

  return (
    <>
      {/* Restricted Areas Polygons */}
      {restrictedAreas.map((area) => (
        <Source
          key={area.id}
          id={`restrict-${area.id}`}
          type="geojson"
          data={{
            type: "Feature",
            geometry: { type: "Polygon", coordinates: area.coordinates },
            properties: { name: area.name, level: area.level },
          }}
        >
          <Layer
            id={`restrict-fill-${area.id}`}
            type="fill"
            paint={{
              "fill-color":
                area.level === "forbidden" ? "#ef4444" : "#f59e0b",
              "fill-opacity": 0.18,
            }}
          />
          <Layer
            id={`restrict-outline-${area.id}`}
            type="line"
            paint={{
              "line-color":
                area.level === "forbidden" ? "#ef4444" : "#f59e0b",
              "line-width": 2,
              "line-dasharray": [4, 4],
            }}
          />
        </Source>
      ))}

      {/* Fiber Optic Routes */}
      {fiberRoutes.map((route) => (
        <Source
          key={route.id}
          id={`fiber-${route.id}`}
          type="geojson"
          data={{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: route.coordinates,
            },
            properties: { name: route.name },
          }}
        >
          <Layer
            id={`fiber-line-${route.id}`}
            type="line"
            paint={{
              "line-color": "#10b981",
              "line-width": 2,
              "line-opacity": 0.65,
            }}
          />
        </Source>
      ))}

      {/* HQ Control Centers */}
      {controlCenters.map((cc) => (
        <Marker
          key={cc.id}
          longitude={cc.lng}
          latitude={cc.lat}
          anchor="center"
        >
          <div className="relative group cursor-pointer flex flex-col items-center">
            <div className="w-6 h-6 rounded-md bg-[#7c3aed] border border-white flex items-center justify-center text-white text-[9px] font-bold glow-cyan">
              HQ
            </div>
            <div className="absolute -top-6 bg-card border border-border/80 text-[9px] text-foreground font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              {cc.name}
            </div>
          </div>
        </Marker>
      ))}

      {/* Checkpoints */}
      {checkpoints.map((cp) => (
        <Marker
          key={cp.id}
          longitude={cp.lng}
          latitude={cp.lat}
          anchor="center"
        >
          <div className="relative group cursor-pointer flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-[#10b981] border border-white flex items-center justify-center text-white text-[7px] font-bold">
              🛡️
            </div>
            <div className="absolute -top-6 bg-card border border-border/80 text-[8px] text-foreground px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              {cp.name}
            </div>
          </div>
        </Marker>
      ))}
    </>
  );
}
export default InfrastructureLayers;
