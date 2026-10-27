/**
 * NEXUS: THE LIVING CITY
 * Analytics & KPIs View - High-Density Interactive Visualizations
 */

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Droplets,
  Car,
  Wind,
  ShieldAlert,
} from 'lucide-react';
import { SimulationState } from '../simulation/cityEngine';

interface AnalyticsViewProps {
  simState: SimulationState;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ simState }) => {
  const { metrics, history } = simState;

  // Render SVG Sparkline / Area Chart
  const renderAreaChart = (
    data: number[],
    color: string,
    minVal: number,
    maxVal: number,
    unit: string
  ) => {
    if (data.length < 2) return null;
    const width = 320;
    const height = 90;
    const padding = 10;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const normalizedY = (val - minVal) / Math.max(1, maxVal - minVal);
      const y = height - padding - normalizedY * (height - padding * 2);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

    const latestVal = data[data.length - 1];

    return (
      <div className="space-y-1">
        <div className="flex justify-between items-baseline font-mono text-xs">
          <span className="text-slate-400">Current:</span>
          <span className="font-bold text-sm" style={{ color }}>
            {latestVal} {unit}
          </span>
        </div>
        <div className="relative w-full h-[90px] bg-slate-900/60 rounded-lg p-1 border border-slate-800 overflow-hidden">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id={`grad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#grad_${color.replace('#', '')})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
            {points.map((pt, i) => {
              const [cx, cy] = pt.split(',');
              if (i === points.length - 1) {
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill={color}
                    className="animate-pulse"
                  />
                );
              }
              return null;
            })}
          </svg>
        </div>
      </div>
    );
  };

  const trafficHistory = history.map((h) => h.trafficDensity);
  const energyHistory = history.map((h) => h.energyDemandMW);
  const waterHistory = history.map((h) => h.waterDemandMLD);
  const hospitalHistory = history.map((h) => h.hospitalBedOccupancyPct);
  const aqiHistory = history.map((h) => h.airQualityAQI);
  const econHistory = history.map((h) => h.economicVelocityIndex);

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080f]/95 text-slate-200 select-none space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl hud-panel border border-sky-500/30 bg-[#070c18]/90 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-display text-lg font-bold">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>NEXUS ADDIS METROPOLITAN TELEMETRY & KPIS</span>
          </div>
          <p className="text-xs text-slate-400 font-ethiopic mt-0.5">
            የከተማው ቅጽበታዊ መረጃና ትንታኔ • Multi-System Real-Time Sensor Lattice
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-800 text-xs font-mono text-sky-300">
          POLLING INTERVAL: 1000ms
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span>TRAFFIC DENSITY</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {metrics.trafficDensity}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Avg Speed: {metrics.averageSpeedKmh} km/h
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>GRID LOAD</span>
          </div>
          <div className="text-2xl font-bold font-mono text-yellow-300">
            {metrics.energyDemandMW} <span className="text-xs">MW</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {metrics.energyCapacityPct}% Line Capacity
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>WATER DRAW</span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {metrics.waterDemandMLD} <span className="text-xs">MLD</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Reservoir Headroom: {100 - metrics.waterCapacityPct}%
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-pink-400" />
            <span>HOSPITAL BEDS</span>
          </div>
          <div className="text-2xl font-bold font-mono text-pink-300">
            {metrics.hospitalBedOccupancyPct}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {metrics.availableIcuBeds} ICU Beds Open
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
            <Wind className="w-3.5 h-3.5 text-emerald-400" />
            <span>AIR QUALITY</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {metrics.airQualityAQI}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {metrics.airQualityAQI < 50 ? 'GOOD' : metrics.airQualityAQI < 100 ? 'MODERATE' : 'UNHEALTHY'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            <span>ECON VELOCITY</span>
          </div>
          <div className="text-2xl font-bold font-mono text-teal-300">
            {metrics.economicVelocityIndex}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Trade Throughput High
          </div>
        </div>
      </div>

      {/* 6 Real-time Telemetry Area Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Traffic Chart */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Car className="w-4 h-4 text-amber-400" />
              <span>Traffic Congestion Index</span>
            </span>
            <span className="text-[10px] text-slate-400">Last 15 Minutes</span>
          </div>
          {renderAreaChart(trafficHistory, '#f59e0b', 10, 100, '%')}
        </div>

        {/* Energy Chart */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Energy Draw (GERD & Battery)</span>
            </span>
            <span className="text-[10px] text-slate-400">Last 15 Minutes</span>
          </div>
          {renderAreaChart(energyHistory, '#eab308', 1200, 2400, 'MW')}
        </div>

        {/* Water Chart */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Water Consumption Flow</span>
            </span>
            <span className="text-[10px] text-slate-400">Last 15 Minutes</span>
          </div>
          {renderAreaChart(waterHistory, '#06b6d4', 200, 600, 'MLD')}
        </div>

        {/* Hospital Occupancy Chart */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-pink-400" />
              <span>Hospital Bed Saturation</span>
            </span>
            <span className="text-[10px] text-slate-400">Last 15 Minutes</span>
          </div>
          {renderAreaChart(hospitalHistory, '#ec4899', 30, 100, '%')}
        </div>

        {/* Air Quality AQI Chart */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <Wind className="w-4 h-4 text-emerald-400" />
              <span>Air Quality Index (AQI)</span>
            </span>
            <span className="text-[10px] text-slate-400">Last 15 Minutes</span>
          </div>
          {renderAreaChart(aqiHistory, '#10b981', 10, 200, 'AQI')}
        </div>

        {/* Economy Chart */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-slate-300 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Economic Commerce Index</span>
            </span>
            <span className="text-[10px] text-slate-400">Last 15 Minutes</span>
          </div>
          {renderAreaChart(econHistory, '#14b8a6', 20, 100, 'pts')}
        </div>
      </div>
    </div>
  );
};
