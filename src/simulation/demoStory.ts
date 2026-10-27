/**
 * NEXUS: THE LIVING CITY
 * 16-Step Cinematic Showcase Orchestrator
 * "Heavy rain hits Nexus Addis during evening rush hour"
 */

import { cityEngine } from './cityEngine';
import { agentEngine } from './agentEngine';
import { tacticalAudio } from '../audio/tacticalAudio';

export interface DemoStepInfo {
  step: number;
  totalSteps: number;
  phase: string;
  headline: string;
  amharicHeadline: string;
  detail: string;
  activeAgents: string[];
  cameraTarget?: [number, number, number];
  cameraDistance?: number;
}

export type DemoStoryListener = (info: DemoStepInfo | null) => void;

class DemoStoryOrchestrator {
  private isRunning: boolean = false;
  private currentStep: number = 0;
  private timer: number | null = null;
  private listeners: Set<DemoStoryListener> = new Set();
  private abortController: boolean = false;

  public subscribe(listener: DemoStoryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(info: DemoStepInfo | null) {
    for (const l of this.listeners) {
      l(info);
    }
  }

  public isStoryRunning(): boolean {
    return this.isRunning;
  }

  public stop() {
    this.abortController = true;
    this.isRunning = false;
    this.currentStep = 0;
    if (this.timer) clearTimeout(this.timer);
    this.notify(null);
  }

  public async runCinematicDemo(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.abortController = false;

    try {
      // 1. Traffic congestion increases
      tacticalAudio.playAlertPing();
      tacticalAudio.speakTacticalDispatch('Heavy rain front crossing Entoto ridge during evening rush hour.');
      await this.executeStep({
        step: 1,
        totalSteps: 16,
        phase: 'INCIDENT ONSET',
        headline: 'Heavy Rain Front Crosses Entoto Ridge',
        amharicHeadline: 'ኃይለኛ ዝናብ በእንጦጦ ሰንሰለት በኩል ገባ',
        detail: 'Torrential downpour (48mm/hr) begins as 18:00 evening rush hour peaks. Ground runoff accelerates across Kazanchis and Meskel.',
        activeAgents: ['environment'],
        cameraTarget: [-2, 0, -48], // Entoto
        cameraDistance: 65,
      }, 3200);

      if (this.abortController) return;

      // Trigger weather in cityEngine
      const inc = cityEngine.triggerIncident('heavy_rain', 'kazanchis');

      // 2. Several roads become high-risk
      await this.executeStep({
        step: 2,
        totalSteps: 16,
        phase: 'ANOMALY DETECTED',
        headline: 'Sub-surface Runoff & Hydroplane Warning',
        amharicHeadline: 'የመንገዶች ውሃ መቋጠርና አደጋ ስጋት',
        detail: 'Bole-Kazanchis underpasses accumulate 14cm standing water. Arterial vehicle speeds drop from 48 km/h to 19 km/h.',
        activeAgents: ['traffic', 'environment'],
        cameraTarget: [12, 0, -4], // Kazanchis
        cameraDistance: 45,
      }, 3400);

      if (this.abortController) return;

      // 3. Emergency demand increases
      await this.executeStep({
        step: 3,
        totalSteps: 16,
        phase: 'EMS ALERT',
        headline: 'Multiple Rapid EMS Dispatches Logged',
        amharicHeadline: 'አፋጣኝ የአምቡላንስ ጥሪዎች ተመዘገቡ',
        detail: 'Three civilian vehicle stalls at Gotera and Meskel create potential entrapment. 4 rapid ambulances dispatched.',
        activeAgents: ['emergency'],
        cameraTarget: [2, 0, 8], // Meskel
        cameraDistance: 42,
      }, 3400);

      if (this.abortController) return;

      // 4. Hospital capacity changes
      await this.executeStep({
        step: 4,
        totalSteps: 16,
        phase: 'HEALTHCARE TELEMETRY',
        headline: 'Hospital Triage Surge at Tikur Anbessa',
        amharicHeadline: 'ጥቁር አንበሳ ሆስፒታል ድንገተኛ አልጋዎች ተዘጋጁ',
        detail: 'Health Agent calculates incoming trauma admissions. Tikur Anbessa ICU occupancy rises to 82%; St. Paul trauma bays put on high alert.',
        activeAgents: ['health'],
        cameraTarget: [-10, 0, -22], // Tikur Anbessa
        cameraDistance: 38,
      }, 3400);

      if (this.abortController) return;

      // 5. Water systems experience increased load
      await this.executeStep({
        step: 5,
        totalSteps: 16,
        phase: 'INFRASTRUCTURE STRESS',
        headline: 'Storm Drain Retention Surges to 89%',
        amharicHeadline: 'የጎርፍ ማፋሰሻ መስመሮች በከፍተኛ ጫና ውስጥ',
        detail: 'Legedadi and Gefersa watershed bypass conduits open. Automated sluice gates activate to prevent district flooding.',
        activeAgents: ['water'],
        cameraTarget: [34, 0, 12], // Legedadi
        cameraDistance: 45,
      }, 3400);

      if (this.abortController) return;

      // 6. Environment Agent detects changes
      await this.executeStep({
        step: 6,
        totalSteps: 16,
        phase: 'ENVIRONMENTAL ANALYSIS',
        headline: 'Microclimate Sensors Forecast Rain Peak',
        amharicHeadline: 'የአየር ሁኔታ ትንበያ የዝናቡን ጫፍ አመለከተ',
        detail: 'Barometric scan projects rainfall cessation in 42 minutes. Critical mitigation window: next 25 minutes.',
        activeAgents: ['environment', 'supervisor'],
        cameraTarget: [0, 0, 0],
        cameraDistance: 55,
      }, 3200);

      if (this.abortController) return;

      // 7. Traffic Agent proposes rerouting
      await this.executeStep({
        step: 7,
        totalSteps: 16,
        phase: 'AGENT PROPOSAL',
        headline: 'Traffic Agent: Complete Underpass Lockdown',
        amharicHeadline: 'የትራፊክ ወኪል: የመተላለፊያ መንገዶችን ሙሉ ለሙሉ መዝጋት',
        detail: 'Traffic Agent recommends barricading lower Kazanchis tunnels and diverting 100% of civilian traffic east.',
        activeAgents: ['traffic'],
        cameraTarget: [12, 0, -4],
        cameraDistance: 40,
      }, 3200);

      if (this.abortController) return;

      // 8. Emergency Agent prioritizes ambulance corridors
      await this.executeStep({
        step: 8,
        totalSteps: 16,
        phase: 'AGENT PROPOSAL',
        headline: 'Emergency Agent: Require Underpass for Ambulances',
        amharicHeadline: 'የአደጋ ወኪል: አምቡላንሶች ዋናውን መንገድ እንዲጠቀሙ መጠየቅ',
        detail: 'Emergency Agent objects: Rerouting ambulances around the underpass adds 9.4 minutes to life-critical ICU transit.',
        activeAgents: ['emergency'],
        cameraTarget: [8, 0, 16],
        cameraDistance: 42,
      }, 3400);

      if (this.abortController) return;

      // 9. Health Agent identifies available hospitals
      await this.executeStep({
        step: 9,
        totalSteps: 16,
        phase: 'AGENT PROPOSAL',
        headline: 'Health Agent: Dynamic Bed Load Balancing',
        amharicHeadline: 'የጤና ወኪል: ታማሚዎችን ወደ ተዘጋጁ ሆስፒታሎች ማከፋፈል',
        detail: 'Proposes splitting casualty streams: 60% to St. Paul Advanced Trauma (clearer western approach), 40% to Tikur Anbessa.',
        activeAgents: ['health'],
        cameraTarget: [-28, 0, -14], // St. Paul
        cameraDistance: 40,
      }, 3200);

      if (this.abortController) return;

      // 10. Supervisor compares recommendations & detects conflict
      await this.executeStep({
        step: 10,
        totalSteps: 16,
        phase: 'SUPERVISOR REASONING',
        headline: 'Supervisor Identifies Conflict & Synthesizes Compromise',
        amharicHeadline: 'ተቆጣጣሪው ግጭቱን ፈትሾ አማራጭ መፍትሄ አዘጋጀ',
        detail: 'Supervisor rules: "Closing underpasses protects cars but delays ambulances. Solution: Keep Lane 1 exclusive for EMS with drone pumps, redirect civilians to Ring Road."',
        activeAgents: ['supervisor', 'traffic', 'emergency'],
        cameraTarget: [2, 0, 8],
        cameraDistance: 50,
      }, 3800);

      if (this.abortController) return;

      // 11. Critic evaluates the plan
      await this.executeStep({
        step: 11,
        totalSteps: 16,
        phase: 'CRITIC & JUDGE AUDIT',
        headline: 'Critic Agent: Safety Margin Audit (Score: 94/100)',
        amharicHeadline: 'ገምጋሚ ወኪል: የደህንነት ማረጋገጫ (ውጤት: 94/100)',
        detail: 'Critic evaluates: Zero hospital route obstruction, emergency delay minimized to < 3.2 min, civilian detour safety confirmed. Plan APPROVED.',
        activeAgents: ['critic'],
        cameraTarget: [0, 0, 0],
        cameraDistance: 60,
      }, 3400);

      if (this.abortController) return;

      // 12. Supervisor approves the best strategy
      await this.executeStep({
        step: 12,
        totalSteps: 16,
        phase: 'STRATEGY AUTHORIZATION',
        headline: 'Metropolitan Directive Broadcast to Infrastructure',
        amharicHeadline: 'የከተማው መመሪያ ወደ ሁሉም ተቋማት ተላለፈ',
        detail: 'Autonomous signal beacons illuminate green emergency lane. Digital matrix signs guide 14,000 civilian vehicles along high-ground avenues.',
        activeAgents: ['supervisor'],
        cameraTarget: [12, 0, -4],
        cameraDistance: 45,
      }, 3200);

      if (this.abortController) return;

      // 13. City simulation applies response
      await this.executeStep({
        step: 13,
        totalSteps: 16,
        phase: 'EXECUTION IN PROGRESS',
        headline: 'Pumps Engage & Priority Lane Active',
        amharicHeadline: 'የጎርፍ ፓምፖች ስራ ጀመሩ፣ ቅድሚያ መስመር ተከፈተ',
        detail: 'High-speed drainage pumps purge 8,000 L/min from underpass. Rapid ambulances traverse corridor at 72 km/h unimpeded.',
        activeAgents: ['traffic', 'emergency', 'water'],
        cameraTarget: [8, 0, 16],
        cameraDistance: 40,
      }, 3400);

      if (this.abortController) return;

      // 14. Traffic gradually improves
      await this.executeStep({
        step: 14,
        totalSteps: 16,
        phase: 'SYSTEM STABILIZATION',
        headline: 'Congestion Relieved Across Central Corridor',
        amharicHeadline: 'የትራፊክ መጨናነቅ ደረጃ በደረጃ ቀነሰ',
        detail: 'Civilian flow velocities climb back to 38 km/h. Bottleneck clearance registered in Gotera and Kazanchis.',
        activeAgents: ['traffic', 'transit'],
        cameraTarget: [-18, 0, 30], // Gotera
        cameraDistance: 50,
      }, 3400);

      if (this.abortController) return;

      // 15. Emergency response time decreases
      await this.executeStep({
        step: 15,
        totalSteps: 16,
        phase: 'PATIENT INTAKE SECURED',
        headline: 'All 4 Trauma Units Safely Arrive at St. Paul & Tikur Anbessa',
        amharicHeadline: 'ሁሉም አምቡላንሶች በሰላም ደርሰዋል',
        detail: 'Average patient transit time: 3.8 minutes (vs 14.2 min uncoordinated baseline). Zero secondary accidents recorded.',
        activeAgents: ['emergency', 'health'],
        cameraTarget: [-10, 0, -22],
        cameraDistance: 40,
      }, 3400);

      if (this.abortController) return;

      // 16. Dashboard shows measured outcome
      tacticalAudio.speakTacticalDispatch('Showcase mission complete. Autonomous multi-agent coordination verified.');
      await this.executeStep({
        step: 16,
        totalSteps: 16,
        phase: 'MISSION COMPLETE',
        headline: 'Showcase Complete: Autonomous Coordination Verified',
        amharicHeadline: 'ማሳያው ተጠናቋል: ራስ-ገዝ ቅንጅቱ በተሳካ ሁኔታ ተፈጽሟል',
        detail: '14,000 citizens safeguarded. 10.4 minutes average travel time saved per commuter. Zero emergency delays. Full incident archived in City Memory.',
        activeAgents: ['supervisor', 'critic'],
        cameraTarget: [0, 0, 0],
        cameraDistance: 70,
      }, 5000);

      cityEngine.clearWeather();
      this.isRunning = false;
      this.notify(null);
    } catch (e) {
      console.error('Demo story error:', e);
      this.isRunning = false;
      this.notify(null);
    }
  }

  private executeStep(info: DemoStepInfo, durationMs: number): Promise<void> {
    this.currentStep = info.step;
    this.notify(info);

    return new Promise((resolve) => {
      this.timer = window.setTimeout(() => {
        resolve();
      }, durationMs);
    });
  }
}

export const demoStory = new DemoStoryOrchestrator();
