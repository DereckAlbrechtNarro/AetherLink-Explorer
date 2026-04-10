'use client';

import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Satellite {
  id: string;
  lat: number;
  lng: number;
  coverageRadius: number;
  status: 'strong' | 'weak' | 'medium';
}

interface CoverageData {
  timestamp: string;
  message: string;
  satellites: Satellite[];
}

interface LiveSatelliteMapContentProps {
  coverage: CoverageData | null;
}

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LiveSatelliteMapContent({ coverage }: LiveSatelliteMapContentProps) {
  const getStatusColor = (status: Satellite['status']): string => {
    switch (status) {
      case 'strong':
        return '#10b981';
      case 'weak':
        return '#ef4444';
      default:
        return '#eab308';
    }
  };

  // Show loading state
  if (!coverage || !coverage.satellites || coverage.satellites.length === 0) {
    return (
      <div className="bg-white rounded-xl flex items-center justify-center shadow-lg" style={{ height: '500px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Connecting to satellite network...</p>
        </div>
      </div>
    );
  }

  // Fixed center: Americas on left, Europe/Asia on right
  // Center at [20°N, 20°E] shows both hemispheres well
  const centerLat = 20;
  const centerLng = 20;
  
  // Fixed zoom level that shows the whole world without looping
  const zoomLevel = 2;

  return (
    <MapContainer
      key="static-world-map"
      center={[centerLat, centerLng]}
      zoom={zoomLevel}
      minZoom={2}
      maxZoom={6}
      zoomControl={true}
      scrollWheelZoom={true}
      dragging={true}
      // CRITICAL: Prevents map from looping/repeating
      worldCopyJump={false}
      maxBounds={[[-90, -180], [90, 180]]}
      maxBoundsViscosity={1.0}
      style={{ height: '500px', width: '100%', borderRadius: '16px', background: '#e8f4f8' }}
      className="z-0 shadow-xl"
    >
      <TileLayer
        // Clean, beautiful map tiles - Americas left, Europe/Asia right
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {coverage.satellites.map((sat) => (
        <div key={sat.id}>
          {/* Outer coverage circle */}
          <Circle
            center={[sat.lat, sat.lng]}
            radius={sat.coverageRadius * 1000}
            pathOptions={{ 
              color: getStatusColor(sat.status), 
              fillColor: getStatusColor(sat.status),
              fillOpacity: 0.12,
              weight: 2,
              opacity: 0.7
            }}
          />
          {/* Inner signal circle for better visibility */}
          <Circle
            center={[sat.lat, sat.lng]}
            radius={sat.coverageRadius * 500}
            pathOptions={{ 
              color: getStatusColor(sat.status), 
              fillColor: getStatusColor(sat.status),
              fillOpacity: 0.25,
              weight: 1,
              opacity: 0.5
            }}
          />
          <Marker position={[sat.lat, sat.lng]}>
            <Popup>
              <div className="text-sm min-w-45">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse`} style={{ backgroundColor: getStatusColor(sat.status) }}></div>
                  <strong className="text-lg">Satellite {sat.id}</strong>
                </div>
                <div className="space-y-1">
                  <p>Status: <span className={`capitalize font-semibold ${
                    sat.status === 'strong' ? 'text-green-600' : 
                    sat.status === 'weak' ? 'text-red-500' : 'text-yellow-600'
                  }`}>{sat.status}</span></p>
                  <p>Coverage: <span className="font-mono">{sat.coverageRadius.toLocaleString()} km</span></p>
                  <p>Position: <span className="font-mono">{Math.abs(sat.lat).toFixed(2)}° {sat.lat >= 0 ? 'N' : 'S'}, {Math.abs(sat.lng).toFixed(2)}° {sat.lng >= 0 ? 'E' : 'W'}</span></p>
                </div>
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </MapContainer>
  );
}