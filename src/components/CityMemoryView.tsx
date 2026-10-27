/**
 * NEXUS: THE LIVING CITY
 * City Memory View - Incident Retrospectives, Critic Audits & Knowledge Base
 */

import React, { useState } from 'react';
import {
  Archive,
  Search,
  CheckCircle2,
  Clock,
  TrendingDown,
  ShieldCheck,
  Scale,
  BrainCircuit,
  Filter,
} from 'lucide-react';
import { CityMemoryEntry, IncidentType } from '../types/city';

interface CityMemoryViewProps {
  memory: CityMemoryEntry[];
}

export const CityMemoryView: React.FC<CityMemoryViewProps> = ({ memory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredEntries = memory.filter((m) => {
    const matchesSearch =
      m.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.systemTakeaway.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || m.incidentType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080f]/95 text-slate-200 select-none space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl hud-panel border border-sky-500/30 bg-[#070c18]/90 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-display text-lg font-bold">
            <Archive className="w-5 h-5 text-sky-400" />
            <span>NEXUS EPISODIC CITY MEMORY ARCHIVE</span>
          </div>
          <p className="text-xs text-slate-400 font-ethiopic mt-0.5">
            የከተማው ታሪካዊ ክስተቶች ማህደር • Past Autonomous Interventions, Critic Audits, and Model Learning
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-800 text-xs font-mono text-sky-300">
          INDEXED INCIDENTS: {memory.length}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past crises, districts, or system takeaways..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-sky-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 font-mono text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 text-[11px]">TYPE:</span>
          {['ALL', 'heavy_rain', 'traffic_accident', 'power_outage', 'water_shortage'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2 py-1 rounded text-[10px] uppercase cursor-pointer ${
                selectedType === t
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Entries List */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-sky-500/40 transition-colors space-y-2.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <h4 className="font-display font-bold text-sm text-sky-100">
                  {entry.eventTitle}
                </h4>
                <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800/60 text-[10px] font-mono text-sky-300 uppercase">
                  {entry.district}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 uppercase">
                  {entry.incidentType.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{entry.timestamp}</span>
                </span>
                <span className="flex items-center space-x-1 text-emerald-400">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Score: {entry.criticScore}/100</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800/80">
                <span className="text-sky-400 font-semibold block text-[10px] mb-0.5">
                  SUPERVISOR ACTION EXECUTED:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {entry.supervisorAction}
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800/80">
                <span className="text-emerald-400 font-semibold block text-[10px] mb-0.5">
                  SYSTEM TAKEAWAY & NEURAL RETENTION:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {entry.systemTakeaway}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">COORDINATED AGENTS:</span>
                {entry.agentsInvolved.map((ag) => (
                  <span
                    key={ag}
                    className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[9.5px] text-sky-300 uppercase"
                  >
                    {ag}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-emerald-300">{entry.economicImpactBirr}</span>
                <span>Resolved in {entry.resolutionTimeMinutes}m</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
