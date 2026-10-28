/**
 * NEXUS: THE LIVING CITY
 * Navigation Sidebar - Left Futuristic Mission Control Rail
 */

import React from 'react';
import {
  LayoutDashboard,
  Box,
  Cpu,
  AlertTriangle,
  FlaskConical,
  Building2,
  BarChart3,
  Archive,
  Play,
  Sparkles,
  Command,
} from 'lucide-react';
import { ViewTab } from '../types/city';

interface NavigationSidebarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onRunDemo: () => void;
  isDemoRunning: boolean;
  onOpenCommandPalette: () => void;
  activeIncidentsCount: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentTab,
  onTabChange,
  onRunDemo,
  isDemoRunning,
  onOpenCommandPalette,
  activeIncidentsCount,
}) => {
  const navItems = [
    { id: 'overview' as ViewTab, label: 'Overview', amharic: 'አጠቃላይ እይታ', icon: LayoutDashboard },
    { id: 'twin3d' as ViewTab, label: 'Live City 3D', amharic: 'የከተማው መንታ', icon: Box },
    { id: 'agents' as ViewTab, label: 'AI Agents', amharic: 'የአይ-አይ ወኪሎች', icon: Cpu, badge: '11 Active' },
    {
      id: 'incidents' as ViewTab,
      label: 'Incidents',
      amharic: 'ክስተቶችና ድንገተኛ',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} LIVE` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    },
    { id: 'scenarios' as ViewTab, label: 'Future Simulator', amharic: 'የወደፊት ትንበያ', icon: FlaskConical },
    { id: 'infrastructure' as ViewTab, label: 'Infrastructure', amharic: 'መሰረተ ልማት', icon: Building2 },
    { id: 'analytics' as ViewTab, label: 'Analytics & KPIs', amharic: 'መረጃና ትንታኔ', icon: BarChart3 },
    { id: 'memory' as ViewTab, label: 'City Memory', amharic: 'የከተማው ማህደር', icon: Archive },
  ];

  return (
    <aside className="w-64 h-full flex flex-col justify-between hud-panel border-r border-sky-950/60 bg-[#070b14]/90 z-20 select-none">
      {/* Top Header */}
      <div>
        <div className="p-4 border-b border-sky-900/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-sky-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#070b14] rounded-[6px] flex items-center justify-center font-bold text-sky-400 text-sm font-mono">
                NX
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-bold tracking-widest text-sm text-sky-200">
                  NEXUS
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-mono border border-sky-500/30">
                  V3.8
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-ethiopic tracking-wide">
                ኔክሰስ አዲስ አበባ • Autonomous Twin
              </p>
            </div>
          </div>

          <div className="mt-3.5 px-2.5 py-1.5 rounded bg-sky-950/40 border border-sky-800/30 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Grid Status</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
              <span className="font-mono text-emerald-300 font-semibold text-[10px]">
                {activeIncidentsCount > 0 ? 'RESPONDING' : 'AUTONOMOUS'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-200 border border-sky-500/40 shadow-sm shadow-sky-500/10 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-sky-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[9px] text-slate-400 font-ethiopic">{item.amharic}</div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      item.badgeColor || 'bg-sky-950 text-sky-400 border-sky-800/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Showcase Demo & Actions */}
      <div className="p-3 border-t border-sky-900/30 space-y-2">
        <button
          onClick={onRunDemo}
          disabled={isDemoRunning}
          className={`w-full group relative overflow-hidden px-3 py-2.5 rounded-lg border font-display text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            isDemoRunning
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-200 shadow-md shadow-amber-500/20'
              : 'bg-gradient-to-r from-sky-600/30 via-cyan-600/20 to-emerald-600/30 border-sky-500/40 text-sky-100 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20'
          }`}
        >
          {isDemoRunning ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>SHOWCASE RUNNING...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-sky-400 text-sky-400 group-hover:scale-110 transition-transform" />
              <span>RUN CINEMATIC DEMO</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 hover:border-slate-700 cursor-pointer"
        >
          <div className="flex items-center space-x-1.5 font-mono">
            <Command className="w-3 h-3 text-slate-400" />
            <span>Command Palette</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 font-mono border border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Lead Architect & Developer Credit */}
        <div className="pt-2 border-t border-sky-950/70 text-left space-y-0.5">
          <div className="flex items-center justify-between text-[9px] font-mono text-sky-400">
            <span className="flex items-center space-x-1 font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
              <span>LEAD ARCHITECT</span>
            </span>
            <span className="text-slate-500">ADDIS ABABA</span>
          </div>
          <div className="text-[11.5px] font-display font-bold text-sky-100 tracking-wide">
            Hailemichael Tesfaye
          </div>
          <div className="text-[9.5px] text-slate-400 font-mono leading-tight">
            Agentic AI Engineer & Full Stack Web Developer
          </div>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              "Excited to unveil NEXUS: The Living City for the @MetaAI Global AI Hackathon ($150K)! 🇪🇹 An autonomous 11-agent municipal digital twin for Addis Ababa powered by Meta Llama 3.3 70B, @modal_labs H100 GPUs, and Meta SAM with dual Amharic voice dispatch.\n\nTry the live 3D twin: https://nexus-the-living-city.vercel.app\nCode: https://github.com/hailemichaeltesfsye-hue/-nexus-the-living-city\n\n#MetaAIHackathon #BuildWithLlama #Llama3 #ModalLabs"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2.5 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono text-slate-300 hover:text-white hover:border-sky-500 hover:bg-slate-800 transition-all cursor-pointer shadow"
          >
            <svg className="w-3 h-3 fill-current text-white" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="font-bold tracking-wide">Share Project on X</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
