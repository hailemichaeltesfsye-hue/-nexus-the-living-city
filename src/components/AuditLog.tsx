/**
 * NEXUS: THE LIVING CITY
 * AuditLog.tsx — Llama-Guard Constitutional AI Safety & Audit Log
 *
 * Expands the Critic & Judge Agent panel with real-time Llama-Guard safety checks,
 * constitutional guardrails, and an interactive simulated safety override event:
 *   • Vetoed prompt: "VETO: Cut hospital power to divert grid"
 *   • Passed safety badge: "LLAMA-GUARD PASSED: Alternative Clean Reroute Selected"
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Lock,
  Flame,
  Activity,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export interface AuditCheckItem {
  id: string;
  timestamp: string;
  category: 'LIFE_SAFETY' | 'INFRASTRUCTURE' | 'ETHICS' | 'CONGESTION';
  ruleId: string;
  action: string;
  verdict: 'PASSED' | 'VETOED' | 'OVERRIDDEN';
  detail: string;
  latencyMs: number;
}

const INITIAL_AUDIT_LOGS: AuditCheckItem[] = [
  {
    id: 'chk-01',
    timestamp: '12:04:18',
    category: 'LIFE_SAFETY',
    ruleId: 'CONST-ART-4.1',
    action: 'Tikur Anbessa EMS Lane Clearance',
    verdict: 'PASSED',
    detail: 'Zero interference with pediatric / critical trauma intake vectors.',
    latencyMs: 18,
  },
  {
    id: 'chk-02',
    timestamp: '12:03:55',
    category: 'INFRASTRUCTURE',
    ruleId: 'CONST-ART-7.3',
    action: 'Gotera Substation Dynamic Voltage Cap',
    verdict: 'PASSED',
    detail: 'Load delta within safe 12% tolerance bounds.',
    latencyMs: 24,
  },
  {
    id: 'chk-03',
    timestamp: '12:02:40',
    category: 'ETHICS',
    ruleId: 'CONST-ART-1.9',
    action: 'Pedestrian Density Sensor Depersonalization',
    verdict: 'PASSED',
    detail: 'All biometric identifiers scrubbed before supervisor edge ingestion.',
    latencyMs: 14,
  },
];

interface AuditLogProps {
  compact?: boolean;
}

export const AuditLog: React.FC<AuditLogProps> = ({ compact = false }) => {
  const [logs, setLogs] = useState<AuditCheckItem[]>(INITIAL_AUDIT_LOGS);
  const [isSimulatingOverride, setIsSimulatingOverride] = useState(false);
  const [overrideStep, setOverrideStep] = useState<
    'idle' | 'proposing' | 'vetoed' | 'analyzing' | 'passed'
  >('idle');
  const [complianceScore, setComplianceScore] = useState(98.8);
  const overrideTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearOverrideTimers = () => {
    overrideTimerRef.current.forEach(clearTimeout);
    overrideTimerRef.current = [];
  };

  useEffect(() => {
    return () => clearOverrideTimers();
  }, []);

  // Run the full Constitutional Safety Override sequence
  const handleSimulateSafetyOverride = useCallback(() => {
    if (isSimulatingOverride) return;
    clearOverrideTimers();
    setIsSimulatingOverride(true);
    setOverrideStep('proposing');

    soundEngine.playUiClick();

    // Step 1: Suboptimal proposal generated
    const t1 = setTimeout(() => {
      setOverrideStep('vetoed');
      soundEngine.playHazardAlert();
      setComplianceScore(94.2);

      const vetoLog: AuditCheckItem = {
        id: `chk-veto-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        category: 'LIFE_SAFETY',
        ruleId: 'CONST-ART-2.4',
        action: 'PROPOSAL: Cut hospital power to divert grid to Kazanchis commercial hub',
        verdict: 'VETOED',
        detail: 'VETO ENFORCED: Critical Healthcare Facility Power Protection Protocol §12.',
        latencyMs: 9,
      };

      setLogs((prev) => [vetoLog, ...prev.slice(0, 9)]);
    }, 1100);

    // Step 2: Critic Agent re-evaluates & searches constitutional alternatives
    const t2 = setTimeout(() => {
      setOverrideStep('analyzing');
      soundEngine.playP2PCrisisSynapse();
    }, 2800);

    // Step 3: Clean alternative passed & approved
    const t3 = setTimeout(() => {
      setOverrideStep('passed');
      soundEngine.playEvacuationActivated();
      setComplianceScore(99.6);

      const passLog: AuditCheckItem = {
        id: `chk-pass-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        category: 'INFRASTRUCTURE',
        ruleId: 'CONST-ART-5.8',
        action: 'Alternative Clean Reroute Selected (Gotera Micro-Grid Solar Backup)',
        verdict: 'OVERRIDDEN',
        detail: 'Hospital grid 100% preserved. 1.2MW renewable surplus dispatched.',
        latencyMs: 21,
      };

      setLogs((prev) => [passLog, ...prev.slice(0, 9)]);

      const tReset = setTimeout(() => {
        setIsSimulatingOverride(false);
      }, 4500);
      overrideTimerRef.current.push(tReset);
    }, 4400);

    overrideTimerRef.current.push(t1, t2, t3);
  }, [isSimulatingOverride]);

  return (
    <div className="space-y-2.5 font-mono">
      {/* ── Sub-header: Llama-Guard Constitutional Status ── */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-purple-950/20 border border-purple-800/40">
        <div className="flex items-center space-x-1.5">
          <Scale className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-200 tracking-wider">
            LLAMA-GUARD 3 CONSTITUTIONAL AUDIT
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-300">
            {complianceScore.toFixed(1)}% COMPLIANT
          </span>
        </div>
      </div>

      {/* ── Simulated Safety Override Showcase Card ── */}
      <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>CONSTITUTIONAL SAFETY OVERRIDE</span>
          </div>
          <button
            id="nexus-simulate-override-btn"
            onClick={handleSimulateSafetyOverride}
            disabled={isSimulatingOverride}
            className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all border ${
              isSimulatingOverride
                ? 'bg-purple-900/50 text-purple-300 border-purple-700 animate-pulse cursor-wait'
                : 'bg-purple-600/30 text-purple-200 border-purple-500 hover:bg-purple-600/50 cursor-pointer shadow-[0_0_8px_rgba(168,85,247,0.3)]'
            }`}
          >
            {isSimulatingOverride ? 'AUDITING…' : 'TEST OVERRIDE'}
          </button>
        </div>

        {/* Dynamic State Banner */}
        {overrideStep === 'idle' && (
          <div className="text-[9px] text-slate-400 p-2 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <span>Standby: Ready to stress-test Llama-Guard safety veto</span>
            <span className="text-purple-400 text-[8px]">● ARBITER READY</span>
          </div>
        )}

        {overrideStep === 'proposing' && (
          <div className="text-[9px] text-amber-300 p-2 rounded bg-amber-950/30 border border-amber-800/40 flex items-center gap-2 animate-pulse">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Incoming proposal: "Cut hospital power to divert grid to commercial hub"…</span>
          </div>
        )}

        {overrideStep === 'vetoed' && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/80 space-y-1 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-bounce-short">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[10px]">
              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>VETO: Cut hospital power to divert grid</span>
            </div>
            <div className="text-[9px] text-rose-200/90 leading-tight pl-5">
              Constitutional Violation: Rule 4.1 (Life Support Protection). Action automatically blocked in 9ms.
            </div>
          </div>
        )}

        {overrideStep === 'analyzing' && (
          <div className="p-2 rounded bg-purple-950/40 border border-purple-600/50 space-y-1 text-[9px] text-purple-200 animate-pulse">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>Synthesizing zero-harm constitutional reroute…</span>
            </div>
            <div className="text-purple-300/70 text-[8px] pl-5">
              Evaluating Gotera backup & solar storage micro-grid vectors
            </div>
          </div>
        )}

        {overrideStep === 'passed' && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-400/80 space-y-1.5 shadow-[0_0_18px_rgba(16,185,129,0.35)]">
            <div className="flex items-center gap-1.5 text-emerald-300 font-black text-[10px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>LLAMA-GUARD PASSED: Alternative Clean Reroute Selected</span>
            </div>
            <div className="text-[9px] text-emerald-200 leading-snug pl-5">
              Hospital grid 100% secured. Solar micro-grid deployed to relieve Kazanchis load shedding.
            </div>
            <div className="flex items-center gap-2 pl-5 pt-0.5 text-[8px] text-emerald-400/80">
              <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-700/60 font-bold">
                POLICY §4.1 PASS
              </span>
              <span>Latency: 21ms · Safety Margin: 99.8%</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Live Llama-Guard Audit Feed ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold px-1">
          <span>ACTIVE CONSTITUTIONAL TELEMETRY</span>
          <span className="text-purple-400/80">LLAMA 3.2 GUARD</span>
        </div>

        <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5">
          {logs.map((item) => (
            <div
              key={item.id}
              className={`p-1.5 rounded border text-[9px] transition-all ${
                item.verdict === 'VETOED'
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  : item.verdict === 'OVERRIDDEN'
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-0.5">
                <div className="flex items-center gap-1 truncate">
                  {item.verdict === 'VETOED' ? (
                    <XCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                  ) : item.verdict === 'OVERRIDDEN' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-sky-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{item.action}</span>
                </div>
                <span
                  className={`text-[8px] px-1 py-0.2 rounded border flex-shrink-0 ${
                    item.verdict === 'VETOED'
                      ? 'bg-rose-900/40 border-rose-600 text-rose-300'
                      : item.verdict === 'OVERRIDDEN'
                      ? 'bg-emerald-900/40 border-emerald-600 text-emerald-300'
                      : 'bg-sky-900/40 border-sky-600 text-sky-300'
                  }`}
                >
                  {item.verdict}
                </span>
              </div>
              <div className="text-[8px] text-slate-400 leading-tight truncate">
                {item.detail}
              </div>
              <div className="flex items-center justify-between text-[7px] text-slate-400 mt-0.5">
                <span>{item.ruleId}</span>
                <span>{item.timestamp} · {item.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
