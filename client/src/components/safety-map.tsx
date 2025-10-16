import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapIcon } from 'lucide-react';
import { DELHI_BOUNDS, getSafetyColor } from '@/lib/safety-utils';
import type { Accident, SafetyLevel } from '@shared/schema';

// Using Mapbox demo token - replace with your own in production
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

type SafetyMapProps = {
  accidents: Accident[];
  selectedAccident: Accident | null;
  onSelectAccident: (accident: Accident | null) => void;
  areaAnalytics: Map<string, { count: number; safetyLevel: SafetyLevel }>;
};

export function SafetyMap({ accidents, selectedAccident, onSelectAccident, areaAnalytics }: SafetyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [DELHI_BOUNDS.center.lng, DELHI_BOUNDS.center.lat],
        zoom: DELHI_BOUNDS.zoom,
        maxBounds: [
          [DELHI_BOUNDS.minLng, DELHI_BOUNDS.minLat],
          [DELHI_BOUNDS.maxLng, DELHI_BOUNDS.maxLat]
        ],
        minZoom: 10,
        maxZoom: 18,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Map failed to load. WebGL may not be supported in this environment.');
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Failed to initialize map. WebGL may not be supported.');
    }

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when accidents or selection changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    // Add new markers
    accidents.forEach((accident) => {
      const areaData = areaAnalytics.get(accident.area);
      const safetyLevel = areaData?.safetyLevel || 'safe';
      const isSelected = selectedAccident?.id === accident.id;

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = isSelected ? '20px' : '14px';
      el.style.height = isSelected ? '20px' : '14px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getSafetyColor(safetyLevel);
      el.style.border = '2px solid white';
      el.style.boxShadow = isSelected 
        ? `0 0 20px ${getSafetyColor(safetyLevel)}` 
        : '0 2px 4px rgba(0,0,0,0.2)';
      el.style.cursor = 'pointer';
      el.style.transition = 'all 0.2s';

      if (isSelected) {
        const ping = document.createElement('span');
        ping.style.position = 'absolute';
        ping.style.inset = '0';
        ping.style.borderRadius = '50%';
        ping.style.backgroundColor = getSafetyColor(safetyLevel);
        ping.style.animation = 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite';
        el.appendChild(ping);
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([accident.longitude, accident.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onSelectAccident(accident);
      });

      markers.current.set(accident.id, marker);
    });
  }, [accidents, selectedAccident, areaAnalytics, onSelectAccident, mapLoaded]);

  // Fly to selected accident
  useEffect(() => {
    if (selectedAccident && map.current) {
      map.current.flyTo({
        center: [selectedAccident.longitude, selectedAccident.latitude],
        zoom: 14,
        duration: 1000,
      });
    }
  }, [selectedAccident]);

  if (mapError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-muted" data-testid="safety-map">
        <div className="text-center p-8 max-w-2xl">
          <div className="mb-4">
            <MapIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Map Requires WebGL</h3>
          <p className="text-muted-foreground mb-4">{mapError}</p>
          <div className="bg-card border border-border rounded-lg p-4 text-left">
            <p className="text-sm font-medium mb-2">To view the interactive map:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Open this app in a full browser (Chrome, Firefox, Safari)</li>
              <li>• The map will display with full street details and neighborhood labels</li>
              <li>• All accident markers will be visible and interactive</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            In the meantime, use the <strong>Statistics</strong> tab to explore all accident data and analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" data-testid="safety-map">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-card border border-card-border rounded-md shadow-lg p-4" data-testid="map-legend">
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
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
