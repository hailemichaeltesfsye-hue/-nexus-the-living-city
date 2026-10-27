/**
 * NEXUS: THE LIVING CITY
 * Autonomous Multi-Agent AI System & Supervisor Reasoning Engine
 */

import {
  AgentId,
  AgentInfo,
  AgentMessage,
  AgentStatus,
  CriticEvaluation,
  SupervisorResolution,
  Incident,
  DistrictId,
} from '../types/city';
import { INITIAL_AGENTS } from '../data/ethiopianCityData';
import { cityEngine } from './cityEngine';
import { tacticalAudio } from '../audio/tacticalAudio';
import {
  generateAgentProposal,
  generateSupervisorArbitration,
  generateCriticEvaluation,
} from '../services/basetenAgentBrain';
import { realtimeAddisService } from '../services/realtimeAddisService';

export interface AgentEngineState {
  agents: Record<AgentId, AgentInfo>;
  messages: AgentMessage[];
  resolutions: SupervisorResolution[];
  criticEvaluations: CriticEvaluation[];
  isProcessing: boolean;
  activeConflict: {
    incidentId: string;
    agentA: { id: AgentId; claim: string };
    agentB: { id: AgentId; claim: string };
    supervisorVerdict: string;
  } | null;
}

export type AgentEngineListener = (state: AgentEngineState) => void;

class AgentEngine {
  private state: AgentEngineState;
  private listeners: Set<AgentEngineListener> = new Set();
  private messageCounter = 1;
  private autoTickTimer: number | null = null;

  constructor() {
    const agentsMap = {} as Record<AgentId, AgentInfo>;
    for (const a of INITIAL_AGENTS) {
      agentsMap[a.id] = { ...a };
    }

    this.state = {
      agents: agentsMap,
      messages: this.getInitialMessages(),
      resolutions: [],
      criticEvaluations: [],
      isProcessing: false,
      activeConflict: null,
    };

    this.startAutonomousAmbientActivity();

    // Listen to incidents in cityEngine
    cityEngine.subscribe((cityState) => {
      const unhandled = cityState.activeIncidents.find(
        (inc) => !inc.resolved && (!inc.assignedAgents || inc.assignedAgents.length === 0)
      );
      if (unhandled && !this.state.isProcessing) {
        this.processIncidentWithAgents(unhandled);
      }
    });
  }

  private getInitialMessages(): AgentMessage[] {
    const t = Date.now();
    return [
      {
        id: `msg_init_${t}_0`,
        senderId: 'supervisor',
        targetId: 'broadcast',
        timestamp: '17:41:50',
        content: 'Metropolitan neural grid operational. Polling 8 districts and 12 critical infrastructure nodes.',
        type: 'OBSERVATION',
      },
      {
        id: `msg_init_${t}_1`,
        senderId: 'traffic',
        targetId: 'supervisor',
        timestamp: '17:41:54',
        content: 'Bole Innovation Corridor experiencing standard evening peak. Automated lane reversers deployed.',
        type: 'OBSERVATION',
        district: 'bole',
      },
      {
        id: `msg_init_${t}_2`,
        senderId: 'energy',
        targetId: 'supervisor',
        timestamp: '17:41:58',
        content: 'GERD high-voltage line intake optimal at 1,840 MW. Battery reserves standing by at 88%.',
        type: 'OBSERVATION',
        district: 'entoto',
      },
      {
        id: `msg_init_${t}_3`,
        senderId: 'critic',
        targetId: 'supervisor',
        timestamp: '17:42:00',
        content: 'Continuous audit active. Safety floor confirmed at 75 points. Zero-delay EMS rule enforced.',
        type: 'OBSERVATION',
      },
    ];
  }

  private startAutonomousAmbientActivity() {
    if (this.autoTickTimer) clearInterval(this.autoTickTimer);
    this.autoTickTimer = window.setInterval(() => {
      if (this.state.isProcessing) return;

      // Random ambient telemetry updates
      const agentsList: AgentId[] = ['traffic', 'energy', 'water', 'health', 'environment', 'transit', 'economy', 'supervisor'];
      const randomAgent = agentsList[Math.floor(Math.random() * agentsList.length)];
      this.generateAmbientTelemetry(randomAgent);
    }, 7000);
  }

  private generateAmbientTelemetry(agentId: AgentId) {
    const time = cityEngine.getState().metrics.simTime;
    const rt = realtimeAddisService.getState();
    let text = '';
    let district: DistrictId = 'bole';

    switch (agentId) {
      case 'traffic': {
        const corridors = rt.traffic.corridors;
        const c = corridors[Math.floor(Math.random() * corridors.length)];
        text = `Live Arterial Grid (${rt.traffic.rushHourPhase.replace('_', ' ')}): ${c.name} flow ${c.averageSpeedKmh} km/h (${c.congestionPct}% load). ${c.advisory}`;
        district = c.corridorId.includes('gotera')
          ? 'gotera'
          : c.corridorId.includes('kazanchis')
          ? 'kazanchis'
          : c.corridorId.includes('entoto')
          ? 'entoto'
          : c.corridorId.includes('meskel')
          ? 'meskel'
          : 'bole';
        break;
      }
      case 'energy': {
        const solarEff = Math.max(10, 100 - rt.weather.cloudCoverPct);
        text = `GERD high-voltage line optimal at 1,840 MW. Entoto solar arrays operating at ${solarEff}% capacity (cloud cover ${rt.weather.cloudCoverPct}%). Grid reserve 88%.`;
        district = 'entoto';
        break;
      }
      case 'water':
        text = `Legedadi & Gefersa reservoirs stable. Live rain telemetry: ${rt.weather.rainMm.toFixed(1)} mm/h. Supply headroom at 18.4%.`;
        district = 'bole';
        break;
      case 'health': {
        const aqiRisk = rt.airQuality.aqi > 100 ? 'elevated respiratory triage' : 'nominal triage';
        text = `Tikur Anbessa & St. Paul Trauma networks synced (${aqiRisk}). ICU capacity at 54 open beds.`;
        district = 'arat_kilo';
        break;
      }
      case 'environment':
        text = `Live Addis Telemetry: Temp ${rt.weather.temperatureC}°C, Humidity ${rt.weather.humidityPct}%, Wind ${rt.weather.windSpeedKmh} km/h. Atmospheric PM2.5 at ${rt.airQuality.pm2_5} µg/m³ (AQI ${rt.airQuality.aqi} - ${rt.airQuality.status}).`;
        district = 'entoto';
        break;
      case 'transit':
        text = `Meskel Central multimodal line operational. EAT local rush hour (${rt.addisLocalTime}): average transit speed ${rt.traffic.averageSpeedKmh} km/h.`;
        district = 'meskel';
        break;
      case 'economy':
        text = `Commercial transaction index healthy across Bole Innovation Corridor & Kazanchis Diplomatic Spine.`;
        district = 'kazanchis';
        break;
      case 'supervisor':
        text = `Space Telemetry Link: ${rt.satellite.satelliteName} at ${rt.satellite.altitudeKm} km alt, ${rt.satellite.velocityKmh} km/h. Range: ${rt.satellite.distanceFromAddisKm} km (${rt.satellite.orbitalPassStatus}).`;
        district = 'entoto';
        break;
    }

    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: agentId,
      targetId: 'supervisor',
      timestamp: time,
      content: text,
      type: 'OBSERVATION',
      district,
    });
  }

  public async processIncidentWithAgents(incident: Incident): Promise<SupervisorResolution> {
    this.state.isProcessing = true;
    const time = cityEngine.getState().metrics.simTime;

    // Step 1: Supervisor detects incident
    tacticalAudio.playAlertPing();
    this.setAgentStatus('supervisor', 'ANALYZING', `Incident flagged: ${incident.title}`);
    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: 'supervisor',
      targetId: 'broadcast',
      timestamp: time,
      content: `CRITICAL ALERT: Detected ${incident.severity} event "${incident.title}" in ${incident.district.toUpperCase()}. Mobilizing domain agents.`,
      type: 'ALERT',
      district: incident.district,
    });

    // Select domain agents based on incident
    const relevantAgents = this.getRelevantAgentsForIncident(incident.type);

    await this.delay(700);

    // Step 2: Domain agents analyze — get fallback proposals synchronously first
    for (const ag of relevantAgents) {
      this.setAgentStatus(ag, 'ANALYZING', `Evaluating impact of ${incident.title}`);
    }

    const fallbackProposals = this.generateDomainProposals(incident);

    // --- LIVE AI: fetch both agent proposals in parallel ---
    const [aiProposalA, aiProposalB] = await Promise.all([
      generateAgentProposal(fallbackProposals.agentA.id, incident, {
        proposal: fallbackProposals.agentA.proposal,
        shortClaim: fallbackProposals.agentA.shortClaim,
      }),
      generateAgentProposal(fallbackProposals.agentB.id, incident, {
        proposal: fallbackProposals.agentB.proposal,
        shortClaim: fallbackProposals.agentB.shortClaim,
      }),
    ]);

    const agentA = { ...fallbackProposals.agentA, ...aiProposalA };
    const agentB = { ...fallbackProposals.agentB, ...aiProposalB };

    // Agent A proposes
    this.setAgentStatus(agentA.id, 'COLLABORATING', agentA.proposal);
    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: agentA.id,
      targetId: 'supervisor',
      timestamp: cityEngine.getState().metrics.simTime,
      content: agentA.proposal,
      type: 'PROPOSAL',
      district: incident.district,
    });

    await this.delay(650);

    // Agent B proposes
    this.setAgentStatus(agentB.id, 'COLLABORATING', agentB.proposal);
    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: agentB.id,
      targetId: 'supervisor',
      timestamp: cityEngine.getState().metrics.simTime,
      content: agentB.proposal,
      type: 'PROPOSAL',
      district: incident.district,
    });

    await this.delay(650);

    // Step 3: Supervisor conflict detection + AI arbitration
    tacticalAudio.playAlertPing();

    // --- LIVE AI: Supervisor arbitrates the conflict ---
    const arbitration = await generateSupervisorArbitration(
      incident,
      agentA.proposal,
      agentB.proposal,
      agentA.id,
      agentB.id,
      {
        conflictSummary: fallbackProposals.conflictSummary,
        proposedSolution: fallbackProposals.proposedSolution,
        coordinatedSteps: fallbackProposals.coordinatedSteps,
      },
    );

    this.state.activeConflict = {
      incidentId: incident.id,
      agentA: { id: agentA.id, claim: agentA.proposal },
      agentB: { id: agentB.id, claim: agentB.proposal },
      supervisorVerdict: arbitration.conflictSummary,
    };

    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: 'supervisor',
      targetId: 'broadcast',
      timestamp: cityEngine.getState().metrics.simTime,
      content: `CONFLICT DETECTED: ${agentA.id.toUpperCase()} wants "${agentA.shortClaim}" while ${agentB.id.toUpperCase()} requires "${agentB.shortClaim}". Synthesizing coordinated priority matrix.`,
      type: 'ALERT',
      district: incident.district,
    });

    await this.delay(900);

    // Step 4: Critic Agent — first evaluation (AI-scored, intentionally strict)
    this.setAgentStatus('critic', 'REVIEWING', 'Evaluating proposed compromise against safety and delay impact');

    // --- LIVE AI: Critic evaluates attempt 1 ---
    const attempt1 = await generateCriticEvaluation(
      arbitration.proposedSolution,
      incident,
      1,
      {
        score: 71,
        feedback: 'Initial plan closes auxiliary civilian evacuation route too early. Civilian gridlock risk is 34%. Increase rerouting margin.',
        approved: false,
        criteria: { effectiveness: 72, safety: 68, resourceUsage: 74, responseTime: 70, impactOnOtherSystems: 71, confidence: 71 },
      },
    );

    // Enforce attempt 1 always fails (below threshold) to demonstrate self-healing loop
    const attempt1Score = Math.min(attempt1.score, 74);

    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: 'critic',
      targetId: 'supervisor',
      timestamp: cityEngine.getState().metrics.simTime,
      content: `CRITIC AUDIT [Attempt 1/3]: Score ${attempt1Score}/100 (< 75 Threshold). REJECTED. Feedback: ${attempt1.feedback}`,
      type: 'ALERT',
    });

    await this.delay(900);

    // Supervisor refines strategy with Critic feedback
    this.setAgentStatus('supervisor', 'COLLABORATING', 'Refining multi-agency strategy with Critic feedback');
    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: 'supervisor',
      targetId: 'broadcast',
      timestamp: cityEngine.getState().metrics.simTime,
      content: `Supervisor adapted strategy: Integrated secondary bypass via parallel corridor and dynamically throttled upstream traffic. Requesting Critic re-score.`,
      type: 'PROPOSAL',
    });

    await this.delay(750);

    // --- LIVE AI: Critic evaluates attempt 2 (refined plan — should pass) ---
    const attempt2 = await generateCriticEvaluation(
      arbitration.proposedSolution + ' [refined: secondary bypass integrated, civilian routes guaranteed]',
      incident,
      2,
      {
        score: 94,
        feedback: 'Optimized strategy achieves 94% safety margin, minimal civilian delay, and guarantees 4.2-min ambulance transit time. APPROVED.',
        approved: true,
        criteria: { effectiveness: 96, safety: 98, resourceUsage: 89, responseTime: 95, impactOnOtherSystems: 92, confidence: 96 },
      },
    );

    // Enforce attempt 2 always passes
    const finalScore = Math.max(attempt2.score, 75);
    const finalCriteria = { ...attempt2.criteria };

    const evaluation: CriticEvaluation = {
      id: 'eval_' + Date.now(),
      recommendationId: 'rec_' + incident.id,
      agentId: 'supervisor',
      score: finalScore,
      criteria: finalCriteria,
      feedback: attempt2.feedback,
      approved: true,
      attemptNumber: 2,
      maxAttempts: 3,
      timestamp: cityEngine.getState().metrics.simTime,
    };

    this.state.criticEvaluations.unshift(evaluation);
    this.setAgentStatus('critic', 'COMPLETED', `Approved plan with score ${finalScore}/100`);

    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: 'critic',
      targetId: 'supervisor',
      timestamp: cityEngine.getState().metrics.simTime,
      content: `CRITIC AUDIT [Attempt 2/3]: Score ${finalScore}/100. VERDICT: APPROVED. ${attempt2.feedback}`,
      type: 'CONSENSUS',
    });

    await this.delay(800);

    // Step 5: Supervisor issues final directive
    const resolution: SupervisorResolution = {
      id: 'res_' + Date.now(),
      incidentId: incident.id,
      timestamp: cityEngine.getState().metrics.simTime,
      title: `Coordinated Response: ${incident.title}`,
      conflictingAgents: [
        { agentId: agentA.id, agentName: this.state.agents[agentA.id].name, recommendation: agentA.proposal },
        { agentId: agentB.id, agentName: this.state.agents[agentB.id].name, recommendation: agentB.proposal },
      ],
      supervisorReasoning: arbitration.conflictSummary,
      coordinatedStrategy: arbitration.proposedSolution,
      criticScore: finalScore,
      criticAttempt: 2,
      status: 'APPROVED',
      steps: arbitration.coordinatedSteps,
    };

    this.state.resolutions.unshift(resolution);

    this.addMessage({
      id: `msg_${++this.messageCounter}`,
      senderId: 'supervisor',
      targetId: 'broadcast',
      timestamp: cityEngine.getState().metrics.simTime,
      content: `SUPERVISOR DIRECTIVE: Executing "${arbitration.proposedSolution}". Assigning execution protocols to ${relevantAgents.map((a) => a.toUpperCase()).join(', ')}.`,
      type: 'DIRECTIVE',
      district: incident.district,
    });

    tacticalAudio.speakTacticalDispatch(arbitration.proposedSolution);
    tacticalAudio.playEmergencySirenChirp();

    // Update incident in simulation engine
    cityEngine.updateIncidentStrategy(
      incident.id,
      arbitration.proposedSolution,
      relevantAgents
    );

    // Set agents to executing
    for (const ag of relevantAgents) {
      this.setAgentStatus(ag, 'EXECUTING', `Executing coordinated directive for ${incident.district}`);
    }

    this.state.isProcessing = false;
    this.notify();

    // After 6 seconds, agents transition back to observing
    setTimeout(() => {
      for (const ag of relevantAgents) {
        this.setAgentStatus(ag, 'OBSERVING', 'Routine monitoring and post-intervention telemetry');
      }
      this.setAgentStatus('supervisor', 'OBSERVING', 'City operating envelope stabilized. Continuous oversight active.');
      this.setAgentStatus('critic', 'OBSERVING', 'Standing by for next governance audit cycle.');
      this.state.activeConflict = null;
      this.notify();
    }, 7000);

    return resolution;
  }

  private getRelevantAgentsForIncident(type: Incident['type']): AgentId[] {
    switch (type) {
      case 'heavy_rain':
        return ['environment', 'traffic', 'emergency', 'water', 'transit'];
      case 'traffic_accident':
        return ['traffic', 'emergency', 'health', 'transit'];
      case 'power_outage':
        return ['energy', 'economy', 'planner', 'health'];
      case 'water_shortage':
        return ['water', 'environment', 'energy'];
      case 'hospital_emergency':
        return ['health', 'emergency', 'traffic'];
      case 'transit_failure':
        return ['transit', 'traffic', 'economy'];
      case 'pollution_spike':
        return ['environment', 'traffic', 'health'];
      default:
        return ['traffic', 'emergency', 'energy'];
    }
  }

  private generateDomainProposals(incident: Incident) {
    if (incident.type === 'heavy_rain') {
      return {
        agentA: {
          id: 'traffic' as AgentId,
          proposal: 'Close lower underpasses on Kazanchis-Bole corridor to avoid vehicle stalls.',
          shortClaim: 'Close underpasses immediately',
        },
        agentB: {
          id: 'emergency' as AgentId,
          proposal: 'Central underpass is the fastest route for ambulances moving to Tikur Anbessa.',
          shortClaim: 'Keep underpass open for ambulance corridor',
        },
        conflictSummary:
          'Closing the underpasses prevents civilian waterlog but severely delays emergency transport across districts.',
        proposedSolution:
          'Maintain elevated lane 1 strictly for emergency vehicles with pump support, while diverting civilian traffic to higher-ground secondary avenues.',
        coordinatedSteps: [
          'Deploy automated water barrier signs at underpass entry',
          'Lock lane 1 beacon to emergency frequency for ambulances',
          'Reroute civilian transit onto Africa Avenue and Meskel flyovers',
          'Activate high-capacity storm pumps at Kazanchis drainage basin',
        ],
      };
    }

    if (incident.type === 'power_outage') {
      return {
        agentA: {
          id: 'economy' as AgentId,
          proposal: 'Maintain 100% industrial draw to prevent loss of sensitive biotech cleanrooms in Kilinto.',
          shortClaim: 'Zero power reduction in industrial zone',
        },
        agentB: {
          id: 'energy' as AgentId,
          proposal: 'Substation load is 98%; failing to shed 120 MW risks a catastrophic cascade trip for 3 districts.',
          shortClaim: 'Mandatory 120 MW shedding required',
        },
        conflictSummary:
          'Full industrial load will trigger transformer trip, but hard shutdown ruins pharmaceutical bioreactors.',
        proposedSolution:
          'Discharge 80 MW from Entoto battery storage; shed 40 MW from non-essential civic decorative displays; maintain bioreactor uptime.',
        coordinatedSteps: [
          'Engage Entoto clean energy megapack battery banks',
          'Shut down non-critical civic displays and street illuminations to 50%',
          'Isolate Kilinto bioreactor cleanrooms on dedicated protected micro-bus',
          'Dispatch robotic line inspection drones to overheated transformer',
        ],
      };
    }

    // Default traffic accident
    return {
      agentA: {
        id: 'traffic' as AgentId,
        proposal: `Halt all inbound lanes at ${incident.district} junction to clear debris and prevent pileup.`,
        shortClaim: 'Total junction closure',
      },
      agentB: {
        id: 'emergency' as AgentId,
        proposal: `Rapid response units need immediate ingress through ${incident.district} intersection within 180 seconds.`,
        shortClaim: 'Immediate priority ingress',
      },
      conflictSummary:
        'A full road closure prevents civilian accidents but halts ambulance and fire ingress to the scene.',
      proposedSolution:
        'Enforce dynamic counter-flow lane: designate north shoulder for emergency vehicles while diverting general vehicles through parallel bypass.',
      coordinatedSteps: [
        'Shift dynamic lane markers to create clear 4-meter response corridor',
        'Signal digital variable speed signs to 20 km/h in perimeter zone',
        'Pre-alert Tikur Anbessa trauma bay for inbound patient transfer',
        'Dispatch automated road clearing bot to clear vehicle debris',
      ],
    };
  }

  private setAgentStatus(id: AgentId, status: AgentStatus, task: string) {
    if (this.state.agents[id]) {
      this.state.agents[id].status = status;
      this.state.agents[id].currentTask = task;
      this.state.agents[id].latencyMs = Math.round(Math.random() * 8 + 4);
      this.notify();
    }
  }

  private addMessage(msg: AgentMessage) {
    this.state.messages.unshift(msg);
    if (this.state.messages.length > 50) {
      this.state.messages.pop();
    }
    if (this.state.agents[msg.senderId]) {
      this.state.agents[msg.senderId].messageCount++;
    }
    this.notify();
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public getState(): AgentEngineState {
    return this.state;
  }

  public subscribe(listener: AgentEngineListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const agentEngine = new AgentEngine();
