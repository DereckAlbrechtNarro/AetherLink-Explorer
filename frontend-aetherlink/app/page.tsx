'use client';

import Link from 'next/link';
import LiveSatelliteMap from '../components/LiveSatelliteMap';
import AIRoutePlanner from '../components/AIRoutePlanner';
import Navbar from '../components/Navbar';
import { useState } from 'react';

export default function Home() {
  const [showPlanner, setShowPlanner] = useState(false);

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.5px,transparent_1px)] bg-size-[20px_20px] opacity-5"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 text-gray-800">
            Stay Connected<br />Anywhere on Earth
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Portable satellite internet kits • Rugged power stations • Off-grid adventure gear
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/products" className="px-10 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition text-lg shadow-md hover:shadow-lg">
              Explore Products
            </Link>
            <button onClick={() => setShowPlanner(true)} className="px-10 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold rounded-xl transition text-lg">
              Plan My Adventure
            </button>
          </div>
        </div>
      </section>

      {/* Live Map Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <LiveSatelliteMap />
      </section>

      {/* AI Route Planner Modal */}
      {showPlanner && <AIRoutePlanner onClose={() => setShowPlanner(false)} />}
    </main>
  );
}