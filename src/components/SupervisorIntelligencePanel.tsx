/**
 * NEXUS: THE LIVING CITY
 * Supervisor Intelligence Panel - Right Tactical AI Operations & Critic Audit Deck
 */

import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Scale,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  GitBranch,
  Terminal,
  Activity,
  Layers,
  Radio,
  CloudSun,
  Satellite,
} from 'lucide-react';
import { AgentEngineState } from '../simulation/agentEngine';
import { AgentId } from '../types/city';
import { realtimeAddisService, RealtimeAddisState } from '../services/realtimeAddisService';
import { AuditLog } from './AuditLog';

interface SupervisorIntelligencePanelProps {
  agentState: AgentEngineState;
  onFocusAgent?: (agentId: AgentId) => void;
}

export const SupervisorIntelligencePanel: React.FC<SupervisorIntelligencePanelProps> = ({
  agentState,
  onFocusAgent,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'feed' | 'dag'>('feed');
  const [showLlamaGuard, setShowLlamaGuard] = useState<boolean>(true);
  const [realtimeState, setRealtimeState] = useState<RealtimeAddisState>(() =>
    realtimeAddisService.getState()
  );

  useEffect(() => {
    return realtimeAddisService.subscribe((s) => setRealtimeState({ ...s }));
  }, []);

  const supervisor = agentState.agents.supervisor;
  const critic = agentState.agents.critic;
  const latestResolution = agentState.resolutions[0];
  const latestEvaluation = agentState.criticEvaluations[0];
  const activeConflict = agentState.activeConflict;

  const filteredMessages = agentState.messages.filter((msg) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ALERTS') return msg.type === 'ALERT';
    if (filterType === 'PROPOSALS') return msg.type === 'PROPOSAL';
    if (filterType === 'DIRECTIVES') return msg.type === 'DIRECTIVE';
    return true;
  });

  return (
    <div className="w-84 h-full flex flex-col justify-between hud-panel border-l border-sky-950/60 bg-[#070b14]/92 z-20 select-none overflow-hidden">
      {/* Panel Top Header */}
      <div className="p-3.5 border-b border-sky-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-display font-bold text-sky-200 tracking-wide">
                SUPERVISOR AI
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                ማዕከላዊ ተቆጣጣሪ • Latency {supervisor?.latencyMs || 12}ms
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900/80 p-0.5 rounded border border-slate-800 font-mono text-[9px]">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                viewMode === 'feed' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              FEED
            </button>
            <button
              onClick={() => setViewMode('dag')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${
                viewMode === 'dag' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              DAG TREE
            </button>
          </div>
        </div>

        {/* Current Supervisor Directive */}
        <div className="mt-2.5 p-2 rounded bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-300 leading-snug">
          <span className="text-sky-400 font-semibold font-mono text-[10px] mr-1.5">[DIRECTIVE]:</span>
          {supervisor?.currentRecommendation || 'Maintaining equilibrium across all 8 metropolitan sectors.'}
        </div>

        {/* Real-Time Addis Ababa External API Telemetry Card */}
        <div className="mt-2 p-2 rounded-lg bg-sky-950/30 border border-cyan-500/30 font-mono text-[10px] space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] font-bold text-cyan-300 tracking-wider">
                LIVE ADDIS TELEMETRY
              </span>
            </div>
            <span className="text-[9px] text-slate-400">EAT {realtimeState.addisLocalTime}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-sky-900/40 text-[9px]">
            <div className="flex items-center gap-1 text-slate-300">
              <CloudSun className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="truncate">
                {realtimeState.weather.temperatureC}°C · {realtimeState.weather.weatherCondition}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Activity className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span className="truncate">
                AQI {realtimeState.airQuality.aqi} · {realtimeState.airQuality.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Radio className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                Flow {realtimeState.traffic.averageSpeedKmh} km/h ({realtimeState.traffic.overallDensityPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Satellite className="w-3 h-3 text-purple-400 flex-shrink-0" />
              <span className="truncate">
                ESSGI Orbit {realtimeState.satellite.signalStrengthPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Scrollable Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {viewMode === 'dag' ? (
          <div className="space-y-2.5 font-mono text-[11px]">
            <div className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mb-2 flex items-center space-x-1">
              <GitBranch className="w-3.5 h-3.5" />
              <span>ACTIVE REASONING DAG PIPELINE</span>
            </div>

            {/* Level 1: Observation Vector */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-sky-800/60 relative">
              <span className="text-[9px] text-sky-400 font-bold block">1. SENSOR VECTOR INGEST</span>
              <span className="text-slate-300 text-[10px]">
                8 Metropolitan Districts • 12 Critical Facilities • 1,450 Road Sensors
              </span>
            </div>

            <div className="flex justify-center -my-1 text-sky-500 font-bold">↓</div>

            {/* Level 2: Domain Agent Proposals */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-amber-800/60 relative space-y-1">
              <span className="text-[9px] text-amber-400 font-bold block">2. DOMAIN AGENT DIVERGENCE</span>
              <div className="text-[10px] text-slate-300">
                • <b className="text-amber-400">Traffic:</b> Restrict arterial flow
              </div>
              <div className="text-[10px] text-slate-300">
                • <b className="text-rose-400">Emergency:</b> Demand unimpeded ingress
              </div>
            </div>

            <div className="flex justify-center -my-1 text-amber-500 font-bold">↓</div>

            {/* Level 3: Supervisor Synthesis */}
            <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-500/70 relative">
              <span className="text-[9px] text-sky-300 font-bold block">3. SUPERVISOR ARBITRATION</span>
              <span className="text-sky-100 text-[10px] font-semibold">
                Dynamic Priority Corridor + High-Ground Diversion
              </span>
            </div>

            <div className="flex justify-center -my-1 text-rose-500 font-bold">↓</div>

            {/* Level 4: Critic Audit */}
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/70 relative flex items-center justify-between">
              <div>
                <span className="text-[9px] text-rose-300 font-bold block">4. CRITIC SAFETY AUDIT</span>
                <span className="text-emerald-400 text-[10px] font-bold">
                  Score: 94/100 (Threshold ≥ 75)
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold">
                PASSED
              </span>
            </div>

            <div className="flex justify-center -my-1 text-emerald-500 font-bold">↓</div>

            {/* Level 5: Actuators */}
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-600/70 relative">
              <span className="text-[9px] text-emerald-400 font-bold block">5. ACTUATOR EXECUTION</span>
              <span className="text-slate-300 text-[10px]">
                Signals Flipped • Matrix Signs Updated • Pumps Engaged
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* ACTIVE CONFLICT & COORDINATION (If conflict present) */}
            {activeConflict && (
              <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-950/30 space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-300 font-mono text-[10px] font-bold">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                  <span>ACTIVE CONFLICT DETECTED</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-start space-x-1.5">
                    <span className="font-mono text-amber-400 font-bold shrink-0 text-[10px]">
                      {activeConflict.agentA.id.toUpperCase()}:
                    </span>
                    <span className="text-slate-300 leading-tight">{activeConflict.agentA.claim}</span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-start space-x-1.5">
                    <span className="font-mono text-rose-400 font-bold shrink-0 text-[10px]">
                      {activeConflict.agentB.id.toUpperCase()}:
                    </span>
                    <span className="text-slate-300 leading-tight">{activeConflict.agentB.claim}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-amber-900/40 text-[10px] text-amber-200">
                  <span className="font-semibold text-amber-400">Supervisor Synthesis: </span>
                  {activeConflict.supervisorVerdict}
                </div>
              </div>
            )}

        {/* LATEST COORDINATED RESOLUTION */}
        {latestResolution && (
          <div className="p-2.5 rounded-lg border border-sky-800/40 bg-sky-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-sky-300 font-mono text-[10px] font-bold">
                <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                <span>COORDINATED PLAN</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800">
                {latestResolution.status}
              </span>
            </div>

            <div className="text-[11px] font-semibold text-sky-100 leading-tight">
              {latestResolution.coordinatedStrategy}
            </div>

            <div className="space-y-1 pt-1 border-t border-sky-900/30">
              {latestResolution.steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 text-[10px] text-slate-300">
                  <span className="font-mono text-sky-400 shrink-0 font-bold">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CRITIC & JUDGE AUDIT CARD */}
        <div className="p-2.5 rounded-lg border border-rose-900/40 bg-rose-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-rose-300 font-mono text-[10px] font-bold">
              <Scale className="w-3.5 h-3.5 text-rose-400" />
              <span>CRITIC & JUDGE AUDIT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowLlamaGuard(!showLlamaGuard)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  showLlamaGuard
                    ? 'bg-purple-900/60 border-purple-500 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {showLlamaGuard ? 'LLAMA-GUARD: ACTIVE' : 'LLAMA-GUARD'}
              </button>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300">
                THRESHOLD ≥ 75
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-900/70 border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Current Audit Score</div>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold font-mono text-rose-300">
                  {latestEvaluation ? latestEvaluation.score : critic?.qualityScore || 96}
                </span>
                <span className="text-[10px] font-mono text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">Safety Verdict</div>
              <div className="flex items-center space-x-1 text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {latestEvaluation
                    ? latestEvaluation.approved
                      ? 'APPROVED'
                      : 'RETRY'
                    : 'VERIFIED'}
                </span>
              </div>
            </div>
          </div>

          {/* Criteria breakdown */}
          <div className="space-y-1 text-[10px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Effectiveness</span>
              <span className="text-sky-300">{latestEvaluation?.criteria.effectiveness || 96}%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400"
                style={{ width: `${latestEvaluation?.criteria.effectiveness || 96}%` }}
              />
            </div>

            <div className="flex justify-between text-slate-400 pt-0.5">
              <span>Safety Margin</span>
              <span className="text-emerald-300">{latestEvaluation?.criteria.safety || 98}%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${latestEvaluation?.criteria.safety || 98}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic bg-slate-900/40 p-1.5 rounded border border-slate-800/60">
            "{latestEvaluation?.feedback || critic?.currentRecommendation || 'Continuous audit guarantees zero ambulance delay.'}"
          </div>

          {/* LLAMA-GUARD CONSTITUTIONAL AUDIT LOG COMPONENT */}
          {showLlamaGuard && (
            <div className="pt-2 border-t border-purple-900/30">
              <AuditLog />
            </div>
          )}
        </div>

        {/* LIVE AI ACTIVITY LOG FEED */}
        <div>
          <div className="flex items-center justify-between pb-1.5 border-b border-sky-950">
            <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
              <Terminal className="w-3 h-3 text-sky-400" />
              <span>LIVE AI EVENT FEED</span>
            </div>

            <div className="flex items-center space-x-1">
              {['ALL', 'ALERTS', 'PROPOSALS'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`text-[8px] font-mono px-1 py-0.5 rounded cursor-pointer ${
                    filterType === f
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredMessages.map((msg) => {
              const sender = agentState.agents[msg.senderId];
              const isAlert = msg.type === 'ALERT';
              const isProposal = msg.type === 'PROPOSAL';
              const isDirective = msg.type === 'DIRECTIVE';

              return (
                <div
                  key={msg.id}
                  onClick={() => onFocusAgent && onFocusAgent(msg.senderId)}
                  className={`p-1.5 rounded border text-[10.5px] transition-colors cursor-pointer ${
                    isAlert
                      ? 'bg-rose-950/25 border-rose-800/40 text-rose-200'
                      : isDirective
                      ? 'bg-sky-950/25 border-sky-800/40 text-sky-200'
                      : isProposal
                      ? 'bg-amber-950/20 border-amber-800/30 text-amber-200'
                      : 'bg-slate-900/50 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                    <span className="font-bold flex items-center space-x-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ backgroundColor: sender?.accentColor || '#38bdf8' }}
                      />
                      <span style={{ color: sender?.accentColor || '#38bdf8' }}>
                        {sender?.name.toUpperCase() || msg.senderId.toUpperCase()}
                      </span>
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="leading-snug">{msg.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
  </div>

      {/* Bottom Telemetry Ticker */}
      <div className="p-2 border-t border-sky-900/30 bg-[#05080f] text-[10px] font-mono flex items-center justify-between text-slate-400">
        <span className="flex items-center space-x-1">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>NEURAL MESH: 11 NODES</span>
        </span>
        <span className="text-slate-400">100% DETERMINISTIC</span>
      </div>
    </div>
  );
};
