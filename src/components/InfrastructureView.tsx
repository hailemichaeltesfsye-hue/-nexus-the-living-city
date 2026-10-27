/**
 * NEXUS: THE LIVING CITY
 * Infrastructure & Districts Master Registry View
 */

import React, { useState } from 'react';
import {
  Building2,
  Activity,
  Zap,
  Droplets,
  ShieldAlert,
  TrainTrack,
  Cpu,
  Crosshair,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { INITIAL_BUILDINGS, ETHIOPIAN_DISTRICTS } from '../data/ethiopianCityData';
import { BuildingInfo, DistrictId } from '../types/city';

interface InfrastructureViewProps {
  onFocusBuilding: (buildingId: string) => void;
  onFocusDistrict: (districtId: DistrictId) => void;
}

export const InfrastructureView: React.FC<InfrastructureViewProps> = ({
  onFocusBuilding,
  onFocusDistrict,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredBuildings = INITIAL_BUILDINGS.filter((b) => {
    if (filterType === 'ALL') return true;
    return b.type === filterType;
  });

  const getIcon = (type: BuildingInfo['type']) => {
    switch (type) {
      case 'hospital':
        return <Activity className="w-4 h-4 text-rose-400" />;
      case 'power':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'emergency':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'transit':
        return <TrainTrack className="w-4 h-4 text-purple-400" />;
      case 'tech':
      case 'civic':
        return <Cpu className="w-4 h-4 text-sky-400" />;
      default:
        return <Building2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080f]/95 text-slate-200 select-none space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl hud-panel border border-sky-500/30 bg-[#070c18]/90 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-display text-lg font-bold">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>NEXUS ADDIS METROPOLITAN INFRASTRUCTURE GRID</span>
          </div>
          <p className="text-xs text-slate-400 font-ethiopic mt-0.5">
            የመሰረተ ልማት አውታርና ዞኖች • Power, Water, Healthcare, Logistics & Public Maglev Hubs
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-800 text-xs font-mono text-sky-300">
          MONITORED ASSETS: {INITIAL_BUILDINGS.length} FACILITIES
        </div>
      </div>

      {/* 8 Districts Grid Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span>8 METROPOLITAN DISTRICTS & SECTOR STATUS</span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ETHIOPIAN_DISTRICTS.map((dist) => (
            <div
              key={dist.id}
              onClick={() => onFocusDistrict(dist.id)}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/90 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs text-sky-200 group-hover:text-sky-300">
                  {dist.name}
                </span>
                <Crosshair className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </div>
              <div className="text-[10px] text-slate-400 font-ethiopic">
                {dist.amharicName}
              </div>

              <div className="space-y-1 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Population:</span>
                  <span className="text-slate-200 font-bold">
                    {(dist.population / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Power Draw:</span>
                  <span className="text-yellow-300 font-bold">{dist.powerDemandMW} MW</span>
                </div>
                <div className="flex justify-between">
                  <span>Traffic Index:</span>
                  <span className="text-amber-400 font-bold">{dist.trafficLevel}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities Registry with Filter */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>CRITICAL INFRASTRUCTURE ASSETS REGISTRY</span>
          </h4>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 font-mono text-xs">
            {['ALL', 'hospital', 'power', 'water', 'emergency', 'transit', 'tech'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2 py-1 rounded text-[10px] uppercase cursor-pointer ${
                  filterType === f
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBuildings.map((bld) => (
            <div
              key={bld.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/40">
                    {getIcon(bld.type)}
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-xs text-sky-100">
                      {bld.name}
                    </h5>
                    <div className="text-[10px] text-slate-400 font-ethiopic">
                      {bld.amharicName}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onFocusBuilding(bld.id)}
                  className="p-1 rounded bg-sky-950 hover:bg-sky-900 text-sky-400 hover:text-sky-200 border border-sky-800 text-xs cursor-pointer"
                  title="Focus camera in 3D"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status and Load */}
              <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">OPERATIONAL SATURATION</span>
                  <span className="text-sky-300 font-bold">{bld.occupancyOrLoadPct}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400"
                    style={{ width: `${bld.occupancyOrLoadPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 text-[10.5px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>District:</span>
                  <span className="text-slate-200 uppercase font-semibold">{bld.district}</span>
                </div>
                {bld.metrics.capacity && (
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="text-slate-300 truncate max-w-[170px]">{bld.metrics.capacity}</span>
                  </div>
                )}
                {bld.metrics.energyUsageMW && (
                  <div className="flex justify-between">
                    <span>Power Load:</span>
                    <span className="text-yellow-300">{bld.metrics.energyUsageMW} MW</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
