import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { DELHI_BOUNDS, getSafetyColor } from '@/lib/safety-utils';
import type { Accident, SafetyLevel } from '@shared/schema';

type SafetyMapProps = {
  accidents: Accident[];
  selectedAccident: Accident | null;
  onSelectAccident: (accident: Accident | null) => void;
  areaAnalytics: Map<string, { count: number; safetyLevel: SafetyLevel }>;
};

function MapController({ selectedAccident }: { selectedAccident: Accident | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedAccident) {
      map.flyTo([selectedAccident.latitude, selectedAccident.longitude], 14, {
        duration: 1,
      });
    }
  }, [selectedAccident, map]);

  return null;
}

export function SafetyMap({ accidents, selectedAccident, onSelectAccident, areaAnalytics }: SafetyMapProps) {
  const center: LatLngExpression = [DELHI_BOUNDS.center.lat, DELHI_BOUNDS.center.lng];

  const accidentMarkers = useMemo(() => {
    return accidents.map((accident) => {
      const areaData = areaAnalytics.get(accident.area);
      const safetyLevel = areaData?.safetyLevel || 'safe';
      const isSelected = selectedAccident?.id === accident.id;

      return {
        accident,
        safetyLevel,
        isSelected,
        position: [accident.latitude, accident.longitude] as LatLngExpression,
        color: getSafetyColor(safetyLevel),
      };
    });
  }, [accidents, selectedAccident, areaAnalytics]);

  return (
    <div className="relative w-full h-full" data-testid="safety-map">
      <MapContainer
        center={center}
        zoom={DELHI_BOUNDS.zoom}
        minZoom={10}
        maxZoom={18}
        className="w-full h-full"
        zoomControl={true}
        maxBounds={[
          [DELHI_BOUNDS.minLat, DELHI_BOUNDS.minLng],
          [DELHI_BOUNDS.maxLat, DELHI_BOUNDS.maxLng]
        ]}
      >
        {/* OpenStreetMap Tile Layer - Detailed street map with all labels */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Map Controller for flying to selected accident */}
        <MapController selectedAccident={selectedAccident} />

        {/* Accident Markers */}
        {accidentMarkers.map(({ accident, safetyLevel, isSelected, position, color }) => (
          <CircleMarker
            key={accident.id}
            center={position}
            radius={isSelected ? 10 : 7}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.8,
              color: '#ffffff',
              weight: 2,
              className: isSelected ? 'accident-marker-selected' : 'accident-marker',
            }}
            eventHandlers={{
              click: () => onSelectAccident(accident),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">{accident.area}</p>
                <p className="text-xs text-muted-foreground">
                  {accident.date} at {accident.time}
                </p>
                <p className="text-xs mt-1">
                  <span className="font-medium">Severity:</span> {accident.severity || 'Unknown'}
                </p>
                {(accident.fatalities ?? 0) > 0 && (
                  <p className="text-xs text-red-600 font-medium">
                    Fatalities: {accident.fatalities}
                  </p>
                )}
                {(accident.injuries ?? 0) > 0 && (
                  <p className="text-xs text-orange-600">
                    Injuries: {accident.injuries}
                  </p>
                )}
                <p className="text-xs mt-1 text-muted-foreground">
                  Click for details
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-card border border-card-border rounded-md shadow-lg p-4 z-[1000]" data-testid="map-legend">
        <h3 className="font-semibold text-sm mb-3">Safety Levels</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-map-safe border-2 border-white" />
            <span className="text-xs">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-map-moderate border-2 border-white" />
            <span className="text-xs">Moderate Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-map-high-risk border-2 border-white" />
            <span className="text-xs">High Risk</span>
          </div>
        </div>
      </div>

      <style>{`
        .accident-marker-selected {
          animation: pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .leaflet-container {
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
