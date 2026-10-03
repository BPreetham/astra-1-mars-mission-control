'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, DashboardSummary } from '@/lib/api';
import { Header } from '@/components/Header';
import { StatusCards } from '@/components/StatusCards';
import { MarsMap } from '@/components/MarsMap';
import { EmergencyQuickPanel } from '@/components/EmergencyQuickPanel';
import { DecisionSupportPanel } from '@/components/DecisionSupportPanel';
import { ActivityFeed } from '@/components/ActivityFeed';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function CommandCenterPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error('Fetch dashboard error:', err);
      setError(err.message || 'Unable to connect to .NET backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 4000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleDeployFromMap = async (robotId: number) => {
    try {
      await api.deployRobot(robotId, { targetSector: 'Sector B-17', mission: 'ASTRA SEARCH' });
      await fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onRefreshNeeded={fetchDashboard} />

      <div className="p-5 space-y-4 flex-1">
        {/* Loading State */}
        {loading && !data && (
          <div className="h-96 flex flex-col items-center justify-center bg-[#091122] border border-[#1b2b4d] rounded-lg">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <span className="font-mono text-xs text-cyan-300 tracking-widest uppercase">
              LOADING MISSION TELEMETRY...
            </span>
            <span className="font-mono text-[10px] text-slate-500 mt-1">
              CONNECTING TO ASP.NET CORE // POSTGRESQL CLUSTER
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !data && (
          <div className="h-96 flex flex-col items-center justify-center bg-red-950/20 border border-red-500/50 rounded-lg p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
            <h3 className="font-mono text-sm font-bold text-red-300 tracking-wider uppercase">
              CONNECTION LOST
            </h3>
            <p className="font-mono text-xs text-slate-400 mt-1 max-w-md">
              Unable to retrieve mission telemetry from .NET backend. Verify service status on port 5000.
            </p>
            <button
              onClick={() => {
                setLoading(true);
                fetchDashboard();
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            >
              RETRY CONNECTION
            </button>
          </div>
        )}

        {/* Loaded Content */}
        {data && (
          <>
            {/* Top 4 Live Status Cards */}
            <StatusCards
              oxygen={data.topStatus.oxygen}
              resources={data.topStatus.resources}
              communication={data.topStatus.communication}
              robotFleet={data.topStatus.robotFleet}
            />

            {/* Central Interactive Mars Tactical Map */}
            <MarsMap
              robots={data.robots}
              astra={data.astra}
              emergencies={data.emergencies}
              commNodes={data.communicationNodes}
              structure={data.undergroundStructure}
              onDeployRobot={handleDeployFromMap}
            />

            {/* Bottom Row: Emergency Queue & Decision Support Engine */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EmergencyQuickPanel
                emergencies={data.emergencies}
                onActionComplete={fetchDashboard}
              />
              <DecisionSupportPanel
                recommendation={data.activeRecommendation}
                onActionComplete={fetchDashboard}
              />
            </div>

            {/* Mission Activity Feed */}
            <ActivityFeed events={data.recentEvents} />
          </>
        )}
      </div>
    </div>
  );
}
