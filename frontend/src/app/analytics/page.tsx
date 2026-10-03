'use client';

import React, { useState, useEffect } from 'react';
import { api, DashboardSummary } from '@/lib/api';
import { Header } from '@/components/Header';
import { BarChart3, Activity, PieChart, ShieldAlert, Cpu, Bot, Waves, Wind } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const summary = await api.getDashboard();
      setData(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const critCount = data?.emergencies.filter(e => e.severity === 'CRITICAL').length || 1;
  const highCount = data?.emergencies.filter(e => e.severity === 'HIGH').length || 2;
  const medCount = data?.emergencies.filter(e => e.severity === 'MEDIUM').length || 1;
  const lowCount = data?.emergencies.filter(e => e.severity === 'LOW').length || 1;
  const totalEm = critCount + highCount + medCount + lowCount;

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRefreshNeeded={loadData} />

      <div className="p-5 space-y-5 flex-1">
        {/* Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-black text-slate-100 uppercase tracking-widest">
                MISSION ANALYTICS & SYSTEM TELEMETRY
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                CORRELATION ANALYSIS // SENSE → ANALYZE → PRIORITIZE → ACT → ADAPT
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-[#0e172a] px-3 py-1.5 rounded border border-[#1e2e4f]">
            <span className="text-slate-400">ANALYTICS ENGINE: </span>
            <span className="text-emerald-400 font-bold">ACTIVE // .NET 8 / POSTGRES</span>
          </div>
        </div>

        {/* 1 & 2: Oxygen Production vs Consumption & Storm Intensity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Oxygen Prod vs Cons */}
          <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2 mb-3">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                1. OXYGEN PRODUCTION VS CONSUMPTION
              </span>
              <span className="text-amber-400 text-[10px]">DEFICIT: -8.4%/HR</span>
            </div>

            <div className="h-44 w-full">
              <svg viewBox="0 0 400 120" className="w-full h-full">
                <line x1="30" y1="20" x2="380" y2="20" stroke="#192846" strokeWidth="0.8" strokeDasharray="2 2" />
                <line x1="30" y1="60" x2="380" y2="60" stroke="#192846" strokeWidth="0.8" strokeDasharray="2 2" />
                <line x1="30" y1="100" x2="380" y2="100" stroke="#192846" strokeWidth="0.8" />

                {/* Consumption bar (80%) */}
                <rect x="70" y="30" width="80" height="70" fill="#ef4444" fillOpacity="0.8" rx="2" />
                <text x="110" y="25" fill="#fca5a5" fontSize="9" textAnchor="middle">CONS (80%)</text>

                {/* Production bar (71.6%) */}
                <rect x="210" y="42" width="80" height="58" fill="#06b6d4" fillOpacity="0.8" rx="2" />
                <text x="250" y="37" fill="#67e8f9" fontSize="9" textAnchor="middle">PROD (71.6%)</text>
              </svg>
            </div>
          </div>

          {/* Chart 2: Energy Storm Intensity vs Comms Latency */}
          <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2 mb-3">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Waves className="w-4 h-4 text-purple-400" />
                2. ENERGY STORM FLUX VS RELAY LATENCY
              </span>
              <span className="text-red-400 text-[10px]">PEAK: 94.5%</span>
            </div>

            <div className="h-44 w-full">
              <svg viewBox="0 0 400 120" className="w-full h-full">
                <line x1="30" y1="100" x2="380" y2="100" stroke="#192846" strokeWidth="0.8" />
                {/* Storm Curve */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  points="40,90 100,75 180,45 260,35 340,30 380,26"
                />
                {/* Latency Curve */}
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points="40,95 100,85 180,60 260,40 340,32 380,28"
                />
                <text x="340" y="20" fill="#ef4444" fontSize="8" fontWeight="bold">STORM 94.5%</text>
                <text x="340" y="45" fill="#f59e0b" fontSize="8">LATENCY 830ms</text>
              </svg>
            </div>
          </div>
        </div>

        {/* 3 & 4: Robot Status & Emergency Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Robot Distribution */}
          <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2 mb-3">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                3. ROBOT FLEET STATUS RATIO
              </span>
              <span className="text-cyan-400 text-[10px]">12 TOTAL UNITS</span>
            </div>

            <div className="flex items-center justify-around py-3">
              <div className="text-center">
                <span className="text-2xl font-bold text-emerald-400 block">
                  {data?.topStatus.robotFleet.onlineCount || 9}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">ONLINE (75%)</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-2xl font-bold text-amber-400 block">
                  {data?.topStatus.robotFleet.searchingCount || 2}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">SEARCHING (17%)</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-2xl font-bold text-red-400 block">
                  {data?.topStatus.robotFleet.offlineCount || 1}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">OFFLINE (8%)</span>
              </div>
            </div>
          </div>

          {/* Emergency Distribution */}
          <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2 mb-3">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                4. EMERGENCY COUNT BY SEVERITY
              </span>
              <span className="text-amber-400 text-[10px]">{totalEm} TOTAL</span>
            </div>

            <div className="flex items-center justify-around py-3">
              <div className="text-center">
                <span className="text-2xl font-bold text-red-400 block">{critCount}</span>
                <span className="text-[10px] text-slate-400">CRITICAL</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-2xl font-bold text-amber-400 block">{highCount}</span>
                <span className="text-[10px] text-slate-400">HIGH</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-2xl font-bold text-cyan-400 block">{medCount}</span>
                <span className="text-[10px] text-slate-400">MEDIUM</span>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-2xl font-bold text-slate-400 block">{lowCount}</span>
                <span className="text-[10px] text-slate-400">LOW</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5: Recent Operator Actions Log */}
        <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2.5 mb-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              5. AUDITABLE OPERATOR ACTIONS & MISSION LOG (POSTGRESQL AUDIT TRAIL)
            </h3>
            <span className="text-[10px] text-slate-400">COMMAND RECORD</span>
          </div>

          <div className="space-y-2">
            {data?.recentEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-2 rounded bg-[#0d1627] border border-[#16243f] text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="font-bold text-slate-200">{e.message}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#101b30] text-cyan-300 border border-[#1c2c4c]">
                  {e.eventType}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
