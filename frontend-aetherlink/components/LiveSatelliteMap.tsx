'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import io, { Socket } from 'socket.io-client';

const LiveSatelliteMapContent = dynamic(
  () => import('./LiveSatelliteMapContent'),
  { ssr: false }
);

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

export default function LiveSatelliteMap() {
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('✅ Connected to backend server');
      setIsConnected(true);
    });

    socket.on('coverageUpdate', (data: CoverageData) => {
      setCoverage(data);
      console.log('📡 Update received:', data.timestamp);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Fallback demo data
    const fallbackTimeout = setTimeout(() => {
      if (!coverage && !isConnected) {
        console.log('⚠️ Using fallback demo data');
        const fallbackData: CoverageData = {
          timestamp: new Date().toISOString(),
          satellites: [
            { id: 'SAT-001', lat: 40.7128, lng: -74.0060, coverageRadius: 1200, status: 'strong' },
            { id: 'SAT-002', lat: -12.0464, lng: -77.0428, coverageRadius: 1100, status: 'strong' },
            { id: 'SAT-003', lat: 51.5074, lng: -0.1278, coverageRadius: 1300, status: 'medium' },
            { id: 'SAT-004', lat: 35.6762, lng: 139.6503, coverageRadius: 1000, status: 'strong' },
            { id: 'SAT-005', lat: -33.8688, lng: 151.2093, coverageRadius: 950, status: 'weak' },
            { id: 'SAT-006', lat: 27.7172, lng: 85.3240, coverageRadius: 1400, status: 'strong' },
          ],
          message: '📡 6 satellites in orbit • All satellites visible on map'
        };
        setCoverage(fallbackData);
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const avgRadius = coverage?.satellites && coverage.satellites.length > 0
    ? coverage.satellites.reduce((sum, sat) => sum + sat.coverageRadius, 0) / coverage.satellites.length
    : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          🛰️ Live Satellite Coverage
        </h2>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-sm text-gray-500">{isConnected ? 'Live' : 'Demo Mode'}</span>
          </div>
          
          <div className="bg-gray-100 rounded-lg px-3 py-1">
            <span className="text-emerald-600 font-mono font-bold">{coverage?.satellites.length || 0}</span>
            <span className="text-gray-500 text-sm ml-1">satellites</span>
          </div>
          
          <div className="bg-gray-100 rounded-lg px-3 py-1">
            <span className="text-emerald-600 font-mono font-bold">{Math.round(avgRadius)}</span>
            <span className="text-gray-500 text-sm ml-1">km avg coverage</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <LiveSatelliteMapContent coverage={coverage} />
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs shadow-lg z-10">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-700">Strong</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-700">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-700">Weak</span>
            </div>
          </div>
        </div>
      </div>
      
      {coverage && (
        <div className="mt-3 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <span>🛰️</span>
            {coverage.message}
            <span>🛰️</span>
          </p>
        </div>
      )}
    </div>
  );
}