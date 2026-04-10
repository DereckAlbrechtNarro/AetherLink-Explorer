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
      case 'strong': return '#10b981';
      case 'weak': return '#ef4444';
      default: return '#eab308';
    }
  };

  if (!coverage || !coverage.satellites || coverage.satellites.length === 0) {
    return (
      <div className="bg-white rounded-xl flex items-center justify-center shadow-lg" style={{ height: '500px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading satellites...</p>
        </div>
      </div>
    );
  }

  // Center at [0, 0] to show the whole world once
  // Zoom level 2 shows entire planet without repeating
  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={6}
      zoomControl={true}
      scrollWheelZoom={true}
      dragging={true}
      // CRITICAL: NO LOOPING, NO REPEATING
      worldCopyJump={false}
      maxBounds={[[-85, -180], [85, 180]]}
      maxBoundsViscosity={1.0}
      style={{ height: '500px', width: '100%', borderRadius: '16px', background: '#e8f4f8' }}
    >
      {/* Standard OpenStreetMap - shows continents ONCE */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
        noWrap={true}
      />
      
      {coverage.satellites.map((sat) => (
        <div key={sat.id}>
          <Circle
            center={[sat.lat, sat.lng]}
            radius={Math.min(sat.coverageRadius * 1000, 2000000)}
            pathOptions={{ 
              color: getStatusColor(sat.status), 
              fillColor: getStatusColor(sat.status),
              fillOpacity: 0.15,
              weight: 2,
            }}
          />
          <Circle
            center={[sat.lat, sat.lng]}
            radius={Math.min(sat.coverageRadius * 500, 1000000)}
            pathOptions={{ 
              color: getStatusColor(sat.status), 
              fillColor: getStatusColor(sat.status),
              fillOpacity: 0.3,
              weight: 1,
            }}
          />
          <Marker position={[sat.lat, sat.lng]}>
            <Popup>
              <div className="text-sm">
                <strong>Satellite {sat.id}</strong><br />
                Status: <span className={`capitalize font-semibold ${
                  sat.status === 'strong' ? 'text-green-600' : 
                  sat.status === 'weak' ? 'text-red-500' : 'text-yellow-600'
                }`}>{sat.status}</span><br />
                Coverage: {sat.coverageRadius.toLocaleString()} km<br />
                Position: {sat.lat.toFixed(1)}°, {sat.lng.toFixed(1)}°
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </MapContainer>
  );
}