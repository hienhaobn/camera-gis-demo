import { useRef, useState, useEffect, useCallback } from "react";
import Map, {
  NavigationControl,
  ScaleControl,
  Popup,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMapStore } from "@/stores/useMapStore";
import { registerPMTilesProtocol, fetchAndResolveStyle } from "@/lib/mapConfig";
import type { CustomDrawing } from "@/stores/useMapStore";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

// Import subcomponents
import { MeasureHUD } from "./components/MeasureHUD";
import { DrawHUD } from "./components/DrawHUD";
import { MarkHUD } from "./components/MarkHUD";
import { RouteHUD } from "./components/RouteHUD";
import { ZoneLayers } from "./components/ZoneLayers";
import { InfrastructureLayers } from "./components/InfrastructureLayers";
import { CustomDrawingLayers } from "./components/CustomDrawingLayers";
import { RouteLayers } from "./components/RouteLayers";
import { CameraClusterMarkers } from "./components/CameraClusterMarkers";

export function MapView() {
  const mapRef = useRef<MapRef>(null);

  const {
    selectedCamera,
    setSelectedCamera,
    activeTool,
    drawShape,
    addMeasurePoint,
    customMarkers,
    addCustomMarker,
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

  // Map Style selection & offline initialization
  const isTest = import.meta.env.MODE === "test";
  const [resolvedStyle, setResolvedStyle] = useState<any>(
    isTest ? { version: 8, sources: {}, layers: [] } : null
  );

  useEffect(() => {
    registerPMTilesProtocol();
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchAndResolveStyle(theme)
      .then((style) => {
        if (isMounted) {
          setResolvedStyle(style);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi tải cấu hình bản đồ offline:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [theme]);

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
      {!resolvedStyle ? (
        <div className="w-full h-full flex items-center justify-center bg-background text-muted-foreground font-mono text-xs gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          ĐANG KHỞI TẠO BẢN ĐỒ OFFLINE...
        </div>
      ) : (
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
          mapStyle={resolvedStyle}
          style={{ width: "100%", height: "100%" }}
          minZoom={7}
          maxZoom={18}
          onError={(e) => {
            console.error("[Map Error] Lỗi tải tài nguyên bản đồ offline:", e.error?.message || e);
          }}
        >
        {/* Navigation / Scale controls */}
        <NavigationControl position="top-left" showCompass />
        <ScaleControl position="bottom-left" />

        {/* 1. Zone Polygons Rendering */}
        <ZoneLayers />

        {/* 2. Fiber Optic Cable Routes & Restricted Areas Layer */}
        <InfrastructureLayers />

        {/* 3. Render Custom Drawings (User polygon/lines) & user markers */}
        <CustomDrawingLayers drawingPoints={drawingPoints} />

        {/* 4. Measurement & Route Finding Line Layers */}
        <RouteLayers routeStart={routeStart} routeEnd={routeEnd} />

        {/* 5. Render 200+ Cameras & Clusters */}
        <CameraClusterMarkers bounds={bounds} zoom={zoom} mapRef={mapRef} />

        {/* 6. Dialog Modal Popup for Placing Marker */}
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
                <SelectTrigger className="h-7 text-xs bg-muted/50 border-border w-full">
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
      )}

      {/* Floating HUD Panels inside the Map */}

      {/* 1. Distance measurement panel */}
      {activeTool === "measure" && <MeasureHUD />}

      {/* 2. Drawing tool controls */}
      {activeTool === "draw" && (
        <DrawHUD
          drawingPoints={drawingPoints}
          setDrawingPoints={setDrawingPoints}
          handleCompleteDrawing={handleCompleteDrawing}
        />
      )}

      {/* 3. Place Marker Info HUD Overlay */}
      {activeTool === "mark" && <MarkHUD />}

      {/* 4. Route Finder HUD Overlay */}
      {activeTool === "route" && (
        <RouteHUD
          routeStart={routeStart}
          routeEnd={routeEnd}
          routeStep={routeStep}
          handleClearRoute={handleClearRoute}
        />
      )}

      {/* Floating coordinates panel at the bottom center of the map */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 bg-background/85 border border-border/50 text-[9px] font-mono text-muted-foreground rounded-md backdrop-blur-md pointer-events-none select-none tracking-wide hidden sm:block shadow">
        LAT: {viewport.latitude.toFixed(5)} | LNG:{" "}
        {viewport.longitude.toFixed(5)} | ZOOM: {viewport.zoom.toFixed(1)}
      </div>
    </div>
  );
}
export default MapView;
