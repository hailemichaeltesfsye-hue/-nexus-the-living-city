/**
 * NEXUS: THE LIVING CITY
 * Cinematic Demonstration Overlay (16-Step Showcase Banner)
 */

import React from 'react';
import { Sparkles, Square, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { DemoStepInfo } from '../simulation/demoStory';

interface CinematicOverlayProps {
  stepInfo: DemoStepInfo | null;
  onStop: () => void;
}

export const CinematicOverlay: React.FC<CinematicOverlayProps> = ({
  stepInfo,
  onStop,
}) => {
  if (!stepInfo) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 select-none pointer-events-auto animate-in slide-in-from-top-4 duration-200">
      <div className="hud-panel rounded-2xl p-4 border border-amber-500/50 bg-[#070c18]/95 shadow-2xl space-y-2.5">
        {/* Top Phase Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/60 text-amber-300 uppercase tracking-widest">
              PHASE: {stepInfo.phase}
            </span>
            <span className="text-xs font-mono text-slate-400">
              [Step {stepInfo.step} / {stepInfo.totalSteps}]
            </span>
          </div>

          <button
            onClick={onStop}
            className="px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-[10px] font-mono text-rose-300 flex items-center space-x-1 cursor-pointer"
          >
            <Square className="w-2.5 h-2.5 fill-current" />
            <span>EXIT SHOWCASE</span>
          </button>
        </div>

        {/* Step Titles */}
        <div>
          <h3 className="font-display font-bold text-base text-sky-100 leading-snug">
            {stepInfo.headline}
          </h3>
          <div className="text-xs text-amber-300 font-ethiopic">
            {stepInfo.amharicHeadline}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          {stepInfo.detail}
        </p>

        {/* Active Cooperating Agents */}
        <div className="pt-2 border-t border-sky-950 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3 h-3 text-sky-400" />
            <span className="text-slate-500">ACTIVE PARTICIPATING AGENTS:</span>
            {stepInfo.activeAgents.map((ag) => (
              <span
                key={ag}
                className="px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-sky-300 uppercase font-bold"
              >
                {ag}
              </span>
            ))}
          </div>

          <span className="text-slate-500">AUTONOMOUS SYNCHRONIZATION</span>
        </div>
      </div>
    </div>
  );
};
