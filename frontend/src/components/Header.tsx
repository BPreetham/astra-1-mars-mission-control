'use client';

import React, { useState, useEffect } from 'react';
import { api, SimulationStatus } from '@/lib/api';
import { Play, RotateCcw, FastForward, AlertOctagon, Clock, Zap } from 'lucide-react';

interface HeaderProps {
  onRefreshNeeded?: () => void;
}

export function Header({ onRefreshNeeded }: HeaderProps) {
  const [earthTime, setEarthTime] = useState<string>('');
  const [marsSol, setMarsSol] = useState<number>(428);
  const [simStatus, setSimStatus] = useState<SimulationStatus | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20538); // 05:42:18 baseline
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  useEffect(() => {
    // Ticking Clock
    const timer = setInterval(() => {
      const now = new Date();
      setEarthTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchSim = async () => {
    try {
      const res = await api.getSimulationStatus();
      setSimStatus(res);
      if (res.secondsRemaining > 0) {
        setSecondsRemaining(res.secondsRemaining);
      }
    } catch {
      // API may be waking up
    }
  };

  useEffect(() => {
    fetchSim();
    const interval = setInterval(fetchSim, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartSim = async () => {
    try {
      setLoadingAction(true);
      const res = await api.startSimulation();
      setSimStatus(res);
      setSecondsRemaining(res.secondsRemaining);
      onRefreshNeeded?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStepSim = async () => {
    try {
      setLoadingAction(true);
      const res = await api.stepSimulation();
      setSimStatus(res);
      setSecondsRemaining(res.secondsRemaining);
      onRefreshNeeded?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetSim = async () => {
    try {
      setLoadingAction(true);
      await api.resetSimulation();
      await fetchSim();
      onRefreshNeeded?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  // Format countdown string
  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header className="bg-[#090f1d] border-b border-[#1b294b] px-5 py-3 sticky top-0 z-20 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Mission Branding & Earth/Mars Time */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                SOL {marsSol}
              </span>
              <h2 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase">
                ASTRA-1 / MISSION CONTROL
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
              <span>{earthTime || 'SYNCHRONIZING...'}</span>
              <span>•</span>
              <span className="text-amber-400">GALE CRATER SECTOR 4</span>
            </div>
          </div>

          {/* Energy Storm Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-red-950/40 border border-red-500/40 px-3 py-1 rounded">
            <Zap className="w-4 h-4 text-red-400 animate-pulse" />
            <div>
              <div className="text-[10px] font-mono font-semibold text-red-300 uppercase leading-none">
                ENERGY STORM
              </div>
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">
                CRITICAL (94.5%)
              </div>
            </div>
          </div>
        </div>

        {/* Center: Recovery Window Countdown */}
        <div className="flex items-center gap-3 bg-[#0d162a] border border-[#23355d] px-4 py-1.5 rounded shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <Clock className="w-5 h-5 text-red-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              ASTRA RECOVERY WINDOW
            </div>
            <div className="text-xl font-mono font-black text-red-400 tracking-widest tabular-nums">
              {formatCountdown(secondsRemaining)}
            </div>
          </div>
        </div>

        {/* Right: Crisis Simulation Controls */}
        <div className="flex items-center gap-2">
          {simStatus && (
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[10px] font-mono text-slate-400">
                STAGE {simStatus.currentStage} / {simStatus.totalStages}
              </span>
              <span className="text-[11px] font-mono font-semibold text-cyan-300 truncate max-w-[200px]">
                {simStatus.stageTitle}
              </span>
            </div>
          )}

          <button
            onClick={handleStartSim}
            disabled={loadingAction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/50 rounded transition-all shadow-[0_0_8px_rgba(245,158,11,0.2)] disabled:opacity-50"
            title="Start crisis simulation"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START CRISIS</span>
          </button>

          <button
            onClick={handleStepSim}
            disabled={loadingAction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 rounded transition-all disabled:opacity-50"
            title="Progress to next simulation stage"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>STEP NEXT</span>
          </button>

          <button
            onClick={handleResetSim}
            disabled={loadingAction}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded transition-all disabled:opacity-50"
            title="Reset mission to initial baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </header>
  );
}
