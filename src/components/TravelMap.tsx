import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { TravelPlanResponse } from '@/lib/llm/types';

interface TravelMapProps {
  plan: TravelPlanResponse | null;
  startLocation: string;
}

export function TravelMap({ plan, startLocation }: TravelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!plan || !mapRef.current) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    async function initMap() {
      try {
        const { Map, Geocoder } = await loader.importLibrary("maps");
        const { Marker, InfoWindow } = await loader.importLibrary("marker") as google.maps.MarkerLibrary;
        const geocoder = new Geocoder();

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Geocode start location
        const startCoords = await geocodeLocation(geocoder, startLocation);
        
        // Initialize map if not already done
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new Map(mapRef.current, {
            zoom: 4,
            center: startCoords,
            styles: [
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#445566" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }]
              }
            ]
          });
        }

        // Add start location marker
        addMarker(
          Marker,
          InfoWindow,
          startCoords,
          "Starting Point",
          "Your journey begins here",
          "🏠"
        );

        // Geocode and add destination marker
        const destCoords = await geocodeLocation(geocoder, plan.destination);
        addMarker(
          Marker,
          InfoWindow,
          destCoords,
          plan.destination,
          generateDestinationInfo(plan),
          "🎯"
        );

        // Fit bounds to show all markers
        const bounds = new google.maps.LatLngBounds();
        markersRef.current.forEach(marker => bounds.extend(marker.getPosition()!));
        mapInstanceRef.current.fitBounds(bounds);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }

    function addMarker(
      Marker: typeof google.maps.Marker,
      InfoWindow: typeof google.maps.InfoWindow,
      position: google.maps.LatLngLiteral,
      title: string,
      content: string,
      label: string
    ) {
      const marker = new Marker({
        position,
        map: mapInstanceRef.current,
        title,
        label,
        animation: google.maps.Animation.DROP
      });

      const infoWindow = new InfoWindow({
        content: `
          <div class="p-4 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${title}</h3>
            <div class="text-sm">${content}</div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    }

    async function geocodeLocation(
      geocoder: google.maps.Geocoder,
      location: string
    ): Promise<google.maps.LatLngLiteral> {
      try {
        const result = await geocoder.geocode({ address: location });
        const { lat, lng } = result.results[0].geometry.location;
        return { lat: lat(), lng: lng() };
      } catch (error) {
        console.error(`Error geocoding ${location}:`, error);
        return { lat: 0, lng: 0 };
      }
    }

    initMap();
  }, [plan, startLocation]);

  if (!plan) {
    return null;
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

function generateDestinationInfo(plan: TravelPlanResponse): string {
  const activities = plan.itinerary
    .map(day => day.activities.map(activity => `• ${activity}`).join('<br>'))
    .join('<br>');

  return `
    <p class="font-medium mb-2">${plan.duration}</p>
    <div class="mb-2">
      <p class="font-medium">Activities:</p>
      ${activities}
    </div>
  `;
}