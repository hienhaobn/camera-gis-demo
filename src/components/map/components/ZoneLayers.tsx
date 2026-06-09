import { Source, Layer } from "react-map-gl/maplibre";
import { zones } from "@/data/zones";
import { useMapStore } from "@/stores/useMapStore";
import type { FeatureCollection } from "geojson";

export function ZoneLayers() {
  const visibleZones = useMapStore((state) => state.visibleLayers.zones);

  if (!visibleZones) return null;

  return (
    <Source
      id="zones-source"
      type="geojson"
      data={zones as unknown as FeatureCollection}
    >
      <Layer
        id="zones-fill"
        type="fill"
        paint={{
          "fill-color": ["get", "color"],
          "fill-opacity": 0.12,
        }}
      />
      <Layer
        id="zones-outline"
        type="line"
        paint={{
          "line-color": ["get", "color"],
          "line-width": 1.5,
          "line-dasharray": [3, 2],
        }}
      />
    </Source>
  );
}
export default ZoneLayers;
