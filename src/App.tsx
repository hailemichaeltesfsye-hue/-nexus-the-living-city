/**
 * NEXUS: THE LIVING CITY
 * Autonomous AI Digital Twin for Ethiopia
 * Main Application Orchestrator
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Sparkles } from 'lucide-react';
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
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isSupervisorDrawerOpen, setIsSupervisorDrawerOpen] = useState<boolean>(false);

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

      {/* Mobile / Tablet Top Navigation Bar */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-30 pointer-events-auto flex items-center justify-between px-2.5 py-2 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/30">
        {/* Left: Hamburger menu toggle with incident badge */}
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white flex items-center justify-center relative cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-cyan-400" />
          {simState.metrics.activeIncidentsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border border-slate-950" />
          )}
        </button>

        {/* Center: Brand & Compact Engine Selector */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 mr-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(0,242,255,0.8)]" />
            <span className="font-display font-black text-xs tracking-wider text-white">NEXUS</span>
          </div>
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setCanvasEngine('real_mapbox')}
              className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                canvasEngine === 'real_mapbox'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D MAP
            </button>
            <button
              onClick={() => setCanvasEngine('procedural_three')}
              className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                canvasEngine === 'procedural_three'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TWIN
            </button>
          </div>
        </div>

        {/* Right: Search & AI Intel Drawer Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white cursor-pointer"
            title="Tactical Command Palette (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => setIsSupervisorDrawerOpen(true)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
              isSupervisorDrawerOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border-cyan-500/40'
            }`}
            title="Toggle Supervisor AI Intelligence Panel"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AI INTEL</span>
          </button>
        </div>
      </div>

      {/* Main HUD Overlay Frame */}
      <div className="relative z-10 w-full h-full flex pointer-events-none">
        {/* Top Center: 3D Twin Engine Selector (Desktop) */}
        <div className="hidden lg:flex absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto items-center bg-slate-950/90 border border-cyan-500/40 rounded-full p-1 shadow-[0_0_20px_rgba(0,0,0,0.85)] backdrop-blur-xl">
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

        {/* Left Navigation Rail (Desktop) */}
        <div className="pointer-events-auto h-full hidden lg:flex">
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
        <div className="flex-1 h-full relative overflow-hidden pointer-events-auto pt-12 lg:pt-0">
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

        {/* Right Intelligence Panel (Desktop - Visible on overview and twin3d) */}
        {(currentTab === 'overview' || currentTab === 'twin3d') && (
          <div className="pointer-events-auto h-full hidden xl:flex">
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

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative z-10 w-72 sm:w-80 max-w-[85vw] h-full shadow-2xl bg-slate-950 flex flex-col">
            <NavigationSidebar
              currentTab={currentTab}
              onTabChange={(tab) => {
                setCurrentTab(tab);
                setIsMobileNavOpen(false);
                if (tab === 'twin3d') canvasRef.current?.resetOverviewCamera();
              }}
              onRunDemo={() => {
                setIsMobileNavOpen(false);
                handleRunDemo();
              }}
              isDemoRunning={isDemoRunning}
              onOpenCommandPalette={() => {
                setIsMobileNavOpen(false);
                setIsCommandPaletteOpen(true);
              }}
              activeIncidentsCount={simState.metrics.activeIncidentsCount}
              onCloseMobile={() => setIsMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Supervisor Intelligence Drawer */}
      {isSupervisorDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSupervisorDrawerOpen(false)}
          />
          <div className="relative z-10 w-full sm:w-96 max-w-[92vw] h-full shadow-2xl bg-slate-950 flex flex-col">
            <SupervisorIntelligencePanel
              agentState={agentState}
              onFocusAgent={(id) => {
                const ag = agentState.agents[id];
                if (ag.targetDistrict && ag.targetDistrict !== 'all') {
                  canvasRef.current?.focusOnDistrict(ag.targetDistrict);
                }
                setIsSupervisorDrawerOpen(false);
              }}
              onCloseMobile={() => setIsSupervisorDrawerOpen(false)}
            />
          </div>
        </div>
      )}

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
