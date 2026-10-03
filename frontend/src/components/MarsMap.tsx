'use client';

import React, { useState } from 'react';
import { Robot, AstraStatus, Emergency, CommunicationNode, UndergroundStructure } from '@/lib/api';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Bot, 
  Radio, 
  AlertTriangle, 
  Network, 
  Compass, 
  Zap,
  X,
  Crosshair
} from 'lucide-react';

interface MarsMapProps {
  robots: Robot[];
  astra: AstraStatus;
  emergencies: Emergency[];
  commNodes: CommunicationNode[];
  structure?: UndergroundStructure | null;
  onDeployRobot?: (robotId: number) => void;
}

export function MarsMap({
  robots,
  astra,
  emergencies,
  commNodes,
  structure,
  onDeployRobot,
}: MarsMapProps) {
  // Layer toggles
  const [showRobots, setShowRobots] = useState(true);
  const [showAstra, setShowAstra] = useState(true);
  const [showStorm, setShowStorm] = useState(true);
  const [showEmergencies, setShowEmergencies] = useState(true);
  const [showComms, setShowComms] = useState(true);
  const [showStructure, setShowStructure] = useState(true);

  // Zoom & pan
  const [zoom, setZoom] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'robot' | 'astra' | 'emergency' | 'comm' | 'structure';
    data: any;
  } | null>(null);

  // Map coordinate projection
  // Mars Lat [-4.5 to -4.75] -> Y [50 to 450]
  // Mars Lon [137.38 to 137.68] -> X [50 to 750]
  const projectX = (lon: number) => {
    const minLon = 137.38;
    const maxLon = 137.68;
    return 60 + ((lon - minLon) / (maxLon - minLon)) * 680;
  };

  const projectY = (lat: number) => {
    const minLat = -4.52;
    const maxLat = -4.75;
    return 60 + ((lat - minLat) / (maxLat - minLat)) * 380;
  };

  // Colony coordinate
  const colonyX = projectX(137.4417);
  const colonyY = projectY(-4.5895);

  // Astra coordinates
  const astraX = projectX(astra.longitude || 137.575);
  const astraY = projectY(astra.latitude || -4.685);

  // Structure coordinates
  const structX = projectX(structure?.longitude || 137.620);
  const structY = projectY(structure?.latitude || -4.712);

  return (
    <div className="relative bg-[#070b14] border border-[#1b2b4d] rounded-lg overflow-hidden flex flex-col h-[520px]">
      {/* Top Map Toolbar */}
      <div className="bg-[#0b1325]/90 backdrop-blur border-b border-[#1b2b4d] px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase">
            MARS TACTICAL SURFACE MAP // SECTORS A-01 TO C-24
          </span>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-cyan-300">
            <input
              type="checkbox"
              checked={showRobots}
              onChange={(e) => setShowRobots(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span className="text-cyan-400">Robots ({robots.length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-red-300">
            <input
              type="checkbox"
              checked={showAstra}
              onChange={(e) => setShowAstra(e.target.checked)}
              className="accent-red-500 rounded"
            />
            <span className="text-red-400">Astra Beacon</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-purple-300">
            <input
              type="checkbox"
              checked={showStorm}
              onChange={(e) => setShowStorm(e.target.checked)}
              className="accent-purple-500 rounded"
            />
            <span className="text-purple-400">Energy Storm</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-300">
            <input
              type="checkbox"
              checked={showEmergencies}
              onChange={(e) => setShowEmergencies(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="text-amber-400">Emergencies ({emergencies.filter(e => e.status !== 'RESOLVED').length})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-300">
            <input
              type="checkbox"
              checked={showComms}
              onChange={(e) => setShowComms(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="text-blue-400">Comms</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-300">
            <input
              type="checkbox"
              checked={showStructure}
              onChange={(e) => setShowStructure(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="text-emerald-400">Underground Structure</span>
          </label>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 overflow-hidden bg-[#050811] cursor-crosshair">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#132038" strokeWidth="0.8" />
            </pattern>
            {/* Storm Gradient */}
            <radialGradient id="stormGradient">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            {/* Anomaly Gradient */}
            <radialGradient id="anomalyGradient">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="800" height="500" fill="url(#grid)" />

          {/* Martian Topographic Contour Lines */}
          <g stroke="#1b2e50" strokeWidth="1" fill="none" opacity="0.6">
            <ellipse cx="250" cy="180" rx="160" ry="110" />
            <ellipse cx="250" cy="180" rx="110" ry="70" strokeDasharray="3 3" />
            <ellipse cx="580" cy="340" rx="180" ry="120" />
            <ellipse cx="580" cy="340" rx="130" ry="80" strokeDasharray="4 4" />
            <ellipse cx="580" cy="340" rx="70" ry="40" />
          </g>

          {/* Sector labels */}
          <g fill="#2d4875" fontSize="9" fontFamily="monospace">
            <text x="70" y="80">SEC A-01</text>
            <text x="250" y="80">SEC A-02 [COLONY]</text>
            <text x="450" y="80">SEC A-03</text>
            <text x="650" y="80">SEC A-04</text>
            <text x="70" y="240">SEC B-10</text>
            <text x="250" y="240">SEC B-14</text>
            <text x="450" y="240">SEC B-17 [ASTRA TARGET]</text>
            <text x="650" y="240">SEC B-21 [ANOMALY ALPHA]</text>
            <text x="70" y="420">SEC C-01</text>
            <text x="250" y="420">SEC C-08</text>
            <text x="450" y="420">SEC C-15</text>
            <text x="650" y="420">SEC C-24</text>
          </g>

          {/* Communication Links Topology */}
          {showComms && (
            <g stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6">
              {commNodes.map((n) => (
                <line
                  key={`line-${n.id}`}
                  x1={colonyX}
                  y1={colonyY}
                  x2={projectX(n.longitude)}
                  y2={projectY(n.latitude)}
                  stroke={n.status === 'ONLINE' ? '#3b82f6' : n.status === 'DEGRADED' ? '#f59e0b' : '#ef4444'}
                />
              ))}
            </g>
          )}

          {/* Energy Storm Zone */}
          {showStorm && (
            <g>
              <circle
                cx={540}
                cy={310}
                r="170"
                fill="url(#stormGradient)"
                className="animate-pulse"
              />
              <circle
                cx={540}
                cy={310}
                r="90"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity="0.8"
              />
              <text
                x="540"
                y="200"
                fill="#fca5a5"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                ⚠ IONOSPHERIC ENERGY STORM (94.5%)
              </text>
            </g>
          )}

          {/* Underground Structure */}
          {showStructure && structure && (
            <g
              className="cursor-pointer group"
              onClick={() => setSelectedEntity({ type: 'structure', data: structure })}
            >
              <circle
                cx={structX}
                cy={structY}
                r="35"
                fill="url(#anomalyGradient)"
              />
              <polygon
                points={`${structX},${structY - 14} ${structX + 12},${structY + 10} ${structX - 12},${structY + 10}`}
                fill="#10b981"
                stroke="#34d399"
                strokeWidth="2"
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              />
              <text
                x={structX}
                y={structY + 24}
                fill="#34d399"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                STRUCTURE (340m DEPTH)
              </text>
            </g>
          )}

          {/* Astra Last Known Position */}
          {showAstra && (
            <g
              className="cursor-pointer"
              onClick={() => setSelectedEntity({ type: 'astra', data: astra })}
            >
              <circle
                cx={astraX}
                cy={astraY}
                r="28"
                fill="#ef4444"
                fillOpacity="0.25"
                className="animate-ping"
              />
              <circle
                cx={astraX}
                cy={astraY}
                r="12"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="2"
                className="drop-shadow-[0_0_12px_rgba(239,68,68,1)]"
              />
              <text
                x={astraX}
                y={astraY - 16}
                fill="#fca5a5"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="extrabold"
                textAnchor="middle"
              >
                ★ ASTRA (88% BEACON)
              </text>
            </g>
          )}

          {/* Colony Base Hub */}
          <g>
            <circle
              cx={colonyX}
              cy={colonyY}
              r="14"
              fill="#0891b2"
              stroke="#67e8f9"
              strokeWidth="2"
              className="drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]"
            />
            <text
              x={colonyX}
              y={colonyY - 18}
              fill="#67e8f9"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              COLONY HABITAT (10,000 POP)
            </text>
          </g>

          {/* Communication Nodes */}
          {showComms &&
            commNodes.map((n) => {
              const nx = projectX(n.longitude);
              const ny = projectY(n.latitude);
              const isColony = n.name.includes('Colony');
              if (isColony) return null;
              const color = n.status === 'ONLINE' ? '#3b82f6' : n.status === 'DEGRADED' ? '#f59e0b' : '#ef4444';
              return (
                <g
                  key={n.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedEntity({ type: 'comm', data: n })}
                >
                  <circle cx={nx} cy={ny} r="7" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                  <text
                    x={nx}
                    y={ny + 15}
                    fill={color}
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {n.name.split(' ')[0]} ({n.signalStrength}%)
                  </text>
                </g>
              );
            })}

          {/* Emergencies */}
          {showEmergencies &&
            emergencies
              .filter((e) => e.status !== 'RESOLVED')
              .map((em) => {
                const ex = projectX(em.longitude);
                const ey = projectY(em.latitude);
                const isCrit = em.severity === 'CRITICAL';
                return (
                  <g
                    key={em.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedEntity({ type: 'emergency', data: em })}
                  >
                    <polygon
                      points={`${ex},${ey - 9} ${ex + 8},${ey + 6} ${ex - 8},${ey + 6}`}
                      fill={isCrit ? '#ef4444' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="animate-bounce"
                    />
                    <text
                      x={ex}
                      y={ey + 16}
                      fill={isCrit ? '#f87171' : '#fbbf24'}
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      ! {em.locationName}
                    </text>
                  </g>
                );
              })}

          {/* Robot Fleet */}
          {showRobots &&
            robots.map((r) => {
              const rx = projectX(r.longitude);
              const ry = projectY(r.latitude);
              const isOffline = r.status === 'OFFLINE';
              const isSearching = r.status === 'SEARCHING';
              const fill = isOffline ? '#64748b' : isSearching ? '#f59e0b' : '#06b6d4';

              return (
                <g
                  key={r.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedEntity({ type: 'robot', data: r })}
                >
                  <circle
                    cx={rx}
                    cy={ry}
                    r="8"
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="group-hover:scale-125 transition-transform"
                  />
                  <text
                    x={rx}
                    y={ry - 10}
                    fill={fill}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {r.robotCode} ({r.battery}%)
                  </text>
                </g>
              );
            })}
        </svg>

        {/* Selected Entity Popup / Drawer */}
        {selectedEntity && (
          <div className="absolute top-3 right-3 w-80 bg-[#091122]/95 border border-cyan-500/50 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur p-4 text-xs font-mono text-slate-200 z-20">
            <div className="flex items-center justify-between border-b border-[#1f3054] pb-2 mb-3">
              <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                {selectedEntity.type === 'robot' && <Bot className="w-4 h-4 text-cyan-400" />}
                {selectedEntity.type === 'astra' && <Radio className="w-4 h-4 text-red-400" />}
                {selectedEntity.type === 'emergency' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {selectedEntity.type === 'comm' && <Network className="w-4 h-4 text-blue-400" />}
                {selectedEntity.type === 'structure' && <Compass className="w-4 h-4 text-emerald-400" />}
                {selectedEntity.type.toUpperCase()} DETAILS
              </span>
              <button
                onClick={() => setSelectedEntity(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedEntity.type === 'robot' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">UNIT:</span>
                  <span className="text-white font-bold">{selectedEntity.data.robotCode} - {selectedEntity.data.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">STATUS:</span>
                  <span className="text-cyan-400 font-bold">{selectedEntity.data.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BATTERY:</span>
                  <span className="text-emerald-400 font-bold">{selectedEntity.data.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CURRENT MISSION:</span>
                  <span className="text-amber-300">{selectedEntity.data.currentMission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">COMM LINK:</span>
                  <span className="text-blue-300">{selectedEntity.data.communicationStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">COORDINATES:</span>
                  <span className="text-slate-300">{selectedEntity.data.latitude.toFixed(3)}°, {selectedEntity.data.longitude.toFixed(3)}°</span>
                </div>

                {selectedEntity.data.status !== 'OFFLINE' && (
                  <button
                    onClick={() => {
                      onDeployRobot?.(selectedEntity.data.id);
                      setSelectedEntity(null);
                    }}
                    className="w-full mt-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase rounded text-[11px] transition-colors"
                  >
                    DEPLOY TO SECTOR B-17
                  </button>
                )}
              </div>
            )}

            {selectedEntity.type === 'astra' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">IDENTIFIER:</span>
                  <span className="text-red-400 font-bold">COLONY PROTECTOR ASTRA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LAST KNOWN:</span>
                  <span className="text-amber-300 font-bold">{selectedEntity.data.lastKnownLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SIGNAL STRENGTH:</span>
                  <span className="text-emerald-400 font-bold">{selectedEntity.data.signalStrength}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CONFIDENCE:</span>
                  <span className="text-cyan-400 font-bold">{selectedEntity.data.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DISTANCE TO BASE:</span>
                  <span className="text-slate-200">{selectedEntity.data.distanceFromColonyKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RECOVERY WINDOW:</span>
                  <span className="text-red-400 font-bold">{selectedEntity.data.recoveryCountdown}</span>
                </div>
              </div>
            )}

            {selectedEntity.type === 'structure' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">DESIGNATION:</span>
                  <span className="text-emerald-400 font-bold">{selectedEntity.data.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SECTOR:</span>
                  <span className="text-white">Sector B-21</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DEPTH:</span>
                  <span className="text-cyan-300 font-bold">{selectedEntity.data.depth} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ENERGY SIGNATURE:</span>
                  <span className="text-purple-400 font-bold">{selectedEntity.data.energySignature}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RESONANCE FREQ:</span>
                  <span className="text-slate-300">{selectedEntity.data.frequency} MHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ASTRA DISTANCE:</span>
                  <span className="text-amber-300 font-bold">{selectedEntity.data.distanceFromAstraKm} km</span>
                </div>
              </div>
            )}

            {selectedEntity.type === 'emergency' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">TYPE:</span>
                  <span className="text-amber-300 font-bold">{selectedEntity.data.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SEVERITY:</span>
                  <span className={`font-bold ${selectedEntity.data.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                    {selectedEntity.data.severity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LOCATION:</span>
                  <span className="text-white">{selectedEntity.data.locationName}</span>
                </div>
                <p className="text-[11px] text-slate-300 border-t border-slate-700/60 pt-1.5 mt-1.5">
                  {selectedEntity.data.description}
                </p>
              </div>
            )}

            {selectedEntity.type === 'comm' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">NODE:</span>
                  <span className="text-white font-bold">{selectedEntity.data.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">STATUS:</span>
                  <span className={`font-bold ${selectedEntity.data.status === 'ONLINE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedEntity.data.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SIGNAL:</span>
                  <span className="text-cyan-400 font-bold">{selectedEntity.data.signalStrength}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">LATENCY:</span>
                  <span className="text-slate-300">{selectedEntity.data.latency} ms</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
