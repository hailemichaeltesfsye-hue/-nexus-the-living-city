/**
 * NEXUS: THE LIVING CITY
 * Building & Infrastructure Telemetry Inspector Modal
 */

import React from 'react';
import {
  X,
  Building,
  Zap,
  Activity,
  Droplets,
  ShieldAlert,
  TrainTrack,
  Radio,
  Crosshair,
  AlertTriangle,
} from 'lucide-react';
import { BuildingInfo } from '../types/city';

interface BuildingInspectorModalProps {
  building: BuildingInfo | null;
  onClose: () => void;
  onFocus: () => void;
  onTriggerIncidentHere: () => void;
}

export const BuildingInspectorModal: React.FC<BuildingInspectorModalProps> = ({
  building,
  onClose,
  onFocus,
  onTriggerIncidentHere,
}) => {
  if (!building) return null;

  const getTypeIcon = () => {
    switch (building.type) {
      case 'hospital':
        return <Activity className="w-5 h-5 text-rose-400" />;
      case 'power':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'water':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'emergency':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'transit':
        return <TrainTrack className="w-5 h-5 text-purple-400" />;
      default:
        return <Building className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="fixed top-16 right-90 z-30 w-80 hud-panel rounded-xl border border-sky-500/30 bg-[#070b14]/95 shadow-2xl p-3.5 space-y-3 select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2.5">
          <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/40">
            {getTypeIcon()}
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-sky-100 leading-tight">
              {building.name}
            </h4>
            <div className="text-[10px] text-slate-400 font-ethiopic">
              {building.amharicName}
            </div>
            <div className="flex items-center space-x-1.5 mt-1 font-mono text-[9px]">
              <span className="px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-sky-300 uppercase">
                {building.district}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300 uppercase">
                {building.type}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status & Load Gauge */}
      <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">OPERATIONAL LOAD</span>
          <span className="font-bold text-sky-300">{building.occupancyOrLoadPct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              building.occupancyOrLoadPct > 85
                ? 'bg-rose-500'
                : building.occupancyOrLoadPct > 70
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
            style={{ width: `${building.occupancyOrLoadPct}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block text-[9px]">PRIMARY CAPACITY</span>
          <span className="text-slate-200 font-bold truncate block">
            {building.metrics.capacity || `${building.height * 20} Units`}
          </span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-400 block text-[9px]">ENERGY DRAW</span>
          <span className="text-yellow-300 font-bold block">
            {building.metrics.energyUsageMW
              ? `${building.metrics.energyUsageMW} MW`
              : `${(building.height * 0.15).toFixed(1)} MW`}
          </span>
        </div>
      </div>

      {building.metrics.specialUnits && (
        <div className="text-[10px] text-slate-300 bg-sky-950/30 p-2 rounded border border-sky-900/40 font-mono">
          <span className="text-sky-400 font-semibold block text-[9px]">SPECIALIZED HARDWARE:</span>
          {building.metrics.specialUnits}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-sky-950">
        <button
          onClick={onFocus}
          className="px-2.5 py-1.5 rounded-md bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-[11px] font-mono text-sky-200 flex items-center justify-center space-x-1 cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5 text-sky-400" />
          <span>Focus Camera</span>
        </button>

        <button
          onClick={onTriggerIncidentHere}
          className="px-2.5 py-1.5 rounded-md bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-[11px] font-mono text-rose-200 flex items-center justify-center space-x-1 cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Simulate Crisis</span>
        </button>
      </div>
    </div>
  );
};
