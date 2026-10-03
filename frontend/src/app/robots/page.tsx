'use client';

import React, { useState, useEffect } from 'react';
import { api, Robot, RobotTelemetry } from '@/lib/api';
import { Header } from '@/components/Header';
import { 
  Bot, 
  Battery, 
  Wifi, 
  MapPin, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  X, 
  Navigation, 
  CornerDownLeft, 
  Send 
} from 'lucide-react';

export default function RobotFleetPage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [telemetry, setTelemetry] = useState<RobotTelemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [customMission, setCustomMission] = useState('');

  const loadRobots = async () => {
    try {
      const list = await api.getRobots();
      setRobots(list);
      if (selectedRobot) {
        const updated = list.find((r) => r.id === selectedRobot.id);
        if (updated) setSelectedRobot(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRobots();
    const interval = setInterval(loadRobots, 4000);
    return () => clearInterval(interval);
  }, [selectedRobot?.id]);

  const handleSelectRobot = async (r: Robot) => {
    setSelectedRobot(r);
    setActionMessage(null);
    try {
      const telem = await api.getRobotTelemetry(r.id);
      setTelemetry(telem);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeploy = async () => {
    if (!selectedRobot) return;
    try {
      setActionLoading(true);
      const res = await api.deployRobot(selectedRobot.id, {
        mission: 'ASTRA SEARCH & RESCUE',
        targetSector: 'Sector B-17',
      });
      setActionMessage(res.message);
      await loadRobots();
    } catch (err: any) {
      setActionMessage(err.message || 'Deploy failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedRobot) return;
    try {
      setActionLoading(true);
      const res = await api.returnRobot(selectedRobot.id);
      setActionMessage(res.message);
      await loadRobots();
    } catch (err: any) {
      setActionMessage(err.message || 'Return failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeMission = async () => {
    if (!selectedRobot || !customMission) return;
    try {
      setActionLoading(true);
      const res = await api.changeRobotMission(selectedRobot.id, customMission);
      setActionMessage(res.message);
      setCustomMission('');
      await loadRobots();
    } catch (err: any) {
      setActionMessage(err.message || 'Mission change failed');
    } finally {
      setActionLoading(false);
    }
  };

  const onlineCount = robots.filter((r) => r.status === 'ONLINE').length;
  const searchingCount = robots.filter((r) => r.status === 'SEARCHING').length;
  const offlineCount = robots.filter((r) => r.status === 'OFFLINE').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRefreshNeeded={loadRobots} />

      <div className="p-5 space-y-4 flex-1">
        {/* Fleet Summary Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-black text-slate-100 uppercase tracking-wider">
                AUTONOMOUS ROBOT FLEET // TELEMETRY & COMMAND
              </h2>
              <p className="text-xs font-mono text-slate-400">
                12 SURFACE UNITS ASSIGNED TO ASTRA-1 EXPEDITION & CRISIS MANAGEMENT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="bg-[#0e172a] px-3 py-1.5 rounded border border-[#1e2e4f] flex items-center gap-2">
              <span className="text-slate-400">TOTAL:</span>
              <span className="text-slate-100 font-bold">12</span>
            </div>
            <div className="bg-emerald-950/30 px-3 py-1.5 rounded border border-emerald-500/30 flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{onlineCount} ONLINE</span>
            </div>
            <div className="bg-amber-950/30 px-3 py-1.5 rounded border border-amber-500/30 flex items-center gap-2 text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{searchingCount} SEARCHING</span>
            </div>
            <div className="bg-red-950/30 px-3 py-1.5 rounded border border-red-500/30 flex items-center gap-2 text-red-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>{offlineCount} OFFLINE</span>
            </div>
          </div>
        </div>

        {/* Robot Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {robots.map((r) => {
            const isOffline = r.status === 'OFFLINE';
            const isSearching = r.status === 'SEARCHING';
            const isSelected = selectedRobot?.id === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handleSelectRobot(r)}
                className={`p-4 rounded-lg border font-mono text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0e1c38] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-[#0b1222] border-[#1d2d4d] hover:border-cyan-500/50 hover:bg-[#0d1629]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-black text-cyan-300">
                    {r.robotCode}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                      isOffline
                        ? 'bg-red-950 text-red-400 border border-red-500/40'
                        : isSearching
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {r.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 font-bold truncate mb-3">
                  {r.name}
                </div>

                <div className="space-y-1.5 text-[11px] border-t border-[#172540] pt-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Battery className="w-3 h-3 text-emerald-400" />
                      Battery:
                    </span>
                    <span className={r.battery < 25 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {r.battery}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Location:
                    </span>
                    <span className="text-slate-200">
                      {r.latitude.toFixed(2)}°, {r.longitude.toFixed(2)}°
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-purple-400" />
                      Signal:
                    </span>
                    <span className="text-purple-300 font-semibold">{r.signalStrength}</span>
                  </div>

                  <div className="flex justify-between pt-1 border-t border-[#142036]">
                    <span className="text-slate-400">Mission:</span>
                    <span className="text-amber-300 truncate max-w-[140px]">{r.currentMission}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Robot Detail Modal / View */}
        {selectedRobot && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#091122] border border-cyan-500/60 rounded-lg max-w-2xl w-full p-5 font-mono text-xs text-slate-200 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1f3054] pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">
                    {selectedRobot.robotCode}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase">
                      {selectedRobot.name} // TELEMETRY & COMMAND INTERFACE
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      STATUS: {selectedRobot.status} // COMMS: {selectedRobot.communicationStatus}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRobot(null)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {actionMessage && (
                <div className="mb-4 p-2.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-[11px]">
                  {actionMessage}
                </div>
              )}

              {/* Detail Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-2.5 bg-[#0e172a] rounded border border-[#1b2b4d]">
                  <span className="text-[10px] text-slate-400 block">BATTERY</span>
                  <span className="text-lg font-bold text-emerald-400">{selectedRobot.battery}%</span>
                </div>
                <div className="p-2.5 bg-[#0e172a] rounded border border-[#1b2b4d]">
                  <span className="text-[10px] text-slate-400 block">TEMPERATURE</span>
                  <span className="text-lg font-bold text-cyan-400">{selectedRobot.temperature}°C</span>
                </div>
                <div className="p-2.5 bg-[#0e172a] rounded border border-[#1b2b4d]">
                  <span className="text-[10px] text-slate-400 block">SIGNAL</span>
                  <span className="text-lg font-bold text-purple-400">{selectedRobot.signalStrength}</span>
                </div>
                <div className="p-2.5 bg-[#0e172a] rounded border border-[#1b2b4d]">
                  <span className="text-[10px] text-slate-400 block">CURRENT MISSION</span>
                  <span className="text-xs font-bold text-amber-300 truncate block mt-1">
                    {selectedRobot.currentMission}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#1b2b4d] pt-3 mb-4 space-y-3">
                <div className="text-[10px] uppercase text-slate-400 font-bold">
                  COMMAND OVERRIDE & DISPATCH:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleDeploy}
                    disabled={actionLoading || selectedRobot.status === 'OFFLINE'}
                    className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase rounded text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>DEPLOY TO SECTOR B-17 (ASTRA RESCUE)</span>
                  </button>

                  <button
                    onClick={handleReturn}
                    disabled={actionLoading}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase rounded text-xs border border-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CornerDownLeft className="w-4 h-4" />
                    <span>RETURN TO BASE</span>
                  </button>
                </div>

                {/* Change Mission Field */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new mission (e.g. GEOLOGICAL SURVEY, PERIMETER GUARD)..."
                    value={customMission}
                    onChange={(e) => setCustomMission(e.target.value)}
                    className="flex-1 bg-[#050811] border border-[#1d2d4d] px-3 py-1.5 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleChangeMission}
                    disabled={actionLoading || !customMission}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase rounded text-xs disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>CHANGE MISSION</span>
                  </button>
                </div>
              </div>

              {/* Telemetry Log */}
              <div>
                <div className="text-[10px] uppercase text-slate-400 font-bold mb-2">
                  RECENT TELEMETRY SAMPLES ({telemetry.length}):
                </div>
                <div className="max-h-36 overflow-y-auto bg-[#050811] rounded border border-[#16233a] p-2 space-y-1.5">
                  {telemetry.length === 0 ? (
                    <div className="text-slate-500 text-center py-2">No historical telemetry recorded.</div>
                  ) : (
                    telemetry.slice(0, 10).map((t) => (
                      <div key={t.id} className="flex justify-between text-[10px] text-slate-400 border-b border-[#111c2e] pb-1">
                        <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
                        <span>LAT: {t.latitude.toFixed(3)}°</span>
                        <span>LON: {t.longitude.toFixed(3)}°</span>
                        <span className="text-emerald-400">BAT: {t.battery}%</span>
                        <span className="text-cyan-300">TEMP: {t.temperature}°C</span>
                        <span className="text-amber-300">{t.mission}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
