/**
 * NEXUS: THE LIVING CITY
 * Future Simulator & Scenario Laboratory
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  BarChart,
} from 'lucide-react';
import { PREBUILT_SCENARIOS, runFutureSimulation } from '../simulation/scenarios';
import { ScenarioResult } from '../types/city';

export const FutureSimulatorView: React.FC = () => {
  const [selectedPrebuilt, setSelectedPrebuilt] = useState<string>('scen_rain_rush');
  const [popDelta, setPopDelta] = useState<number>(0);
  const [trafficDelta, setTrafficDelta] = useState<number>(35);
  const [energyDelta, setEnergyDelta] = useState<number>(15);
  const [waterDelta, setWaterDelta] = useState<number>(25);
  const [rainMm, setRainMm] = useState<number>(45);
  const [transitDelta, setTransitDelta] = useState<number>(-10);
  const [customPrompt, setCustomPrompt] = useState<string>(
    'What happens if heavy rain affects the city for 3 hours?'
  );

  const [simulationResult, setSimulationResult] = useState<ScenarioResult>(() =>
    runFutureSimulation(
      'Torrential Rain During Rush Hour',
      '45mm/hr precipitation over Entoto ridge and central basins during 18:00 peak commute.',
      0,
      35,
      15,
      25,
      45,
      -10
    )
  );

  const handleSelectPrebuilt = (id: string) => {
    setSelectedPrebuilt(id);
    const scen = PREBUILT_SCENARIOS.find((s) => s.id === id);
    if (scen) {
      setPopDelta(scen.populationDeltaPct);
      setTrafficDelta(scen.trafficDeltaPct);
      setEnergyDelta(scen.energyDeltaPct);
      setWaterDelta(scen.waterDeltaPct);
      setRainMm(scen.rainMmPerHour);
      setTransitDelta(scen.transitAdoptionDeltaPct);
      setCustomPrompt(scen.promptQuestion);

      const result = runFutureSimulation(
        scen.title,
        scen.description,
        scen.populationDeltaPct,
        scen.trafficDeltaPct,
        scen.energyDeltaPct,
        scen.waterDeltaPct,
        scen.rainMmPerHour,
        scen.transitAdoptionDeltaPct
      );
      setSimulationResult(result);
    }
  };

  const handleRunSimulation = () => {
    const result = runFutureSimulation(
      customPrompt || 'Custom Simulated Scenario',
      `Custom stress-test run with Parametric Multipliers (Pop: ${popDelta}%, Traffic: ${trafficDelta}%, Rain: ${rainMm}mm)`,
      popDelta,
      trafficDelta,
      energyDelta,
      waterDelta,
      rainMm,
      transitDelta
    );
    setSimulationResult(result);
  };

  const b = simulationResult.before;
  const a = simulationResult.after;

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080f]/95 text-slate-200 select-none space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl hud-panel border border-sky-500/30 bg-[#070c18]/90 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-display text-lg font-bold">
            <FlaskConical className="w-5 h-5 text-sky-400" />
            <span>NEXUS FUTURE SIMULATOR & SCENARIO LAB</span>
          </div>
          <p className="text-xs text-slate-400 font-ethiopic mt-0.5">
            የወደፊት ትንበያና የአደጋ ማስተናገድ አቅም መፈተሻ • High-Dimensional Stress-Testing Engine
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-display font-bold text-xs flex items-center space-x-2 shadow-lg shadow-sky-500/20 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>SIMULATE FUTURE</span>
        </button>
      </div>

      {/* Natural Language Prompt & Prebuilt Chips */}
      <div className="space-y-3">
        <label className="text-xs font-mono text-slate-400 block">
          NATURAL LANGUAGE HYPOTHESIS / SCENARIO INQUIRY:
        </label>
        <div className="relative">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-sky-800/50 text-sky-100 font-mono text-xs focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 placeholder:text-slate-500"
            placeholder="Type e.g. What happens if the city's population increases by 30%?"
          />
          <button
            onClick={handleRunSimulation}
            className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-sky-600/40 hover:bg-sky-600/60 text-sky-200 text-xs font-mono cursor-pointer"
          >
            Run
          </button>
        </div>

        {/* Prebuilt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-mono text-slate-500">PREBUILTS:</span>
          {PREBUILT_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => handleSelectPrebuilt(scen.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedPrebuilt === scen.id
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-500/50 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {scen.title}
            </button>
          ))}
        </div>
      </div>

      {/* Parametric Adjustment Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400">Population</span>
            <span className="text-sky-300 font-bold">{popDelta > 0 ? `+${popDelta}%` : `${popDelta}%`}</span>
          </div>
          <input
            type="range"
            min="-20"
            max="60"
            step="5"
            value={popDelta}
            onChange={(e) => setPopDelta(Number(e.target.value))}
            className="w-full accent-sky-400"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400">Traffic Surge</span>
            <span className="text-amber-300 font-bold">+{trafficDelta}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={trafficDelta}
            onChange={(e) => setTrafficDelta(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400">Energy Delta</span>
            <span className="text-yellow-300 font-bold">{energyDelta > 0 ? `+${energyDelta}%` : `${energyDelta}%`}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={energyDelta}
            onChange={(e) => setEnergyDelta(Number(e.target.value))}
            className="w-full accent-yellow-400"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400">Water Demand</span>
            <span className="text-cyan-300 font-bold">{waterDelta > 0 ? `+${waterDelta}%` : `${waterDelta}%`}</span>
          </div>
          <input
            type="range"
            min="-30"
            max="60"
            step="5"
            value={waterDelta}
            onChange={(e) => setWaterDelta(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400">Rainfall</span>
            <span className="text-blue-300 font-bold">{rainMm} mm/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="5"
            value={rainMm}
            onChange={(e) => setRainMm(Number(e.target.value))}
            className="w-full accent-blue-400"
          />
        </div>

        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-slate-400">Transit Shift</span>
            <span className="text-purple-300 font-bold">{transitDelta > 0 ? `+${transitDelta}%` : `${transitDelta}%`}</span>
          </div>
          <input
            type="range"
            min="-30"
            max="40"
            step="5"
            value={transitDelta}
            onChange={(e) => setTransitDelta(Number(e.target.value))}
            className="w-full accent-purple-400"
          />
        </div>
      </div>

      {/* OVERALL RESILIENCE SCORE & BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Resilience Score Gauge */}
        <div className="p-5 rounded-xl hud-panel border border-sky-500/30 bg-[#070b14]/90 flex flex-col items-center justify-center text-center space-y-2">
          <div className="text-xs font-mono text-slate-400">OVERALL CITY RESILIENCE SCORE</div>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * simulationResult.resilienceScore) / 100}
                className={
                  simulationResult.resilienceScore >= 80
                    ? 'text-emerald-400'
                    : simulationResult.resilienceScore >= 65
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-display font-bold text-sky-100">
                {simulationResult.resilienceScore}
              </span>
              <span className="text-[10px] font-mono text-slate-400">OUT OF 100</span>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-300">
            {simulationResult.resilienceScore >= 80
              ? 'ROBUST AUTONOMOUS REDUNDANCY'
              : simulationResult.resilienceScore >= 65
              ? 'MODERATE STRESS ELEVATION'
              : 'CRITICAL BOTTLENECK INTERVENTIONS REQUIRED'}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-xl hud-panel border border-sky-500/30 bg-[#070b14]/90 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>RESILIENCE DIMENSION BREAKDOWN</span>
            <span className="text-sky-400">AUTONOMOUS AUDIT</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {Object.entries(simulationResult.resilienceBreakdown).map(([key, val]) => (
              <div key={key} className="space-y-1 p-2 rounded bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="capitalize text-slate-400">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span
                    className={`font-bold ${
                      val >= 80 ? 'text-emerald-400' : val >= 65 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {val}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      val >= 80 ? 'bg-emerald-400' : val >= 65 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Critical Bottlenecks */}
          <div className="pt-2 border-t border-sky-950">
            <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1">
              DETECTED INFRASTRUCTURE BOTTLENECKS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {simulationResult.criticalBottlenecks.map((bneck, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/50 text-[10.5px] font-mono text-rose-300"
                >
                  ⚠️ {bneck}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BEFORE vs AFTER MATRIX */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
          <BarChart className="w-4 h-4 text-sky-400" />
          <span>PROJECTED STATE COMPARISON: CURRENT (BEFORE) VS PROJECTED (AFTER)</span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs font-mono">
          {/* Traffic */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block">TRAFFIC DENSITY</span>
            <div className="flex items-center space-x-2 text-sm font-bold">
              <span className="text-slate-400">{b.trafficDensity}%</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              <span className={a.trafficDensity > 75 ? 'text-rose-400' : 'text-emerald-400'}>
                {a.trafficDensity}%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">Speed: {a.averageSpeedKmh} km/h</span>
          </div>

          {/* Energy */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block">ENERGY DEMAND</span>
            <div className="flex items-center space-x-2 text-sm font-bold">
              <span className="text-slate-400">{b.energyDemandMW}</span>
              <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />
              <span className={a.energyCapacityPct > 90 ? 'text-rose-400' : 'text-yellow-300'}>
                {a.energyDemandMW} MW
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">{a.energyCapacityPct}% Line Cap</span>
          </div>

          {/* Water */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block">WATER SUPPLY</span>
            <div className="flex items-center space-x-2 text-sm font-bold">
              <span className="text-slate-400">{b.waterDemandMLD}</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300">{a.waterDemandMLD} MLD</span>
            </div>
            <span className="text-[9px] text-slate-400 block">{a.waterCapacityPct}% Reservoir</span>
          </div>

          {/* Healthcare */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block">HOSPITAL BEDS</span>
            <div className="flex items-center space-x-2 text-sm font-bold">
              <span className="text-slate-400">{b.hospitalBedOccupancyPct}%</span>
              <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
              <span className={a.hospitalBedOccupancyPct > 85 ? 'text-rose-400' : 'text-pink-300'}>
                {a.hospitalBedOccupancyPct}%
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">{a.availableIcuBeds} ICU open</span>
          </div>

          {/* Air Quality */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block">AIR QUALITY (AQI)</span>
            <div className="flex items-center space-x-2 text-sm font-bold">
              <span className="text-slate-400">{b.airQualityAQI}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className={a.airQualityAQI > 100 ? 'text-amber-400' : 'text-emerald-300'}>
                {a.airQualityAQI}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 block">PM2.5 Sensor Array</span>
          </div>

          {/* Public Transit */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block">TRANSIT LOAD</span>
            <div className="flex items-center space-x-2 text-sm font-bold">
              <span className="text-slate-400">{b.transitLoadPct}%</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300">{a.transitLoadPct}%</span>
            </div>
            <span className="text-[9px] text-slate-400 block">Maglev & BRT Net</span>
          </div>

          {/* Economy */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] block">ECON VELOCITY</span>
            <div className="flex items-center space-x-2 text-sm font-bold">
              <span className="text-slate-400">{b.economicVelocityIndex}</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-teal-300">{a.economicVelocityIndex}</span>
            </div>
            <span className="text-[9px] text-slate-400 block">Trade Throughput</span>
          </div>
        </div>
      </div>

      {/* AI Agent Strategic Forecasting Recommendations */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
          <Cpu className="w-4 h-4 text-sky-400" />
          <span>AUTONOMOUS AGENT STRATEGIC FORECASTS & PRE-EMPTIVE MITIGATIONS</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {simulationResult.agentForecastingNotes.map((note) => (
            <div
              key={note.agentId}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-sky-300">{note.agentName}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${
                    note.riskLevel === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : note.riskLevel === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  RISK: {note.riskLevel}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{note.forecast}</p>
              <div className="pt-1.5 border-t border-slate-800 text-[10.5px] font-mono text-emerald-300">
                <span className="text-slate-400">RECOMMENDED MITIGATION: </span>
                {note.suggestedMitigation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── META MUSE IMAGE: ADDIS ABABA 2035 GENERATIVE VISION ── */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.18)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-purple-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white font-mono tracking-wider">
                  META MUSE IMAGE // ADDIS ABABA 2035 GENERATIVE VISION
                </h4>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  MUSE WONDER ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synthesized by Meta Muse Code Agent from 2035 Master Plan & Climate Stress Vectors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800">
              ✓ RESILIENCE PROJECTION: {simulationResult.resilienceScore}/100
            </span>
          </div>
        </div>

        {/* Side-by-Side 2026 vs 2035 Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 2026 Baseline */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold">2026 CURRENT BASELINE</span>
              <span className="text-amber-400 text-[10px]">INFRASTRUCTURE STRESS: MODERATE</span>
            </div>
            <div className="p-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Urban Transit Mesh:</span>
                <span className="font-mono text-cyan-300">Anbessa BRT + LRT (Grade Intersected)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Hydro Storm Runoff:</span>
                <span className="font-mono text-rose-300">Akaki Basin Surface Retention</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Grid Load Balancing:</span>
                <span className="font-mono text-yellow-300">GERD 2,400MW Radial Distribution</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trauma ICU Access:</span>
                <span className="font-mono text-slate-200">Tikur Anbessa + St. Paul (Single Axis)</span>
              </div>
            </div>
          </div>

          {/* 2035 Meta Muse AI Vision */}
          <div className="rounded-xl bg-purple-950/20 border border-purple-500/50 overflow-hidden shadow-[0_0_25px_rgba(168,85,247,0.15)]">
            <div className="px-3.5 py-2 bg-purple-950/60 border-b border-purple-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-purple-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>2035 META MUSE AI SMART TWIN</span>
              </span>
              <span className="text-emerald-400 text-[10px] font-bold">NET-ZERO CORRIDOR: 92.4%</span>
            </div>
            <div className="p-4 space-y-2.5 text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                <span className="text-slate-400">Autonomous Maglev Transit:</span>
                <span className="font-mono text-emerald-300">90-sec Headway Continuous Grid</span>
              </div>
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                <span className="text-slate-400">Subterranean Sluice Siphons:</span>
                <span className="font-mono text-cyan-300">18,000 L/min Autonomic Evacuation</span>
              </div>
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
                <span className="text-slate-400">Gotera Solar Microgrid:</span>
                <span className="font-mono text-yellow-300">12MW Distributed Battery Vault</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Autonomous Drone Corridors:</span>
                <span className="font-mono text-purple-300">SAM 3.1 Edge AI Patrol (Zero Collision)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Introspection Synthesized by Meta Muse Code */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs">
          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>META MUSE PROMPT INTROSPECTION // SYNTHESIZED BY MUSE CODE</span>
            <span className="text-slate-500">PARAMETRIC SEED #2035-ADDIS</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed font-sans italic">
            "Photorealistic 8k aerial perspective of Addis Ababa Kazanchis financial axis in 2035, elevated maglev monorail gliding smoothly above biophilic green pedestrian corridors, Commercial Bank HQ gleaming with solar-photovoltaic glazed facade, zero-emission Sheger electric shuttles, and cloud-piercing Entoto observatory ridge bathed in dawn light."
          </p>
        </div>
      </div>
    </div>
  );
};
