/**
 * NEXUS: THE LIVING CITY
 * Onboarding Briefing Modal
 */

import React from 'react';
import {
  BrainCircuit,
  Box,
  Cpu,
  Sparkles,
  Command,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onStartDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl hud-panel border border-sky-500/40 bg-[#070c18] shadow-2xl p-6 space-y-6">
        {/* Top Header */}
        <div className="flex items-center space-x-3.5 border-b border-sky-950 pb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-sky-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#070c18] rounded-[10px] flex items-center justify-center font-bold text-sky-400 text-lg font-mono">
              NX
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-display font-bold text-sky-100 tracking-wide">
                NEXUS: THE LIVING CITY
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono border border-sky-500/40">
                AI DIGITAL TWIN
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Autonomous Multi-Agent AI Grid for Real-Time Urban Telemetry & Governance
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
              <Box className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sky-200">Interactive 3D Twin</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Explore 8 stylized districts of Addis Ababa, moving vehicle traffic, maglev monorail, and click any building for live telemetry.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-emerald-200">11 Autonomous Agents</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Coordinated by a Central Supervisor AI with Critic auditing (threshold ≥ 75) that detects conflicts and synthesizes compromises.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-purple-200">Future Simulator</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ask "What happens if..." or adjust population, traffic, and climate sliders to calculate the City Resilience Score (0–100).
            </p>
          </div>
        </div>

        {/* Hotkey Shortcuts Bar */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">Space</kbd> Pause/Play</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">Ctrl+K</kbd> Command Palette</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">H</kbd> Cinema Mode</span>
          </div>
          <span className="text-emerald-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Demo Engine Ready</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-sky-950">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 cursor-pointer"
          >
            ENTER COMMAND CENTER
          </button>

          <button
            onClick={() => {
              onClose();
              onStartDemo();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-display font-bold text-xs flex items-center space-x-2 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>RUN CINEMATIC DEMO NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
