/**
 * NEXUS: THE LIVING CITY
 * Timeline Control Bar - Ergonomic Bottom Tactical Dock & Playback Engine
 * With Drone-Cam Mode, Shading Modes, and Tactical Sound Control
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  FastForward,
  ChevronUp,
  ChevronDown,
  Camera,
  Car,
  Layers,
  Clock,
  Zap,
  Activity,
  Wind,
  Droplets,
  Siren,
  Plane,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
} from 'lucide-react';
import { CityMetrics, DistrictId, LayerFilter } from '../types/city';
import { VisualShadingMode } from '../three/CityScene';
import { tacticalAudio } from '../audio/tacticalAudio';

interface TimelineControlBarProps {
  metrics: CityMetrics;
  speed: number;
  isRunning: boolean;
  onTogglePlayPause: () => void;
  onSetSpeed: (speed: number) => void;
  onStepForward: () => void;
  onCameraPreset: (preset: 'overview' | 'ambulance' | 'drone' | DistrictId) => void;
  isDroneCamActive: boolean;
  activeLayer: LayerFilter;
  onLayerChange: (layer: LayerFilter) => void;
  shadingMode: VisualShadingMode;
  onShadingModeChange: (mode: VisualShadingMode) => void;
}

export const TimelineControlBar: React.FC<TimelineControlBarProps> = ({
  metrics,
  speed,
  isRunning,
  onTogglePlayPause,
  onSetSpeed,
  onStepForward,
  onCameraPreset,
  isDroneCamActive,
  activeLayer,
  onLayerChange,
  shadingMode,
  onShadingModeChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(tacticalAudio.getIsMuted());

  const speeds = [1, 2, 5, 10];

  const handleAudioToggle = () => {
    const muted = tacticalAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) tacticalAudio.playTacticalClick();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-4 select-none pointer-events-auto transition-transform duration-300">
      {/* Collapse Toggle Handle */}
      <div className="flex justify-center -mb-2">
        <button
          onClick={() => {
            tacticalAudio.playTacticalClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="px-3 py-0.5 rounded-t-md bg-[#070b14]/90 border-t border-x border-sky-500/30 text-[10px] font-mono text-sky-400 hover:text-sky-200 flex items-center space-x-1 shadow-md cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>SHOW TACTICAL DOCK (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>CINEMA MODE</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock */}
      {!isCollapsed && (
        <div className="hud-panel rounded-xl p-2.5 shadow-2xl border border-sky-500/25 bg-[#060a14]/90 space-y-2">
          {/* Top Bar: Playback + Time + Live Telemetry Indicators + Audio */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-950/60 pb-2">
            {/* Playback Controls */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => {
                  tacticalAudio.playTacticalClick();
                  onTogglePlayPause();
                }}
                className={`p-1.5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                  isRunning
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                    : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                }`}
                title={isRunning ? 'Pause simulation (Space)' : 'Resume simulation (Space)'}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <div className="flex items-center space-x-1 bg-slate-900/80 rounded-md p-0.5 border border-slate-800">
                {speeds.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      tacticalAudio.playTacticalClick();
                      onSetSpeed(s);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                      speed === s && isRunning
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  tacticalAudio.playTacticalClick();
                  onStepForward();
                }}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-mono cursor-pointer"
                title="Step 10s forward"
              >
                +10s
              </button>

              {/* Clock */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-sky-950/40 border border-sky-900/40 font-mono text-xs text-sky-200">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold">{metrics.simTime}</span>
                <span className="text-[10px] text-slate-400">EAT (Addis)</span>
              </div>

              {/* Audio Toggle */}
              <button
                onClick={handleAudioToggle}
                className={`p-1.5 rounded border cursor-pointer transition-all ${
                  !isMuted
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
              >
                {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Live Telemetry Pills */}
            <div className="flex items-center space-x-2 text-[11px] font-mono">
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                <Car className="w-3 h-3 text-amber-400" />
                <span className="text-slate-400">Traffic:</span>
                <span
                  className={`font-bold ${
                    metrics.trafficDensity > 75
                      ? 'text-rose-400'
                      : metrics.trafficDensity > 60
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {metrics.trafficDensity}%
                </span>
              </div>

              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-slate-400">Grid:</span>
                <span className="font-bold text-yellow-300">{metrics.energyDemandMW} MW</span>
              </div>

              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                <Activity className="w-3 h-3 text-pink-400" />
                <span className="text-slate-400">ICU:</span>
                <span className="font-bold text-pink-300">{metrics.availableIcuBeds} beds</span>
              </div>

              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                <Wind className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-400">AQI:</span>
                <span className="font-bold text-emerald-300">{metrics.airQualityAQI}</span>
              </div>

              {metrics.rainfallIntensityMm > 0 && (
                <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/50 text-sky-300">
                  <Droplets className="w-3 h-3 text-sky-400 animate-bounce" />
                  <span>Rain: {metrics.rainfallIntensityMm} mm/h</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar: Camera Presets & Shading Modes & Layers */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Camera Views + Drone Cam */}
            <div className="flex items-center space-x-1 font-mono">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1 mr-1">
                <Camera className="w-3 h-3 text-sky-400" />
                <span>VIEW:</span>
              </span>

              <button
                onClick={() => onCameraPreset('overview')}
                className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 cursor-pointer"
              >
                Overview
              </button>
              <button
                onClick={() => onCameraPreset('bole')}
                className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 cursor-pointer"
              >
                Bole
              </button>
              <button
                onClick={() => onCameraPreset('kazanchis')}
                className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 cursor-pointer"
              >
                Kazanchis
              </button>
              <button
                onClick={() => onCameraPreset('meskel')}
                className="px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 cursor-pointer"
              >
                Meskel
              </button>

              <button
                onClick={() => onCameraPreset('ambulance')}
                className="px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/60 text-[10px] text-rose-300 border border-rose-800/60 flex items-center space-x-1 cursor-pointer"
                title="Follow emergency response unit in 3D"
              >
                <Siren className="w-3 h-3 text-rose-400" />
                <span>Ambulance</span>
              </button>

              {/* Miracle Feature: Drone Cockpit Cam */}
              <button
                onClick={() => onCameraPreset('drone')}
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold border flex items-center space-x-1 cursor-pointer transition-all ${
                  isDroneCamActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-cyan-950/60 text-cyan-300 border-cyan-800 hover:bg-cyan-900/60'
                }`}
                title="First-person flight through the city aboard an autonomous eVTOL drone!"
              >
                <Plane className="w-3 h-3" />
                <span>DRONE COCKPIT CAM</span>
              </button>
            </div>

            {/* Shading / Visual Modes */}
            <div className="flex items-center space-x-1 font-mono">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1 mr-1">
                <Eye className="w-3 h-3 text-sky-400" />
                <span>SHADING:</span>
              </span>

              {(['standard', 'thermal', 'traffic', 'cyberpunk'] as VisualShadingMode[]).map(
                (mode) => (
                  <button
                    key={mode}
                    onClick={() => onShadingModeChange(mode)}
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase cursor-pointer ${
                      shadingMode === mode
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
