'use client';

import React, { useState, useEffect } from 'react';
import { api, CommunicationNode, CommunicationRoute } from '@/lib/api';
import { Header } from '@/components/Header';
import { Network, Wifi, Radio, Zap, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CommunicationsPage() {
  const [nodes, setNodes] = useState<CommunicationNode[]>([]);
  const [routes, setRoutes] = useState<CommunicationRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activationResult, setActivationResult] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const [n, r] = await Promise.all([
        api.getCommsNodes(),
        api.getCommsRoutes(),
      ]);
      setNodes(n);
      setRoutes(r);
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

  const handleActivateRoute = async (routeId: number) => {
    try {
      setActionLoading(true);
      const res = await api.activateRoute(routeId);
      setActivationResult(res.data);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const recommendedRoute = routes.find((r) => r.name.includes('Multi-Hop')) || routes[1] || routes[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRefreshNeeded={loadData} />

      <div className="p-5 space-y-4 flex-1">
        {/* Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1222] border border-blue-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-blue-950/60 border border-blue-500/50 text-blue-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-black text-slate-100 uppercase tracking-widest">
                COMMUNICATION GRID & RELAY CONTROL
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                IONOSPHERIC SCATTER MONITORING // MULTI-HOP BYPASS ROUTING ENGINE
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-[#0e172a] px-3 py-1.5 rounded border border-[#1e2e4f]">
            <span className="text-slate-400">NETWORK TOPOLOGY: </span>
            <span className="text-amber-400 font-bold">DEGRADED BY STORM FLUX</span>
          </div>
        </div>

        {/* Route Optimization Recommendation Box */}
        {recommendedRoute && (
          <div className="bg-[#0b1222] border border-cyan-500/50 rounded-lg p-5 shadow-[0_0_15px_rgba(6,182,212,0.12)]">
            <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2.5 mb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                RECOMMENDED BYPASS ROUTE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                OPTIMIZED PATH
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-mono font-extrabold text-white">
                  {recommendedRoute.hopsPath}
                </div>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Bypasses direct ionized plasma corridor through Relay B ridge node to restore telemetry to rover R-04.
                </p>
              </div>

              <button
                onClick={() => handleActivateRoute(recommendedRoute.id)}
                disabled={actionLoading || recommendedRoute.status === 'ACTIVE'}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black uppercase rounded shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {recommendedRoute.status === 'ACTIVE' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>ROUTE ACTIVE</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>ACTIVATE ROUTE</span>
                  </>
                )}
              </button>
            </div>

            {/* Before vs After Metric Delta */}
            {(activationResult || recommendedRoute.status === 'ACTIVE') && (
              <div className="mt-4 p-3 rounded bg-[#070d1a] border border-cyan-500/30 flex flex-wrap items-center justify-around gap-4 text-xs font-mono">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">SIGNAL RECOVERY</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-red-400 font-bold">42%</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-emerald-400 font-extrabold text-sm">79%</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div className="text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">LATENCY REDUCTION</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-red-400 font-bold">830 ms</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-cyan-400 font-extrabold text-sm">210 ms</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div className="text-center">
                  <span className="text-[10px] text-slate-500 uppercase block">TARGET LINK</span>
                  <span className="text-emerald-400 font-bold block mt-0.5">R-04 VERIFIED</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visual Topology Hierarchy */}
        <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-5">
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-[#1b2b4d] pb-2.5 mb-4">
            NETWORK TOPOLOGY TREE // HIERARCHICAL DIAGNOSTICS
          </h3>

          <div className="space-y-4 font-mono text-xs">
            {/* Colony Base */}
            <div className="p-3 bg-[#0d1629] border border-cyan-500/40 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-white text-sm">COLONY BASE HUB (PRIMARY)</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-emerald-400 font-bold">98% SIGNAL</span>
                <span className="text-cyan-400">25 ms</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
            </div>

            {/* Child Relays */}
            <div className="pl-6 border-l-2 border-[#1e2f50] ml-4 space-y-3">
              {nodes
                .filter((n) => !n.name.includes('Colony'))
                .map((n) => {
                  const isOnline = n.status === 'ONLINE';
                  const isDegraded = n.status === 'DEGRADED';
                  const statusColor = isOnline
                    ? 'text-emerald-400 bg-emerald-950 border-emerald-500/30'
                    : isDegraded
                    ? 'text-amber-400 bg-amber-950 border-amber-500/30'
                    : 'text-red-400 bg-red-950 border-red-500/30';

                  return (
                    <div
                      key={n.id}
                      className="p-3 bg-[#0e172a] border border-[#1b2b4d] rounded flex items-center justify-between hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">├──</span>
                        <Wifi className={`w-4 h-4 ${isOnline ? 'text-emerald-400' : isDegraded ? 'text-amber-400' : 'text-red-400'}`} />
                        <span className="font-bold text-slate-200">{n.name}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${n.signalStrength > 70 ? 'text-emerald-400' : n.signalStrength > 30 ? 'text-amber-400' : 'text-red-400'}`}>
                          {n.signalStrength}% SIGNAL
                        </span>
                        <span className="text-slate-400">{n.latency} ms</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                          {n.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
