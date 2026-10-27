/**
 * NEXUS: THE LIVING CITY
 * SelfHealingGrid.tsx — Autonomous Self-Healing City Grid Mechanic
 *
 * Activated from the Hazard panel. Animates a live telemetry
 * status sequence: Critical → Healing → Healed in 5 seconds with
 * smooth colour transitions, real-time step log and district badges.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Zap,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  Activity,
  Cpu,
  Radio,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

// ─── Heal sequence steps ──────────────────────────────────────────────────────
interface HealStep {
  id: string;
  ms: number;       // delay from activation
  label: string;
  sublabel: string;
  phase: 'critical' | 'healing' | 'healed';
  district: string;
  icon: React.ReactNode;
}

const HEAL_STEPS: HealStep[] = [
  {
    id: 'detect',
    ms: 0,
    label: 'ANOMALY DETECTED',
    sublabel: 'Grid voltage drop 34% — Kazanchis / Meskel sectors offline',
    phase: 'critical',
    district: 'KAZANCHIS · MESKEL',
    icon: <AlertOctagon className="w-3.5 h-3.5" />,
  },
  {
    id: 'reroute_power',
    ms: 800,
    label: 'Rerouting Power Grid…',
    sublabel: 'Switching to micro-grid Gotera backup — load shedding cancelled',
    phase: 'healing',
    district: 'GOTERA BACKUP',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  {
    id: 'traffic_override',
    ms: 1800,
    label: 'Traffic Signal Automation Override Applied',
    sublabel: 'All 48 smart signals switched to EMS priority corridor mode',
    phase: 'healing',
    district: 'ARTERIAL GRID',
    icon: <Radio className="w-3.5 h-3.5" />,
  },
  {
    id: 'agent_consensus',
    ms: 2900,
    label: 'Multi-Agent Consensus Reached',
    sublabel: 'Traffic × Energy × Emergency agents approved optimal reroute',
    phase: 'healing',
    district: 'SUPERVISOR AI',
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
  {
    id: 'healed',
    ms: 4200,
    label: 'Grid Status: HEALED & OPTIMIZED',
    sublabel: 'All sectors restored — efficiency +18% vs baseline',
    phase: 'healed',
    district: 'ALL DISTRICTS',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
];

// ─── District health badge ────────────────────────────────────────────────────
const DISTRICT_BADGES = [
  { name: 'Kazanchis', initial: 'critical' },
  { name: 'Meskel Sq.', initial: 'critical' },
  { name: 'Gotera', initial: 'stable' },
  { name: 'Bole', initial: 'stable' },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface SelfHealingGridProps {
  hazardActive: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const SelfHealingGrid: React.FC<SelfHealingGridProps> = ({ hazardActive }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
  const [healPhase, setHealPhase] = useState<'idle' | 'critical' | 'healing' | 'healed'>('idle');
  const [districtHealth, setDistrictHealth] = useState<Record<string, 'critical' | 'healing' | 'healed' | 'stable'>>({
    Kazanchis: 'critical',
    'Meskel Sq.': 'critical',
    Gotera: 'stable',
    Bole: 'stable',
  });
  const [gridPercent, setGridPercent] = useState(34);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Auto-reset when hazard is cleared externally
  useEffect(() => {
    if (!hazardActive) {
      resetGrid();
    } else {
      setHealPhase('critical');
      setDistrictHealth({ Kazanchis: 'critical', 'Meskel Sq.': 'critical', Gotera: 'stable', Bole: 'stable' });
      setGridPercent(34);
    }
  }, [hazardActive]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const resetGrid = useCallback(() => {
    clearTimers();
    setIsRunning(false);
    setVisibleSteps([]);
    setHealPhase('idle');
    setGridPercent(34);
    setDistrictHealth({ Kazanchis: 'critical', 'Meskel Sq.': 'critical', Gotera: 'stable', Bole: 'stable' });
  }, []);

  const startHealing = useCallback(() => {
    if (isRunning) return;
    clearTimers();
    setIsRunning(true);
    setVisibleSteps([]);
    setHealPhase('critical');
    soundEngine.playHazardAlert();

    HEAL_STEPS.forEach((step, idx) => {
      const t = setTimeout(() => {
        setVisibleSteps((prev) => [...prev, step.id]);
        setHealPhase(step.phase);

        // Animate grid % upward
        if (step.id === 'reroute_power') {
          setGridPercent(62);
          soundEngine.playEvacuationActivated();
        } else if (step.id === 'traffic_override') {
          setGridPercent(81);
          soundEngine.playP2PCrisisSynapse();
        } else if (step.id === 'agent_consensus') {
          setGridPercent(93);
          soundEngine.playP2PSynapse();
        } else if (step.id === 'healed') {
          setGridPercent(100);
          setDistrictHealth({
            Kazanchis: 'healed',
            'Meskel Sq.': 'healed',
            Gotera: 'healed',
            Bole: 'healed',
          });
          soundEngine.playCinemaTourEnd();
          // Mark idle after showing final healed state
          setTimeout(() => setIsRunning(false), 2000);
        }
      }, step.ms);
      timersRef.current.push(t);
    });
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), []);

  const phaseColor = {
    idle: 'text-slate-400',
    critical: 'text-rose-400',
    healing: 'text-amber-400',
    healed: 'text-emerald-400',
  }[healPhase];

  const phaseBorder = {
    idle: 'border-slate-700',
    critical: 'border-rose-500/60',
    healing: 'border-amber-500/60',
    healed: 'border-emerald-500/60',
  }[healPhase];

  const districtColor = (h: string) =>
    h === 'critical' ? 'bg-rose-600/20 border-rose-500/60 text-rose-300' :
    h === 'healing'  ? 'bg-amber-600/20 border-amber-500/60 text-amber-300' :
    h === 'healed'   ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300' :
    'bg-slate-800/50 border-slate-700 text-slate-400';

  if (!hazardActive && healPhase === 'idle') return null;

  return (
    <div className={`mt-3 rounded-xl border ${phaseBorder} bg-slate-950/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-700`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${phaseBorder} transition-colors duration-700`}>
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${phaseColor} ${isRunning && healPhase === 'healing' ? 'animate-spin' : ''}`} />
          <span className={`font-mono text-xs font-bold tracking-widest ${phaseColor}`}>
            AUTONOMOUS SELF-HEALING
          </span>
        </div>
        <div className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${phaseBorder} ${phaseColor}`}>
          {healPhase.toUpperCase()}
        </div>
      </div>

      {/* Grid Power Gauge */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-slate-400 tracking-wider">GRID POWER CAPACITY</span>
          <span className={`font-mono text-sm font-black ${phaseColor} transition-colors duration-700`}>
            {gridPercent}%
          </span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              gridPercent < 50 ? 'bg-gradient-to-r from-rose-700 to-rose-500' :
              gridPercent < 85 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
              'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
            }`}
            style={{ width: `${gridPercent}%` }}
          />
        </div>
      </div>

      {/* District Health Badges */}
      <div className="flex items-center gap-2 px-4 py-2 flex-wrap">
        {DISTRICT_BADGES.map((d) => (
          <div
            key={d.name}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-mono font-bold transition-all duration-700 ${districtColor(districtHealth[d.name])}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              districtHealth[d.name] === 'healed' ? 'bg-emerald-400 animate-pulse' :
              districtHealth[d.name] === 'healing' ? 'bg-amber-400 animate-ping' :
              districtHealth[d.name] === 'critical' ? 'bg-rose-500 animate-ping' :
              'bg-slate-500'
            }`} />
            {d.name}
          </div>
        ))}
      </div>

      {/* Live Telemetry Log */}
      <div className="px-4 pb-3 space-y-1.5 max-h-44 overflow-y-auto">
        {HEAL_STEPS.filter((s) => visibleSteps.includes(s.id)).map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-2.5 rounded-lg px-3 py-2 border transition-all duration-500 ${
              step.phase === 'critical' ? 'bg-rose-950/30 border-rose-800/40' :
              step.phase === 'healing'  ? 'bg-amber-950/30 border-amber-800/40' :
              'bg-emerald-950/30 border-emerald-800/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
            }`}
          >
            <div className={`mt-0.5 flex-shrink-0 ${
              step.phase === 'critical' ? 'text-rose-400' :
              step.phase === 'healing'  ? 'text-amber-400' :
              'text-emerald-400'
            }`}>
              {step.icon}
            </div>
            <div className="min-w-0">
              <div className={`font-mono text-[11px] font-bold leading-tight ${
                step.phase === 'critical' ? 'text-rose-300' :
                step.phase === 'healing'  ? 'text-amber-300' :
                'text-emerald-300'
              }`}>
                {step.label}
              </div>
              <div className="font-mono text-[9px] text-slate-400 leading-snug mt-0.5">
                {step.sublabel}
              </div>
              <div className={`font-mono text-[8px] tracking-widest mt-0.5 ${
                step.phase === 'critical' ? 'text-rose-500/70' :
                step.phase === 'healing'  ? 'text-amber-500/70' :
                'text-emerald-500/70'
              }`}>
                ↳ {step.district}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activate Button */}
      {!isRunning && healPhase !== 'healed' && (
        <div className="px-4 pb-3">
          <button
            id="nexus-self-heal-btn"
            onClick={startHealing}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600/80 to-rose-600/80 hover:from-amber-500 hover:to-rose-500 border border-amber-400/50 text-white font-mono text-xs font-bold tracking-widest transition-all shadow-[0_0_16px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            ACTIVATE AUTONOMOUS HEALING SEQUENCE
          </button>
        </div>
      )}

      {/* Healed final state badge */}
      {healPhase === 'healed' && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-950/50 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-black text-emerald-300 tracking-widest">
              GRID FULLY RESTORED — ALL SYSTEMS OPTIMAL
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfHealingGrid;
