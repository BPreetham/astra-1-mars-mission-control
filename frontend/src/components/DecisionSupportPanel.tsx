'use client';

import React, { useState } from 'react';
import { Recommendation, api } from '@/lib/api';
import { Cpu, CheckCircle, ShieldCheck, Check, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface DecisionSupportPanelProps {
  recommendation?: Recommendation | null;
  onActionComplete?: () => void;
}

export function DecisionSupportPanel({
  recommendation,
  onActionComplete,
}: DecisionSupportPanelProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!recommendation) return;
    try {
      setLoading(true);
      const res = await api.acceptRecommendation(recommendation.id);
      setSuccessMsg(res.message);
      onActionComplete?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!recommendation) {
    return (
      <div className="bg-[#0b1222] border border-[#1b2b4d] rounded-lg p-4 flex flex-col justify-center items-center text-center h-full">
        <Cpu className="w-8 h-8 text-slate-600 mb-2" />
        <span className="text-xs font-mono text-slate-400">
          DATA-DRIVEN ENGINE COMPUTING NEXT RECOMMENDATION...
        </span>
      </div>
    );
  }

  const isAccepted = recommendation.status === 'ACCEPTED';

  return (
    <div className="bg-[#0b1222] border border-cyan-500/30 rounded-lg p-4 flex flex-col justify-between h-full shadow-[0_0_15px_rgba(6,182,212,0.08)] relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b2b4d] pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              DATA-DRIVEN DECISION SUPPORT ENGINE
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-bold">
            CONFIDENCE: {recommendation.confidence}%
          </span>
        </div>

        {/* Recommended Action */}
        <div className="bg-[#0e172a] border border-[#1e2e4f] p-3 rounded-md mb-3">
          <div className="text-[10px] font-mono text-slate-400 uppercase">
            RECOMMENDED ACTION
          </div>
          <div className="text-sm font-mono font-black text-cyan-300 tracking-wider mt-0.5">
            {recommendation.recommendedAction}
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            {recommendation.reason}
          </p>
        </div>

        {/* Explainable Factor Breakdown */}
        <div className="space-y-1.5 mb-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            REASONING & FACTOR CONTRIBUTION:
          </div>
          {recommendation.factors && recommendation.factors.length > 0 ? (
            recommendation.factors.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs font-mono bg-[#09101f] px-2.5 py-1 rounded border border-[#17243e]"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">{f.factorName}</span>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-[11px] text-cyan-400 font-semibold">{f.factorValue}</span>
                  <span className="text-[10px] text-slate-500">+{f.contribution}pts</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[11px] font-mono text-slate-400">
              ✓ Verified Astra signal strength (88%)
              <br />✓ Closest available rover with battery &gt; 50%
              <br />✓ Multi-hop communication route viable
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-[#1b2b4d] flex items-center justify-between gap-3">
        {isAccepted ? (
          <div className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded font-mono text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>RECOMMENDATION ACCEPTED // {recommendation.target} DEPLOYED</span>
          </div>
        ) : (
          <>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-extrabold uppercase rounded tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] disabled:opacity-50"
            >
              {loading ? 'DEPLOYING...' : 'ACCEPT & DEPLOY'}
            </button>
            <Link
              href="/analytics"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold uppercase rounded border border-slate-700 transition-colors flex items-center gap-1"
            >
              <span>VIEW ANALYSIS</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
