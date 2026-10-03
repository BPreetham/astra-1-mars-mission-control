'use client';

import React, { useState, useEffect } from 'react';
import { api, ResourceItem, OxygenStatus } from '@/lib/api';
import { Header } from '@/components/Header';
import { Boxes, Wind, Droplet, Apple, Zap, Fuel, HeartPulse, TrendingDown, ArrowUpRight } from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [oxygen, setOxygen] = useState<OxygenStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resList, oxy] = await Promise.all([
        api.getResources(),
        api.getOxygenStatus(),
      ]);
      setResources(resList);
      setOxygen(oxy);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'oxygen': return Wind;
      case 'water': return Droplet;
      case 'food': return Apple;
      case 'power': return Zap;
      case 'fuel': return Fuel;
      default: return HeartPulse;
    }
  };

  const getColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'oxygen': return 'text-cyan-400 border-cyan-500/40 bg-cyan-500';
      case 'water': return 'text-blue-400 border-blue-500/40 bg-blue-500';
      case 'food': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500';
      case 'power': return 'text-amber-400 border-amber-500/40 bg-amber-500';
      case 'fuel': return 'text-orange-400 border-orange-500/40 bg-orange-500';
      default: return 'text-pink-400 border-pink-500/40 bg-pink-500';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRefreshNeeded={loadData} />

      <div className="p-5 space-y-4 flex-1">
        {/* Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-400">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-black text-slate-100 uppercase tracking-widest">
                COLONY LIFE SUPPORT & ESSENTIAL RESOURCES
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                SUSTAINMENT METRICS FOR 10,000 HABITAT POPULATION UNDER STORM CONDITIONS
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-[#0e172a] px-3 py-1.5 rounded border border-[#1e2e4f]">
            <span className="text-slate-400">OVERALL STATUS: </span>
            <span className="text-amber-400 font-bold">DEGRADED // DIVERSION ACTIVE</span>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => {
            const Icon = getIcon(r.resourceType);
            const isDegraded = r.status === 'DEGRADED';
            const isCrit = r.status === 'CRITICAL';

            return (
              <div
                key={r.id}
                className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4 font-mono text-xs hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-slate-800 border border-slate-700">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="font-extrabold text-slate-100 text-sm uppercase">
                      {r.resourceType}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isCrit
                        ? 'bg-red-950 text-red-400 border-red-500/40'
                        : isDegraded
                        ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Level Display */}
                <div className="my-3 flex items-baseline justify-between">
                  <div className="text-3xl font-black text-white">
                    {r.quantity.toFixed(0)}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    RESERVE: <span className="text-amber-400 font-bold">{r.reserveHours}h</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      r.quantity < 50 ? 'bg-amber-500' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${r.quantity}%` }}
                  />
                </div>

                {/* Rates */}
                <div className="flex justify-between text-[10px] text-slate-400 border-t border-[#16233a] pt-2">
                  <span>PROD: {r.productionRate.toFixed(1)}/h</span>
                  <span>CONS: {r.consumptionRate.toFixed(1)}/h</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Historical Resource Trends SVG Chart */}
        <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2.5 mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
              24-HOUR RESOURCE DEPLETION TRAJECTORY (POSTGRESQL AGGREGATED)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              SABATIER REACTOR O2 OFFSET: -8.4%
            </span>
          </div>

          <div className="h-56 w-full relative font-mono text-xs">
            <svg viewBox="0 0 700 180" className="w-full h-full">
              <line x1="40" y1="20" x2="680" y2="20" stroke="#192846" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="40" y1="65" x2="680" y2="65" stroke="#192846" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="40" y1="110" x2="680" y2="110" stroke="#192846" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="40" y1="155" x2="680" y2="155" stroke="#192846" strokeWidth="0.8" />

              <text x="10" y="24" fill="#64748b" fontSize="9">100%</text>
              <text x="10" y="69" fill="#64748b" fontSize="9">75%</text>
              <text x="10" y="114" fill="#64748b" fontSize="9">50%</text>
              <text x="10" y="159" fill="#64748b" fontSize="9">25%</text>

              {/* Oxygen Trend line */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                points="60,40 180,50 300,55 420,62 540,75 660,82"
              />

              {/* Power Trend line */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
                points="60,60 180,72 300,80 420,95 540,105 660,115"
              />

              {/* Water Trend line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points="60,70 180,72 300,74 420,76 540,79 660,82"
              />

              <text x="660" y="78" fill="#06b6d4" fontSize="9" fontWeight="bold">OXYGEN (78%)</text>
              <text x="660" y="112" fill="#f59e0b" fontSize="9" fontWeight="bold">POWER (59%)</text>
              <text x="660" y="94" fill="#3b82f6" fontSize="9" fontWeight="bold">WATER (64%)</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
