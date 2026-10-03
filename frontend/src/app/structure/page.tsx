'use client';

import React, { useState, useEffect } from 'react';
import { api, UndergroundStructure, AstraStatus } from '@/lib/api';
import { Header } from '@/components/Header';
import { Compass, Waves, Activity, AlertCircle, ShieldAlert, Layers, Radio } from 'lucide-react';

export default function StructurePage() {
  const [structure, setStructure] = useState<UndergroundStructure | null>(null);
  const [astra, setAstra] = useState<AstraStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [st, a] = await Promise.all([
        api.getUndergroundStructure(),
        api.getAstraStatus(),
      ]);
      setStructure(st);
      setAstra(a);
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

  const astraSignal = astra?.signalStrength || 88;
  const structSignal = structure?.energySignature || 91;

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRefreshNeeded={loadData} />

      <div className="p-5 space-y-4 flex-1">
        {/* Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1222] border border-emerald-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-black text-slate-100 uppercase tracking-widest">
                  UNKNOWN UNDERGROUND STRUCTURE // ANOMALY ALPHA
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/40">
                  {structure?.status || 'UNDER INVESTIGATION'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                SUB-SURFACE SEISMIC & RESONANT EMISSION DETECTED BY SECTOR B SEISMOMETERS
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-[#0e172a] px-3 py-1.5 rounded border border-[#1e2e4f]">
            <span className="text-slate-400">INVESTIGATION PROTOCOL: </span>
            <span className="text-cyan-400 font-bold">PASSIVE SURVEY // NO EXCAVATION</span>
          </div>
        </div>

        {/* Structure Metrics */}
        {structure && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">LOCATION</span>
              <div className="text-xl font-mono font-bold text-slate-100 mt-1">
                Sector B-21
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                COORDS: {structure.latitude.toFixed(3)}° S, {structure.longitude.toFixed(3)}° E
              </div>
            </div>

            <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">ESTIMATED DEPTH</span>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {structure.depth} m
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                BASALTIC REGOLITH CRUST
              </div>
            </div>

            <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">ENERGY SIGNATURE</span>
              <div className="text-xl font-mono font-bold text-purple-400 mt-1">
                {structure.energySignature}%
              </div>
              <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: `${structure.energySignature}%` }} />
              </div>
            </div>

            <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase">DISTANCE FROM ASTRA</span>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                {structure.distanceFromAstraKm} km
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                RADIAL OFFSET BEARING 142°
              </div>
            </div>
          </div>
        )}

        {/* Visual Signal Comparison */}
        <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2.5 mb-4">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                COMPARATIVE SIGNAL HARMONICS: ASTRA BEACON VS UNDERGROUND STRUCTURE
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              HARMONIC OVERLAP RATIO: 94.2%
            </span>
          </div>

          <div className="space-y-4">
            {/* Astra Signal Bar */}
            <div className="bg-[#0e172a] border border-[#1e2e4f] p-3.5 rounded-lg">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-red-400 font-bold flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5" />
                  ASTRA SIGNAL (433.92 MHz)
                </span>
                <span className="text-red-300 font-extrabold">{astraSignal}%</span>
              </div>
              <div className="font-mono text-xs text-red-400 tracking-wider">
                {'█'.repeat(Math.floor((astraSignal / 100) * 20))}
                {'░'.repeat(20 - Math.floor((astraSignal / 100) * 20))}
                <span className="ml-3 font-bold">{astraSignal}%</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                Pulsed periodic transponder emission from colony emergency protector unit.
              </p>
            </div>

            {/* Structure Signal Bar */}
            <div className="bg-[#0e172a] border border-[#1e2e4f] p-3.5 rounded-lg">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-purple-400 font-bold flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5" />
                  STRUCTURE SIGNAL (432.85 MHz)
                </span>
                <span className="text-purple-300 font-extrabold">{structSignal}%</span>
              </div>
              <div className="font-mono text-xs text-purple-400 tracking-wider">
                {'█'.repeat(Math.floor((structSignal / 100) * 20))}
                {'░'.repeat(20 - Math.floor((structSignal / 100) * 20))}
                <span className="ml-3 font-bold">{structSignal}%</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                Resonant continuous wave from unidentified subterranean structure at 340m depth.
              </p>
            </div>
          </div>

          {/* Neutral Scientific Note */}
          <div className="mt-4 p-3 rounded bg-blue-950/20 border border-blue-500/30 text-xs font-mono text-slate-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-cyan-300 font-bold uppercase">SCIENTIFIC ADVISORY: </span>
              The subterranean emission shares harmonic carrier attributes with Astra's transponder, but current telemetry does not confirm whether the structure is hostile, synthetic, or a natural resonant quartz intrusion. Passive observation remains standard operating procedure while surface rovers prioritize locating Astra.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
