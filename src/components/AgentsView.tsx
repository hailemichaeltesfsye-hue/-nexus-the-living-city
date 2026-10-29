/**
 * NEXUS: THE LIVING CITY
 * AI Agents View - Multi-Agent Neural Architecture & Dynamic Synapse Mesh
 * Featuring: Orbital Neural Constellation, Live Synapse Particle Movement,
 * Brainwave Oscilloscopes, and Synergy Stress-Testing
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit,
  Car,
  Zap,
  Droplets,
  ShieldAlert,
  Activity,
  Wind,
  TrainTrack,
  TrendingUp,
  Compass,
  Scale,
  Cpu,
  Layers,
  Sparkles,
  Play,
  Share2,
  Radio,
  MessageSquare,
} from 'lucide-react';
import { AgentEngineState, agentEngine } from '../simulation/agentEngine';
import { cityEngine } from '../simulation/cityEngine';
import { AgentId, AgentInfo } from '../types/city';
import { tacticalAudio } from '../audio/tacticalAudio';
import { soundEngine } from '../audio/SoundEngine';
import { LiveDebateWarRoom } from './LiveDebateWarRoom';

interface AgentsViewProps {
  agentState: AgentEngineState;
  onFocusAgentInCity?: (agentId: AgentId) => void;
}

interface ParticlePacket {
  id: number;
  from: AgentId;
  to: AgentId;
  progress: number;
  speed: number;
  color: string;
  pulseType: 'p2p' | 'consensus' | 'synergy';
}

interface MeshLink {
  id: string;
  source: AgentId;
  target: AgentId;
  type: 'central' | 'neighbor' | 'strategic' | 'lattice';
  label: string;
}

// 10 domain agent identifiers in orbital ring
const DOMAIN_AGENT_IDS: AgentId[] = [
  'traffic',
  'energy',
  'water',
  'emergency',
  'health',
  'environment',
  'transit',
  'economy',
  'planner',
  'critic',
];

// Strategic Peer-to-Peer Cross-Domain Synapse Pairs
const STRATEGIC_PEER_PAIRS: [AgentId, AgentId, string][] = [
  ['traffic', 'emergency', 'Priority EMS Green Corridor Clearance'],
  ['health', 'energy', 'Critical Care Grid Backup & Trauma Power'],
  ['planner', 'transit', 'Transit-Oriented Zoning & Maglev Expansion'],
  ['traffic', 'transit', 'Multimodal Commute Sync & BRT Arterial Priority'],
  ['emergency', 'health', 'Casualty Triage Routing & ICU Bed Allocation'],
  ['energy', 'water', 'Hydropower Reservoir & Water Pumping Equilibrium'],
  ['water', 'environment', 'Watershed Inflow & Flood Runoff Telemetry'],
  ['environment', 'energy', 'Solar Radiation Forecast & Clean Microgrid Balancing'],
  ['economy', 'planner', 'Commercial Zoning Expansion & Industrial Growth ROI'],
  ['economy', 'energy', 'Heavy Industry Power Demand & Tariff Load Shifting'],
  ['critic', 'emergency', 'Life-Safety Compliance & Zero-Delay EMS Audit'],
  ['critic', 'planner', 'Ethical Zoning Audit & Environmental Buffer Protection'],
  ['critic', 'traffic', 'Throughput & Bottleneck SLA Monitoring'],
  ['critic', 'health', 'Hospital Headroom & Trauma Capacity Audit'],
  ['environment', 'health', 'Air Quality Indices & Epidemic Vulnerability Alerts'],
  ['water', 'emergency', 'Fire Hydrant Pressure Security & Emergency Water Reserves'],
  ['transit', 'economy', 'Workforce Commute Velocity & Urban Freight Mobility'],
];

// Orbital neighbor ring pairs (adjacent agents around the perimeter)
const NEIGHBOR_RING_PAIRS: [AgentId, AgentId][] = [
  ['traffic', 'energy'],
  ['energy', 'water'],
  ['water', 'emergency'],
  ['emergency', 'health'],
  ['health', 'environment'],
  ['environment', 'transit'],
  ['transit', 'economy'],
  ['economy', 'planner'],
  ['planner', 'critic'],
  ['critic', 'traffic'],
];

// Pre-compute all 55 Mesh Links (10 Central Consensus + 45 P2P Mesh pairs)
const ALL_MESH_LINKS: MeshLink[] = [];

// 1. Central connections to Supervisor AI for global consensus synthesis
DOMAIN_AGENT_IDS.forEach((agId) => {
  ALL_MESH_LINKS.push({
    id: `central_supervisor_${agId}`,
    source: 'supervisor',
    target: agId,
    type: 'central',
    label: 'Global Consensus Trunk',
  });
});

// 2. All 45 Peer-to-Peer pairs among the 10 domain agents
for (let i = 0; i < DOMAIN_AGENT_IDS.length; i++) {
  for (let j = i + 1; j < DOMAIN_AGENT_IDS.length; j++) {
    const ag1 = DOMAIN_AGENT_IDS[i];
    const ag2 = DOMAIN_AGENT_IDS[j];

    const strategicMatch = STRATEGIC_PEER_PAIRS.find(
      ([a, b]) => (a === ag1 && b === ag2) || (a === ag2 && b === ag1)
    );

    const isNeighbor = NEIGHBOR_RING_PAIRS.some(
      ([a, b]) => (a === ag1 && b === ag2) || (a === ag2 && b === ag1)
    );

    let type: 'neighbor' | 'strategic' | 'lattice' = 'lattice';
    let label = 'P2P Mesh Synapse Interconnect';

    if (strategicMatch) {
      type = 'strategic';
      label = strategicMatch[2];
    } else if (isNeighbor) {
      type = 'neighbor';
      label = 'Orbital Neighbor Telemetry Bridge';
    }

    ALL_MESH_LINKS.push({
      id: `p2p_${ag1}_${ag2}`,
      source: ag1,
      target: ag2,
      type,
      label,
    });
  }
}

export const AgentsView: React.FC<AgentsViewProps> = ({ agentState }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>('supervisor');
  const [viewLayout, setViewLayout] = useState<'constellation' | 'grid'>('constellation');
  const [isSynergyTesting, setIsSynergyTesting] = useState<boolean>(false);
  const [isDebateModalOpen, setIsDebateModalOpen] = useState<boolean>(false);
  const [packets, setPackets] = useState<ParticlePacket[]>([]);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState<number>(() => cityEngine.getState().activeIncidents.length);

  const packetCounterRef = useRef<number>(0);

  // Subscribe to live city incidents
  useEffect(() => {
    return cityEngine.subscribe((state) => {
      setActiveIncidentsCount(state.activeIncidents.length);
    });
  }, []);

  // Ambient telemetry loop: Continuous stream of P2P peer packets and supervisor consensus packets
  useEffect(() => {
    const interval = setInterval(() => {
      const isCrisis = activeIncidentsCount > 0 || agentState.isProcessing;

      let from: AgentId;
      let to: AgentId;
      let pulseType: 'p2p' | 'consensus' | 'synergy';
      let color: string;

      if (Math.random() < 0.7) {
        // 70% P2P peer telemetry exchange between domain agents
        pulseType = 'p2p';
        if (Math.random() < 0.5) {
          const pair = STRATEGIC_PEER_PAIRS[Math.floor(Math.random() * STRATEGIC_PEER_PAIRS.length)];
          from = Math.random() < 0.5 ? pair[0] : pair[1];
          to = from === pair[0] ? pair[1] : pair[0];
        } else {
          const pair = NEIGHBOR_RING_PAIRS[Math.floor(Math.random() * NEIGHBOR_RING_PAIRS.length)];
          from = Math.random() < 0.5 ? pair[0] : pair[1];
          to = from === pair[0] ? pair[1] : pair[0];
        }
        color = Math.random() < 0.5 ? '#00f5ff' : '#c084fc';
      } else {
        // 30% Central supervisory consensus telemetry
        pulseType = 'consensus';
        const domainAg = DOMAIN_AGENT_IDS[Math.floor(Math.random() * DOMAIN_AGENT_IDS.length)];
        if (Math.random() < 0.5) {
          from = domainAg;
          to = 'supervisor';
        } else {
          from = 'supervisor';
          to = domainAg;
        }
        color = '#38bdf8';
      }

      const agentFrom = agentState.agents[from];
      const newPacket: ParticlePacket = {
        id: ++packetCounterRef.current,
        from,
        to,
        progress: 0,
        speed: 0.016 + Math.random() * 0.014,
        color: isCrisis ? (pulseType === 'p2p' ? '#ec4899' : '#00f5ff') : (agentFrom?.accentColor || color),
        pulseType,
      };

      setPackets((prev) => [...prev.slice(-24), newPacket]);
      // SFX: soft P2P synapse data-packet tone (throttled — 1 in 4 packets)
      if (Math.random() < 0.25) {
        if (isCrisis) soundEngine.playP2PCrisisSynapse();
        else soundEngine.playP2PSynapse();
      }
    }, 550);

    return () => clearInterval(interval);
  }, [agentState.agents, agentState.isProcessing, activeIncidentsCount]);

  // Accelerated dynamic P2P data packets when crisis simulation or active incidents are engaged
  useEffect(() => {
    if (activeIncidentsCount === 0 && !agentState.isProcessing) return;

    const crisisInterval = setInterval(() => {
      const crisisPairs: [AgentId, AgentId][] = [
        ['traffic', 'emergency'],
        ['emergency', 'health'],
        ['health', 'energy'],
        ['water', 'emergency'],
        ['transit', 'traffic'],
        ['critic', 'supervisor'],
      ];
      const pair = crisisPairs[Math.floor(Math.random() * crisisPairs.length)];
      const from = Math.random() < 0.5 ? pair[0] : pair[1];
      const to = from === pair[0] ? pair[1] : pair[0];

      const crisisPacket: ParticlePacket = {
        id: ++packetCounterRef.current,
        from,
        to,
        progress: 0,
        speed: 0.026 + Math.random() * 0.018,
        color: Math.random() < 0.5 ? '#f43f5e' : '#00f5ff',
        pulseType: 'synergy',
      };

      setPackets((prev) => [...prev.slice(-28), crisisPacket]);
      // SFX: louder crisis synapse burst (1 in 3 packets)
      if (Math.random() < 0.33) soundEngine.playP2PCrisisSynapse();
    }, 420);

    return () => clearInterval(crisisInterval);
  }, [activeIncidentsCount, agentState.isProcessing]);

  // High-performance animation frame loop for all moving packets
  useEffect(() => {
    let animId: number;
    const animatePackets = () => {
      setPackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + p.speed }))
          .filter((p) => p.progress < 1)
      );
      animId = requestAnimationFrame(animatePackets);
    };
    animId = requestAnimationFrame(animatePackets);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Trigger synergy test: Fires massive multi-agent P2P synapse burst and consensus synthesis
  const triggerSynergyTest = () => {
    tacticalAudio.playAlertPing();
    tacticalAudio.speakTacticalDispatch('Initiating multi-agent peer-to-peer neural synergy mesh synchronization.');
    soundEngine.playCinemaTourStart(); // dramatic synergy burst
    setIsSynergyTesting(true);

    const bursts: ParticlePacket[] = [];

    // 1. Packets along strategic peer lines
    STRATEGIC_PEER_PAIRS.forEach(([ag1, ag2]) => {
      bursts.push({
        id: ++packetCounterRef.current,
        from: ag1,
        to: ag2,
        progress: Math.random() * 0.15,
        speed: 0.024 + Math.random() * 0.016,
        color: '#00f5ff', // high-glow cyan
        pulseType: 'synergy',
      });
      bursts.push({
        id: ++packetCounterRef.current,
        from: ag2,
        to: ag1,
        progress: Math.random() * 0.15,
        speed: 0.024 + Math.random() * 0.016,
        color: '#c084fc', // high-glow purple
        pulseType: 'synergy',
      });
    });

    // 2. Packets along neighbor ring lines
    NEIGHBOR_RING_PAIRS.forEach(([ag1, ag2]) => {
      bursts.push({
        id: ++packetCounterRef.current,
        from: ag1,
        to: ag2,
        progress: Math.random() * 0.15,
        speed: 0.022 + Math.random() * 0.014,
        color: agentState.agents[ag1]?.accentColor || '#38bdf8',
        pulseType: 'p2p',
      });
    });

    // 3. Central Supervisor consensus bursts
    DOMAIN_AGENT_IDS.forEach((agId) => {
      bursts.push({
        id: ++packetCounterRef.current,
        from: agId,
        to: 'supervisor',
        progress: 0,
        speed: 0.025 + Math.random() * 0.015,
        color: '#38bdf8',
        pulseType: 'consensus',
      });
      bursts.push({
        id: ++packetCounterRef.current,
        from: 'supervisor',
        to: agId,
        progress: 0,
        speed: 0.022 + Math.random() * 0.015,
        color: '#a855f7',
        pulseType: 'consensus',
      });
    });

    setPackets((prev) => [...prev.slice(-10), ...bursts]);

    setTimeout(() => {
      setIsSynergyTesting(false);
      tacticalAudio.playTacticalClick();
    }, 4500);
  };

  // Dispatch direct P2P packet on demand when clicking peer in Hero card
  const sendDirectPeerPacket = (targetId: AgentId) => {
    tacticalAudio.playTacticalClick();
    const pkt: ParticlePacket = {
      id: ++packetCounterRef.current,
      from: selectedAgentId,
      to: targetId,
      progress: 0,
      speed: 0.028,
      color: '#00f5ff',
      pulseType: 'p2p',
    };
    setPackets((prev) => [...prev.slice(-26), pkt]);
    setSelectedAgentId(targetId);
  };

  const getConnectedPeers = (agentId: AgentId): AgentId[] => {
    if (agentId === 'supervisor') {
      return ['traffic', 'emergency', 'energy', 'health', 'water', 'critic'];
    }
    const peers = new Set<AgentId>();
    peers.add('supervisor');
    STRATEGIC_PEER_PAIRS.forEach(([a, b]) => {
      if (a === agentId) peers.add(b);
      if (b === agentId) peers.add(a);
    });
    NEIGHBOR_RING_PAIRS.forEach(([a, b]) => {
      if (a === agentId) peers.add(b);
      if (b === agentId) peers.add(a);
    });
    return Array.from(peers);
  };

  const getAgentIcon = (id: AgentId) => {
    switch (id) {
      case 'supervisor':
        return <BrainCircuit className="w-5 h-5 text-sky-400" />;
      case 'traffic':
        return <Car className="w-5 h-5 text-amber-400" />;
      case 'energy':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'water':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'emergency':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'health':
        return <Activity className="w-5 h-5 text-pink-400" />;
      case 'environment':
        return <Wind className="w-5 h-5 text-emerald-400" />;
      case 'transit':
        return <TrainTrack className="w-5 h-5 text-purple-400" />;
      case 'economy':
        return <TrendingUp className="w-5 h-5 text-teal-400" />;
      case 'planner':
        return <Compass className="w-5 h-5 text-indigo-400" />;
      case 'critic':
        return <Scale className="w-5 h-5 text-rose-400" />;
    }
  };

  const getStatusBadge = (status: AgentInfo['status']) => {
    switch (status) {
      case 'ANALYZING':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'COLLABORATING':
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'EXECUTING':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'REVIEWING':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'COMPLETED':
        return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const selectedAgent = agentState.agents[selectedAgentId];

  // Orbital positions for the 10 domain agents around Supervisor
  const domainAgents: { id: AgentId; angleDeg: number }[] = [
    { id: 'traffic', angleDeg: 0 },
    { id: 'energy', angleDeg: 36 },
    { id: 'water', angleDeg: 72 },
    { id: 'emergency', angleDeg: 108 },
    { id: 'health', angleDeg: 144 },
    { id: 'environment', angleDeg: 180 },
    { id: 'transit', angleDeg: 216 },
    { id: 'economy', angleDeg: 252 },
    { id: 'planner', angleDeg: 288 },
    { id: 'critic', angleDeg: 324 },
  ];

  // Calculate coordinates in a 760x500 virtual plane
  const centerX = 380;
  const centerY = 250;
  const radiusX = 275;
  const radiusY = 170;

  const nodeCoordinates: Record<AgentId, { x: number; y: number }> = {
    supervisor: { x: centerX, y: centerY },
    traffic: { x: centerX + Math.cos((0 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((0 * Math.PI) / 180) * radiusY },
    energy: { x: centerX + Math.cos((36 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((36 * Math.PI) / 180) * radiusY },
    water: { x: centerX + Math.cos((72 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((72 * Math.PI) / 180) * radiusY },
    emergency: { x: centerX + Math.cos((108 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((108 * Math.PI) / 180) * radiusY },
    health: { x: centerX + Math.cos((144 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((144 * Math.PI) / 180) * radiusY },
    environment: { x: centerX + Math.cos((180 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((180 * Math.PI) / 180) * radiusY },
    transit: { x: centerX + Math.cos((216 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((216 * Math.PI) / 180) * radiusY },
    economy: { x: centerX + Math.cos((252 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((252 * Math.PI) / 180) * radiusY },
    planner: { x: centerX + Math.cos((288 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((288 * Math.PI) / 180) * radiusY },
    critic: { x: centerX + Math.cos((324 * Math.PI) / 180) * radiusX, y: centerY + Math.sin((324 * Math.PI) / 180) * radiusY },
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080f]/95 text-slate-200 select-none space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-xl hud-panel border border-sky-500/30 bg-[#070c18]/90 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-display text-lg font-bold">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>NEXUS MULTI-AGENT INTELLIGENCE NETWORK</span>
          </div>
          <p className="text-xs text-slate-400 font-ethiopic mt-0.5">
            11 ራስ-ገዝ የአይ-አይ ወኪሎች • Full Peer-to-Peer (P2P) Mesh Network & Central Supervisor Consensus
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Synergy Test Button */}
          <button
            onClick={triggerSynergyTest}
            disabled={isSynergyTesting}
            className={`px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-1.5 cursor-pointer transition-all ${
              isSynergyTesting
                ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/20'
                : 'bg-gradient-to-r from-sky-600/30 via-purple-600/30 to-emerald-600/30 border-sky-500/50 text-sky-200 hover:border-sky-400 hover:shadow-lg hover:shadow-cyan-500/20'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSynergyTesting ? 'animate-spin text-amber-400' : 'text-sky-400'}`} />
            <span>{isSynergyTesting ? 'SYNAPSE BURST ACTIVE...' : 'TRIGGER AGENT SYNERGY'}</span>
          </button>

          {/* 11-Agent War Room Consensus Button */}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setIsDebateModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg border border-purple-500/60 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
            title="Open 11-Agent Cognitive Conflict Arbitration War Room"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>WAR ROOM TRANSCRIPT</span>
          </button>

          {/* Layout Toggle */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => {
                tacticalAudio.playTacticalClick();
                setViewLayout('constellation');
              }}
              className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-all ${
                viewLayout === 'constellation'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              P2P CONSTELLATION
            </button>
            <button
              onClick={() => {
                tacticalAudio.playTacticalClick();
                setViewLayout('grid');
              }}
              className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-all ${
                viewLayout === 'grid'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GRID MATRIX
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTION FEATURE: FULL DYNAMIC PEER-TO-PEER (P2P) MESH CONSTELLATION */}
      {viewLayout === 'constellation' && (
        <div className="relative w-full h-[540px] rounded-2xl hud-panel border border-sky-500/40 bg-[#070c1a]/95 overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Background Synapse Circuit Grid & Rings */}
          <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />

          {/* Top Live Status HUD Badges */}
          <div className="absolute top-3 left-4 flex flex-wrap items-center gap-2 text-[10px] font-mono pointer-events-none z-10">
            <span className="px-2.5 py-1 rounded bg-sky-950/80 border border-sky-800/60 text-sky-300 font-semibold flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>P2P MESH: 55 ACTIVE DYNAMIC SYNAPSES</span>
            </span>
            {isSynergyTesting && (
              <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/80 text-amber-300 font-semibold animate-pulse shadow-md shadow-amber-500/20">
                ⚡ SYNAPSE BURST IN PROGRESS
              </span>
            )}
            {activeIncidentsCount > 0 && (
              <span className="px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/80 text-rose-300 font-semibold animate-pulse shadow-md shadow-rose-500/20">
                🚨 CRISIS P2P TELEMETRY ({activeIncidentsCount} ACTIVE ALERTS)
              </span>
            )}
          </div>

          {/* SVG Neural Connections with P2P Mesh and Moving Packets */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 760 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="p2pActiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="p2pPulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f5ff" stopOpacity="1" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="supervisorConsensusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
              </linearGradient>

              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="p2pGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur1" />
                <feGaussianBlur stdDeviation="2" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Orbital Guide Ellipses */}
            <ellipse cx={centerX} cy={centerY} rx={radiusX} ry={radiusY} fill="none" stroke="rgba(56, 189, 248, 0.14)" strokeWidth="1" strokeDasharray="4 4" />
            <ellipse cx={centerX} cy={centerY} rx={radiusX * 0.55} ry={radiusY * 0.55} fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />

            {/* 1. Secondary P2P Mesh Lattice Lines */}
            {ALL_MESH_LINKS.filter((l) => l.type === 'lattice').map((link) => {
              const src = nodeCoordinates[link.source];
              const tgt = nodeCoordinates[link.target];
              if (!src || !tgt) return null;

              const isCarryingPacket = packets.some(
                (p) =>
                  (p.from === link.source && p.to === link.target) ||
                  (p.from === link.target && p.to === link.source)
              );
              const isSelected = selectedAgentId === link.source || selectedAgentId === link.target;

              let stroke = 'rgba(56, 189, 248, 0.10)';
              let strokeWidth = 0.8;
              let opacity = 0.18;
              let filter: string | undefined = undefined;

              if (isCarryingPacket) {
                stroke = 'url(#p2pPulseGradient)';
                strokeWidth = 2.4;
                opacity = 1.0;
                filter = 'url(#p2pGlow)';
              } else if (isSelected) {
                stroke = 'url(#p2pActiveGradient)';
                strokeWidth = 1.6;
                opacity = 0.75;
                filter = 'url(#glow)';
              } else if (isSynergyTesting || activeIncidentsCount > 0) {
                stroke = 'rgba(168, 85, 247, 0.28)';
                strokeWidth = 1.0;
                opacity = 0.35;
              }

              return (
                <line
                  key={link.id}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  filter={filter}
                  className="transition-all duration-300 pointer-events-none"
                />
              );
            })}

            {/* 2. Neighbor Ring P2P Lines */}
            {ALL_MESH_LINKS.filter((l) => l.type === 'neighbor').map((link) => {
              const src = nodeCoordinates[link.source];
              const tgt = nodeCoordinates[link.target];
              if (!src || !tgt) return null;

              const isCarryingPacket = packets.some(
                (p) =>
                  (p.from === link.source && p.to === link.target) ||
                  (p.from === link.target && p.to === link.source)
              );
              const isSelected = selectedAgentId === link.source || selectedAgentId === link.target;

              let stroke = 'rgba(168, 85, 247, 0.28)';
              let strokeWidth = 1.4;
              let opacity = 0.45;
              let filter: string | undefined = undefined;
              let strokeDasharray: string | undefined = undefined;

              if (isCarryingPacket) {
                stroke = 'url(#p2pPulseGradient)';
                strokeWidth = 2.6;
                opacity = 1.0;
                filter = 'url(#p2pGlow)';
              } else if (isSelected) {
                stroke = 'url(#p2pActiveGradient)';
                strokeWidth = 2.2;
                opacity = 0.9;
                filter = 'url(#glow)';
              } else if (isSynergyTesting || activeIncidentsCount > 0) {
                stroke = 'url(#p2pActiveGradient)';
                strokeWidth = 1.8;
                opacity = 0.85;
                filter = 'url(#glow)';
                strokeDasharray = '5 3';
              }

              return (
                <line
                  key={link.id}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  filter={filter}
                  strokeDasharray={strokeDasharray}
                  className="transition-all duration-200 pointer-events-none"
                />
              );
            })}

            {/* 3. Strategic Cross-Domain P2P Lines (Traffic<->Emergency, Health<->Energy, Planner<->Transit, etc.) */}
            {ALL_MESH_LINKS.filter((l) => l.type === 'strategic').map((link) => {
              const src = nodeCoordinates[link.source];
              const tgt = nodeCoordinates[link.target];
              if (!src || !tgt) return null;

              const isCarryingPacket = packets.some(
                (p) =>
                  (p.from === link.source && p.to === link.target) ||
                  (p.from === link.target && p.to === link.source)
              );
              const isSelected = selectedAgentId === link.source || selectedAgentId === link.target;

              let stroke = 'rgba(56, 189, 248, 0.3)';
              let strokeWidth = 1.5;
              let opacity = 0.5;
              let filter: string | undefined = undefined;
              let strokeDasharray: string | undefined = undefined;

              if (isCarryingPacket) {
                stroke = 'url(#p2pPulseGradient)';
                strokeWidth = 2.8;
                opacity = 1.0;
                filter = 'url(#p2pGlow)';
              } else if (isSelected) {
                stroke = 'url(#p2pActiveGradient)';
                strokeWidth = 2.4;
                opacity = 0.95;
                filter = 'url(#p2pGlow)';
              } else if (isSynergyTesting || activeIncidentsCount > 0) {
                stroke = 'url(#p2pActiveGradient)';
                strokeWidth = 2.0;
                opacity = 0.85;
                filter = 'url(#glow)';
                strokeDasharray = '6 3';
              }

              return (
                <line
                  key={link.id}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  filter={filter}
                  strokeDasharray={strokeDasharray}
                  className="transition-all duration-200 pointer-events-none"
                />
              );
            })}

            {/* 4. Central Consensus Trunks connecting all 10 domain agents to Supervisor AI */}
            {ALL_MESH_LINKS.filter((l) => l.type === 'central').map((link) => {
              const src = nodeCoordinates[link.source];
              const tgt = nodeCoordinates[link.target];
              if (!src || !tgt) return null;

              const isCarryingPacket = packets.some(
                (p) =>
                  (p.from === link.source && p.to === link.target) ||
                  (p.from === link.target && p.to === link.source)
              );
              const isSelected = selectedAgentId === link.source || selectedAgentId === link.target;

              let stroke = 'rgba(56, 189, 248, 0.35)';
              let strokeWidth = 1.5;
              let opacity = 0.55;
              let filter: string | undefined = undefined;

              if (isCarryingPacket) {
                stroke = '#38bdf8';
                strokeWidth = 2.6;
                opacity = 1.0;
                filter = 'url(#p2pGlow)';
              } else if (isSelected) {
                stroke = '#38bdf8';
                strokeWidth = 2.2;
                opacity = 0.95;
                filter = 'url(#glow)';
              } else if (isSynergyTesting) {
                stroke = '#38bdf8';
                strokeWidth = 1.8;
                opacity = 0.85;
                filter = 'url(#glow)';
              }

              return (
                <line
                  key={link.id}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray="6 3"
                  opacity={opacity}
                  filter={filter}
                  className="transition-all duration-200 pointer-events-none"
                />
              );
            })}

            {/* Dynamic Moving Particle Packets (Live Data Packets in Transit!) */}
            {packets.map((pkt) => {
              const start = nodeCoordinates[pkt.from];
              const end = nodeCoordinates[pkt.to];
              if (!start || !end) return null;

              const curX = start.x + (end.x - start.x) * pkt.progress;
              const curY = start.y + (end.y - start.y) * pkt.progress;
              const isP2P = pkt.pulseType === 'p2p' || pkt.pulseType === 'synergy';

              return (
                <g key={pkt.id} className="pointer-events-none">
                  {/* Outer aura halo */}
                  <circle
                    cx={curX}
                    cy={curY}
                    r={pkt.pulseType === 'synergy' ? 9 : 7}
                    fill={pkt.color}
                    opacity="0.3"
                    filter="url(#glow)"
                  />
                  {/* Glowing core particle */}
                  <circle
                    cx={curX}
                    cy={curY}
                    r={pkt.pulseType === 'synergy' ? 4.5 : 3.5}
                    fill={pkt.color}
                    filter="url(#glow)"
                  />
                  {/* Center pinpoint */}
                  <circle cx={curX} cy={curY} r="1.8" fill="#ffffff" />
                  {/* Cyber streak tail */}
                  <line
                    x1={curX - (end.x - start.x) * 0.05}
                    y1={curY - (end.y - start.y) * 0.05}
                    x2={curX}
                    y2={curY}
                    stroke={pkt.color}
                    strokeWidth={isP2P ? 2.5 : 2.0}
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                </g>
              );
            })}
          </svg>

          {/* Center Node: Supervisor AI */}
          <div
            onClick={() => {
              tacticalAudio.playTacticalClick();
              setSelectedAgentId('supervisor');
            }}
            style={{
              position: 'absolute',
              left: `${(centerX / 760) * 100}%`,
              top: `${(centerY / 500) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`z-20 p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col items-center select-none ${
              selectedAgentId === 'supervisor'
                ? 'bg-sky-950/95 border-sky-400 shadow-2xl shadow-sky-500/50 scale-110 ring-2 ring-sky-400/60'
                : 'bg-[#091122]/95 border-sky-500/50 hover:border-sky-400 hover:scale-105 shadow-xl shadow-sky-950/80'
            }`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/60 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/30">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm shadow-emerald-400" />
            </div>
            <span className="mt-1.5 font-display font-bold text-xs text-sky-100 whitespace-nowrap">
              SUPERVISOR AI
            </span>
            <span className="text-[9px] font-mono text-sky-300">GLOBAL CONSENSUS CORE</span>
          </div>

          {/* 10 Surrounding Orbital Domain Agent Nodes */}
          {domainAgents.map((ag) => {
            const agent = agentState.agents[ag.id];
            const coord = nodeCoordinates[ag.id];
            const isSelected = selectedAgentId === ag.id;
            const isPeerOfSelected =
              selectedAgentId !== ag.id &&
              (selectedAgentId === 'supervisor' ||
                STRATEGIC_PEER_PAIRS.some(
                  ([a, b]) => (a === selectedAgentId && b === ag.id) || (b === selectedAgentId && a === ag.id)
                ) ||
                NEIGHBOR_RING_PAIRS.some(
                  ([a, b]) => (a === selectedAgentId && b === ag.id) || (b === selectedAgentId && a === ag.id)
                ));

            return (
              <div
                key={ag.id}
                onClick={() => {
                  tacticalAudio.playTacticalClick();
                  setSelectedAgentId(ag.id);
                }}
                style={{
                  position: 'absolute',
                  left: `${(coord.x / 760) * 100}%`,
                  top: `${(coord.y / 500) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`z-20 p-2 rounded-xl border transition-all cursor-pointer group flex items-center space-x-2 select-none ${
                  isSelected
                    ? 'bg-slate-900/95 border-sky-400 shadow-xl shadow-sky-500/40 scale-110 ring-2 ring-sky-400/50'
                    : isPeerOfSelected
                    ? 'bg-slate-950/90 border-purple-500/50 shadow-lg shadow-purple-500/20 hover:border-purple-400 hover:scale-105'
                    : 'bg-slate-950/85 border-slate-800 hover:border-slate-600 hover:scale-105'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0"
                  style={{
                    backgroundColor: `${agent?.accentColor}18`,
                    borderColor: `${agent?.accentColor}50`,
                  }}
                >
                  {getAgentIcon(ag.id)}
                </div>
                <div className="hidden sm:block">
                  <div className="font-display font-bold text-[11px] text-sky-100 whitespace-nowrap">
                    {agent?.name}
                  </div>
                  <div className="text-[8.5px] font-mono text-slate-400 whitespace-nowrap">
                    {agent?.qualityScore}% Quality • {agent?.latencyMs}ms
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Overlay Legend & Real-Time Transmission Frequency */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
              <span>
                FULL P2P MESH + CENTRAL CONSENSUS • TRANSMISSION:{' '}
                {isSynergyTesting ? '~128' : activeIncidentsCount > 0 ? '~96' : '~52'} PKT/S
              </span>
            </span>
            <span className="text-sky-300 hidden md:inline">
              CLICK ANY NODE TO INSPECT LIVE P2P SYNAPSE BRIDGES
            </span>
          </div>
        </div>
      )}

      {/* Selected Hero Agent Telemetry Card */}
      {selectedAgent && (
        <div className="p-5 rounded-xl hud-panel border border-sky-500/40 bg-[#070f22]/90 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg"
                style={{
                  backgroundColor: `${selectedAgent.accentColor}15`,
                  borderColor: `${selectedAgent.accentColor}50`,
                }}
              >
                {getAgentIcon(selectedAgent.id)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-display font-bold text-sky-100">
                    {selectedAgent.name}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getStatusBadge(
                      selectedAgent.status
                    )}`}
                  >
                    {selectedAgent.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-ethiopic">
                  {selectedAgent.amharicName} • {selectedAgent.role}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center space-x-3 font-mono text-xs">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                <span className="text-[9px] text-slate-400 block">CONFIDENCE</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {selectedAgent.confidence}%
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                <span className="text-[9px] text-slate-400 block">QUALITY</span>
                <span className="text-sky-400 font-bold text-sm">
                  {selectedAgent.qualityScore}%
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                <span className="text-[9px] text-slate-400 block">LATENCY</span>
                <span className="text-amber-400 font-bold text-sm">
                  {selectedAgent.latencyMs}ms
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center min-w-[70px]">
                <span className="text-[9px] text-slate-400 block">MESSAGES</span>
                <span className="text-purple-400 font-bold text-sm">
                  {selectedAgent.messageCount}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-sky-400 font-semibold block text-[10px] mb-1">CURRENT TASK:</span>
              <p className="text-slate-300 leading-relaxed">{selectedAgent.currentTask}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-emerald-400 font-semibold block text-[10px] mb-1">
                ACTIVE RECOMMENDATION:
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedAgent.currentRecommendation}</p>
            </div>
          </div>

          {/* Connected P2P Mesh Bridges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1 border-t border-sky-950">
            <span className="text-slate-400 text-[10px] font-semibold flex items-center space-x-1">
              <Share2 className="w-3 h-3 text-cyan-400" />
              <span>ACTIVE P2P MESH BRIDGES:</span>
            </span>
            {getConnectedPeers(selectedAgent.id).map((peerId) => {
              const peerAgent = agentState.agents[peerId];
              return (
                <button
                  key={peerId}
                  onClick={() => sendDirectPeerPacket(peerId)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-sky-950/80 border border-slate-700 hover:border-cyan-400/60 text-[10px] text-sky-200 uppercase cursor-pointer transition-all flex items-center space-x-1.5 group"
                  title={`Send live P2P telemetry packet to ${peerAgent?.name || peerId}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: peerAgent?.accentColor || '#38bdf8' }}
                  />
                  <span>{peerAgent?.name || peerId}</span>
                  <span className="text-[8px] text-cyan-400 opacity-60 group-hover:opacity-100">⇄ P2P</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of All 11 Agents */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
          <Share2 className="w-3.5 h-3.5 text-sky-400" />
          <span>ALL 11 AUTONOMOUS AGENT NODES</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {Object.values(agentState.agents).map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => {
                  tacticalAudio.playTacticalClick();
                  setSelectedAgentId(agent.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-400 shadow-lg shadow-sky-500/20 ring-1 ring-sky-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="p-2 rounded-lg border"
                      style={{
                        backgroundColor: `${agent.accentColor}15`,
                        borderColor: `${agent.accentColor}40`,
                      }}
                    >
                      {getAgentIcon(agent.id)}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-sky-100">
                        {agent.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 font-ethiopic">
                        {agent.amharicName}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border uppercase ${getStatusBadge(
                      agent.status
                    )}`}
                  >
                    {agent.status}
                  </span>
                </div>

                <div className="mt-2.5 text-[11px] text-slate-300 line-clamp-2 leading-snug">
                  {agent.currentRecommendation}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Score: <b className="text-sky-300">{agent.qualityScore}%</b></span>
                  <span>Latency: <b className="text-amber-400">{agent.latencyMs}ms</b></span>
                  <span className="text-slate-500">#{agent.messageCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 11-Agent Cognitive Conflict Arbitration War Room Dialogue ── */}
      <LiveDebateWarRoom
        isOpen={isDebateModalOpen}
        onClose={() => setIsDebateModalOpen(false)}
      />
    </div>
  );
};
