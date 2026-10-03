'use client';

import React, { useState, useEffect } from 'react';
import { api, Emergency, Robot } from '@/lib/api';
import { Header } from '@/components/Header';
import { AlertTriangle, CheckCircle, ShieldAlert, UserCheck, Bot, Clock, MapPin } from 'lucide-react';

export default function EmergencyCenterPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [emList, rList] = await Promise.all([
        api.getEmergencies(),
        api.getRobots(),
      ]);
      setEmergencies(emList);
      setRobots(rList);
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

  const handlePrioritize = async (id: number) => {
    try {
      setActionLoading(id);
      await api.prioritizeEmergency(id, 'CRITICAL');
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssign = async (id: number, robotId: number) => {
    try {
      setActionLoading(id);
      await api.assignEmergency(id, robotId);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      setActionLoading(id);
      await api.resolveEmergency(id);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRefreshNeeded={loadData} />

      <div className="p-5 space-y-5 flex-1">
        {/* Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b1222] border border-amber-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500/50 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-black text-slate-100 uppercase tracking-widest">
                COLONY CRISIS & EMERGENCY CENTER
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                TRIAGE, PRIORITY ESCALATION, AND AUTONOMOUS ROVER DISPATCH
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-[#0e172a] px-3 py-1.5 rounded border border-[#1e2e4f]">
            <span className="text-slate-400">TOTAL EMERGENCIES: </span>
            <span className="text-amber-400 font-bold">{emergencies.length}</span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="text-emerald-400 font-bold">
              {emergencies.filter(e => e.status === 'RESOLVED').length} RESOLVED
            </span>
          </div>
        </div>

        {/* Severity Groups */}
        <div className="space-y-6">
          {severities.map((sev) => {
            const items = emergencies.filter((e) => e.severity === sev);
            const isCrit = sev === 'CRITICAL';
            const isHigh = sev === 'HIGH';

            return (
              <div key={sev} className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4">
                <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isCrit ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : isHigh ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                    />
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
                      {sev} SEVERITY QUEUE ({items.length})
                    </h3>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-4 text-xs font-mono text-slate-500">
                    NO {sev} EMERGENCIES LOGGED
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((em) => {
                      const isResolved = em.status === 'RESOLVED';
                      return (
                        <div
                          key={em.id}
                          className={`p-3.5 rounded border font-mono text-xs transition-all ${
                            isResolved
                              ? 'bg-[#090e1a] border-slate-800 text-slate-500'
                              : isCrit
                              ? 'bg-red-950/20 border-red-500/40 text-slate-200'
                              : 'bg-[#0e172a] border-[#1d2f53] text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-extrabold text-slate-100 text-sm">
                              {em.type}
                            </span>
                            <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {em.locationName}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 mb-2.5">
                            {em.description}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-[#162544] pt-2 mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(em.createdAt).toLocaleTimeString()}
                            </span>
                            <span className={isResolved ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                              STATUS: {em.status}
                            </span>
                          </div>

                          {em.assignedRobotCode && (
                            <div className="mb-2 text-[10px] text-cyan-300 flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5 text-cyan-400" />
                              <span>DISPATCHED: {em.assignedRobotCode}</span>
                            </div>
                          )}

                          {!isResolved && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#162544]">
                              {sev !== 'CRITICAL' && (
                                <button
                                  onClick={() => handlePrioritize(em.id)}
                                  disabled={actionLoading === em.id}
                                  className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded transition-colors disabled:opacity-50"
                                >
                                  PRIORITIZE TO CRITICAL
                                </button>
                              )}

                              {/* Assign dropdown */}
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssign(em.id, parseInt(e.target.value));
                                  }
                                }}
                                defaultValue=""
                                className="px-2 py-1 text-[10px] bg-[#050913] border border-[#20345d] text-slate-200 rounded focus:outline-none"
                              >
                                <option value="" disabled>
                                  ASSIGN ROVER...
                                </option>
                                {robots
                                  .filter((r) => r.status !== 'OFFLINE')
                                  .map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.robotCode} ({r.battery}%)
                                    </option>
                                  ))}
                              </select>

                              <button
                                onClick={() => handleResolve(em.id)}
                                disabled={actionLoading === em.id}
                                className="ml-auto px-3 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-black rounded transition-colors disabled:opacity-50"
                              >
                                RESOLVE
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
