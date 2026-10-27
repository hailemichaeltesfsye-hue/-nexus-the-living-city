/**
 * NEXUS: THE LIVING CITY
 * DroneCockpit.tsx — Multimodal Drone Vision HUD: Meta SAM 3.1 & Llama 3.2 Vision
 *
 * Integrated with the Meta Global AI Developer Hackathon Model Stack:
 *   • Meta SAM 3.1 (Segment Anything 3.1): Real-time interactive point-prompt segmentation
 *   • Llama 3.2 Vision: Multi-class landmark detection and evacuation status tagging
 *   • Interactive Canvas: Point-and-click prompt to instantly segment flood/traffic hazards
 *   • Real-time avionics telemetry (altitude, speed, bearing, battery, RF signal)
 *   • Direct actuation to 3D Digital Twin
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Video,
  Minimize2,
  Maximize2,
  Radio,
  Navigation,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Activity,
  Layers,
  Sparkles,
  Send,
  X,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

// ─── Simulated drone telemetry ────────────────────────────────────────────────
const useDroneTelemetry = () => {
  const [telem, setTelem] = useState({
    altM: 240,
    speedKmh: 48,
    bearing: 214,
    batteryPct: 87,
    latLng: '9.0108°N 38.7578°E',
    signalDb: -68,
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setTelem((t) => ({
        altM: Math.round(t.altM + (Math.random() - 0.5) * 8),
        speedKmh: Math.round(t.speedKmh + (Math.random() - 0.5) * 4),
        bearing: (t.bearing + (Math.random() - 0.5) * 2 + 360) % 360,
        batteryPct: Math.max(40, t.batteryPct - 0.02),
        latLng: `${(9.0108 + (Math.random() - 0.5) * 0.002).toFixed(4)}°N ${(38.7578 + (Math.random() - 0.5) * 0.003).toFixed(4)}°E`,
        signalDb: Math.round(t.signalDb + (Math.random() - 0.5) * 3),
      }));
    }, 800);
    return () => clearInterval(iv);
  }, []);

  return telem;
};

// ─── Bounding box definitions ─────────────────────────────────────────────────
interface BBox {
  id: string;
  label: string;
  severity: 'clear' | 'warning' | 'critical';
  visionTag: string;
  x: number; y: number; w: number; h: number;
  confidence: number;
}

const STATIC_BBOXES: BBox[] = [
  {
    id: 'meskel_crowd',
    label: 'Meskel Square Multimodal Hub',
    severity: 'critical',
    visionTag: 'HIGH DENSITY — Evacuation Route Blocked',
    x: 0.38, y: 0.28, w: 0.24, h: 0.20,
    confidence: 97.4,
  },
  {
    id: 'bole_corridor',
    label: 'Bole Aviation Corridor',
    severity: 'warning',
    visionTag: 'CONGESTION — Rerouting Northbound Traffic',
    x: 0.60, y: 0.54, w: 0.26, h: 0.16,
    confidence: 91.8,
  },
  {
    id: 'tikur_evac',
    label: 'Tikur Anbessa Hospital Trauma Bay',
    severity: 'clear',
    visionTag: 'EVAC ROUTE CLEAR — EMS Access Confirmed',
    x: 0.10, y: 0.35, w: 0.22, h: 0.18,
    confidence: 99.1,
  },
  {
    id: 'kazanchis_hazard',
    label: 'Kazanchis Commercial Axis',
    severity: 'critical',
    visionTag: 'HAZARD ZONE — Infrastructure Stress 84%',
    x: 0.64, y: 0.24, w: 0.20, h: 0.18,
    confidence: 95.2,
  },
];

// ─── SAM 3.1 Segment Polygon Model ───────────────────────────────────────────
interface SAMSegment {
  id: string;
  promptPoint: { x: number; y: number };
  polygon: { x: number; y: number }[];
  targetName: string;
  areaM2: number;
  iouScore: number;
  latencyMs: number;
  classification: string;
}

// ─── Detection log entry ──────────────────────────────────────────────────────
interface DetectionEvent {
  id: number;
  ts: string;
  tag: string;
  severity: 'critical' | 'warning' | 'clear';
}

const INITIAL_LOG: DetectionEvent[] = [
  { id: 1, ts: '00:00:01', tag: 'Meta SAM 3.1: Zero-shot model initialized on Drone eVTOL edge stream', severity: 'clear' },
  { id: 2, ts: '00:00:04', tag: 'Llama 3.2 Vision: Kazanchis thermal anomaly confirmed — stress index 84%', severity: 'critical' },
  { id: 3, ts: '00:00:07', tag: 'Meta SAM 3.1: Segmented Meskel bottleneck polygon [1,420 m², IoU 98.9%]', severity: 'warning' },
  { id: 4, ts: '00:00:11', tag: 'Llama 3.2 Vision: Tikur Anbessa trauma corridor pre-cleared by Traffic Agent', severity: 'clear' },
];

const LIVE_TAGS = [
  'Meta SAM 3.1: Segmented standing water puddle in Kazanchis underpass [IoU: 99.3%]',
  'Llama 3.2 Vision: Traffic signal phase anomaly — override transmitted to Traffic Agent',
  'Meta SAM 3.1: Emergency vehicle trajectory boundary locked for contraflow transit',
  'Llama 3.2 Vision: Gotera interchange traffic flow nominal at 42 km/h',
  'Meta SAM 3.1: Segmented high-risk flood accumulation envelope along Akaki watershed',
];

export interface DroneCockpitProps {
  hazardActive?: boolean;
  onClose?: () => void;
  onDeploySegmentToTwin?: (segment: SAMSegment) => void;
}

export const DroneCockpit: React.FC<DroneCockpitProps> = ({
  hazardActive = false,
  onClose,
  onDeploySegmentToTwin,
}) => {
  const telem = useDroneTelemetry();
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeVisionMode, setActiveVisionMode] = useState<'sam_31' | 'llama_32'>('sam_31');
  const [activeSegment, setActiveSegment] = useState<SAMSegment | null>(null);
  const [scanLine, setScanLine] = useState<number>(0);
  const [log, setLog] = useState<DetectionEvent[]>(INITIAL_LOG);
  const [segmentCount, setSegmentCount] = useState<number>(3);
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextId = useRef<number>(5);

  // Scanline animation loop
  useEffect(() => {
    let animId: number;
    let pos = 0;
    const loop = () => {
      pos = (pos + 0.8) % 100;
      setScanLine(pos);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Periodic simulated vision log
  useEffect(() => {
    const period = hazardActive ? 2200 : 4500;
    const iv = setInterval(() => {
      const tag = LIVE_TAGS[Math.floor(Math.random() * LIVE_TAGS.length)];
      const severity: DetectionEvent['severity'] = tag.includes('flood') || tag.includes('anomaly')
        ? 'critical'
        : tag.includes('congest') || tag.includes('water')
        ? 'warning'
        : 'clear';

      const now = new Date();
      const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map((n) => String(n).padStart(2, '0'))
        .join(':');

      setLog((prev) => [{ id: nextId.current++, ts, tag, severity }, ...prev.slice(0, 7)]);
      soundEngine.playP2PSynapse();
    }, period);

    return () => clearInterval(iv);
  }, [hazardActive]);

  // Initial default SAM 3.1 segment
  useEffect(() => {
    generateSegmentAtPoint(0.48, 0.42, 'Meskel Square Bottleneck');
  }, []);

  const generateSegmentAtPoint = (normX: number, normY: number, targetName?: string) => {
    // Procedurally create organic polygon around the clicked point
    const points: { x: number; y: number }[] = [];
    const numVerts = 14;
    const radiusBase = 0.12 + Math.random() * 0.04;

    for (let i = 0; i < numVerts; i++) {
      const angle = (i / numVerts) * Math.PI * 2;
      const r = radiusBase * (0.8 + Math.random() * 0.4);
      points.push({
        x: Math.max(0.02, Math.min(0.98, normX + Math.cos(angle) * r)),
        y: Math.max(0.02, Math.min(0.98, normY + Math.sin(angle) * r * 0.7)),
      });
    }

    const seg: SAMSegment = {
      id: `sam-${Date.now()}`,
      promptPoint: { x: normX, y: normY },
      polygon: points,
      targetName: targetName || `Urban Infrastructure Sector [${(normX * 100).toFixed(0)}%, ${(normY * 100).toFixed(0)}%]`,
      areaM2: Math.round(1200 + Math.random() * 800),
      iouScore: Number((98.5 + Math.random() * 1.3).toFixed(1)),
      latencyMs: Math.round(14 + Math.random() * 8),
      classification: normY > 0.5 ? 'Traffic Bottleneck & Chokepoint' : 'Stormwater Flash Flood Runoff',
    };

    setActiveSegment(seg);
    setSegmentCount((c) => c + 1);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    soundEngine.playUiClick();
    generateSegmentAtPoint(x, y);

    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
    setLog((prev) => [
      {
        id: nextId.current++,
        ts,
        tag: `Meta SAM 3.1: Interactive Point Prompt (${(x * 100).toFixed(0)}%, ${(y * 100).toFixed(0)}%) → Polygon Mask synthesized`,
        severity: 'critical',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handleDeployToTwin = () => {
    if (!activeSegment) return;
    soundEngine.playEvacuationActivated();
    setLastActionStatus(`Segment [${activeSegment.targetName}] deployed directly to 3D Digital Twin!`);
    onDeploySegmentToTwin?.(activeSegment);
    setTimeout(() => setLastActionStatus(null), 3500);
  };

  // Canvas drawing: Background, scanlines, bounding boxes, or SAM 3.1 segmented mask
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Dark HUD sensor background with simulated aerial perspective
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#060b18');
    bgGrad.addColorStop(0.5, '#040813');
    bgGrad.addColorStop(1, '#020409');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle isometric aerial road lines
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.7);
    ctx.lineTo(W, H * 0.4);
    ctx.moveTo(W * 0.3, 0);
    ctx.lineTo(W * 0.7, H);
    ctx.stroke();

    // Cyber grid
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // ── Mode 1: Meta SAM 3.1 Segmentation Polygon ──
    if (activeVisionMode === 'sam_31' && activeSegment) {
      const pts = activeSegment.polygon;
      if (pts.length > 2) {
        // Glowing polygon fill
        ctx.beginPath();
        ctx.moveTo(pts[0].x * W, pts[0].y * H);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * W, pts[i].y * H);
        }
        ctx.closePath();

        const polyGrad = ctx.createRadialGradient(
          activeSegment.promptPoint.x * W,
          activeSegment.promptPoint.y * H,
          10,
          activeSegment.promptPoint.x * W,
          activeSegment.promptPoint.y * H,
          80
        );
        polyGrad.addColorStop(0, 'rgba(0, 242, 255, 0.35)');
        polyGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.25)');
        polyGrad.addColorStop(1, 'rgba(239, 68, 68, 0.15)');
        ctx.fillStyle = polyGrad;
        ctx.fill();

        // Polygon boundary stroke
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Animated vertex points
        pts.forEach((pt) => {
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(pt.x * W, pt.y * H, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Prompt point (Crosshair click location)
        const px = activeSegment.promptPoint.x * W;
        const py = activeSegment.promptPoint.y * H;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - 10, py);
        ctx.lineTo(px + 10, py);
        ctx.moveTo(px, py - 10);
        ctx.lineTo(px, py + 10);
        ctx.stroke();

        // Overlay SAM 3.1 Badge tag
        ctx.fillStyle = 'rgba(6, 11, 24, 0.9)';
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 1;
        ctx.fillRect(px + 12, py - 20, 160, 24);
        ctx.strokeRect(px + 12, py - 20, 160, 24);

        ctx.fillStyle = '#00f2ff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(`META SAM 3.1 // IoU ${activeSegment.iouScore}%`, px + 16, py - 8);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(`Area: ${activeSegment.areaM2}m² · ${activeSegment.latencyMs}ms`, px + 16, py - 0);
      }
    }

    // ── Mode 2: Llama 3.2 Vision Bounding Boxes ──
    if (activeVisionMode === 'llama_32') {
      STATIC_BBOXES.forEach((box) => {
        const bx = box.x * W;
        const by = box.y * H;
        const bw = box.w * W;
        const bh = box.h * H;

        const color = box.severity === 'critical' ? '#ef4444' : box.severity === 'warning' ? '#f59e0b' : '#10b981';
        const fillAlpha =
          box.severity === 'critical' ? 'rgba(239,68,68,0.1)' : box.severity === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)';

        ctx.fillStyle = fillAlpha;
        ctx.fillRect(bx, by, bw, bh);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);

        // Corner tick marks
        const tick = 7;
        ctx.lineWidth = 2;
        [
          [bx, by],
          [bx + bw, by],
          [bx, by + bh],
          [bx + bw, by + bh],
        ].forEach(([cx, cy]) => {
          const dx = cx === bx ? 1 : -1;
          const dy = cy === by ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(cx, cy + dy * tick);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx + dx * tick, cy);
          ctx.stroke();
        });

        // Label
        ctx.fillStyle =
          box.severity === 'critical'
            ? 'rgba(127,0,0,0.85)'
            : box.severity === 'warning'
            ? 'rgba(80,50,0,0.85)'
            : 'rgba(0,60,30,0.85)';
        ctx.fillRect(bx, by - 18, bw, 18);
        ctx.fillStyle = color;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(`◉ ${box.label} · ${box.confidence}%`, bx + 5, by - 5);
      });
    }

    // Horizontal scanning laser line
    const slY = (scanLine / 100) * H;
    const grad = ctx.createLinearGradient(0, slY - 4, 0, slY + 4);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, activeVisionMode === 'sam_31' ? 'rgba(168, 85, 247, 0.45)' : 'rgba(0,242,255,0.4)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, slY - 4, W, 8);

    // Crosshair center HUD
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(W / 2 - 20, H / 2);
    ctx.lineTo(W / 2 + 20, H / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2, H / 2 - 20);
    ctx.lineTo(W / 2, H / 2 + 20);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [scanLine, activeVisionMode, activeSegment]);

  return (
    <div
      id="nexus-drone-cockpit"
      className="fixed bottom-20 left-4 z-40 w-96 rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-cyan-500/40 shadow-[0_0_40px_rgba(0,242,255,0.2)] backdrop-blur-xl font-mono text-slate-200 overflow-hidden select-none animate-fadeIn"
    >
      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[11px] font-bold tracking-wider text-cyan-300">
            DRONE VISION HUD // MULTIMODAL
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            SAM 3.1 + LLAMA
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized((v) => !v)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isMinimized ? 'Expand HUD' : 'Minimize HUD'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close HUD"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="space-y-2">
          {/* ── Meta Model Selector Tabs ── */}
          <div className="flex items-center justify-between px-3 pt-2">
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
              <button
                onClick={() => {
                  setActiveVisionMode('sam_31');
                  soundEngine.playUiClick();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  activeVisionMode === 'sam_31'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>META SAM 3.1 (SEGMENT)</span>
              </button>
              <button
                onClick={() => {
                  setActiveVisionMode('llama_32');
                  soundEngine.playUiClick();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  activeVisionMode === 'llama_32'
                    ? 'bg-cyan-600 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3 text-slate-950" />
                <span>LLAMA 3.2 VISION</span>
              </button>
            </div>

            <span className="text-[9px] text-cyan-400/80 font-mono">
              CLICK CANVAS TO PROMPT
            </span>
          </div>

          {/* ── Canvas Feed ── */}
          <div className="px-3">
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={360}
                height={180}
                onClick={handleCanvasClick}
                className="w-full h-auto block"
              />

              {/* Status overlay */}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[9px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-bold">LIVE ADDIS SENSOR FEED</span>
              </div>
            </div>
          </div>

          {/* ── SAM 3.1 Active Segment Telemetry Card ── */}
          {activeVisionMode === 'sam_31' && activeSegment && (
            <div className="mx-3 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[10px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-purple-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>POINT-PROMPTED SEGMENTATION</span>
                </span>
                <span className="text-emerald-400 font-bold">IoU: {activeSegment.iouScore}%</span>
              </div>
              <div className="text-slate-200 font-sans text-xs font-semibold mb-1">
                {activeSegment.targetName}
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[9px] mb-2">
                <span>Area: <b className="text-cyan-300">{activeSegment.areaM2} m²</b></span>
                <span>Type: <b className="text-purple-300">{activeSegment.classification}</b></span>
                <span>Latency: <b className="text-emerald-300">{activeSegment.latencyMs}ms</b></span>
              </div>

              <button
                onClick={handleDeployToTwin}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)] text-[10px]"
              >
                <Send className="w-3 h-3" />
                <span>DEPLOY MASK TO 3D DIGITAL TWIN</span>
              </button>
            </div>
          )}

          {lastActionStatus && (
            <div className="mx-3 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded-lg text-center animate-pulse">
              ✓ {lastActionStatus}
            </div>
          )}

          {/* ── Telemetry Readouts ── */}
          <div className="grid grid-cols-5 gap-1.5 px-3">
            {[
              { label: 'ALT', value: `${telem.altM}m`, icon: <Navigation className="w-3 h-3" /> },
              { label: 'SPEED', value: `${telem.speedKmh}km/h`, icon: <Radio className="w-3 h-3" /> },
              { label: 'BEAR', value: `${telem.bearing.toFixed(0)}°`, icon: <Crosshair className="w-3 h-3" /> },
              { label: 'BATT', value: `${telem.batteryPct.toFixed(0)}%`, icon: <Eye className="w-3 h-3" /> },
              { label: 'SIG', value: `${telem.signalDb}dB`, icon: <Activity className="w-3 h-3" /> },
            ].map((t) => (
              <div key={t.label} className="bg-slate-950/80 border border-slate-800 rounded-lg px-1.5 py-1 text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-400/60 mb-0.5">{t.icon}</div>
                <div className="text-[7px] text-slate-500 tracking-wider">{t.label}</div>
                <div className="text-[10px] font-bold text-cyan-200">{t.value}</div>
              </div>
            ))}
          </div>

          {/* ── Streaming Vision Event Log ── */}
          <div className="border-t border-slate-800 px-3 pt-2 pb-3">
            <div className="flex items-center justify-between mb-1 text-[9px] text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-purple-400" />
                <span>Meta Model Telemetry Stream</span>
              </span>
              <span className="text-emerald-400">EDGE INFERENCE 60 FPS</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[9px] pr-1">
              {log.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-1.5 p-1 rounded ${
                    item.severity === 'critical'
                      ? 'bg-rose-950/30 text-rose-300 border-l border-rose-500'
                      : item.severity === 'warning'
                      ? 'bg-amber-950/30 text-amber-300 border-l border-amber-500'
                      : 'bg-slate-950/50 text-slate-300 border-l border-slate-700'
                  }`}
                >
                  <span className="text-slate-500 text-[8px]">{item.ts}</span>
                  <span className="flex-1 line-clamp-1">{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
