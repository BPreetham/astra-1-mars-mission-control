'use client';

import React, { useState } from 'react';
import { Emergency, api } from '@/lib/api';
import { AlertTriangle, CheckCircle2, ShieldAlert, UserCheck } from 'lucide-react';

interface EmergencyQuickPanelProps {
  emergencies: Emergency[];
  onActionComplete?: () => void;
}

export function EmergencyQuickPanel({ emergencies, onActionComplete }: EmergencyQuickPanelProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handlePrioritize = async (id: number) => {
    try {
      setLoadingId(id);
      await api.prioritizeEmergency(id, 'CRITICAL');
      onActionComplete?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      setLoadingId(id);
      await api.resolveEmergency(id);
      onActionComplete?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const activeEmergencies = emergencies.slice(0, 4);

  return (
    <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            CRITICAL EMERGENCIES // PRIORITY QUEUE
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-[#121d33] px-2 py-0.5 rounded border border-[#1f3156]">
          {emergencies.filter(e => e.status !== 'RESOLVED').length} ACTIVE
        </span>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {activeEmergencies.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            NO ACTIVE EMERGENCIES DETECTED
          </div>
        ) : (
          activeEmergencies.map((em) => {
            const isCritical = em.severity === 'CRITICAL';
            const isResolved = em.status === 'RESOLVED';

            return (
              <div
                key={em.id}
                className={`p-3 rounded border text-xs font-mono transition-all ${
                  isResolved
                    ? 'bg-slate-900/40 border-slate-800 text-slate-500'
                    : isCritical
                    ? 'bg-red-950/20 border-red-500/40 text-slate-200 shadow-[0_0_10px_rgba(239,68,68,0.08)]'
                    : 'bg-[#0d172c] border-[#1d2f53] text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                        isResolved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : isCritical
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {em.severity}
                    </span>
                    <span className="font-bold text-slate-100">{em.type}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400">{em.locationName}</span>
                </div>

                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                  {em.description}
                </p>

                {em.assignedRobotCode && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-cyan-300">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    <span>ASSIGNED TO {em.assignedRobotCode}</span>
                  </div>
                )}

                {!isResolved && (
                  <div className="mt-2.5 pt-2 border-t border-[#182848] flex items-center justify-end gap-2">
                    {em.severity !== 'CRITICAL' && (
                      <button
                        onClick={() => handlePrioritize(em.id)}
                        disabled={loadingId === em.id}
                        className="px-2 py-1 text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded transition-colors disabled:opacity-50"
                      >
                        PRIORITIZE
                      </button>
                    )}

                    <button
                      onClick={() => handleResolve(em.id)}
                      disabled={loadingId === em.id}
                      className="px-2 py-1 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded transition-colors disabled:opacity-50"
                    >
                      RESOLVE
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
