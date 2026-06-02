import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Map, {
  NavigationControl,
  ScaleControl,
  Marker,
  Popup,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import useSupercluster from "use-supercluster";
import * as turf from "@turf/turf";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMapStore } from "@/stores/useMapStore";
import { cameras } from "@/data/cameras";
import { zones } from "@/data/zones";
import {
  controlCenters,
  checkpoints,
  restrictedAreas,
  fiberRoutes,
} from "@/data/infrastructure";

import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { CustomDrawing, DrawShape } from "@/stores/useMapStore";
import type { Camera } from "@/data/cameras";
import type { FeatureCollection, Feature } from "geojson";

import "maplibre-gl/dist/maplibre-gl.css";

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

export function MapView() {
  const mapRef = useRef<MapRef>(null);

  const {
    selectedCamera,
    setSelectedCamera,
    isSatellite,
    visibleLayers,
    searchQuery,
    statusFilter,
    activeTool,
    setActiveTool,
    drawShape,
    setDrawShape,
    measurePoints,
    addMeasurePoint,
    clearMeasurePoints,
    customMarkers,
    addCustomMarker,
    removeCustomMarker,
    customDrawings,
    addCustomDrawing,
    theme,
  } = useMapStore();

  // Map viewport state
  const [viewport, setViewport] = useState({
    longitude: 108.2022,
    latitude: 16.0544,
    zoom: 11,
    pitch: 35,
    bearing: -10,
  });

  // Get current bounds for supercluster
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null,
  );
  const [zoom, setZoom] = useState(11);

  // Map Style selection
  const mapStyle = isSatellite
    ? {
        version: 8 as const,
        sources: {
          "satellite-tiles": {
            type: "raster" as const,
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "Tiles &copy; Esri",
          },
        },
        layers: [
          {
            id: "satellite",
            type: "raster" as const,
            source: "satellite-tiles",
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      }
    : theme === 'light'
    ? 'https://tiles.openfreemap.org/styles/positron'
    : 'https://tiles.openfreemap.org/styles/dark';

  // Update bounds on move/zoom
  const updateMapBounds = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const rawBounds = map.getBounds();
    const rawZoom = map.getZoom();

    setBounds([
      rawBounds.getWest(),
      rawBounds.getSouth(),
      rawBounds.getEast(),
      rawBounds.getNorth(),
    ]);
    setZoom(rawZoom);
  }, []);

  // Initial bounds are loaded via the onLoad callback of the Map component

  // Center on selected camera
  useEffect(() => {
    if (selectedCamera && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedCamera.lng, selectedCamera.lat],
        zoom: 15,
        duration: 2000,
        pitch: 45,
      });
    }
  }, [selectedCamera]);

  // Filter camera nodes
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
  }, [searchQuery, statusFilter]);

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

  // Measure calculations
  const measureDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    const line = turf.lineString(measurePoints);
    return turf.length(line, { units: "kilometers" });
  }, [measurePoints]);

  // Placed marker dialog state
  const [newMarkerName, setNewMarkerName] = useState("");
  const [newMarkerType, setNewMarkerType] = useState<
    "center" | "guard" | "restricted" | "custom"
  >("custom");
  const [pendingMarkerCoords, setPendingMarkerCoords] = useState<
    [number, number] | null
  >(null);

  // Custom drawings state
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);

  // Draw end handlers
  const handleCompleteDrawing = () => {
    if (drawingPoints.length < 2) return;

    let geomType: "Polygon" | "LineString" = "LineString";
    let coords: number[][] | number[][][] = drawingPoints;
    let area = 0;
    let distance = 0;

    if (drawShape === "polygon" && drawingPoints.length >= 3) {
      geomType = "Polygon";
      // Polygon coords must be closed (start === end)
      const closedCoords = [[...drawingPoints, drawingPoints[0]]];
      coords = closedCoords;
      const poly = turf.polygon(closedCoords);
      area = turf.area(poly) / 1000000; // Convert m2 to km2
    } else {
      const line = turf.lineString(drawingPoints);
      distance = turf.length(line, { units: "kilometers" });
    }

    const color = drawShape === "polygon" ? "#00d4ff" : "#a855f7";

    const newDrawing: CustomDrawing = {
      id: `D-${Date.now()}`,
      type: "Feature",
      geometry:
        geomType === "Polygon"
          ? { type: "Polygon", coordinates: coords as [number, number][][] }
          : { type: "LineString", coordinates: coords as [number, number][] },
      properties: {
        name: `${drawShape === "polygon" ? "Vùng Giám Sát" : "Tuyến Cáp / Ranh Giới"} #${customDrawings.length + 1}`,
        color,
        area: area > 0 ? parseFloat(area.toFixed(2)) : undefined,
        distance: distance > 0 ? parseFloat(distance.toFixed(2)) : undefined,
      },
    };

    addCustomDrawing(newDrawing);
    setDrawingPoints([]);
  };

  // Handle Route Finding (simulation)
  const [routeStart, setRouteStart] = useState<[number, number] | null>(null);
  const [routeEnd, setRouteEnd] = useState<[number, number] | null>(null);
  const [routeStep, setRouteStep] = useState<"start" | "end" | "done">("start");

  const routeGeoJSON = useMemo(() => {
    if (!routeStart || !routeEnd) return null;
    return turf.lineString([routeStart, routeEnd]);
  }, [routeStart, routeEnd]);

  const routeDistance = useMemo(() => {
    if (!routeGeoJSON) return 0;
    return turf.length(routeGeoJSON, { units: "kilometers" });
  }, [routeGeoJSON]);

  const handleRouteClick = (lng: number, lat: number) => {
    if (routeStep === "start") {
      setRouteStart([lng, lat]);
      setRouteStep("end");
    } else if (routeStep === "end") {
      setRouteEnd([lng, lat]);
      setRouteStep("done");
    }
  };

  // Clear route
  const handleClearRoute = () => {
    setRouteStart(null);
    setRouteEnd(null);
    setRouteStep("start");
  };

  // Map Click Handler for tools
  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;

    if (activeTool === "measure") {
      addMeasurePoint([lng, lat]);
    } else if (activeTool === "mark") {
      setPendingMarkerCoords([lng, lat]);
      setNewMarkerName(`Trạm / Điểm mới #${customMarkers.length + 1}`);
    } else if (activeTool === "draw") {
      setDrawingPoints((prev) => [...prev, [lng, lat]]);
    } else if (activeTool === "route") {
      handleRouteClick(lng, lat);
    } else {
      // Normal click clears selected camera if clicked empty space
      const target = event.originalEvent?.target as HTMLElement;
      if (target && target.classList.contains("maplibregl-canvas")) {
        setSelectedCamera(null);
      }
    }
  };

  return (
    <div className="w-full h-full relative" data-testid="map-container">
      <Map
        {...viewport}
        ref={mapRef}
        onLoad={updateMapBounds}
        onMove={(evt) => {
          setViewport(evt.viewState);
          updateMapBounds();
        }}
        onClick={handleMapClick}
        mapLib={maplibregl}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        minZoom={7}
        maxZoom={18}
      >
        {/* Navigation / Scale controls */}
        <NavigationControl position="top-left" showCompass />
        <ScaleControl position="bottom-left" />

        {/* 1. Zone Polygons Rendering (GeoJSON Layer) */}
        {visibleLayers.zones && (
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
        )}

        {/* 2. Fiber Optic Cable Routes Layer */}
        {visibleLayers.infrastructure && (
          <>
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
          </>
        )}

        {/* 3. Render Custom Drawings (User polygon/lines) */}
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

        {/* 4. Active Draw Points Rendering */}
        {activeTool === "draw" && drawingPoints.length > 0 && (
          <>
            {/* Draw Lines */}
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

            {/* Active Anchor Points */}
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

        {/* 5. Measurement Line Layer */}
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

        {/* 6. Route Finder Line Layer */}
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

        {/* 7. Base Infrastructure Markers */}
        {visibleLayers.infrastructure && (
          <>
            {controlCenters.map((cc) => (
              <Marker
                key={cc.id}
                longitude={cc.lng}
                latitude={cc.lat}
                anchor="center"
              >
                <div className="relative group cursor-pointer flex flex-col items-center">
                  {/* Glowing center icon */}
                  <div className="w-6 h-6 rounded-md bg-[#7c3aed] border border-white flex items-center justify-center text-white text-[9px] font-bold glow-cyan">
                    HQ
                  </div>
                  <div className="absolute -top-6 bg-card border border-border/80 text-[9px] text-foreground font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {cc.name}
                  </div>
                </div>
              </Marker>
            ))}

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
        )}

        {/* 8. Render Custom User Markers */}
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

        {/* 9. Render 200+ Cameras & Clusters (Using supercluster UI) */}
        {visibleLayers.cameras &&
          clusters.map((cluster) => {
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
                  className="pulsing-dot-container cursor-pointer transition-transform hover:scale-125"
                  data-testid="camera-marker"
                >
                  {/* Pulse Ring */}
                  <div
                    className="pulsing-dot-ring"
                    style={{ backgroundColor: statusColor }}
                  />
                  {/* Core Indicator */}
                  <div
                    className="pulsing-dot-core"
                    style={{
                      backgroundColor: statusColor,
                      boxShadow: isSelected
                        ? "0 0 10px white, 0 0 15px var(--primary)"
                        : "none",
                      transform: isSelected ? "scale(1.2)" : "none",
                    }}
                  />
                </div>
              </Marker>
            );
          })}

        {/* 10. Dialog Modal Popup for Placing Marker (floating control overlay) */}
        {pendingMarkerCoords && (
          <Popup
            longitude={pendingMarkerCoords[0]}
            latitude={pendingMarkerCoords[1]}
            anchor="bottom"
            onClose={() => setPendingMarkerCoords(null)}
            closeOnClick={false}
          >
            <div className="flex flex-col gap-2.5 p-1 w-48 text-left">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
                ĐẶT MARKER MỚI
              </span>
              <Input
                type="text"
                placeholder="Tên Marker..."
                value={newMarkerName}
                onChange={(e) => setNewMarkerName(e.target.value)}
                className="h-7 text-xs bg-muted/50 border-border"
              />
              <Select
                value={newMarkerType}
                onValueChange={(val) =>
                  setNewMarkerType(
                    val as "center" | "guard" | "restricted" | "custom",
                  )
                }
              >
                <SelectTrigger className="h-7 text-xs bg-muted/50 border-border">
                  <SelectValue placeholder="Loại trạm" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="center">🏢 Trung Tâm</SelectItem>
                  <SelectItem value="guard">🚨 Chốt An Ninh</SelectItem>
                  <SelectItem value="restricted">⚠️ Cảnh Báo</SelectItem>
                  <SelectItem value="custom">📍 Tùy Chỉnh</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1.5 mt-1 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] py-0 cursor-pointer"
                  onClick={() => setPendingMarkerCoords(null)}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-[10px] py-0 cursor-pointer bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                  onClick={() => {
                    if (pendingMarkerCoords) {
                      addCustomMarker({
                        name: newMarkerName || "Custom Marker",
                        type: newMarkerType,
                        lng: pendingMarkerCoords[0],
                        lat: pendingMarkerCoords[1],
                      });
                      setPendingMarkerCoords(null);
                    }
                  }}
                >
                  Lưu
                </Button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating HUD Panels inside the Map */}

      {/* 1. Distance measurement panel */}
      {activeTool === "measure" && measurePoints.length > 0 && (
        <Card className="absolute top-4 right-4 z-10 w-64 bg-card/85 backdrop-blur-md border border-border/50 select-none shadow-xl">
          <CardContent className="p-3.5 flex flex-col gap-2.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
                THỐNG KÊ ĐO KHOẢNG CÁCH
              </span>
              <Badge
                variant="outline"
                className="font-mono text-[10px] text-primary border-primary/20 bg-primary/5"
              >
                {measurePoints.length} Points
              </Badge>
            </div>
            <div className="flex flex-col gap-1 border-t border-border/40 pt-2 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">KHOẢNG CÁCH:</span>
                <span className="text-primary font-bold">
                  {measureDistance < 1
                    ? `${(measureDistance * 1000).toFixed(1)} m`
                    : `${measureDistance.toFixed(2)} km`}
                </span>
              </div>
            </div>
            <div className="flex gap-2 border-t border-border/40 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
                onClick={clearMeasurePoints}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
                onClick={() => setActiveTool(null)}
              >
                Hoàn Thành
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Drawing tool controls */}
      {activeTool === "draw" && (
        <Card className="absolute top-4 right-4 z-10 w-64 bg-card/85 backdrop-blur-md border border-border/50 select-none shadow-xl">
          <CardContent className="p-3.5 flex flex-col gap-2.5 text-left">
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
              CÔNG CỤ VẼ BẢN ĐỒ
            </span>
            <div className="flex flex-col gap-2 border-t border-border/40 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Hình dạng:</span>
                <Select
                  value={drawShape || "polygon"}
                  onValueChange={(val) => setDrawShape(val as DrawShape)}
                >
                  <SelectTrigger className="h-7 w-28 text-xs bg-muted/30 border-border">
                    <SelectValue placeholder="Shape" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="line">LineString</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {drawingPoints.length > 0 && (
                <div className="text-[10px] font-mono text-primary/80 mt-1 bg-primary/5 p-1.5 border border-primary/10 rounded">
                  Đã vẽ {drawingPoints.length} điểm
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-border/40 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
                onClick={() => setDrawingPoints([])}
                disabled={drawingPoints.length === 0}
              >
                Hủy Vẽ
              </Button>
              <Button
                size="sm"
                className="flex-1 text-[10px] h-7 cursor-pointer bg-primary text-primary-foreground font-bold hover:bg-primary/95"
                onClick={handleCompleteDrawing}
                disabled={
                  drawingPoints.length < (drawShape === "polygon" ? 3 : 2)
                }
              >
                Xác Nhận
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Place Marker Info HUD Overlay */}
      {activeTool === "mark" && (
        <Card className="absolute top-4 right-4 z-10 w-64 bg-card/85 backdrop-blur-md border border-border/50 select-none shadow-xl">
          <CardContent className="p-3.5 text-left flex flex-col gap-2">
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
              CÔNG CỤ ĐÁNH DẤU
            </span>
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-2 leading-relaxed">
              Click vào một địa điểm bất kỳ trên bản đồ để đặt trạm/chốt mới.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 4. Route Finder HUD Overlay */}
      {activeTool === "route" && (
        <Card className="absolute top-4 right-4 z-10 w-64 bg-card/85 backdrop-blur-md border border-border/50 select-none shadow-xl">
          <CardContent className="p-3.5 flex flex-col gap-2.5 text-left">
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
              BỘ ĐIỀU HƯỚNG / TÌM ĐƯỜNG
            </span>

            <div className="flex flex-col gap-2 border-t border-border/40 pt-2 font-mono text-xs">
              <div className="flex items-center gap-2 justify-between">
                <span className="text-muted-foreground">Điểm đầu:</span>
                <span className="font-bold truncate max-w-[120px] text-green-400">
                  {routeStart ? "Đã ghim (Click Map)" : "Chưa đặt"}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <span className="text-muted-foreground">Điểm cuối:</span>
                <span className="font-bold truncate max-w-[120px] text-red-400">
                  {routeEnd ? "Đã ghim (Click Map)" : "Chưa đặt"}
                </span>
              </div>

              {routeStep === "start" && (
                <div className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 p-1.5 rounded text-center mt-1 animate-pulse">
                  Click bản đồ để chọn điểm BẮT ĐẦU
                </div>
              )}
              {routeStep === "end" && (
                <div className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 p-1.5 rounded text-center mt-1 animate-pulse">
                  Click bản đồ để chọn điểm KẾT THÚC
                </div>
              )}

              {routeStep === "done" && (
                <div className="mt-1 border-t border-border/40 pt-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Độ dài tuyến:</span>
                    <span className="font-bold text-primary">
                      {routeDistance.toFixed(2)} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Thời gian ước tính:
                    </span>
                    <span className="font-bold text-foreground">
                      {Math.ceil(routeDistance * 1.5)} phút
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-border/40 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
                onClick={handleClearRoute}
              >
                Xóa Lộ Trình
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[10px] h-7 cursor-pointer hover:bg-muted"
                onClick={() => setActiveTool(null)}
              >
                Đóng
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating coordinates panel at the bottom center of the map */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 bg-background/85 border border-border/50 text-[9px] font-mono text-muted-foreground rounded-md backdrop-blur-md pointer-events-none select-none tracking-wide hidden sm:block shadow">
        LAT: {viewport.latitude.toFixed(5)} | LNG:{" "}
        {viewport.longitude.toFixed(5)} | ZOOM: {viewport.zoom.toFixed(1)}
      </div>
    </div>
  );
}
