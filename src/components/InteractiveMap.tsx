import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Custom marker icons
const createIcon = (color: string) => L.divIcon({
  className: 'custom-marker',
  html: `
    <div class="w-8 h-8 rounded-full bg-${color}-500 border-2 border-white shadow-lg flex items-center justify-center">
      <div class="w-2 h-2 bg-white rounded-full"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const icons = {
  start: createIcon('green'),
  destination: createIcon('red'),
  attraction: createIcon('blue')
};

interface Location {
  name: string;
  lat: number;
  lng: number;
  type: keyof typeof icons;
  description?: string;
  duration?: string;
}

interface InteractiveMapProps {
  locations: Location[];
}

function MapController({ locations }: { locations: Location[] }) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (locations.length < 2) return;

    // Clear existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Create waypoints from locations
    const waypoints = locations.map(loc => L.latLng(loc.lat, loc.lng));

    // Initialize routing control
    routingControlRef.current = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          { color: '#3b82f6', weight: 4, opacity: 0.7 },
          { color: '#60a5fa', weight: 2, opacity: 0.5 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      altLineOptions: {
        styles: [
          { color: '#9333ea', weight: 4, opacity: 0.4 },
          { color: '#a855f7', weight: 2, opacity: 0.3 }
        ]
      },
      createMarker: () => null, // We create our own markers
      addWaypoints: false,
      draggableWaypoints: false,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving'
      })
    }).addTo(map);

    // Create bounds for all locations
    const bounds = L.latLngBounds(waypoints);
    
    // Add padding to bounds and fit map
    map.fitBounds(bounds.pad(0.2));

    // Clean up on unmount
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, locations]);

  return null;
}

export function InteractiveMap({ locations }: InteractiveMapProps) {
  // Use a modern, minimalist map style
  const mapStyle = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      className="h-[500px] w-full rounded-lg shadow-lg overflow-hidden"
      style={{ background: '#1a1b1e' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={mapStyle}
      />
      
      <MapController locations={locations} />
      
      {locations.map((location, index) => (
        <Marker
          key={`${location.name}-${index}`}
          position={[location.lat, location.lng]}
          icon={icons[location.type]}
        >
          <Popup className="map-popup">
            <div className="p-3">
              <h3 className="font-semibold text-lg mb-1">{location.name}</h3>
              {location.duration && (
                <p className="text-sm text-gray-600 mb-2">
                  {location.duration}
                </p>
              )}
              {location.description && (
                <p className="text-sm text-gray-600">
                  {location.description}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}