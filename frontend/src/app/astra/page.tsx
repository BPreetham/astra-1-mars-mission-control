'use client';

import React, { useState, useEffect } from 'react';
import { api, AstraStatus, AstraSignal } from '@/lib/api';
import { Header } from '@/components/Header';
import { Radio, Radar, AlertOctagon, Activity, ShieldAlert, Clock, MapPin, Compass } from 'lucide-react';

export default function AstraTrackingPage() {
  const [status, setStatus] = useState<AstraStatus | null>(null);
  const [signals, setSignals] = useState<AstraSignal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, sigs] = await Promise.all([
        api.getAstraStatus(),
        api.getAstraSignals(),
      ]);
      setStatus(s);
      setSignals(sigs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRefreshNeeded={loadData} />

      <div className="p-5 space-y-4 flex-1">
        {/* Title Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1222] border border-red-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-red-950/60 border border-red-500/50 text-red-400">
              <Radar className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-black text-slate-100 uppercase tracking-widest">
                  ASTRA TRACKING & RECOVERY TELEMETRY
                </h2>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-mono font-bold border border-red-500/40">
                  {status?.status || 'CRITICAL'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                COLONY EMERGENCY PROTECTOR INTERCEPT // HIGH FREQUENCY TRANSPONDER LOCK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-[#0e172a] px-3 py-1.5 rounded border border-[#1e2e4f]">
              <span className="text-slate-400">SEARCH STATUS: </span>
              <span className="text-amber-400 font-bold">{status?.searchStatus || 'SEARCHING'}</span>
            </div>
          </div>
        </div>

        {/* Status Metrics Cards */}
        {status && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">LAST KNOWN LOCATION</span>
              <div className="text-xl font-mono font-bold text-slate-100 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-400" />
                {status.lastKnownLocation}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                COORDS: {status.latitude.toFixed(3)}° S, {status.longitude.toFixed(3)}° E
              </div>
            </div>

            <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">SIGNAL STRENGTH</span>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {status.signalStrength}%
              </div>
              <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${status.signalStrength}%` }} />
              </div>
            </div>

            <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">CONFIDENCE FACTOR</span>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {status.confidence}%
              </div>
              <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${status.confidence}%` }} />
              </div>
            </div>

            <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">DISTANCE FROM BASE</span>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                {status.distanceFromColonyKm} km
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                HELLAS PLANITIA NORTH RIM
              </div>
            </div>
          </div>
        )}

        {/* Signal History Visual Graph (SVG) */}
        <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2.5 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                ASTRA SIGNAL STRENGTH & CONFIDENCE CURVE (POSTGRESQL TELEMETRY)
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                SIGNAL STRENGTH (%)
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                CONFIDENCE (%)
              </span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="h-64 w-full relative">
            <svg viewBox="0 0 700 200" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#192846" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="40" y1="70" x2="680" y2="70" stroke="#192846" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="40" y1="120" x2="680" y2="120" stroke="#192846" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="40" y1="170" x2="680" y2="170" stroke="#192846" strokeWidth="0.8" />

              {/* Y Axis Labels */}
              <text x="10" y="24" fill="#64748b" fontSize="9" fontFamily="monospace">100%</text>
              <text x="10" y="74" fill="#64748b" fontSize="9" fontFamily="monospace">75%</text>
              <text x="10" y="124" fill="#64748b" fontSize="9" fontFamily="monospace">50%</text>
              <text x="10" y="174" fill="#64748b" fontSize="9" fontFamily="monospace">25%</text>

              {signals.length > 1 && (
                <>
                  {/* Signal Strength Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    points={signals
                      .map((s, idx) => {
                        const x = 60 + (idx / (signals.length - 1)) * 600;
                        const y = 170 - (s.signalStrength / 100) * 150;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Confidence Line */}
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    points={signals
                      .map((s, idx) => {
                        const x = 60 + (idx / (signals.length - 1)) * 600;
                        const y = 170 - (s.confidence / 100) * 150;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Data Points */}
                  {signals.map((s, idx) => {
                    const x = 60 + (idx / (signals.length - 1)) * 600;
                    const y1 = 170 - (s.signalStrength / 100) * 150;
                    const y2 = 170 - (s.confidence / 100) * 150;
                    return (
                      <g key={s.id}>
                        <circle cx={x} cy={y1} r="4" fill="#10b981" />
                        <circle cx={x} cy={y2} r="4" fill="#06b6d4" />
                        <text
                          x={x}
                          y="190"
                          fill="#64748b"
                          fontSize="8"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          T-{((signals.length - 1 - idx) * 10)}m
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Signal Events Table */}
        <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-5">
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-[#1b2b4d] pb-2.5 mb-3">
            HISTORICAL BEACON EVENT LOG (STORED IN POSTGRESQL)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-[#0e172a] text-slate-400 uppercase text-[10px] border-b border-[#1d2d4d]">
                <tr>
                  <th className="p-2.5">TIMESTAMP</th>
                  <th className="p-2.5">COORDINATES</th>
                  <th className="p-2.5">SIGNAL</th>
                  <th className="p-2.5">CONFIDENCE</th>
                  <th className="p-2.5">SOURCE</th>
                  <th className="p-2.5">NOTES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#172540]">
                {signals.map((s) => (
                  <tr key={s.id} className="hover:bg-[#0f1a30] transition-colors">
                    <td className="p-2.5 text-slate-400">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2.5 text-slate-200">
                      {s.latitude.toFixed(3)}° S, {s.longitude.toFixed(3)}° E
                    </td>
                    <td className="p-2.5 text-emerald-400 font-bold">
                      {s.signalStrength}%
                    </td>
                    <td className="p-2.5 text-cyan-400 font-bold">
                      {s.confidence}%
                    </td>
                    <td className="p-2.5 text-amber-300">
                      {s.source}
                    </td>
                    <td className="p-2.5 text-slate-400 text-[11px]">
                      {s.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
