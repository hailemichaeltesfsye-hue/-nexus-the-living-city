/**
 * NEXUS: THE LIVING CITY
 * Incidents & Crisis Management Operations View
 */

import React from 'react';
import {
  AlertTriangle,
  Flame,
  CloudRain,
  Car,
  Zap,
  Droplets,
  Activity,
  TrainTrack,
  Wind,
  Crosshair,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { Incident, IncidentType, DistrictId } from '../types/city';
import { cityEngine } from '../simulation/cityEngine';

interface IncidentsViewProps {
  activeIncidents: Incident[];
  onFocusIncident: (incident: Incident) => void;
  onTriggerNewIncident: (type: IncidentType, district?: DistrictId) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  activeIncidents,
  onFocusIncident,
  onTriggerNewIncident,
}) => {
  const incidentButtons: { type: IncidentType; label: string; icon: any; color: string }[] = [
    { type: 'heavy_rain', label: 'Torrential Rain Front', icon: CloudRain, color: 'text-blue-400' },
    { type: 'traffic_accident', label: 'Arterial Pod Collision', icon: Car, color: 'text-amber-400' },
    { type: 'power_outage', label: 'Transformer Overheat', icon: Zap, color: 'text-yellow-400' },
    { type: 'water_shortage', label: 'Conduit Pressure Anomaly', icon: Droplets, color: 'text-cyan-400' },
    { type: 'hospital_emergency', label: 'Trauma ICU Surge', icon: Activity, color: 'text-pink-400' },
    { type: 'transit_failure', label: 'Maglev Rail Desync', icon: TrainTrack, color: 'text-purple-400' },
    { type: 'pollution_spike', label: 'Basin Smog Inversion', icon: Wind, color: 'text-emerald-400' },
    { type: 'infrastructure_failure', label: 'Watershed Gate Fault', icon: AlertTriangle, color: 'text-rose-400' },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080f]/95 text-slate-200 select-none space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl hud-panel border border-sky-500/30 bg-[#070c18]/90 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-display text-lg font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>NEXUS INCIDENT RESPONSE & CRISIS COMMAND</span>
          </div>
          <p className="text-xs text-slate-400 font-ethiopic mt-0.5">
            የአደጋ መቆጣጠሪያና ፈጣን ምላሽ ማስተባበሪያ • Autonomous Event Detection, Mitigation & Resolution
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs font-mono text-rose-300">
          ACTIVE ALERTS: {activeIncidents.length}
        </div>
      </div>

      {/* Trigger New Incident Sandbox */}
      <div className="p-4 rounded-xl hud-panel border border-sky-500/25 bg-[#070b14]/90 space-y-3">
        <div className="text-xs font-mono text-slate-400">
          STRESS-TEST INCIDENT GENERATOR (CLICK TO DEPLOY INTO LIVE CITY):
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {incidentButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.type}
                onClick={() => onTriggerNewIncident(btn.type)}
                className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/50 flex items-center space-x-2 text-xs font-mono text-slate-200 transition-all cursor-pointer group"
              >
                <Icon className={`w-4 h-4 shrink-0 ${btn.color} group-hover:scale-110 transition-transform`} />
                <span className="truncate">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Incidents List */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>CURRENT ACTIVE INCIDENTS & AUTONOMOUS MITIGATION PIPELINE</span>
        </h4>

        {activeIncidents.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h5 className="font-display font-bold text-sm text-sky-200">
              ALL SECTORS NOMINAL
            </h5>
            <p className="text-xs text-slate-400 font-mono">
              Zero active emergencies in progress. Deploy an incident above or launch the Showcase Demo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-rose-900/50 hover:border-rose-500/60 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <h4 className="font-display font-bold text-sm text-sky-100">
                        {incident.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-[10px] font-mono text-rose-300">
                        {incident.severity}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-ethiopic mt-0.5">
                      {incident.amharicTitle} • District: <b className="text-sky-300 uppercase">{incident.district}</b>
                    </div>
                  </div>

                  <button
                    onClick={() => onFocusIncident(incident)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-xs font-mono text-sky-200 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                    <span>Focus in 3D</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {incident.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">AUTONOMOUS RESOLUTION PROGRESS</span>
                    <span className="text-emerald-400 font-bold">
                      {Math.round(incident.responseProgress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${incident.responseProgress}%` }}
                    />
                  </div>
                </div>

                {/* Active Strategy & Agents */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 text-[10px]">EXECUTING PLAN: </span>
                    <span className="text-sky-300 font-semibold">
                      {incident.activeStrategyTitle || 'Supervisor synchronizing multi-agent priority matrix...'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 text-[10px]">AGENTS:</span>
                    {incident.assignedAgents.map((ag) => (
                      <span
                        key={ag}
                        className="px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-[9.5px] text-sky-300 uppercase"
                      >
                        {ag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
