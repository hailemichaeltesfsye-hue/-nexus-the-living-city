/**
 * NEXUS: THE LIVING CITY
 * Simulation Engine - Core Time, State Dynamics, Incidents & Metric Evolution
 */

import {
  CityMetrics,
  Incident,
  IncidentType,
  DistrictId,
  CityMemoryEntry,
} from '../types/city';
import { realtimeAddisService, RealtimeAddisState } from '../services/realtimeAddisService';

export interface SimulationState {
  metrics: CityMetrics;
  activeIncidents: Incident[];
  history: {
    timestamp: string;
    trafficDensity: number;
    energyDemandMW: number;
    waterDemandMLD: number;
    airQualityAQI: number;
    hospitalBedOccupancyPct: number;
    economicVelocityIndex: number;
  }[];
  memory: CityMemoryEntry[];
  speed: number; // 0 = pause, 1, 2, 5, 10
  isRunning: boolean;
}

export type SimulationListener = (state: SimulationState) => void;

class CityEngine {
  private state: SimulationState;
  private listeners: Set<SimulationListener> = new Set();
  private intervalTimer: number | null = null;
  private simSecondsElapsed: number = 0;

  constructor() {
    this.state = {
      metrics: {
        trafficDensity: 58,
        averageSpeedKmh: 42,
        energyDemandMW: 1840,
        energyCapacityPct: 76,
        waterDemandMLD: 410,
        waterCapacityPct: 82,
        hospitalBedOccupancyPct: 74,
        availableIcuBeds: 54,
        activeEmergencyUnits: 36,
        activeIncidentsCount: 0,
        airQualityAQI: 42,
        transitLoadPct: 68,
        economicVelocityIndex: 88,
        weatherCondition: 'CLEAR',
        rainfallIntensityMm: 0,
        simTime: '17:42:00',
        simDate: '2026-10-20',
        timeOfDayHour: 17.7,
      },
      activeIncidents: [],
      history: [],
      memory: this.getInitialMemory(),
      speed: 1,
      isRunning: true,
    };

    // Pre-populate initial 12 history ticks
    this.seedHistory();
    this.startLoop();

    // Connect to Live Addis Ababa Real-Time APIs (Weather, Air Quality, Satellite, Traffic)
    realtimeAddisService.subscribe((rt) => {
      this.applyRealtimeData(rt);
    });
  }

  private applyRealtimeData(rt: RealtimeAddisState) {
    if (!rt) return;
    const m = this.state.metrics;
    m.isRealtimeConnected = rt.isConnected;
    m.addisLocalTime = rt.addisLocalTime;
    m.temperatureC = rt.weather.temperatureC;
    m.humidityPct = rt.weather.humidityPct;
    m.rainfallIntensityMm = rt.weather.rainMm;
    m.weatherCondition = rt.weather.weatherCondition;
    m.airQualityAQI = rt.airQuality.aqi;

    // Smoothly blend real-time traffic density & speed unless an active incident overrides
    if (this.state.activeIncidents.length === 0) {
      m.trafficDensity = Math.round(m.trafficDensity * 0.25 + rt.traffic.overallDensityPct * 0.75);
      m.averageSpeedKmh = Math.round(m.averageSpeedKmh * 0.25 + rt.traffic.averageSpeedKmh * 0.75);
    }

    m.satelliteTelemetry = {
      satelliteName: rt.satellite.satelliteName,
      altitudeKm: rt.satellite.altitudeKm,
      velocityKmh: rt.satellite.velocityKmh,
      distanceFromAddisKm: rt.satellite.distanceFromAddisKm,
      isLineOfSight: rt.satellite.isLineOfSight,
      passStatus: rt.satellite.orbitalPassStatus,
    };

    this.notify();
  }

  private seedHistory() {
    const base = { ...this.state.metrics };
    const now = new Date(2026, 9, 20, 17, 30, 0);

    for (let i = 12; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60000);
      const timeStr = t.toTimeString().split(' ')[0];
      const jitter = (Math.sin(i * 0.8) * 4);

      this.state.history.push({
        timestamp: timeStr,
        trafficDensity: Math.round(Math.max(20, Math.min(95, base.trafficDensity + jitter))),
        energyDemandMW: Math.round(base.energyDemandMW + jitter * 12),
        waterDemandMLD: Math.round(base.waterDemandMLD + jitter * 2),
        airQualityAQI: Math.round(Math.max(15, base.airQualityAQI + jitter)),
        hospitalBedOccupancyPct: Math.round(base.hospitalBedOccupancyPct + jitter * 0.5),
        economicVelocityIndex: Math.round(base.economicVelocityIndex + jitter * 0.8),
      });
    }
  }

  private getInitialMemory(): CityMemoryEntry[] {
    return [
      {
        id: 'mem_1',
        timestamp: '15:18:22',
        eventTitle: 'Gotera Quad-Flyover Micro-Collision',
        district: 'Gotera',
        incidentType: 'traffic_accident',
        outcome: 'RESOLVED_OPTIMAL',
        criticScore: 92,
        supervisorAction: 'Dynamic lane redirection via autonomous matrix signs and drone triage.',
        resolutionTimeMinutes: 4.2,
        economicImpactBirr: '24,000 ETB saved in transit idle delay',
        systemTakeaway: 'Autonomous rerouting through Arat Kilo connector prevented secondary bottleneck.',
        agentsInvolved: ['traffic', 'emergency', 'transit'],
      },
      {
        id: 'mem_2',
        timestamp: '11:45:00',
        eventTitle: 'Kilinto Biotech Grid Frequency Fluctuation',
        district: 'Kilinto',
        incidentType: 'power_outage',
        outcome: 'RESOLVED_OPTIMAL',
        criticScore: 89,
        supervisorAction: 'Engaged Entoto Clean Battery megapack for sub-second peak shaving.',
        resolutionTimeMinutes: 1.8,
        economicImpactBirr: '180,000 ETB pharmaceutical batch protected',
        systemTakeaway: 'Decentralized battery reserve prevented cleanroom shutdown.',
        agentsInvolved: ['energy', 'economy'],
      },
      {
        id: 'mem_3',
        timestamp: '08:20:14',
        eventTitle: 'Legedadi Primary Conduit Pressure Drop',
        district: 'Bole',
        incidentType: 'water_shortage',
        outcome: 'RESOLVED_MITIGATED',
        criticScore: 84,
        supervisorAction: 'Automated valve closure and western supply redirection from Gefersa.',
        resolutionTimeMinutes: 8.5,
        economicImpactBirr: '65,000 ETB water loss mitigated',
        systemTakeaway: 'Acoustic pipe sensors triggered isolation before surface rupture occurred.',
        agentsInvolved: ['water', 'environment'],
      },
    ];
  }

  private startLoop() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    this.intervalTimer = window.setInterval(() => {
      this.tick();
    }, 1000);
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    this.state.isRunning = speed > 0;
    this.notify();
  }

  public togglePlayPause() {
    if (this.state.isRunning) {
      this.state.isRunning = false;
      this.state.speed = 0;
    } else {
      this.state.isRunning = true;
      this.state.speed = 1;
    }
    this.notify();
  }

  public stepForward() {
    this.advanceSim(10);
    this.notify();
  }

  private tick() {
    if (!this.state.isRunning || this.state.speed === 0) return;
    const simStepSeconds = this.state.speed * 2;
    this.advanceSim(simStepSeconds);
  }

  private advanceSim(secondsToAdd: number) {
    this.simSecondsElapsed += secondsToAdd;

    // Parse current sim time
    const [h, m, s] = this.state.metrics.simTime.split(':').map(Number);
    let totalSec = h * 3600 + m * 60 + s + secondsToAdd;
    if (totalSec >= 86400) totalSec %= 86400;

    const newH = Math.floor(totalSec / 3600);
    const newM = Math.floor((totalSec % 3600) / 60);
    const newS = Math.floor(totalSec % 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    this.state.metrics.simTime = `${pad(newH)}:${pad(newM)}:${pad(newS)}`;
    this.state.metrics.timeOfDayHour = newH + newM / 60;

    // Organic drift based on time of day
    this.updateBaseMetricsWithTimeOfDay(newH, newM);

    // Evolve active incidents
    this.evolveIncidents(secondsToAdd);

    // Save history snapshot every 15 simulated seconds
    if (this.simSecondsElapsed % 15 < secondsToAdd) {
      this.snapshotHistory();
    }

    this.notify();
  }

  private updateBaseMetricsWithTimeOfDay(hour: number, _min: number) {
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const m = this.state.metrics;

    // Incident drag factors
    let incidentTrafficDrag = 0;
    let incidentPowerDrag = 0;
    let incidentHospitalDrag = 0;
    let incidentAQIDrag = 0;

    for (const inc of this.state.activeIncidents) {
      if (!inc.resolved) {
        incidentTrafficDrag += inc.impactMetrics.trafficCongestionDelta;
        incidentPowerDrag += inc.impactMetrics.powerRiskDelta;
        if (inc.type === 'hospital_emergency') incidentHospitalDrag += 15;
        if (inc.type === 'pollution_spike') incidentAQIDrag += 45;
        if (inc.type === 'heavy_rain') {
          incidentTrafficDrag += 24;
          incidentAQIDrag -= 15; // Rain clears smog
        }
      }
    }

    // Traffic baseline
    let targetTraffic = isRushHour ? 72 : 45;
    targetTraffic += incidentTrafficDrag;
    m.trafficDensity = Math.round(Math.max(10, Math.min(98, m.trafficDensity * 0.96 + targetTraffic * 0.04)));
    m.averageSpeedKmh = Math.max(12, Math.round(65 - (m.trafficDensity * 0.55)));

    // Energy baseline
    const targetEnergy = 1750 + Math.sin((hour - 6) / 24 * Math.PI * 2) * 220 + incidentPowerDrag * 10;
    m.energyDemandMW = Math.round(m.energyDemandMW * 0.95 + targetEnergy * 0.05);
    m.energyCapacityPct = Math.round(Math.min(99, (m.energyDemandMW / 2400) * 100));

    // Water baseline
    const targetWater = 410 + Math.cos((hour - 8) / 24 * Math.PI * 2) * 40;
    m.waterDemandMLD = Math.round(m.waterDemandMLD * 0.95 + targetWater * 0.05);

    // Hospital capacity
    const targetHospital = 70 + incidentHospitalDrag;
    m.hospitalBedOccupancyPct = Math.round(Math.max(40, Math.min(99, m.hospitalBedOccupancyPct * 0.97 + targetHospital * 0.03)));
    m.availableIcuBeds = Math.max(4, Math.round(60 * (1 - m.hospitalBedOccupancyPct / 100) + (Math.random() * 2 - 1)));

    // Air Quality
    const targetAQI = Math.max(18, Math.min(180, (m.trafficDensity * 0.6) + 15 + incidentAQIDrag));
    m.airQualityAQI = Math.round(m.airQualityAQI * 0.95 + targetAQI * 0.05);

    // Economic velocity
    const targetEcon = Math.max(30, 95 - (incidentTrafficDrag * 0.4) - (m.trafficDensity > 80 ? 15 : 0));
    m.economicVelocityIndex = Math.round(m.economicVelocityIndex * 0.95 + targetEcon * 0.05);

    m.activeIncidentsCount = this.state.activeIncidents.filter((i) => !i.resolved).length;
  }

  private evolveIncidents(secondsToAdd: number) {
    const updatedIncidents: Incident[] = [];

    for (const inc of this.state.activeIncidents) {
      if (inc.resolved) {
        // Keep resolved incidents briefly, then remove
        continue;
      }

      // Incidents progress toward resolution as supervisor & agents work
      const progressRate = (secondsToAdd / 18) * (inc.assignedAgents.length > 0 ? 1.5 : 0.8);
      inc.responseProgress = Math.min(100, inc.responseProgress + progressRate);

      if (inc.responseProgress >= 100) {
        inc.resolved = true;
        // Record into memory
        this.recordResolvedIncident(inc);
      } else {
        updatedIncidents.push(inc);
      }
    }

    this.state.activeIncidents = updatedIncidents;
  }

  private recordResolvedIncident(inc: Incident) {
    const memoryEntry: CityMemoryEntry = {
      id: 'mem_' + Date.now(),
      timestamp: this.state.metrics.simTime,
      eventTitle: inc.title,
      district: inc.district.toUpperCase(),
      incidentType: inc.type,
      outcome: 'RESOLVED_OPTIMAL',
      criticScore: 91,
      supervisorAction: inc.activeStrategyTitle || 'Supervisor synchronized multi-agency response.',
      resolutionTimeMinutes: parseFloat((Math.random() * 4 + 3).toFixed(1)),
      economicImpactBirr: `${(Math.random() * 40 + 20).toFixed(0)},000 ETB saved`,
      systemTakeaway: `Coordinated resolution executed smoothly across ${inc.assignedAgents.join(', ')}.`,
      agentsInvolved: inc.assignedAgents,
    };

    this.state.memory.unshift(memoryEntry);
    if (this.state.memory.length > 25) {
      this.state.memory.pop();
    }
  }

  private snapshotHistory() {
    this.state.history.push({
      timestamp: this.state.metrics.simTime,
      trafficDensity: this.state.metrics.trafficDensity,
      energyDemandMW: this.state.metrics.energyDemandMW,
      waterDemandMLD: this.state.metrics.waterDemandMLD,
      airQualityAQI: this.state.metrics.airQualityAQI,
      hospitalBedOccupancyPct: this.state.metrics.hospitalBedOccupancyPct,
      economicVelocityIndex: this.state.metrics.economicVelocityIndex,
    });

    if (this.state.history.length > 24) {
      this.state.history.shift();
    }
  }

  public triggerIncident(type: IncidentType, customDistrict?: DistrictId): Incident {
    const id = 'inc_' + Date.now();
    let title = 'General Incident';
    let amharicTitle = 'አጠቃላይ ክስተት';
    let district: DistrictId = customDistrict || 'gotera';
    let severity: Incident['severity'] = 'MEDIUM';
    let pos: [number, number, number] = [-18, 0.5, 30]; // Gotera
    let desc = 'System anomaly detected by autonomous sensor lattice.';
    let impact = {
      trafficCongestionDelta: 15,
      powerRiskDelta: 5,
      emergencyDelaySec: 45,
    };

    switch (type) {
      case 'heavy_rain':
        title = 'Flash Torrential Rain over Central Axis';
        amharicTitle = 'ኃይለኛ ዝናብና የጎርፍ ስጋት';
        district = 'kazanchis';
        pos = [12, 0.5, -4];
        severity = 'HIGH';
        desc = 'Entoto mountain runoff funneling into central underpasses. Rapid water accumulation on arterial roads.';
        impact = { trafficCongestionDelta: 28, powerRiskDelta: 12, emergencyDelaySec: 120 };
        this.state.metrics.weatherCondition = 'RAIN';
        this.state.metrics.rainfallIntensityMm = 48;
        break;

      case 'traffic_accident':
        title = 'Bole High-Speed Transit Pod Collision';
        amharicTitle = 'ቦሌ የመንገድ ግጭት';
        district = 'bole';
        pos = [26, 0.5, 24];
        severity = 'HIGH';
        desc = 'Multi-vehicle collision blocking two primary lanes on Bole Avenue. Civilian detour initiated.';
        impact = { trafficCongestionDelta: 32, powerRiskDelta: 0, emergencyDelaySec: 90 };
        break;

      case 'power_outage':
        title = 'Kilinto Industrial Transformer Overheat';
        amharicTitle = 'ኪሊንጦ የትራንስፎርመር መቋረጥ';
        district = 'kilinto';
        pos = [-38, 0.5, 12];
        severity = 'CRITICAL';
        desc = 'High-draw pharmaceutical cleanrooms experiencing line drop. Substation Alpha shifting to microgrid.';
        impact = { trafficCongestionDelta: 5, powerRiskDelta: 45, emergencyDelaySec: 20 };
        break;

      case 'water_shortage':
        title = 'Legedadi Main Conduit Pressure Anomaly';
        amharicTitle = 'የለገዳዲ ቱቦ ግፊት መቀነስ';
        district = 'bole';
        pos = [34, 0.5, 12];
        severity = 'MEDIUM';
        desc = 'Acoustic pipe sensors detect sub-surface flow restriction. Downstream pressure dipping by 22%.';
        impact = { trafficCongestionDelta: 0, powerRiskDelta: 8, emergencyDelaySec: 0 };
        break;

      case 'hospital_emergency':
        title = 'Mass Casualty Drill & Surge at Tikur Anbessa';
        amharicTitle = 'ጥቁር አንበሳ ድንገተኛ የህክምና ጥሪ';
        district = 'arat_kilo';
        pos = [-10, 0.5, -22];
        severity = 'HIGH';
        desc = 'Emergency intake requesting priority greenwave clearance for 6 incoming ambulance units.';
        impact = { trafficCongestionDelta: 12, powerRiskDelta: 4, emergencyDelaySec: 180 };
        break;

      case 'transit_failure':
        title = 'Meskel-Bole Maglev Power Rail Desync';
        amharicTitle = 'የባቡር መስመር የኃይል መቆራረጥ';
        district = 'meskel';
        pos = [2, 0.5, 8];
        severity = 'MEDIUM';
        desc = 'Automated braking engaged on Train Unit 04. 1,400 passengers shifting to autonomous BRT feeder buses.';
        impact = { trafficCongestionDelta: 20, powerRiskDelta: 15, emergencyDelaySec: 30 };
        break;

      case 'pollution_spike':
        title = 'Gotera Basin Thermal Inversion Smog Spike';
        amharicTitle = 'ጎተራ የጭስና አየር ብክለት ጭማሪ';
        district = 'gotera';
        pos = [-18, 0.5, 30];
        severity = 'MEDIUM';
        desc = 'Particulate sensors indicate AQI 162 in low-lying industrial freight depot. Mist scrubbers needed.';
        impact = { trafficCongestionDelta: 0, powerRiskDelta: 5, emergencyDelaySec: 0 };
        break;

      case 'road_closure':
        title = 'Piassa Heritage Quarter Autonomous Paving';
        amharicTitle = 'ፒያሳ የመንገድ ጥገና መዘጋት';
        district = 'piassa';
        pos = [-24, 0.5, -20];
        severity = 'LOW';
        desc = 'Robotic road repaving machines occupying north lane. Diverting freight pods.';
        impact = { trafficCongestionDelta: 14, powerRiskDelta: 0, emergencyDelaySec: 25 };
        break;

      case 'large_public_event':
        title = 'Meskel Square Pan-African Digital Summit';
        amharicTitle = 'መስቀል አደባባይ ዓለም አቀፍ ጉባኤ';
        district = 'meskel';
        pos = [2, 0.5, 8];
        severity = 'MEDIUM';
        desc = '65,000 attendees gathering in central amphitheater. Network telemetry and crowd pedestrian pacing active.';
        impact = { trafficCongestionDelta: 25, powerRiskDelta: 18, emergencyDelaySec: 60 };
        break;

      case 'infrastructure_failure':
        title = 'Entoto Watershed Hydro-Gate Relay Trip';
        amharicTitle = 'የእንጦጦ የውሃ መቆጣጠሪያ ብልሽት';
        district = 'entoto';
        pos = [-2, 0.5, -48];
        severity = 'HIGH';
        desc = 'Remote telemetry lost on spillway valve 3. Maintenance drone swarm dispatched.';
        impact = { trafficCongestionDelta: 0, powerRiskDelta: 10, emergencyDelaySec: 40 };
        break;
    }

    const incident: Incident = {
      id,
      type,
      severity,
      title,
      amharicTitle,
      district,
      worldPosition: pos,
      timestamp: this.state.metrics.simTime,
      description: desc,
      resolved: false,
      assignedAgents: [],
      responseProgress: 0,
      impactMetrics: impact,
    };

    this.state.activeIncidents.unshift(incident);
    this.notify();
    return incident;
  }

  public updateIncidentStrategy(incidentId: string, strategyTitle: string, agents: string[]) {
    const inc = this.state.activeIncidents.find((i) => i.id === incidentId);
    if (inc) {
      inc.activeStrategyTitle = strategyTitle;
      inc.assignedAgents = agents as any;
      this.notify();
    }
  }

  public clearWeather() {
    this.state.metrics.weatherCondition = 'CLEAR';
    this.state.metrics.rainfallIntensityMm = 0;
    this.notify();
  }

  public actuateFloodEmergencyCorridor() {
    this.state.metrics.weatherCondition = 'CLEAR';
    this.state.metrics.rainfallIntensityMm = 0;
    this.state.metrics.averageSpeedKmh = Math.max(48, this.state.metrics.averageSpeedKmh + 14);
    this.state.metrics.trafficDensity = Math.max(25, this.state.metrics.trafficDensity - 28);
    this.state.metrics.activeEmergencyUnits = Math.max(45, this.state.metrics.activeEmergencyUnits + 8);
    
    // Resolve any flood or rain incidents
    this.state.activeIncidents = this.state.activeIncidents.filter((inc) => {
      if (inc.type === 'heavy_rain' || inc.district === 'kazanchis') {
        inc.resolved = true;
        this.recordResolvedIncident(inc);
        return false;
      }
      return true;
    });
    this.state.metrics.activeIncidentsCount = this.state.activeIncidents.length;
    this.notify();
  }

  public actuateGoteraGreenWave() {
    this.state.metrics.averageSpeedKmh = Math.min(58, Math.max(50, this.state.metrics.averageSpeedKmh + 16));
    this.state.metrics.trafficDensity = Math.max(22, this.state.metrics.trafficDensity - 30);
    this.state.metrics.economicVelocityIndex = Math.min(99, this.state.metrics.economicVelocityIndex + 10);
    this.notify();
  }

  public actuateTikurAnbessaICU() {
    this.state.metrics.hospitalBedOccupancyPct = 68;
    this.state.metrics.availableIcuBeds = Math.max(28, this.state.metrics.availableIcuBeds + 14);
    this.state.metrics.activeEmergencyUnits = Math.max(40, this.state.metrics.activeEmergencyUnits + 6);
    this.state.activeIncidents = this.state.activeIncidents.filter((inc) => {
      if (inc.type === 'hospital_emergency') {
        inc.resolved = true;
        this.recordResolvedIncident(inc);
        return false;
      }
      return true;
    });
    this.state.metrics.activeIncidentsCount = this.state.activeIncidents.length;
    this.notify();
  }

  public actuateGERDStabilization() {
    this.state.metrics.energyDemandMW = 1840;
    this.state.metrics.energyCapacityPct = 98;
    this.state.activeIncidents = this.state.activeIncidents.filter((inc) => {
      if (inc.type === 'power_outage') {
        inc.resolved = true;
        this.recordResolvedIncident(inc);
        return false;
      }
      return true;
    });
    this.state.metrics.activeIncidentsCount = this.state.activeIncidents.length;
    this.notify();
  }

  public resolveAllActiveIncidents(strategy: string = 'Multi-Agent Pareto Consensus Dispatched') {
    for (const inc of this.state.activeIncidents) {
      inc.resolved = true;
      inc.activeStrategyTitle = strategy;
      this.recordResolvedIncident(inc);
    }
    this.state.activeIncidents = [];
    this.state.metrics.activeIncidentsCount = 0;
    this.state.metrics.trafficDensity = 38;
    this.state.metrics.averageSpeedKmh = 48;
    this.state.metrics.energyCapacityPct = 95;
    this.clearWeather();
    this.notify();
  }

  public getState(): SimulationState {
    return this.state;
  }

  public subscribe(listener: SimulationListener): () => void {
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

export const cityEngine = new CityEngine();
