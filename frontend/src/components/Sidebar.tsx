'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Radio, 
  Bot, 
  AlertTriangle, 
  Network, 
  Boxes, 
  BarChart3, 
  Cpu, 
  Radar,
  Compass
} from 'lucide-react';

const navItems = [
  { name: '1. Command Center', path: '/', icon: Activity },
  { name: '2. Astra Tracking', path: '/astra', icon: Radar },
  { name: '3. Robot Fleet', path: '/robots', icon: Bot },
  { name: '4. Emergencies', path: '/emergencies', icon: AlertTriangle },
  { name: '5. Communications', path: '/communications', icon: Network },
  { name: '6. Resources', path: '/resources', icon: Boxes },
  { name: '7. Analytics', path: '/analytics', icon: BarChart3 },
  { name: '8. Underground Structure', path: '/structure', icon: Compass },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#080d19] border-r border-[#1a2744] flex flex-col justify-between select-none shrink-0 h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1a2744]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black tracking-wider text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              A-1
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-widest text-slate-100 uppercase">
                ASTRA-1
              </h1>
              <p className="text-[10px] tracking-widest text-cyan-400/80 uppercase font-mono">
                MARS MISSION CONTROL
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#0c1426] px-2.5 py-1.5 rounded border border-[#16233d]">
            <span className="text-slate-400">COLONY POP</span>
            <span className="text-cyan-300 font-bold">10,000</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e172a] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1a2744] bg-[#070b14]">
        <div className="p-2 rounded bg-[#0b1324] border border-[#172540]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wider font-mono text-slate-400">SYSTEM STATUS</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              OPERATIONAL
            </span>
          </div>
          <div className="mt-1.5 text-[9px] font-mono text-slate-400 flex justify-between">
            <span>CORE: .NET 8 / EF</span>
            <span>DB: POSTGRESQL</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
