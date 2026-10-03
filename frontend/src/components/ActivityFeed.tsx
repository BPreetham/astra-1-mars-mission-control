'use client';

import React from 'react';
import { MissionEvent } from '@/lib/api';
import { Activity, Clock } from 'lucide-react';

interface ActivityFeedProps {
  events: MissionEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toTimeString().substring(0, 8);
    } catch {
      return '10:07:31';
    }
  };

  return (
    <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-3">
      <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <h4 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider">
            MISSION ACTIVITY FEED // TELEMETRY LOG
          </h4>
        </div>
        <span className="text-[9px] font-mono text-slate-400">REAL-TIME POSTGRES FEED</span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto py-1 scrollbar-thin">
        {events.slice(0, 8).map((ev) => {
          const isCritical = ev.severity === 'CRITICAL';
          const isWarning = ev.severity === 'WARNING';
          const isSuccess = ev.severity === 'SUCCESS';

          const badgeColor = isCritical
            ? 'text-red-400 bg-red-950/40 border-red-500/30'
            : isWarning
            ? 'text-amber-400 bg-amber-950/40 border-amber-500/30'
            : isSuccess
            ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
            : 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';

          return (
            <div
              key={ev.id}
              className="flex items-center gap-2 shrink-0 bg-[#0e172a] px-2.5 py-1.5 rounded border border-[#1d2d4d] text-[11px] font-mono"
            >
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatTime(ev.timestamp)}
              </span>
              <span className="text-slate-600">•</span>
              <span className={`px-1.5 py-0.5 rounded border font-semibold text-[9px] uppercase ${badgeColor}`}>
                {ev.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
