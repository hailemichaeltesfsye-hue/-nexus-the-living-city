/**
 * NEXUS: THE LIVING CITY
 * Scenario Engine & Future Simulator
 */

import { CityMetrics, ScenarioResult, AgentId } from '../types/city';
import { cityEngine } from './cityEngine';

export interface PrebuiltScenario {
  id: string;
  title: string;
  amharicTitle: string;
  promptQuestion: string;
  description: string;
  populationDeltaPct: number;
  trafficDeltaPct: number;
  energyDeltaPct: number;
  waterDeltaPct: number;
  rainMmPerHour: number;
  transitAdoptionDeltaPct: number;
}

export const PREBUILT_SCENARIOS: PrebuiltScenario[] = [
  {
    id: 'scen_rain_rush',
    title: 'Torrential Rain During Rush Hour',
    amharicTitle: 'ኃይለኛ ዝናብ በስራ መውጫ ሰዓት',
    promptQuestion: 'What happens if heavy rain affects the city for 3 hours?',
    description: '45mm/hr precipitation over Entoto ridge and central basins during 18:00 peak commute.',
    populationDeltaPct: 0,
    trafficDeltaPct: 35,
    energyDeltaPct: 15,
    waterDeltaPct: 25,
    rainMmPerHour: 45,
    transitAdoptionDeltaPct: -10,
  },
  {
    id: 'scen_population_surge',
    title: '30% Metropolitan Population Expansion',
    amharicTitle: 'የ30% የህዝብ ቁጥር ጭማሪ',
    promptQuestion: "What happens if the city's population increases by 30%?",
    description: 'Rapid urban migration with 750,000 new residents settling in Bole and Kilinto sectors.',
    populationDeltaPct: 30,
    trafficDeltaPct: 28,
    energyDeltaPct: 32,
    waterDeltaPct: 34,
    rainMmPerHour: 0,
    transitAdoptionDeltaPct: 15,
  },
  {
    id: 'scen_power_outage',
    title: 'Major Substation Outage (6 Hours)',
    amharicTitle: 'የ6 ሰዓት የኃይል ማከፋፈያ መቋረጥ',
    promptQuestion: 'What happens if the main power station fails for 6 hours?',
    description: 'GERD feeder line maintenance drop with 40% generation loss during midday peak.',
    populationDeltaPct: 0,
    trafficDeltaPct: 15,
    energyDeltaPct: -40,
    waterDeltaPct: -18,
    rainMmPerHour: 0,
    transitAdoptionDeltaPct: -25,
  },
  {
    id: 'scen_traffic_surge',
    title: '50% Arterial Traffic Increase',
    amharicTitle: 'የ50% የመኪና ትራፊክ ጭማሪ',
    promptQuestion: 'What happens if traffic increases by 50%?',
    description: 'Major regional logistics convoy and private vehicle surge across Gotera and Kazanchis arteries.',
    populationDeltaPct: 5,
    trafficDeltaPct: 50,
    energyDeltaPct: 8,
    waterDeltaPct: 0,
    rainMmPerHour: 0,
    transitAdoptionDeltaPct: -5,
  },
];

export function runFutureSimulation(
  scenarioName: string,
  desc: string,
  popDeltaPct: number,
  trafficDeltaPct: number,
  energyDeltaPct: number,
  waterDeltaPct: number,
  rainMm: number,
  transitDeltaPct: number
): ScenarioResult {
  const currentMetrics = { ...cityEngine.getState().metrics };

  // Calculate projected after state
  const projectedTraffic = Math.min(
    98,
    Math.max(15, currentMetrics.trafficDensity + trafficDeltaPct * 0.7 + (rainMm > 20 ? 18 : 0))
  );

  const projectedSpeed = Math.max(12, Math.round(65 - projectedTraffic * 0.52));

  const projectedEnergy = Math.max(
    900,
    Math.round(currentMetrics.energyDemandMW * (1 + energyDeltaPct / 100))
  );
  const projectedEnergyCap = Math.min(100, Math.round((projectedEnergy / 2400) * 100));

  const projectedWater = Math.max(
    250,
    Math.round(currentMetrics.waterDemandMLD * (1 + waterDeltaPct / 100))
  );
  const projectedWaterCap = Math.min(100, Math.round((projectedWater / 550) * 100));

  const projectedHospitalBed = Math.min(
    99,
    Math.max(
      45,
      currentMetrics.hospitalBedOccupancyPct +
        (popDeltaPct * 0.4) +
        (trafficDeltaPct > 30 ? 12 : 0) +
        (rainMm > 30 ? 8 : 0)
    )
  );

  const projectedAQI = Math.min(
    240,
    Math.max(
      15,
      currentMetrics.airQualityAQI +
        (trafficDeltaPct * 0.8) -
        (rainMm > 10 ? rainMm * 0.5 : 0)
    )
  );

  const projectedTransit = Math.min(
    100,
    Math.max(30, currentMetrics.transitLoadPct + transitDeltaPct)
  );

  const projectedEcon = Math.min(
    100,
    Math.max(
      25,
      currentMetrics.economicVelocityIndex +
        (popDeltaPct * 0.3) -
        (projectedTraffic > 85 ? 18 : 0) -
        (energyDeltaPct < -20 ? 30 : 0)
    )
  );

  const afterMetrics: CityMetrics = {
    ...currentMetrics,
    trafficDensity: Math.round(projectedTraffic),
    averageSpeedKmh: projectedSpeed,
    energyDemandMW: projectedEnergy,
    energyCapacityPct: projectedEnergyCap,
    waterDemandMLD: projectedWater,
    waterCapacityPct: projectedWaterCap,
    hospitalBedOccupancyPct: Math.round(projectedHospitalBed),
    availableIcuBeds: Math.max(2, Math.round(60 * (1 - projectedHospitalBed / 100))),
    airQualityAQI: Math.round(projectedAQI),
    transitLoadPct: Math.round(projectedTransit),
    economicVelocityIndex: Math.round(projectedEcon),
    weatherCondition: rainMm > 20 ? 'RAIN' : currentMetrics.weatherCondition,
    rainfallIntensityMm: rainMm,
  };

  // Compute Resilience Scores (0 - 100)
  const mobilityScore = Math.max(10, Math.min(100, Math.round(100 - projectedTraffic * 0.8)));
  const energyScore = Math.max(10, Math.min(100, Math.round(100 - (projectedEnergyCap > 85 ? (projectedEnergyCap - 85) * 4 : 0))));
  const waterScore = Math.max(10, Math.min(100, Math.round(100 - (projectedWaterCap > 80 ? (projectedWaterCap - 80) * 3 : 0))));
  const emergencyScore = Math.max(10, Math.min(100, Math.round(100 - (projectedHospitalBed > 80 ? (projectedHospitalBed - 80) * 3.5 : 0))));
  const envScore = Math.max(10, Math.min(100, Math.round(100 - projectedAQI * 0.4)));
  const econScore = Math.round(projectedEcon);

  const overallResilience = Math.round(
    mobilityScore * 0.2 +
      energyScore * 0.2 +
      waterScore * 0.15 +
      emergencyScore * 0.15 +
      envScore * 0.15 +
      econScore * 0.15
  );

  // Agent forecast notes
  const agentNotes: ScenarioResult['agentForecastingNotes'] = [
    {
      agentId: 'traffic' as AgentId,
      agentName: 'Traffic Agent',
      forecast:
        projectedTraffic > 80
          ? `Severe gridlock projected across Gotera interchange; average speed drops to ${projectedSpeed} km/h.`
          : `Traffic flow remains within manageable bounds at ${projectedTraffic}% density.`,
      riskLevel: projectedTraffic > 80 ? 'CRITICAL' : projectedTraffic > 65 ? 'MEDIUM' : 'LOW',
      suggestedMitigation: 'Shift 35% of freight transit to night window (23:00 - 05:00) and unlock automated busway lanes.',
    },
    {
      agentId: 'energy' as AgentId,
      agentName: 'Energy Agent',
      forecast:
        projectedEnergyCap > 90
          ? `Substation Alpha near thermal limits (${projectedEnergy} MW, ${projectedEnergyCap}% cap). Peak brownout risk.`
          : `Grid operates with comfortable headroom. Entoto battery maintains 650 MWh buffer.`,
      riskLevel: projectedEnergyCap > 90 ? 'HIGH' : 'LOW',
      suggestedMitigation: 'Activate dynamic industrial load shedding on non-essential cement & metal rolling mills in Kilinto.',
    },
    {
      agentId: 'health' as AgentId,
      agentName: 'Health Agent',
      forecast:
        projectedHospitalBed > 85
          ? `Trauma ICU beds strained (${afterMetrics.availableIcuBeds} remaining). Triage overflow expected at Tikur Anbessa.`
          : `Hospital occupancy stable at ${Math.round(projectedHospitalBed)}%.`,
      riskLevel: projectedHospitalBed > 85 ? 'HIGH' : 'LOW',
      suggestedMitigation: 'St. Paul and regional clinics convert elective surgery suites into intermediate care units.',
    },
    {
      agentId: 'water' as AgentId,
      agentName: 'Water Agent',
      forecast:
        projectedWaterCap > 88
          ? `Legedadi extraction rate at 94% ceiling. Pressure drops anticipated in high-elevation Entoto nodes.`
          : `Gefersa and Legedadi reservoirs maintain balanced supply quotas.`,
      riskLevel: projectedWaterCap > 88 ? 'HIGH' : 'LOW',
      suggestedMitigation: 'Engage municipal recycled greywater loops for industrial washing in Kilinto zone.',
    },
    {
      agentId: 'economy' as AgentId,
      agentName: 'Economy Agent',
      forecast:
        projectedEcon < 60
          ? `Logistics latency incurs estimated 4.8M ETB daily friction cost across central business corridors.`
          : `Economic transaction pace robust; supply chain integrity intact.`,
      riskLevel: projectedEcon < 60 ? 'MEDIUM' : 'LOW',
      suggestedMitigation: 'Prioritize automated commercial transit freight corridors along East-West expressways.',
    },
  ];

  // Critical bottlenecks
  const criticalBottlenecks: string[] = [];
  if (projectedTraffic > 80) criticalBottlenecks.push('Gotera 3-Tier Interchange saturation');
  if (projectedEnergyCap > 88) criticalBottlenecks.push('GERD Substation Alpha thermal headroom');
  if (projectedHospitalBed > 85) criticalBottlenecks.push('Tikur Anbessa Level-1 ICU availability');
  if (projectedWaterCap > 88) criticalBottlenecks.push('Legedadi East feeder pipeline volumetric capacity');
  if (rainMm > 25) criticalBottlenecks.push('Kazanchis underpass drainage pump throughput');

  if (criticalBottlenecks.length === 0) {
    criticalBottlenecks.push('All critical infrastructures within safe autonomous operating margins');
  }

  return {
    scenarioName,
    description: desc,
    before: currentMetrics,
    after: afterMetrics,
    resilienceScore: overallResilience,
    resilienceBreakdown: {
      mobility: mobilityScore,
      energySecurity: energyScore,
      waterContinuity: waterScore,
      emergencyReadiness: emergencyScore,
      environmentalHealth: envScore,
      economicVitality: econScore,
    },
    agentForecastingNotes: agentNotes,
    criticalBottlenecks,
  };
}
