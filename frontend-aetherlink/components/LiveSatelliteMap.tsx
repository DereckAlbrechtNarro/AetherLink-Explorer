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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const socket: Socket = io(backendUrl, {
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
      console.log('📡 Update received:', data.timestamp, `${data.satellites.length} satellites`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const avgRadius = coverage?.satellites && coverage.satellites.length > 0
    ? coverage.satellites.reduce((sum, sat) => sum + sat.coverageRadius, 0) / coverage.satellites.length
    : 0;

  const lastUpdateTime = coverage?.timestamp 
    ? new Date(coverage.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : '--:--:--';

  const satelliteCount = coverage?.satellites.length || 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-gray-800">
          🛰️ Live Satellite Coverage
        </h2>
        
        <div className="flex gap-3 flex-wrap">
          {/* Live Clock */}
          <div className="bg-gray-100 rounded-lg px-3 py-1">
            <span className="text-gray-500 text-xs">Current Time</span>
            <span className="text-emerald-600 font-mono font-bold ml-2">{formatTime(currentTime)}</span>
          </div>
          
          {/* Last Updated Clock */}
          <div className="bg-gray-100 rounded-lg px-3 py-1">
            <span className="text-gray-500 text-xs">Last Update</span>
            <span className="text-emerald-600 font-mono font-bold ml-2">{lastUpdateTime}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-sm text-gray-500">{isConnected ? 'Live' : 'Demo Mode'}</span>
          </div>
          
          <div className="bg-gray-100 rounded-lg px-3 py-1">
            <span className="text-emerald-600 font-mono font-bold">{satelliteCount}</span>
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
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
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
            <span className="inline-block animate-pulse">🛰️</span>
            {coverage.message}
            <span className="inline-block animate-pulse">🛰️</span>
          </p>
        </div>
      )}
    </div>
  );
}