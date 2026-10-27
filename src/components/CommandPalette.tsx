/**
 * NEXUS: THE LIVING CITY
 * Command Palette - Tactical Rapid Action Center (Ctrl+K)
 */

import React, { useState, useEffect } from 'react';
import {
  Command,
  Search,
  Play,
  Pause,
  Camera,
  AlertTriangle,
  Building2,
  Cpu,
  Archive,
  FlaskConical,
  X,
  FastForward,
  Siren,
} from 'lucide-react';
import { DistrictId, IncidentType, ViewTab } from '../types/city';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ViewTab) => void;
  onRunDemo: () => void;
  onTogglePlayPause: () => void;
  onSetSpeed: (speed: number) => void;
  onCameraPreset: (preset: 'overview' | 'ambulance' | DistrictId) => void;
  onTriggerIncident: (type: IncidentType) => void;
  onFocusBuilding: (buildingId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onRunDemo,
  onTogglePlayPause,
  onSetSpeed,
  onCameraPreset,
  onTriggerIncident,
  onFocusBuilding,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      category: 'SHOWCASE',
      id: 'demo',
      title: 'Run Cinematic Showcase Demo (16-Step Heavy Rain)',
      icon: Play,
      action: () => {
        onRunDemo();
        onClose();
      },
    },
    {
      category: 'SIMULATION',
      id: 'play_pause',
      title: 'Toggle Simulation Play / Pause',
      icon: Pause,
      action: () => {
        onTogglePlayPause();
        onClose();
      },
    },
    {
      category: 'SIMULATION',
      id: 'speed_5x',
      title: 'Fast Forward Simulation to 5x Speed',
      icon: FastForward,
      action: () => {
        onSetSpeed(5);
        onClose();
      },
    },
    {
      category: 'CAMERA',
      id: 'cam_ambulance',
      title: 'Chase Emergency Ambulance in 3D',
      icon: Siren,
      action: () => {
        onCameraPreset('ambulance');
        onClose();
      },
    },
    {
      category: 'CAMERA',
      id: 'cam_overview',
      title: 'Reset Camera to Metropolitan Overview',
      icon: Camera,
      action: () => {
        onCameraPreset('overview');
        onClose();
      },
    },
    {
      category: 'CAMERA',
      id: 'cam_bole',
      title: 'Focus Camera on Bole Innovation Corridor',
      icon: Camera,
      action: () => {
        onCameraPreset('bole');
        onClose();
      },
    },
    {
      category: 'CAMERA',
      id: 'cam_kazanchis',
      title: 'Focus Camera on Kazanchis Financial District',
      icon: Camera,
      action: () => {
        onCameraPreset('kazanchis');
        onClose();
      },
    },
    {
      category: 'CAMERA',
      id: 'cam_meskel',
      title: 'Focus Camera on Meskel Central Hyper-Plaza',
      icon: Camera,
      action: () => {
        onCameraPreset('meskel');
        onClose();
      },
    },
    {
      category: 'CAMERA',
      id: 'cam_gotera',
      title: 'Focus Camera on Gotera Multimodal Interchange',
      icon: Camera,
      action: () => {
        onCameraPreset('gotera');
        onClose();
      },
    },
    {
      category: 'FACILITIES',
      id: 'fac_tikur',
      title: 'Inspect Tikur Anbessa Cybernetic Health Center',
      icon: Building2,
      action: () => {
        onFocusBuilding('bld_tikur_anbessa');
        onClose();
      },
    },
    {
      category: 'FACILITIES',
      id: 'fac_gerd',
      title: 'Inspect GERD Hyper-Grid Substation Alpha',
      icon: Building2,
      action: () => {
        onFocusBuilding('bld_gerd_substation');
        onClose();
      },
    },
    {
      category: 'INCIDENTS',
      id: 'inc_rain',
      title: 'Trigger Incident: Flash Torrential Rain Front',
      icon: AlertTriangle,
      action: () => {
        onTriggerIncident('heavy_rain');
        onClose();
      },
    },
    {
      category: 'INCIDENTS',
      id: 'inc_crash',
      title: 'Trigger Incident: Bole High-Speed Transit Pod Collision',
      icon: AlertTriangle,
      action: () => {
        onTriggerIncident('traffic_accident');
        onClose();
      },
    },
    {
      category: 'INCIDENTS',
      id: 'inc_power',
      title: 'Trigger Incident: Kilinto Industrial Transformer Overheat',
      icon: AlertTriangle,
      action: () => {
        onTriggerIncident('power_outage');
        onClose();
      },
    },
    {
      category: 'NAVIGATION',
      id: 'nav_scenarios',
      title: 'Open Future Simulator & Scenario Lab',
      icon: FlaskConical,
      action: () => {
        onSelectTab('scenarios');
        onClose();
      },
    },
    {
      category: 'NAVIGATION',
      id: 'nav_agents',
      title: 'Open AI Agents Control Panel (11 Agents)',
      icon: Cpu,
      action: () => {
        onSelectTab('agents');
        onClose();
      },
    },
    {
      category: 'NAVIGATION',
      id: 'nav_memory',
      title: 'Open Episodic City Memory Archive',
      icon: Archive,
      action: () => {
        onSelectTab('memory');
        onClose();
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-950/80 backdrop-blur-sm select-none p-4">
      <div className="w-full max-w-xl rounded-2xl hud-panel border border-sky-500/40 bg-[#070c18] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="p-3 border-b border-sky-950/80 flex items-center space-x-2">
          <Search className="w-4 h-4 text-sky-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a city command, facility name, district, or crisis..."
            className="w-full bg-transparent text-sm font-mono text-sky-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 font-mono">
              No tactical command matches found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-sky-500/15 border border-transparent hover:border-sky-500/30 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 group-hover:border-sky-500/40 text-sky-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-slate-200 group-hover:text-sky-100 block">
                        {item.title}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-sky-950/80 bg-slate-950 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Navigate with arrows / mouse</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
