/**
 * NEXUS: THE LIVING CITY
 * CinemaTour.tsx — Automated 60fps Camera Fly-Through Controller
 *
 * Sequence:
 *   0. Space Orbit (zoom out to globe)
 *   1. Bole International Airport
 *   2. Meskel Square  ← triggers HazardOverlay
 *   3. Kazanchis corridor
 *   4. Tikur Anbessa Hospital
 *   (End — resolution + overlay cleared)
 *
 * Camera: smooth Mapbox flyTo chains with pitch / bearing sweep,
 * manual drag interrupts tour immediately.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Clapperboard, Square, ChevronRight } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { tacticalAudio } from '../audio/tacticalAudio';

// ─── Tour Stop Definition ─────────────────────────────────────────────────────
export interface TourStop {
  id: string;
  label: string;
  sublabel: string;
  voiceAm: string;
  voicePhoneticAm: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  duration: number;       // flyTo animation ms
  holdMs: number;         // linger at destination ms
  triggerHazard?: boolean;
  clearHazard?: boolean;
  icon: string;
}

const TOUR_STOPS: TourStop[] = [
  {
    id: 'orbit',
    label: 'SPACE ORBIT',
    sublabel: 'Syncing orbital telemetry…',
    voiceAm: 'የኔክሰስ ሳተላይት ምህዋር ክትትል ተጀመረ የአዲስ አበባ ስማርት ግሪድ ዝግጁ ነው',
    voicePhoneticAm: 'Ye NEXUS satellite mehwar kititil tejemere Ye Addis Ababa smart grid zegijit new',
    center: [38.7578, 9.0108],
    zoom: 1.5,
    pitch: 0,
    bearing: 0,
    duration: 3200,
    holdMs: 2000,
    icon: '🌍',
  },
  {
    id: 'bole',
    label: 'BOLE INTERNATIONAL',
    sublabel: 'Pan-African aviation gateway — 22M pax/yr',
    voiceAm: 'ቦሌ አለም አቀፍ ኤርፖርት የአየር እና የትራፊክ ኮሪደር በተሟላ ሁኔታ እየሰራ ነው',
    voicePhoneticAm: 'Bole alem akef airport ye ayer enna ye traffic corridor betemuala huneta eyesera new',
    center: [38.7885, 8.9897],
    zoom: 15.8,
    pitch: 58,
    bearing: -35,
    duration: 3600,
    holdMs: 2600,
    icon: '✈️',
  },
  {
    id: 'meskel',
    label: 'MESKEL SQUARE',
    sublabel: 'HAZARD DETECTED — Crisis Zone Alpha activated',
    voiceAm: 'በመስቀል አደባባይ የአደጋ ስጋት ተገኝቷል የአምቡላንስ ፈጣን መስመር ተከፍቷል',
    voicePhoneticAm: 'Be Meskel Adebabay ye adega segat tegentual Ye ambulance fetan mesmer tekeftual',
    center: [38.7578, 9.0108],
    zoom: 16.2,
    pitch: 68,
    bearing: 22,
    duration: 3000,
    holdMs: 3500,
    triggerHazard: true,
    icon: '⚠️',
  },
  {
    id: 'kazanchis',
    label: 'KAZANCHIS CORRIDOR',
    sublabel: 'High-density transit spine — Crisis Zone Beta',
    voiceAm: 'የካዛንቺስ የትራፊክ ፍሰት እና የሃይል አቅርቦት በራስ ገዝ ቁጥጥር ተረጋግቷል',
    voicePhoneticAm: 'Ye Kazanchis ye traffic feset enna ye hayil akirbot be ras gez kutiter teregagituwal',
    center: [38.7692, 9.0185],
    zoom: 16.4,
    pitch: 65,
    bearing: -18,
    duration: 2800,
    holdMs: 3000,
    icon: '⚡',
  },
  {
    id: 'tikur',
    label: 'TIKUR ANBESSA',
    sublabel: 'Cybernetic Health Center — Evacuation corridor LIVE',
    voiceAm: 'ጥቁር አንበሳ ድንገተኛ ህክምና ክፍል ለአደጋ ጊዜ ዝግጁ ነው የህይወት አድን መስመሩ ተጠብቋል',
    voicePhoneticAm: 'Tikur Anbessa dingetenya hekmena kifil le adega gizie zegiju new Ye heywet adin mesmeru tetebkuwal',
    center: [38.7516, 9.0188],
    zoom: 16.8,
    pitch: 72,
    bearing: 45,
    duration: 2800,
    holdMs: 3200,
    clearHazard: true,
    icon: '🏥',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CinemaTourProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  isMapLoaded: boolean;
  onHazardChange: (active: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const CinemaTour: React.FC<CinemaTourProps> = ({
  mapRef,
  isMapLoaded,
  onHazardChange,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStopIndex, setCurrentStopIndex] = useState(-1);
  const [currentStop, setCurrentStop] = useState<TourStop | null>(null);
  const [isInterrupted, setIsInterrupted] = useState(false);

  const isRunningRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopIndexRef = useRef(-1);

  // ── Cleanup helper ────────────────────────────────────────────────────────
  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // ── Stop tour ─────────────────────────────────────────────────────────────
  const stopTour = useCallback(() => {
    isRunningRef.current = false;
    clearTimer();
    setIsRunning(false);
    setCurrentStopIndex(-1);
    setCurrentStop(null);
    setIsInterrupted(false);
    stopIndexRef.current = -1;
    onHazardChange(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    soundEngine.playCinemaTourEnd();
  }, [onHazardChange]);

  // ── Execute a single stop ─────────────────────────────────────────────────
  const executeStop = useCallback(
    (index: number) => {
      if (!isRunningRef.current) return;
      const map = mapRef.current;
      if (!map) return;

      if (index >= TOUR_STOPS.length) {
        // Tour complete
        stopTour();
        return;
      }

      const stop = TOUR_STOPS[index];
      stopIndexRef.current = index;
      setCurrentStopIndex(index);
      setCurrentStop(stop);

      // Hazard triggers
      if (stop.triggerHazard) onHazardChange(true);
      if (stop.clearHazard) onHazardChange(false);

      // Play audio & speak tactical dispatch in authentic Amharic
      soundEngine.playCinemaTourWhoosh();
      if (stop.voiceAm) {
        tacticalAudio.speakTacticalDispatch(stop.voiceAm, 'am', stop.voicePhoneticAm);
      }

      // Camera fly
      map.flyTo({
        center: stop.center,
        zoom: stop.zoom,
        pitch: stop.pitch,
        bearing: stop.bearing,
        duration: stop.duration,
        essential: true,
        easing: (t: number) => {
          // Cubic ease-in-out for silky 60fps feel
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },
      });

      // Hold at destination then advance
      timeoutRef.current = setTimeout(() => {
        if (!isRunningRef.current) return;
        executeStop(index + 1);
      }, stop.duration + stop.holdMs);
    },
    [mapRef, onHazardChange, stopTour],
  );

  // ── Start tour ────────────────────────────────────────────────────────────
  const startTour = useCallback(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    isRunningRef.current = true;
    setIsRunning(true);
    setIsInterrupted(false);
    onHazardChange(false);
    soundEngine.playCinemaTourStart();

    // Attach interrupt listener — any drag stops the tour
    const onDragStart = () => {
      if (isRunningRef.current) {
        setIsInterrupted(true);
        stopTour();
      }
    };
    map.once('dragstart', onDragStart);

    // Begin from first stop
    setTimeout(() => executeStop(0), 300);
  }, [isMapLoaded, mapRef, onHazardChange, executeStop, stopTour]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      clearTimer();
    };
  }, []);

  // ── Progress bar (0-1) for current stop ──────────────────────────────────
  const progress = isRunning && currentStopIndex >= 0
    ? (currentStopIndex + 1) / TOUR_STOPS.length
    : 0;

  return (
    <>
      {/* ── Floating HUD Button ── */}
      <button
        id="nexus-cinema-tour-btn"
        onClick={() => {
          soundEngine.playUiClick();
          if (isRunning) stopTour();
          else startTour();
        }}
        disabled={!isMapLoaded}
        className={`
          group relative flex items-center gap-2 px-4 py-2 rounded-xl border
          text-xs font-mono font-bold tracking-wider transition-all duration-300
          shadow-2xl backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed
          ${isRunning
            ? 'bg-rose-600/90 border-rose-400 text-white shadow-[0_0_22px_rgba(239,68,68,0.65)] hover:bg-rose-500'
            : 'bg-slate-950/90 border-cyan-400/60 text-cyan-300 shadow-[0_0_18px_rgba(0,242,255,0.35)] hover:bg-cyan-950/70 hover:border-cyan-300 hover:text-white hover:shadow-[0_0_28px_rgba(0,242,255,0.6)]'
          }
        `}
        title={isRunning ? 'Click or drag map to interrupt cinema tour' : 'Launch automated cinematic fly-through of Addis Ababa'}
      >
        {isRunning ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>STOP TOUR</span>
            {/* Blinking record dot */}
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping absolute -top-1 -right-1" />
          </>
        ) : (
          <>
            <Clapperboard className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>RUN CINEMA TOUR</span>
            <ChevronRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>

      {/* ── Active Tour Overlay HUD Panel ── */}
      {isRunning && currentStop && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
          <div className="bg-slate-950/92 backdrop-blur-xl border border-cyan-400/50 rounded-2xl px-6 py-3.5 shadow-[0_0_40px_rgba(0,242,255,0.3)] min-w-[340px]">

            {/* Title row */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{currentStop.icon}</span>
              <div>
                <div className="font-mono text-[11px] text-cyan-400/70 tracking-[0.2em] uppercase">
                  CINEMA TOUR · STOP {currentStopIndex + 1}/{TOUR_STOPS.length}
                </div>
                <div className="font-mono text-base font-black text-white tracking-wide leading-tight">
                  {currentStop.label}
                </div>
              </div>
              {/* Spinning reel icon */}
              <div className="ml-auto">
                <Clapperboard className="w-5 h-5 text-cyan-400/60 animate-pulse" />
              </div>
            </div>

            {/* Sub-label */}
            <div className="font-mono text-[11px] text-slate-300 leading-relaxed mb-3 pl-8">
              {currentStop.sublabel}
            </div>

            {/* Stop breadcrumb dots */}
            <div className="flex items-center gap-2 pl-8">
              {TOUR_STOPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-1 transition-all duration-500 ${
                    i < currentStopIndex
                      ? 'opacity-40'
                      : i === currentStopIndex
                        ? 'opacity-100'
                        : 'opacity-20'
                  }`}
                >
                  <div
                    className={`rounded-full transition-all duration-500 ${
                      i === currentStopIndex
                        ? 'w-3 h-3 bg-cyan-400 shadow-[0_0_8px_rgba(0,242,255,0.9)]'
                        : i < currentStopIndex
                          ? 'w-2 h-2 bg-emerald-400'
                          : 'w-2 h-2 bg-slate-600'
                    }`}
                  />
                  {i < TOUR_STOPS.length - 1 && (
                    <div className={`h-px w-4 ${i < currentStopIndex ? 'bg-emerald-400/60' : 'bg-slate-700'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-0.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-1000"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Drag interrupt hint */}
            <div className="mt-2 text-center text-[9px] font-mono text-slate-600 tracking-wider">
              DRAG MAP TO INTERRUPT
            </div>
          </div>
        </div>
      )}

      {/* ── Interrupted banner ── */}
      {isInterrupted && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-slate-900/90 border border-amber-500/60 rounded-xl px-5 py-2.5 shadow-xl text-xs font-mono text-amber-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            CINEMA TOUR INTERRUPTED — Manual control restored
          </div>
        </div>
      )}
    </>
  );
};

export default CinemaTour;
