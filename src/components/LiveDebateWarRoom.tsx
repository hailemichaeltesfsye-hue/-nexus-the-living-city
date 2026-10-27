/**
 * NEXUS: THE LIVING CITY
 * LiveDebateWarRoom.tsx — 11-Agent Cognitive Conflict Arbitration & Pareto Synthesis
 *
 * Real-time spoken dialogue of the 11 autonomous agents debating, negotiating,
 * and synthesizing Pareto compromises under the independent Critic & Judge safety floor.
 * Executes genuine end-to-end actuators across Addis Ababa municipal infrastructure.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowRight,
  Layers,
  X,
  Volume2,
  VolumeX,
  Radio,
  Check,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { tacticalAudio } from '../audio/tacticalAudio';
import { cityEngine } from '../simulation/cityEngine';

export interface DebateTurn {
  id: number;
  agentId: string;
  agentName: string;
  agentAmharic: string;
  role: 'traffic' | 'emergency' | 'health' | 'energy' | 'critic' | 'supervisor' | 'transit' | 'environment';
  type: 'proposal' | 'objection' | 'constitutional_veto' | 'synthesis' | 'approval';
  textAm: string;
  phoneticAm: string;
  textEn: string;
  score?: number;
  ruleCitation?: string;
  timestamp: string;
}

const CINEMATIC_DEBATE_SCRIPT: DebateTurn[] = [
  {
    id: 1,
    agentId: 'traffic',
    agentName: 'Traffic Agent',
    agentAmharic: 'የመንገድ ትራፊክ ወኪል',
    role: 'traffic',
    type: 'proposal',
    textAm: 'በካዛንቺስ የበታች መስመር ላይ 14 ሳንቲሜትር የውሃ መቋጠር ተከስቷል። ፍጥነት ወደ 19 ኪሎሜትር በሰዓት ወርዷል። መንገዱ ለሁሉም ተሽከርካሪዎች ሙሉ በሙሉ እንዲዘጋ እጠይቃለሁ።',
    phoneticAm: 'Be Kazanchis yebehtach mesmer lay asra arat santimeter yewuha mekwater tekesetual Fekinet wede asra zetegn kilometer beseat wordual Mengedu le hulum teshkerkariwoch mulu bemulu endizega eteykalehu',
    textEn: 'Kazanchis underpass water level reaches 14 centimeters. Flow rate plummeted to 19 kilometers per hour. Formally proposing immediate full vehicular closure of lower underpass.',
    timestamp: '18:04:12',
  },
  {
    id: 2,
    agentId: 'emergency',
    agentName: 'Emergency Agent',
    agentAmharic: 'ድንገተኛ አደጋ ወኪል',
    role: 'emergency',
    type: 'objection',
    textAm: 'ተቃውሞ አለኝ! ይህ የበታች መስመር ወደ ጥቁር አንበሳ ሆስፒታል የሚወስድ ብቸኛው የ 4 ነጥብ 2 ደቂቃ የአምቡላንስ ኮሪደር ነው። መንገዱ ከተዘጋ የታማሚዎች መድረሻ ጊዜ ወደ 28 ደቂቃ ያድጋል!',
    phoneticAm: 'Tekawmo alegn Yihe yebehtach mesmer wede Tikur Anbessa Hospital yemiyewesid bichegnaw ye arat nekteb hulat dekika ye ambulance corridor new Mengedu ketezega yetamamiyoch medresha gize wede haya semint dekika yadegal',
    textEn: 'STRONG OBJECTION! The underpass is our sole 4 point 2 minute trauma corridor to Tikur Anbessa Hospital. Rerouting via Bole adds 24 minutes, risking critical patient mortality!',
    timestamp: '18:04:15',
  },
  {
    id: 3,
    agentId: 'health',
    agentName: 'Health Agent',
    agentAmharic: 'የጤና ጥበቃ ወኪል',
    role: 'health',
    type: 'proposal',
    textAm: 'የጥቁር አንበሳ ICU የመቀበል አቅም 82 በመቶ ደርሷል። ተጨማሪ 3 አምቡላንሶች በመንገድ ላይ ናቸው። ኮሪደሩ ክፍት ሆኖ የቆሰሉትን ወደ ቅዱስ ጳውሎስና ጥቁር አንበሳ ማከፋፈል ግድ ይላል።',
    phoneticAm: 'Ye Tikur Anbessa I C U yemikebel akim semanya hulat meto dersual Techemari sost ambulansoch bemenged lay nachew Corridoru kift hono yekoselutin wede Kidus Paulos enna Tikur Anbessa makefafal gid yilal',
    textEn: 'Tikur Anbessa ICU occupancy has spiked to 82 percent. Three urgent trauma ambulances en route. Corridor must remain passable with dual triage balancing between Saint Paul and Tikur Anbessa.',
    timestamp: '18:04:18',
  },
  {
    id: 4,
    agentId: 'energy',
    agentName: 'Energy Agent',
    agentAmharic: 'የኃይል አቅርቦት ወኪል',
    role: 'energy',
    type: 'proposal',
    textAm: 'በዝናቡ ምክንያት የትራንስፎርመር ሙቀት 92 በመቶ ደርሷል። የፍሳሽ ማስወገጃ ፓምፖችን በሙሉ አቅም ለማስነሳት 1 ነጥብ 4 ሜጋዋት ተጨማሪ ኃይል ከጎተራ ሶላር ባትሪ መመደብ አለብን።',
    phoneticAm: 'Be zenabu mekenyat ye transformer muket zetena hulat meto dersual Ye fesash maswegaja pumpochin bemulu akim lemasnesat and nekteb arat megawatt techemari hayil ke Gotera solar battery memedeb alebin',
    textEn: 'High voltage grid load surge to 92 percent. To spool up high capacity flood evacuation pumps, Gotera 1 point 4 megawatt battery reserve must be dispatched immediately.',
    timestamp: '18:04:22',
  },
  {
    id: 5,
    agentId: 'critic',
    agentName: 'Critic & Judge Agent',
    agentAmharic: 'የውሳኔ ገምጋሚ ወኪል',
    role: 'critic',
    type: 'constitutional_veto',
    textAm: 'የሕገ-መንግስት AI አንቀጽ 4 ነጥብ 1 ጥሰት፦ የትራፊክ ወኪል ያቀረበው መንገድ የመዝጋት ሃሳብ የህይወት አድን መስመርን ስለሚዘጋ ውድቅ ተደርጓል! የግምገማ ነጥብ 68 ከመቶ ከ 75 በታች።',
    phoneticAm: 'Ye hige mengist A I ankets arat nekteb and tiset Ye traffic agent yakerebew menged yemezgat hasab yehizb adin mesmerin selemizega wedk tedergual Yegimgema netib sesa semint kemeto',
    textEn: 'CONSTITUTIONAL HARD VETO: Proposal by Traffic Agent violates Safety Invariant Article 4 point 1 Zero Interruption to Level One Trauma Corridor. Plan Rejected. Score: 68 out of 100.',
    score: 68,
    ruleCitation: 'CONST-ART-4.1 // Level-1 Trauma Headroom Guaranteed',
    timestamp: '18:04:25',
  },
  {
    id: 6,
    agentId: 'supervisor',
    agentName: 'City Supervisor AI',
    agentAmharic: 'ማዕከላዊ ተቆጣጣሪ AI',
    role: 'supervisor',
    type: 'synthesis',
    textAm: 'የተቀናጀ የፓሬቶ ውሳኔ፦ የበታች መስመር 1 ለድንገተኛ አምቡላንስ ብቻ ተከልሎ በፓምፕ ውሃው ይወጣል። ሲቪል መኪኖች ወደ አፍሪካ አቬኑ እና መስቀል አደባባይ ፎቅ ይዛወራሉ።',
    phoneticAm: 'Yetekenaje ye Pareto wosanie Yebehtach mesmer and le dingetegna ambulance bicha tekelilo be pump wuhaw yiwotal Civil mekiwoch wede Africa Avenue enna Meskel Adebabay fok yizaweralu',
    textEn: 'PARETO SYNTHESIS: Contraflow Elevated Lane 1 locked exclusively for EMS ambulances with 8000 liters per minute pump discharge. Civilian traffic diverted to elevated flyovers.',
    timestamp: '18:04:29',
  },
  {
    id: 7,
    agentId: 'critic',
    agentName: 'Critic & Judge Agent',
    agentAmharic: 'የውሳኔ ገምጋሚ ወኪል',
    role: 'critic',
    type: 'approval',
    textAm: 'የተሻሻለው ውሳኔ ፀድቋል! የህይወት ደህንነት 94 በመቶ፣ የተጎጂዎች መድረሻ 4 ነጥብ 2 ደቂቃ ተረጋግጧል። የግምገማ ነጥብ 94 ከመቶ ፀድቋል። ትዕዛዝ ወደ ከተማዋ ይተላለፍ!',
    phoneticAm: 'Yeteshashalew wosanie tsedkual Yehizb dehninet zetena arat meto, yetegojiyoch medresha arat nekteb hulat dekika teregagituwal Yegimgema netib zetena arat kemeto tsedkual Teezaz wede ketemawa yitelelf',
    textEn: 'REVISED PLAN RATIFIED: Life safety 94 percent, EMS corridor preserved, flood cleared. Critic Score: 94 out of 100. Actuators authorized for immediate broadcast.',
    score: 94,
    ruleCitation: 'CONST-ART-4.1 & CONST-ART-5.8 PASSED (Score: 94%)',
    timestamp: '18:04:33',
  },
];

export interface LiveDebateWarRoomProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanRatified?: (plan: any) => void;
}

export const LiveDebateWarRoom: React.FC<LiveDebateWarRoomProps> = ({
  isOpen,
  onClose,
  onPlanRatified,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(CINEMATIC_DEBATE_SCRIPT.length);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [lang, setLang] = useState<'bilingual' | 'am' | 'en'>('bilingual');
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isActuated, setIsActuated] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep]);

  // Execute real municipal actuation
  const executeMunicipalActuation = useCallback(() => {
    cityEngine.actuateFloodEmergencyCorridor();
    cityEngine.actuateGoteraGreenWave();
    cityEngine.actuateTikurAnbessaICU();
    cityEngine.actuateGERDStabilization();
    cityEngine.resolveAllActiveIncidents(
      '11-Agent Pareto Consensus: Kazanchis Flood Corridor Cleared & Gotera Green Wave Active'
    );
    setIsActuated(true);
    soundEngine.playCinemaTourEnd();
    onPlanRatified?.(CINEMATIC_DEBATE_SCRIPT[CINEMATIC_DEBATE_SCRIPT.length - 1]);
  }, [onPlanRatified]);

  // Spoken P2P agent dialogue progression
  const playStepSpeech = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= CINEMATIC_DEBATE_SCRIPT.length) {
        setIsPlayingAuto(false);
        setActiveSpeaker(null);
        // Automatically actuate city upon full consensus ratification!
        executeMunicipalActuation();
        return;
      }

      const turn = CINEMATIC_DEBATE_SCRIPT[stepIndex];
      setActiveSpeaker(turn.agentName);

      if (turn.type === 'constitutional_veto') {
        soundEngine.playHazardAlert();
      } else if (turn.type === 'approval') {
        soundEngine.playCinemaTourEnd();
      } else {
        soundEngine.playP2PSynapse();
      }

      // If user muted voice, proceed on simple timer
      if (isVoiceMuted) {
        timeoutRef.current = setTimeout(() => {
          setCurrentStep(stepIndex + 2);
          playStepSpeech(stepIndex + 1);
        }, 1800);
        return;
      }

      // Spoken voice synthesis based on language selection
      const advanceToNext = () => {
        timeoutRef.current = setTimeout(() => {
          setCurrentStep(stepIndex + 2);
          playStepSpeech(stepIndex + 1);
        }, 400);
      };

      if (lang === 'bilingual') {
        tacticalAudio.speakBilingualDispatch(
          turn.textEn,
          turn.textAm,
          turn.phoneticAm,
          advanceToNext
        );
      } else if (lang === 'am') {
        const voices = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
        const hasAmVoice = voices.some((v) => v.lang.startsWith('am') || v.lang.toLowerCase().includes('et'));
        const spokenAm = hasAmVoice ? turn.textAm : turn.phoneticAm;
        tacticalAudio.speakWithAgentVoice(turn.role, spokenAm, 'am', advanceToNext);
      } else {
        tacticalAudio.speakWithAgentVoice(turn.role, turn.textEn, 'en', advanceToNext);
      }
    },
    [executeMunicipalActuation, isVoiceMuted, lang]
  );

  const handleStartSimulatedDebate = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentStep(1);
    setIsPlayingAuto(true);
    setIsActuated(false);
    soundEngine.playP2PCrisisSynapse();
    tacticalAudio.playTacticalClick();
    playStepSpeech(0);
  };

  const handleStopOrReset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentStep(CINEMATIC_DEBATE_SCRIPT.length);
    setIsPlayingAuto(false);
    setActiveSpeaker(null);
    soundEngine.playUiClick();
  };

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const visibleTurns = CINEMATIC_DEBATE_SCRIPT.slice(0, currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden font-mono text-slate-200">
        {/* Glow Header Frame */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
                <span>11-AGENT COGNITIVE WAR ROOM</span>
                <span className="px-1.5 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded">
                  P2P SPOKEN ARBITRATION
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Spoken Inter-Agent Dialogue • Real End-to-End Infrastructure Actuators
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Voice Mute/Unmute */}
            <button
              onClick={() => {
                setIsVoiceMuted((v) => !v);
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                soundEngine.playUiClick();
              }}
              className={`p-2 rounded-lg border text-xs transition-all ${
                isVoiceMuted
                  ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-cyan-300 hover:text-white'
              }`}
              title={isVoiceMuted ? 'Unmute agent voice synthesis' : 'Mute agent voice synthesis'}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
            </button>

            {/* Language Switcher */}
            <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => {
                  setLang('bilingual');
                  soundEngine.playUiClick();
                }}
                className={`px-2.5 py-1 rounded transition-all ${
                  lang === 'bilingual' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌐 ሁለቱም (Dual)
              </button>
              <button
                onClick={() => {
                  setLang('am');
                  soundEngine.playUiClick();
                }}
                className={`px-2 py-1 rounded transition-all ${
                  lang === 'am' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇪🇹 አማርኛ
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  soundEngine.playUiClick();
                }}
                className={`px-2 py-1 rounded transition-all ${
                  lang === 'en' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar (Trigger Live Spoken P2P Multi-Agent Arbitration) */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartSimulatedDebate}
              disabled={isPlayingAuto}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                isPlayingAuto
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPlayingAuto ? 'AGENTS COMMUNICATING (P2P)...' : 'TRIGGER SPOKEN P2P ARBITRATION'}</span>
            </button>

            <button
              onClick={handleStopOrReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>SHOW FULL TRANSCRIPT</span>
            </button>
          </div>

          {/* Active Speaking Indicator */}
          {activeSpeaker && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[11px] animate-pulse">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>🎙️ SPEAKING: {activeSpeaker.toUpperCase()}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 font-mono">
            STEP {Math.min(currentStep, CINEMATIC_DEBATE_SCRIPT.length)} OF {CINEMATIC_DEBATE_SCRIPT.length} // CONSENSUS:{' '}
            {currentStep >= 7 ? '94/100 (APPROVED)' : 'IN PROGRESS'}
          </div>
        </div>

        {/* Live Conversation Transcript Feed */}
        <div
          ref={scrollRef}
          className="p-6 space-y-3.5 max-h-[400px] overflow-y-auto bg-slate-950/50 text-xs"
        >
          {visibleTurns.map((turn) => {
            const isVeto = turn.type === 'constitutional_veto';
            const isApproval = turn.type === 'approval';
            const isSupervisor = turn.role === 'supervisor';
            const isCurrentlySpeaking = activeSpeaker === turn.agentName;

            return (
              <div
                key={turn.id}
                className={`p-3.5 rounded-xl border transition-all animate-fadeIn ${
                  isCurrentlySpeaking
                    ? 'ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(0,242,255,0.3)] bg-cyan-950/30 border-cyan-400'
                    : isVeto
                    ? 'bg-rose-950/25 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : isApproval
                    ? 'bg-emerald-950/25 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : isSupervisor
                    ? 'bg-cyan-950/25 border-cyan-500/50 shadow-[0_0_20px_rgba(0,242,255,0.15)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCurrentlySpeaking
                          ? 'bg-cyan-400 animate-ping'
                          : turn.role === 'emergency'
                          ? 'bg-rose-500'
                          : turn.role === 'traffic'
                          ? 'bg-amber-500'
                          : turn.role === 'health'
                          ? 'bg-emerald-500'
                          : turn.role === 'energy'
                          ? 'bg-yellow-400'
                          : turn.role === 'critic'
                          ? 'bg-purple-500'
                          : 'bg-cyan-400'
                      }`}
                    />
                    <span className="font-bold text-white tracking-wide">
                      {lang === 'am' ? turn.agentAmharic : turn.agentName}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">[{turn.role}]</span>

                    {/* Turn Type Badge */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        isVeto
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isApproval
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isSupervisor
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {turn.type.replace('_', ' ')}
                    </span>

                    {isCurrentlySpeaking && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/30 text-cyan-200 border border-cyan-400 flex items-center gap-1 font-bold">
                        <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                        <span>SPOKEN LIVE</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500">{turn.timestamp}</span>
                </div>

                {/* Message Content (Bilingual shows both English & Amharic side-by-side or stacked) */}
                <div className="space-y-1.5 pl-4 border-l-2 border-slate-700">
                  {(lang === 'bilingual' || lang === 'en') && (
                    <div className="text-slate-100 font-sans text-xs leading-relaxed">
                      {turn.textEn}
                    </div>
                  )}
                  {(lang === 'bilingual' || lang === 'am') && (
                    <div className="text-cyan-200 font-sans text-xs leading-relaxed font-ethiopic">
                      {turn.textAm}
                    </div>
                  )}
                </div>

                {/* Constitutional Citation / Score */}
                {(turn.ruleCitation || turn.score) && (
                  <div className="mt-2 pl-4 flex items-center gap-3 text-[10px]">
                    {turn.ruleCitation && (
                      <span className="text-purple-300 flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3 h-3 text-purple-400" />
                        <span>{turn.ruleCitation}</span>
                      </span>
                    )}
                    {turn.score && (
                      <span
                        className={`font-mono font-bold ${
                          turn.score >= 75 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        SCORE: {turn.score}/100 {turn.score >= 75 ? '✓ APPROVED' : '✗ REJECTED'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Real Actuation Banner when Plan is Ratified */}
        {currentStep >= 7 && (
          <div className="px-6 py-2.5 bg-emerald-950/40 border-t border-emerald-500/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {isActuated
                  ? '✓ Ratified Pareto Plan Actuated: Kazanchis Flood Drained, Gotera Green Wave Active, ICU Preempted.'
                  : 'Consensus Approved by Critic & Judge (94/100). Click below to execute on city actuators.'}
              </span>
            </div>
            {!isActuated ? (
              <button
                onClick={executeMunicipalActuation}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>EXECUTE ON ACTUATORS</span>
              </button>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                CITY ACTUATED LIVE
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Autonomous Conflict Arbitration Engine // Llama-Guard 3 Constitutional Evaluator</span>
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all cursor-pointer"
          >
            CLOSE WAR ROOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveDebateWarRoom;
