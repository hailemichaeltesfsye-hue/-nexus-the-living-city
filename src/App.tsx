/**
 * NEXUS: THE LIVING CITY
 * Autonomous AI Digital Twin for Ethiopia
 * Main Application Orchestrator
 */

import React, { useState, useEffect, useRef } from 'react';
import { ThreeCityCanvas, ThreeCityCanvasHandle } from './components/ThreeCityCanvas';
import { RealAddisMap } from './components/RealAddisMap';
import { VisualShadingMode } from './three/CityScene';
import { NavigationSidebar } from './components/NavigationSidebar';
import { SupervisorIntelligencePanel } from './components/SupervisorIntelligencePanel';
import { TimelineControlBar } from './components/TimelineControlBar';
import { BuildingInspectorModal } from './components/BuildingInspectorModal';
import { FutureSimulatorView } from './components/FutureSimulatorView';
import { AnalyticsView } from './components/AnalyticsView';
import { AgentsView } from './components/AgentsView';
import { IncidentsView } from './components/IncidentsView';
import { InfrastructureView } from './components/InfrastructureView';
import { CityMemoryView } from './components/CityMemoryView';
import { CommandPalette } from './components/CommandPalette';
import { CinematicOverlay } from './components/CinematicOverlay';
import { OnboardingModal } from './components/OnboardingModal';

import { cityEngine, SimulationState } from './simulation/cityEngine';
import { agentEngine, AgentEngineState } from './simulation/agentEngine';
import { demoStory, DemoStepInfo } from './simulation/demoStory';
import {
  BuildingInfo,
  DistrictId,
  Incident,
  IncidentType,
  LayerFilter,
  ViewTab,
} from './types/city';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');
  const [simState, setSimState] = useState<SimulationState>(() => cityEngine.getState());
  const [agentState, setAgentState] = useState<AgentEngineState>(() => agentEngine.getState());
  const [activeLayer, setActiveLayer] = useState<LayerFilter>('all');
  const [shadingMode, setShadingMode] = useState<VisualShadingMode>('standard');
  const [isDroneCamActive, setIsDroneCamActive] = useState<boolean>(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingInfo | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [demoStepInfo, setDemoStepInfo] = useState<DemoStepInfo | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(true);
  const [canvasEngine, setCanvasEngine] = useState<'real_mapbox' | 'procedural_three'>('real_mapbox');

  const canvasRef = useRef<ThreeCityCanvasHandle>(null);

  // Subscribe to simulation state
  useEffect(() => {
    const unsubSim = cityEngine.subscribe((state) => {
      setSimState({ ...state });
      if (canvasRef.current) {
        try {
          canvasRef.current.setWeatherRain(state.metrics.weatherCondition === 'RAIN');
          canvasRef.current.updateIncidents(state.activeIncidents);
        } catch {
          // Canvas warming up — ignore
        }
      }
    });

    const unsubAgents = agentEngine.subscribe((state) => {
      setAgentState({ ...state });
    });

    const unsubDemo = demoStory.subscribe((info) => {
      setDemoStepInfo(info);
      if (info?.cameraTarget && canvasRef.current) {
        // Move camera to step target
        const [x, , z] = info.cameraTarget;
        // Check if district
        if (x === -2 && z === -48) canvasRef.current.focusOnDistrict('entoto');
        else if (x === 12 && z === -4) canvasRef.current.focusOnDistrict('kazanchis');
        else if (x === 2 && z === 8) canvasRef.current.focusOnDistrict('meskel');
        else if (x === -10 && z === -22) canvasRef.current.focusOnBuilding('bld_tikur_anbessa');
        else if (x === -28 && z === -14) canvasRef.current.focusOnBuilding('bld_st_paul');
        else if (x === 34 && z === 12) canvasRef.current.focusOnBuilding('bld_legedadi_water');
        else if (x === -18 && z === 30) canvasRef.current.focusOnDistrict('gotera');
        else if (x === 0 && z === 0) canvasRef.current.resetOverviewCamera();
      }
    });

    return () => {
      unsubSim();
      unsubAgents();
      unsubDemo();
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        cityEngine.togglePlayPause();
      } else if (e.key === 'd' || e.key === 'D') {
        if (!demoStory.isStoryRunning()) {
          handleRunDemo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRunDemo = () => {
    setCurrentTab('overview');
    demoStory.runCinematicDemo();
  };

  const handleStopDemo = () => {
    demoStory.stop();
    cityEngine.clearWeather();
    canvasRef.current?.resetOverviewCamera();
  };

  const handleCameraPreset = (preset: 'overview' | 'ambulance' | 'drone' | DistrictId) => {
    if (preset === 'overview') {
      setIsDroneCamActive(false);
      canvasRef.current?.resetOverviewCamera();
    } else if (preset === 'ambulance') {
      setIsDroneCamActive(false);
      canvasRef.current?.followEmergencyVehicle();
    } else if (preset === 'drone') {
      const active = canvasRef.current?.toggleDroneCam() || false;
      setIsDroneCamActive(active);
    } else {
      setIsDroneCamActive(false);
      canvasRef.current?.focusOnDistrict(preset);
    }
  };

  const handleShadingModeChange = (mode: VisualShadingMode) => {
    setShadingMode(mode);
    canvasRef.current?.setShadingMode(mode);
  };

  const handleBuildingSelect = (bld: BuildingInfo | null) => {
    setSelectedBuilding(bld);
  };

  const handleTriggerIncident = (type: IncidentType, district?: DistrictId) => {
    const inc = cityEngine.triggerIncident(type, district);
    canvasRef.current?.focusOnIncident(inc);
  };

  const isDemoRunning = demoStory.isStoryRunning();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05080f] text-slate-100 flex flex-col font-sans select-none">
      {/* Background 3D Viewport - Primary Real Addis Geospatial Mapbox Twin or Procedural Three.js Twin */}
      {canvasEngine === 'real_mapbox' ? (
        <RealAddisMap
          ref={canvasRef}
          onBuildingSelect={handleBuildingSelect}
          onDistrictSelect={(d) => console.log('Selected district:', d)}
          onIncidentSelect={(i) => console.log('Selected incident:', i)}
          metrics={simState.metrics}
        />
      ) : (
        <ThreeCityCanvas
          ref={canvasRef}
          onBuildingSelect={handleBuildingSelect}
          onDistrictSelect={(d) => console.log('Selected district:', d)}
          onIncidentSelect={(i) => console.log('Selected incident:', i)}
        />
      )}

      {/* Main HUD Overlay Frame */}
      <div className="relative z-10 w-full h-full flex pointer-events-none">
        {/* Top Center: 3D Twin Engine Selector */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center bg-slate-950/90 border border-cyan-500/40 rounded-full p-1 shadow-[0_0_20px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <button
            onClick={() => setCanvasEngine('real_mapbox')}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              canvasEngine === 'real_mapbox'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,242,255,0.7)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Real Geospatial 3D Mapbox Extrusions of Addis Ababa"
          >
            <span>🗺️</span>
            <span>REAL ADDIS 3D</span>
          </button>
          <button
            onClick={() => setCanvasEngine('procedural_three')}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              canvasEngine === 'procedural_three'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,242,255,0.7)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Procedural WebGL Digital Twin Simulation"
          >
            <span>🌐</span>
            <span>PROCEDURAL TWIN</span>
          </button>
        </div>
        {/* Left Navigation Rail (Pointer-events enabled on children) */}
        <div className="pointer-events-auto h-full">
          <NavigationSidebar
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
              if (tab === 'twin3d') canvasRef.current?.resetOverviewCamera();
            }}
            onRunDemo={handleRunDemo}
            isDemoRunning={isDemoRunning}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            activeIncidentsCount={simState.metrics.activeIncidentsCount}
          />
        </div>

        {/* Center Canvas / Sub-Views */}
        <div className="flex-1 h-full relative overflow-hidden pointer-events-auto">
          {/* If user switches to dedicated views, render glassmorphic view panel */}
          {currentTab === 'scenarios' && <FutureSimulatorView />}
          {currentTab === 'analytics' && <AnalyticsView simState={simState} />}
          {currentTab === 'agents' && (
            <AgentsView
              agentState={agentState}
              onFocusAgentInCity={(id) => {
                const ag = agentState.agents[id];
                if (ag.targetDistrict && ag.targetDistrict !== 'all') {
                  canvasRef.current?.focusOnDistrict(ag.targetDistrict);
                  setCurrentTab('overview');
                }
              }}
            />
          )}
          {currentTab === 'incidents' && (
            <IncidentsView
              activeIncidents={simState.activeIncidents}
              onFocusIncident={(inc) => {
                canvasRef.current?.focusOnIncident(inc);
                setCurrentTab('overview');
              }}
              onTriggerNewIncident={handleTriggerIncident}
            />
          )}
          {currentTab === 'infrastructure' && (
            <InfrastructureView
              onFocusBuilding={(id) => {
                canvasRef.current?.focusOnBuilding(id);
                setCurrentTab('overview');
              }}
              onFocusDistrict={(dist) => {
                canvasRef.current?.focusOnDistrict(dist);
                setCurrentTab('overview');
              }}
            />
          )}
          {currentTab === 'memory' && <CityMemoryView memory={simState.memory} />}
        </div>

        {/* Right Intelligence Panel (Visible on overview and twin3d) */}
        {(currentTab === 'overview' || currentTab === 'twin3d') && (
          <div className="pointer-events-auto h-full">
            <SupervisorIntelligencePanel
              agentState={agentState}
              onFocusAgent={(id) => {
                const ag = agentState.agents[id];
                if (ag.targetDistrict && ag.targetDistrict !== 'all') {
                  canvasRef.current?.focusOnDistrict(ag.targetDistrict);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Building Telemetry Inspector Modal */}
      {selectedBuilding && (
        <BuildingInspectorModal
          building={selectedBuilding}
          onClose={() => {
            setSelectedBuilding(null);
            canvasRef.current?.selectBuilding(null);
          }}
          onFocus={() => {
            canvasRef.current?.focusOnBuilding(selectedBuilding.id);
          }}
          onTriggerIncidentHere={() => {
            handleTriggerIncident('infrastructure_failure', selectedBuilding.district);
          }}
        />
      )}

      {/* Cinematic 16-Step Showcase Banner */}
      <CinematicOverlay stepInfo={demoStepInfo} onStop={handleStopDemo} />

      {/* Bottom Ergonomic Control Dock */}
      <TimelineControlBar
        metrics={simState.metrics}
        speed={simState.speed}
        isRunning={simState.isRunning}
        onTogglePlayPause={() => cityEngine.togglePlayPause()}
        onSetSpeed={(s) => cityEngine.setSpeed(s)}
        onStepForward={() => cityEngine.stepForward()}
        onCameraPreset={handleCameraPreset}
        isDroneCamActive={isDroneCamActive}
        activeLayer={activeLayer}
        onLayerChange={setActiveLayer}
        shadingMode={shadingMode}
        onShadingModeChange={handleShadingModeChange}
      />

      {/* Tactical Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onRunDemo={handleRunDemo}
        onTogglePlayPause={() => cityEngine.togglePlayPause()}
        onSetSpeed={(s) => cityEngine.setSpeed(s)}
        onCameraPreset={handleCameraPreset}
        onTriggerIncident={handleTriggerIncident}
        onFocusBuilding={(id) => {
          canvasRef.current?.focusOnBuilding(id);
          setCurrentTab('overview');
        }}
      />

      {/* First-time Launch Onboarding Briefing */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onStartDemo={handleRunDemo}
      />
    </div>
  );
}
