/**
 * NEXUS: THE LIVING CITY
 * HazardOverlay.tsx — Dynamic Real-Time Hazard Visualization System
 *
 * Renders pulsing GeoJSON heatmap / circle layers directly on the Mapbox
 * globe for Meskel Square and Kazanchis crisis zones, plus a live
 * evacuation corridor polyline from Kazanchis → Meskel → Tikur Anbessa.
 *
 * All layers are registered onto a shared mapboxgl.Map ref passed in as a prop.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { FeatureCollection } from 'geojson';
import { soundEngine } from '../audio/SoundEngine';

// ─── Geo Constants ────────────────────────────────────────────────────────────
const MESKEL_SQUARE: [number, number] = [38.7578, 9.0108];
const KAZANCHIS: [number, number] = [38.7692, 9.0185];
const TIKUR_ANBESSA: [number, number] = [38.7516, 9.0188];
// Waypoints forming the evacuation corridor
const EVAC_CORRIDOR_COORDS: [number, number][] = [
  KAZANCHIS,
  [38.764, 9.016],  // mid-junction
  MESKEL_SQUARE,
  [38.754, 9.014],  // corridor bend
  TIKUR_ANBESSA,
];

const HAZARD_ZONES = [
  {
    id: 'meskel',
    coords: MESKEL_SQUARE,
    label: 'MESKEL SQUARE — CRISIS ZONE ALPHA',
    severity: 'CRITICAL' as const,
    radiusMeters: 420,
    colorR: 255, colorG: 40, colorB: 40,   // red
  },
  {
    id: 'kazanchis',
    coords: KAZANCHIS,
    label: 'KAZANCHIS — CRISIS ZONE BETA',
    severity: 'HIGH' as const,
    radiusMeters: 320,
    colorR: 255, colorG: 140, colorB: 0,   // amber
  },
];

// ─── Source / Layer IDs ───────────────────────────────────────────────────────
const SRC_HAZARD = 'nexus-hazard-src';
const SRC_EVAC = 'nexus-evac-src';
const LAYER_HAZARD_HEAT = 'nexus-hazard-heat';
const LAYER_HAZARD_CIRCLE = 'nexus-hazard-circle';
const LAYER_HAZARD_RING = 'nexus-hazard-ring';
const LAYER_EVAC_LINE = 'nexus-evac-line';
const LAYER_EVAC_GLOW = 'nexus-evac-glow';
const LAYER_EVAC_ARROWS = 'nexus-evac-arrows';

// ─── GeoJSON builders ─────────────────────────────────────────────────────────
const buildHazardGeoJSON = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: HAZARD_ZONES.map((z) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: z.coords },
    properties: {
      id: z.id,
      label: z.label,
      severity: z.severity,
      radius: z.radiusMeters,
      r: z.colorR, g: z.colorG, b: z.colorB,
    },
  })),
});

const buildEvacGeoJSON = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: EVAC_CORRIDOR_COORDS },
      properties: { type: 'evac-corridor' },
    },
  ],
});

// ─── Props ────────────────────────────────────────────────────────────────────
export interface HazardOverlayHandle {
  activate: () => void;
  deactivate: () => void;
  isActive: () => boolean;
}

interface HazardOverlayProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  isMapLoaded: boolean;
  active: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const HazardOverlay: React.FC<HazardOverlayProps> = ({
  mapRef,
  isMapLoaded,
  active,
  onActivate,
  onDeactivate,
}) => {
  const pulseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulsePhaseRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const activeRef = useRef(false);

  // ── Register / Remove Mapbox layers ─────────────────────────────────────────
  const injectLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // ── Hazard Source ──
    if (!map.getSource(SRC_HAZARD)) {
      map.addSource(SRC_HAZARD, {
        type: 'geojson',
        data: buildHazardGeoJSON(),
      });
    }

    // ── Evacuation Corridor Source ──
    if (!map.getSource(SRC_EVAC)) {
      map.addSource(SRC_EVAC, {
        type: 'geojson',
        data: buildEvacGeoJSON(),
      });
    }

    // ── Heat-bloom layer ──
    if (!map.getLayer(LAYER_HAZARD_HEAT)) {
      map.addLayer({
        id: LAYER_HAZARD_HEAT,
        type: 'heatmap',
        source: SRC_HAZARD,
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 10, 1, 17, 3],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 10, 40, 17, 160],
          'heatmap-opacity': 0.72,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(255,80,0,0.3)',
            0.5, 'rgba(255,40,0,0.6)',
            0.8, 'rgba(255,0,0,0.82)',
            1.0, 'rgba(255,200,200,1)',
          ],
        },
      });
    }

    // ── Pulsing circle fill ──
    if (!map.getLayer(LAYER_HAZARD_CIRCLE)) {
      map.addLayer({
        id: LAYER_HAZARD_CIRCLE,
        type: 'circle',
        source: SRC_HAZARD,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 20, 17, 80],
          'circle-color': [
            'case',
            ['==', ['get', 'severity'], 'CRITICAL'],
            'rgba(255,30,30,0.45)',
            'rgba(255,140,0,0.38)',
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'severity'], 'CRITICAL'],
            '#ff1e1e',
            '#ff8c00',
          ],
          'circle-stroke-width': 2.5,
          'circle-opacity': 0.82,
          'circle-stroke-opacity': 1,
          'circle-blur': 0.35,
        },
      });
    }

    // ── Outer ring (animated via JS paint update) ──
    if (!map.getLayer(LAYER_HAZARD_RING)) {
      map.addLayer({
        id: LAYER_HAZARD_RING,
        type: 'circle',
        source: SRC_HAZARD,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 36, 17, 140],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#ff3030',
          'circle-stroke-width': 2,
          'circle-opacity': 0,
          'circle-stroke-opacity': 0.7,
        },
      });
    }

    // ── Evacuation corridor glow (thick) ──
    if (!map.getLayer(LAYER_EVAC_GLOW)) {
      map.addLayer({
        id: LAYER_EVAC_GLOW,
        type: 'line',
        source: SRC_EVAC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#00f2ff',
          'line-width': 14,
          'line-opacity': 0.18,
          'line-blur': 8,
        },
      });
    }

    // ── Evacuation corridor main line ──
    if (!map.getLayer(LAYER_EVAC_LINE)) {
      map.addLayer({
        id: LAYER_EVAC_LINE,
        type: 'line',
        source: SRC_EVAC,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#00f2ff',
          'line-width': 4,
          'line-opacity': 0.92,
          'line-dasharray': [0, 4, 3],
        },
      });
    }

    // ── Evacuation arrow symbols ──
    if (!map.getLayer(LAYER_EVAC_ARROWS)) {
      map.addLayer({
        id: LAYER_EVAC_ARROWS,
        type: 'symbol',
        source: SRC_EVAC,
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 80,
          'icon-image': 'airport',
          'icon-size': 0.8,
          'icon-rotate': 90,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
        paint: {
          'icon-color': '#00f2ff',
          'icon-opacity': 0.9,
        },
      });
    }
  }, [mapRef]);

  const removeLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const layers = [LAYER_EVAC_ARROWS, LAYER_EVAC_LINE, LAYER_EVAC_GLOW, LAYER_HAZARD_RING, LAYER_HAZARD_CIRCLE, LAYER_HAZARD_HEAT];
    const sources = [SRC_HAZARD, SRC_EVAC];
    layers.forEach((id) => { try { if (map.getLayer(id)) map.removeLayer(id); } catch {} });
    sources.forEach((id) => { try { if (map.getSource(id)) map.removeSource(id); } catch {} });
  }, [mapRef]);

  // ── Pulse animation — drives ring expand/contract ─────────────────────────
  const startPulseAnimation = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const animate = () => {
      if (!activeRef.current) return;
      pulsePhaseRef.current += 0.04;
      const t = Math.abs(Math.sin(pulsePhaseRef.current));
      const ringRadius = 36 + t * 60;
      const ringOpacity = 0.9 - t * 0.55;
      const circleOpacity = 0.55 + t * 0.35;

      try {
        if (map.getLayer(LAYER_HAZARD_RING)) {
          map.setPaintProperty(LAYER_HAZARD_RING, 'circle-stroke-opacity', ringOpacity);
          map.setPaintProperty(LAYER_HAZARD_RING, 'circle-radius', [
            'interpolate', ['linear'], ['zoom'],
            12, ringRadius * 0.28,
            17, ringRadius * 1.4,
          ]);
        }
        if (map.getLayer(LAYER_HAZARD_CIRCLE)) {
          map.setPaintProperty(LAYER_HAZARD_CIRCLE, 'circle-opacity', circleOpacity);
        }
        // Dash-animate the evac line offset
        const dashOffset = (pulsePhaseRef.current * 3) % 7;
        if (map.getLayer(LAYER_EVAC_LINE)) {
          map.setPaintProperty(LAYER_EVAC_LINE, 'line-dasharray', [dashOffset, 4, 3]);
        }
      } catch { /* map style switching */ }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, [mapRef]);

  const stopPulseAnimation = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ── Effect: respond to active prop changes ────────────────────────────────
  useEffect(() => {
    if (!isMapLoaded) return;

    if (active) {
      activeRef.current = true;
      injectLayers();
      startPulseAnimation();

      // Sound: gentle hazard alert without repetitive ticks
      soundEngine.playHazardAlert();
      soundEngine.playEvacuationActivated();

      onActivate?.();
    } else {
      activeRef.current = false;
      stopPulseAnimation();
      removeLayers();

      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }

      onDeactivate?.();
    }

    return () => {
      stopPulseAnimation();
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current);
        pulseTimerRef.current = null;
      }
    };
  }, [active, isMapLoaded, injectLayers, removeLayers, startPulseAnimation, stopPulseAnimation, onActivate, onDeactivate]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      activeRef.current = false;
      stopPulseAnimation();
      if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
      removeLayers();
    };
  }, [removeLayers, stopPulseAnimation]);

  // No DOM — this is a pure Mapbox-layer controller
  return null;
};

export default HazardOverlay;
