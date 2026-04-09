'use client';

import { useState } from 'react';

export default function AIRoutePlanner({ onClose }: { onClose: () => void }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePlan = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        route: `From ${origin} to ${destination} via off-grid paths`,
        tips: [
          "Ensure satellite terminal is fully charged",
          "Pack the 1000W PowerStation for backup",
          "Coverage is strong in this region according to live map",
          "Recommended: Explorer Hoodie for cold nights"
        ],
        estimatedTime: "4-7 days depending on terrain"
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="bg-zinc-900 rounded-3xl max-w-lg w-full p-8">
        <h3 className="text-3xl font-bold mb-6">AI Off-Grid Route Planner</h3>
        
        <div className="space-y-6">
          <input
            type="text"
            placeholder="Starting location (e.g. Lima, Peru)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Destination (e.g. Cusco highlands)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={handlePlan}
            disabled={loading || !origin || !destination}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {loading ? 'Planning your adventure...' : 'Generate Route'}
          </button>
        </div>

        {result && (
          <div className="mt-8 bg-zinc-800 p-6 rounded-2xl">
            <p className="font-semibold mb-3">Recommended Route:</p>
            <p className="text-emerald-400 mb-4">{result.route}</p>
            <p className="text-sm text-zinc-400 mb-2">Estimated duration: {result.estimatedTime}</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {result.tips.map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={onClose} className="mt-8 w-full py-3 text-zinc-400 hover:text-white transition">Close Planner</button>
      </div>
    </div>
  );
}