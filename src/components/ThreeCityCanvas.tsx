/**
 * NEXUS: THE LIVING CITY
 * ThreeCityCanvas - React Container for Three.js Digital Twin
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { CityScene, VisualShadingMode } from '../three/CityScene';
import { BuildingInfo, DistrictId, Incident } from '../types/city';

export interface ThreeCityCanvasHandle {
  setWeatherRain: (enable: boolean) => void;
  focusOnDistrict: (districtId: DistrictId) => void;
  focusOnBuilding: (buildingId: string) => void;
  focusOnIncident: (incident: Incident) => void;
  followEmergencyVehicle: () => void;
  toggleDroneCam: () => boolean;
  getIsDroneCam: () => boolean;
  setShadingMode: (mode: VisualShadingMode) => void;
  resetOverviewCamera: () => void;
  selectBuilding: (id: string | null) => void;
  updateIncidents: (incidents: Incident[]) => void;
}

interface ThreeCityCanvasProps {
  onBuildingSelect: (building: BuildingInfo | null) => void;
  onDistrictSelect: (districtId: DistrictId | null) => void;
  onIncidentSelect: (incident: Incident | null) => void;
}

export const ThreeCityCanvas = forwardRef<ThreeCityCanvasHandle, ThreeCityCanvasProps>(
  ({ onBuildingSelect, onDistrictSelect, onIncidentSelect }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<CityScene | null>(null);

    const callbacksRef = useRef({
      onBuildingSelect,
      onDistrictSelect,
      onIncidentSelect,
    });

    useEffect(() => {
      callbacksRef.current = {
        onBuildingSelect,
        onDistrictSelect,
        onIncidentSelect,
      };
    }, [onBuildingSelect, onDistrictSelect, onIncidentSelect]);

    useEffect(() => {
      if (!mountRef.current) return;

      const sceneInstance = new CityScene(mountRef.current, {
        onBuildingSelect: (b) => callbacksRef.current.onBuildingSelect(b),
        onDistrictSelect: (d) => callbacksRef.current.onDistrictSelect(d),
        onIncidentSelect: (i) => callbacksRef.current.onIncidentSelect(i),
      });

      sceneRef.current = sceneInstance;

      return () => {
        sceneInstance.dispose();
        sceneRef.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      setWeatherRain: (enable: boolean) => {
        sceneRef.current?.setWeatherRain(enable);
      },
      focusOnDistrict: (districtId: DistrictId) => {
        sceneRef.current?.focusOnDistrict(districtId);
      },
      focusOnBuilding: (buildingId: string) => {
        sceneRef.current?.focusOnBuilding(buildingId);
      },
      focusOnIncident: (incident: Incident) => {
        sceneRef.current?.focusOnIncident(incident);
      },
      followEmergencyVehicle: () => {
        sceneRef.current?.followEmergencyVehicle();
      },
      toggleDroneCam: () => {
        return sceneRef.current?.toggleDroneCam() || false;
      },
      getIsDroneCam: () => {
        return sceneRef.current?.getIsDroneCam() || false;
      },
      setShadingMode: (mode: VisualShadingMode) => {
        sceneRef.current?.setShadingMode(mode);
      },
      resetOverviewCamera: () => {
        sceneRef.current?.resetOverviewCamera();
      },
      selectBuilding: (id: string | null) => {
        sceneRef.current?.selectBuilding(id);
      },
      updateIncidents: (incidents: Incident[]) => {
        sceneRef.current?.updateIncidents(incidents);
      },
    }));

    return (
      <div
        ref={mountRef}
        className="w-full h-full absolute inset-0 overflow-hidden bg-[#060913]"
        style={{ touchAction: 'none' }}
      />
    );
  }
);

ThreeCityCanvas.displayName = 'ThreeCityCanvas';
