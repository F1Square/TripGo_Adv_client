import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TripMapProps {
  trip?: any;
  currentPosition?: any;
  height?: string;
  fullscreen?: boolean;
  showFullRoute?: boolean;
}

const TripMap: React.FC<TripMapProps> = ({ 
  trip, 
  currentPosition, 
  height = '300px',
  fullscreen = false,
  showFullRoute = false 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.Polyline | null>(null);
  const currentMarker = useRef<L.Marker | null>(null);
  const startMarker = useRef<L.Marker | null>(null);
  const endMarker = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current, {
        zoom: 13,
        zoomControl: !fullscreen,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!map.current || !trip) return;

    // Clear existing layers
    if (routeLayer.current) {
      map.current.removeLayer(routeLayer.current);
    }
    if (startMarker.current) {
      map.current.removeLayer(startMarker.current);
    }
    if (endMarker.current) {
      map.current.removeLayer(endMarker.current);
    }

    if (trip.route && trip.route.length > 0) {
      const points: [number, number][] = trip.route.map((point: any) => [
        point.latitude,
        point.longitude
      ]);

      // Create route polyline
      routeLayer.current = L.polyline(points, {
        color: '#4f46e5',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1
      }).addTo(map.current);

      // Add start marker
      const startPoint = trip.route[0];
      const startIcon = L.divIcon({
        html: '<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>',
        className: 'custom-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      startMarker.current = L.marker([startPoint.latitude, startPoint.longitude], {
        icon: startIcon
      }).addTo(map.current);

      // Add end marker for completed trips
      if (trip.status === 'completed' && trip.route.length > 1) {
        const endPoint = trip.route[trip.route.length - 1];
        const endIcon = L.divIcon({
          html: '<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>',
          className: 'custom-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        endMarker.current = L.marker([endPoint.latitude, endPoint.longitude], {
          icon: endIcon
        }).addTo(map.current);
      }

      // Fit map to route bounds
      if (points.length > 1) {
        map.current.fitBounds(routeLayer.current.getBounds(), {
          padding: [20, 20]
        });
      } else {
        map.current.setView(points[0], 15);
      }
    }
  }, [trip]);

  useEffect(() => {
    if (!map.current || !currentPosition || !trip || trip.status === 'completed') return;

    // Clear existing current position marker
    if (currentMarker.current) {
      map.current.removeLayer(currentMarker.current);
    }

    // Add current position marker for active trips
    const currentIcon = L.divIcon({
      html: `
        <div class="relative">
          <div class="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
          <div class="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    currentMarker.current = L.marker([currentPosition.latitude, currentPosition.longitude], {
      icon: currentIcon
    }).addTo(map.current);

    // Center map on current position if it's an active trip
    if (trip.status === 'active' && !showFullRoute) {
      map.current.setView([currentPosition.latitude, currentPosition.longitude], 16);
    }
  }, [currentPosition, trip, showFullRoute]);

  return (
    <div 
      ref={mapContainer} 
      style={{ height, width: '100%' }}
      className="rounded-lg"
    />
  );
};

export default TripMap;