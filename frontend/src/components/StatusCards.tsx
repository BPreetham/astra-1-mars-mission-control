'use client';

import React from 'react';
import { Wind, Package, Wifi, Bot, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatusCardsProps {
  oxygen: {
    value: number;
    trend: string;
    status: string;
    productionRate: number;
    consumptionRate: number;
  };
  resources: {
    value: number;
    subtitle: string;
    status: string;
  };
  communication: {
    status: string;
    subtitle: string;
    relaysAffected: number;
    totalRelays: number;
  };
  robotFleet: {
    onlineCount: number;
    totalCount: number;
    searchingCount: number;
    offlineCount: number;
    status: string;
  };
}

export function StatusCards({
  oxygen,
  resources,
  communication,
  robotFleet,
}: StatusCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Oxygen Card */}
      <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            OXYGEN
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            {oxygen.status}
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="text-3xl font-mono font-extrabold text-slate-100 tracking-tight">
            {oxygen.value.toFixed(0)}%
          </div>
          <div className="flex items-center text-xs font-mono text-red-400 font-semibold">
            <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            {oxygen.trend}
          </div>
        </div>

        <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${oxygen.value}%` }}
          />
        </div>

        <div className="mt-2.5 flex justify-between text-[10px] font-mono text-slate-400">
          <span>PROD: {oxygen.productionRate.toFixed(1)}%</span>
          <span>CONS: {oxygen.consumptionRate.toFixed(1)}%</span>
        </div>
      </div>

      {/* 2. Resources Card */}
      <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            RESOURCES
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            {resources.status}
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="text-3xl font-mono font-extrabold text-slate-100 tracking-tight">
            {resources.value.toFixed(0)}%
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {resources.subtitle}
          </div>
        </div>

        <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${resources.value}%` }}
          />
        </div>

        <div className="mt-2.5 flex justify-between text-[10px] font-mono text-slate-400">
          <span>WATER: 64%</span>
          <span>FOOD: 71%</span>
        </div>
      </div>

      {/* 3. Communication Card */}
      <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-purple-400" />
            COMMUNICATION
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold">
            {communication.status}
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="text-2xl font-mono font-extrabold text-amber-400 tracking-tight">
            DEGRADED
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {communication.subtitle}
          </div>
        </div>

        <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-purple-400 h-full rounded-full transition-all duration-500"
            style={{ width: '42%' }}
          />
        </div>

        <div className="mt-2.5 flex justify-between text-[10px] font-mono text-slate-400">
          <span>RELAYS: 1 OFFLINE</span>
          <span>LATENCY: 830ms (PEAK)</span>
        </div>
      </div>

      {/* 4. Robot Fleet Card */}
      <div className="bg-[#0b1222] border border-[#1d2d4d] rounded-lg p-4 shadow-sm relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            ROBOT FLEET
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            {robotFleet.status}
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div className="text-3xl font-mono font-extrabold text-slate-100 tracking-tight">
            {robotFleet.onlineCount} / {robotFleet.totalCount}
          </div>
          <div className="text-xs font-mono text-emerald-400 font-semibold">
            ONLINE
          </div>
        </div>

        <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${(robotFleet.onlineCount / robotFleet.totalCount) * 100}%` }}
          />
        </div>

        <div className="mt-2.5 flex justify-between text-[10px] font-mono text-slate-400">
          <span>{robotFleet.searchingCount} SEARCHING</span>
          <span className="text-red-400">{robotFleet.offlineCount} OFFLINE</span>
        </div>
      </div>
    </div>
  );
}
