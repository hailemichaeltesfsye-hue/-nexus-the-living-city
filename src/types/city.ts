/**
 * NEXUS: THE LIVING CITY
 * Autonomous AI Digital Twin for Ethiopia
 * Core Domain Types and Interfaces
 */

export type DistrictId =
  | 'bole'
  | 'kazanchis'
  | 'piassa'
  | 'arat_kilo'
  | 'entoto'
  | 'gotera'
  | 'kilinto'
  | 'meskel';

export interface DistrictData {
  id: DistrictId;
  name: string;
  amharicName: string;
  centerCoord: [number, number]; // [x, z] in 3D world
  population: number;
  powerDemandMW: number;
  waterDemandMLD: number;
  trafficLevel: number; // 0 - 100
  healthRisk: number; // 0 - 100
  description: string;
  keyInfrastructure: string[];
}

export type AgentId =
  | 'supervisor'
  | 'traffic'
  | 'energy'
  | 'water'
  | 'emergency'
  | 'health'
  | 'environment'
  | 'transit'
  | 'economy'
  | 'planner'
  | 'critic';

export type AgentStatus =
  | 'IDLE'
  | 'OBSERVING'
  | 'ANALYZING'
  | 'COLLABORATING'
  | 'WAITING'
  | 'REVIEWING'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED';

export interface AgentInfo {
  id: AgentId;
  name: string;
  amharicName: string;
  role: string;
  avatarIcon: string;
  status: AgentStatus;
  confidence: number; // 0 - 100
  qualityScore: number; // 0 - 100
  latencyMs: number;
  currentTask: string;
  currentRecommendation: string;
  targetDistrict?: DistrictId | 'all';
  activeConnections: AgentId[];
  messageCount: number;
  accentColor: string;
}

export interface AgentMessage {
  id: string;
  senderId: AgentId;
  targetId: AgentId | 'broadcast';
  timestamp: string;
  content: string;
  type: 'OBSERVATION' | 'ALERT' | 'PROPOSAL' | 'QUERY' | 'CONSENSUS' | 'DIRECTIVE';
  district?: DistrictId;
}

export interface CriticEvaluation {
  id: string;
  recommendationId: string;
  agentId: AgentId;
  score: number; // 0 - 100
  criteria: {
    effectiveness: number;
    safety: number;
    resourceUsage: number;
    responseTime: number;
    impactOnOtherSystems: number;
    confidence: number;
  };
  feedback: string;
  approved: boolean;
  attemptNumber: number;
  maxAttempts: number;
  timestamp: string;
}

export interface SupervisorResolution {
  id: string;
  incidentId: string;
  timestamp: string;
  title: string;
  conflictingAgents: {
    agentId: AgentId;
    agentName: string;
    recommendation: string;
  }[];
  supervisorReasoning: string;
  coordinatedStrategy: string;
  criticScore: number;
  criticAttempt: number;
  status: 'ANALYZING' | 'EVALUATING' | 'APPROVED' | 'APPLIED' | 'RETRYING';
  steps: string[];
}

export type IncidentType =
  | 'heavy_rain'
  | 'traffic_accident'
  | 'power_outage'
  | 'water_shortage'
  | 'hospital_emergency'
  | 'transit_failure'
  | 'pollution_spike'
  | 'road_closure'
  | 'large_public_event'
  | 'infrastructure_failure';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  amharicTitle: string;
  district: DistrictId;
  worldPosition: [number, number, number];
  timestamp: string;
  description: string;
  resolved: boolean;
  assignedAgents: AgentId[];
  responseProgress: number; // 0 - 100
  activeStrategyTitle?: string;
  impactMetrics: {
    trafficCongestionDelta: number;
    powerRiskDelta: number;
    emergencyDelaySec: number;
  };
}

export interface CityMetrics {
  trafficDensity: number; // 0 - 100%
  averageSpeedKmh: number;
  energyDemandMW: number;
  energyCapacityPct: number; // 0 - 100%
  waterDemandMLD: number;
  waterCapacityPct: number;
  hospitalBedOccupancyPct: number;
  availableIcuBeds: number;
  activeEmergencyUnits: number;
  activeIncidentsCount: number;
  airQualityAQI: number;
  transitLoadPct: number;
  economicVelocityIndex: number; // 0 - 100
  weatherCondition: 'CLEAR' | 'OVERCAST' | 'RAIN' | 'STORMY' | 'NIGHT_CLEAR';
  rainfallIntensityMm: number;
  simTime: string; // HH:MM:SS
  simDate: string;
  timeOfDayHour: number; // 0 - 24
  // Real-Time Addis Ababa Integration Fields
  temperatureC?: number;
  humidityPct?: number;
  isRealtimeConnected?: boolean;
  addisLocalTime?: string;
  satelliteTelemetry?: {
    satelliteName: string;
    altitudeKm: number;
    velocityKmh: number;
    distanceFromAddisKm: number;
    isLineOfSight: boolean;
    passStatus: string;
  };
}

export interface BuildingInfo {
  id: string;
  name: string;
  amharicName: string;
  district: DistrictId;
  type:
    | 'commercial'
    | 'residential'
    | 'hospital'
    | 'power'
    | 'water'
    | 'emergency'
    | 'transit'
    | 'tech'
    | 'civic'
    | 'monument';
  position: [number, number, number];
  height: number;
  occupancyOrLoadPct: number;
  status: 'STABLE' | 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
  metrics: {
    capacity?: string;
    energyUsageMW?: number;
    waterLitersDay?: number;
    specialUnits?: string;
    primaryRole?: string;
  };
  alerts?: string[];
}

export interface CityMemoryEntry {
  id: string;
  timestamp: string;
  eventTitle: string;
  district: string;
  incidentType: IncidentType;
  outcome: 'RESOLVED_OPTIMAL' | 'RESOLVED_MITIGATED' | 'ESCALATED' | 'REVERTED';
  criticScore: number;
  supervisorAction: string;
  resolutionTimeMinutes: number;
  economicImpactBirr: string;
  systemTakeaway: string;
  agentsInvolved: AgentId[];
}

export interface ScenarioParameters {
  populationChangePct: number; // e.g. +30%
  trafficIncreasePct: number; // e.g. +50%
  rainDurationHours: number; // e.g. 3 hours
  powerOutageHours: number; // e.g. 6 hours
  waterShortagePct: number;
  transitAdoptionPct: number;
}

export interface ScenarioResult {
  scenarioName: string;
  description: string;
  before: CityMetrics;
  after: CityMetrics;
  resilienceScore: number; // 0 - 100
  resilienceBreakdown: {
    mobility: number;
    energySecurity: number;
    waterContinuity: number;
    emergencyReadiness: number;
    environmentalHealth: number;
    economicVitality: number;
  };
  agentForecastingNotes: {
    agentId: AgentId;
    agentName: string;
    forecast: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    suggestedMitigation: string;
  }[];
  criticalBottlenecks: string[];
}

export type ViewTab =
  | 'overview'
  | 'twin3d'
  | 'agents'
  | 'incidents'
  | 'scenarios'
  | 'infrastructure'
  | 'analytics'
  | 'memory';

export type LayerFilter =
  | 'all'
  | 'traffic'
  | 'energy'
  | 'water'
  | 'emergency'
  | 'transit'
  | 'heatmap';
