/**
 * NEXUS: THE LIVING CITY
 * High-Fidelity Interactive 3D Digital Twin (Three.js)
 * Procedural African Smart City Architecture, Moving Autonomous Traffic,
 * Autonomous eVTOL Drones, Drone-Cam Cockpit, Dynamic Holographic Neural Beams,
 * Dynamic Weather, and Telemetry Raycasting
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ETHIOPIAN_DISTRICTS, INITIAL_BUILDINGS } from '../data/ethiopianCityData';
import { BuildingInfo, DistrictId, Incident } from '../types/city';

// Pre-allocated math objects to avoid GC pressure
const _vec3 = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _dronePos = new THREE.Vector3();

export interface CitySceneCallbacks {
  onBuildingSelect: (building: BuildingInfo | null) => void;
  onDistrictSelect: (districtId: DistrictId | null) => void;
  onIncidentSelect: (incident: Incident | null) => void;
}

interface Vehicle {
  mesh: THREE.Group;
  path: THREE.Vector3[];
  currentWaypoint: number;
  speed: number;
  progress: number;
  isEmergency: boolean;
  beaconLight?: THREE.PointLight;
}

interface DroneUnit {
  mesh: THREE.Group;
  curve: THREE.CatmullRomCurve3;
  progress: number;
  speed: number;
  rotors: THREE.Mesh[];
  light: THREE.PointLight;
}

export type VisualShadingMode = 'standard' | 'thermal' | 'traffic' | 'cyberpunk';

export class CityScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private animFrameId: number | null = null;
  private clock: THREE.Timer;
  private callbacks: CitySceneCallbacks;

  // Scene elements
  private buildingMeshes: Map<string, THREE.Group> = new Map();
  private buildingData: Map<string, BuildingInfo> = new Map();
  private vehicles: Vehicle[] = [];
  private drones: DroneUnit[] = [];
  private maglevTrain: THREE.Group | null = null;
  private maglevProgress: number = 0;
  private incidentMarkers: Map<string, THREE.Group> = new Map();

  // Neural Beams
  private neuralBeamsGroup: THREE.Group;
  private neuralPulses: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; progress: number }[] = [];

  // Weather & Effects
  private rainParticles: THREE.Points | null = null;
  private isRaining: boolean = false;
  private rainCount = 3500;

  // Visual Shading Mode
  private currentShadingMode: VisualShadingMode = 'standard';
  private roadMeshes: THREE.Mesh[] = [];

  // Raycasting & Interaction
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private selectedBuildingId: string | null = null;
  private selectionAura: THREE.Mesh | null = null;

  // Camera targets
  private targetCameraPos: THREE.Vector3 | null = null;
  private targetLookAt: THREE.Vector3 | null = null;
  private followingVehicle: Vehicle | null = null;
  private droneCamMode: boolean = false;

  constructor(container: HTMLElement, callbacks: CitySceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Timer();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.neuralBeamsGroup = new THREE.Group();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Fog Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913); // Deep cosmic navy
    this.scene.fog = new THREE.FogExp2(0x060913, 0.009);

    // 3. Camera & Controls
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 600);
    this.camera.position.set(0, 75, 110);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 250;
    this.controls.target.set(0, 0, 0);

    // 4. Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig
    this.setupLighting();

    // 6. Build the City Environment
    this.createGroundAndGrid();
    this.createRoadNetwork();
    this.createElevatedMaglevTrack();
    this.createProceduralDistricts();
    this.createKeyInfrastructureBuildings();
    this.createRainSystem();
    this.createTrafficVehicles();
    this.createAutonomousDrones();
    this.createSelectionAura();
    this.setupHolographicNeuralBeams();

    // Add neural beams group to scene
    this.scene.add(this.neuralBeamsGroup);

    // Event Listeners
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);

    window.addEventListener('resize', this.onWindowResize);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);

    // Pre-warm shaders
    this.renderer.compile(this.scene, this.camera);

    // Start loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    // Warm key directional light (Ethiopian highland golden hour/cyber sunlight)
    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.8);
    keyLight.position.set(60, 100, 50);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 300;
    keyLight.shadow.camera.left = -90;
    keyLight.shadow.camera.right = 90;
    keyLight.shadow.camera.top = 90;
    keyLight.shadow.camera.bottom = -90;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Cool ambient hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.85);
    this.scene.add(hemiLight);

    // Subtle blue rim light from mountains
    const rimLight = new THREE.DirectionalLight(0x0284c7, 0.75);
    rimLight.position.set(-60, 40, -60);
    this.scene.add(rimLight);
  }

  private createGroundAndGrid() {
    const groundGeo = new THREE.PlaneGeometry(360, 360, 64, 64);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getY(i);
      if (z < -30) {
        const factor = Math.abs(z + 30) / 70;
        posAttr.setZ(i, Math.pow(factor, 1.6) * 18);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090d18,
      roughness: 0.88,
      metalness: 0.15,
    });

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // Holographic grid
    const gridHelper = new THREE.GridHelper(260, 52, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.03;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.28;
    this.scene.add(gridHelper);

    // District Boundary Rings
    for (const dist of ETHIOPIAN_DISTRICTS) {
      const ringGeo = new THREE.RingGeometry(14, 14.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: dist.id === 'entoto' ? 0x10b981 : dist.id === 'bole' ? 0x38bdf8 : 0x6366f1,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(dist.centerCoord[0], 0.05, dist.centerCoord[1]);
      this.scene.add(ring);
    }
  }

  private createRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x111625,
      roughness: 0.7,
      metalness: 0.3,
    });

    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });

    const roads = [
      { width: 8, length: 180, x: 10, z: 20, rot: 0.2 },
      { width: 7, length: 160, x: -10, z: 10, rot: -0.4 },
      { width: 9, length: 190, x: 0, z: -10, rot: Math.PI / 2 },
      { width: 6, length: 120, x: -25, z: -15, rot: 0.6 },
    ];

    roads.forEach((r) => {
      const roadGeo = new THREE.PlaneGeometry(r.width, r.length);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = r.rot;
      road.position.set(r.x, 0.08, r.z);
      road.receiveShadow = true;
      this.scene.add(road);
      this.roadMeshes.push(road);

      const centerLineGeo = new THREE.PlaneGeometry(0.35, r.length * 0.95);
      const centerLine = new THREE.Mesh(centerLineGeo, lineMat);
      centerLine.rotation.x = -Math.PI / 2;
      centerLine.rotation.z = r.rot;
      centerLine.position.set(r.x, 0.09, r.z);
      this.scene.add(centerLine);
    });

    const junctionGeo = new THREE.RingGeometry(3, 14, 32);
    const junction = new THREE.Mesh(junctionGeo, roadMat);
    junction.rotation.x = -Math.PI / 2;
    junction.position.set(2, 0.085, 8);
    this.scene.add(junction);
    this.roadMeshes.push(junction);
  }

  private createElevatedMaglevTrack() {
    const trackGroup = new THREE.Group();

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-45, 6, 15),
      new THREE.Vector3(-20, 6.5, 28),
      new THREE.Vector3(2, 7, 8),
      new THREE.Vector3(26, 6.5, 24),
      new THREE.Vector3(50, 6, 12),
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.65, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const trackMesh = new THREE.Mesh(tubeGeo, tubeMat);
    trackGroup.add(trackMesh);

    const railMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.9,
    });
    const railGeo = new THREE.TubeGeometry(curve, 64, 0.15, 6, false);
    const railMesh = new THREE.Mesh(railGeo, railMat);
    railMesh.position.y += 0.45;
    trackGroup.add(railMesh);

    const points = curve.getSpacedPoints(10);
    const pylonGeo = new THREE.CylinderGeometry(0.4, 0.6, 6.5, 8);
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });

    points.forEach((pt) => {
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(pt.x, 3.25, pt.z);
      trackGroup.add(pylon);
    });

    this.scene.add(trackGroup);

    // Maglev Train
    this.maglevTrain = new THREE.Group();
    const carMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.8,
      roughness: 0.2,
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let c = 0; c < 3; c++) {
      const car = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(1.6, 1.2, 5.2);
      const body = new THREE.Mesh(bodyGeo, carMat);
      car.add(body);

      const winGeo = new THREE.BoxGeometry(1.65, 0.4, 4.4);
      const win = new THREE.Mesh(winGeo, windowMat);
      win.position.y = 0.2;
      car.add(win);

      const glowLight = new THREE.PointLight(0x06b6d4, 1.2, 5);
      glowLight.position.y = -0.5;
      car.add(glowLight);

      car.position.z = c * -5.6;
      this.maglevTrain.add(car);
    }

    this.scene.add(this.maglevTrain);
  }

  private createProceduralDistricts() {
    const buildingPalette = [
      { wall: 0x1e293b, glow: 0x38bdf8, metalness: 0.4 },
      { wall: 0x0f172a, glow: 0xf59e0b, metalness: 0.7 },
      { wall: 0x182438, glow: 0x10b981, metalness: 0.5 },
      { wall: 0x27272a, glow: 0xec4899, metalness: 0.8 },
    ];

    ETHIOPIAN_DISTRICTS.forEach((dist) => {
      const count = dist.id === 'entoto' ? 6 : 14;

      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 11 + 2;
        const angle = Math.random() * Math.PI * 2;
        const x = dist.centerCoord[0] + Math.cos(angle) * radius;
        const z = dist.centerCoord[1] + Math.sin(angle) * radius;

        if (Math.abs(x) < 4 && Math.abs(z) < 4) continue;

        const theme = buildingPalette[i % buildingPalette.length];
        const height = Math.random() * 26 + 14;
        const width = Math.random() * 4 + 3.5;
        const depth = Math.random() * 4 + 3.5;

        const bldGroup = new THREE.Group();
        bldGroup.position.set(x, 0, z);

        // Plinth
        const baseGeo = new THREE.BoxGeometry(width * 1.15, 2.5, depth * 1.15);
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x0b1120,
          roughness: 0.9,
          metalness: 0.2,
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 1.25;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        bldGroup.add(baseMesh);

        // Tower
        const towerGeo = new THREE.BoxGeometry(width, height, depth);
        const towerMat = new THREE.MeshStandardMaterial({
          color: theme.wall,
          roughness: 0.35,
          metalness: theme.metalness,
        });
        const towerMesh = new THREE.Mesh(towerGeo, towerMat);
        towerMesh.position.y = height / 2 + 2.5;
        towerMesh.castShadow = true;
        towerMesh.receiveShadow = true;
        bldGroup.add(towerMesh);

        // Window strips
        const windowGeo = new THREE.BoxGeometry(width * 1.02, height * 0.75, depth * 0.4);
        const windowMat = new THREE.MeshBasicMaterial({
          color: theme.glow,
          transparent: true,
          opacity: 0.45,
        });
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.y = height / 2 + 2.5;
        bldGroup.add(windowMesh);

        // Rooftop crown
        const crownType = i % 3;
        if (crownType === 0) {
          const heliGeo = new THREE.CylinderGeometry(width * 0.4, width * 0.4, 0.4, 16);
          const heliMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
          const heli = new THREE.Mesh(heliGeo, heliMat);
          heli.position.y = height + 2.7;
          bldGroup.add(heli);
        } else if (crownType === 1) {
          const spireGeo = new THREE.CylinderGeometry(0.08, 0.3, 6, 8);
          const spireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
          const spire = new THREE.Mesh(spireGeo, spireMat);
          spire.position.y = height + 5.5;
          bldGroup.add(spire);

          const beacon = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xef4444 })
          );
          beacon.position.y = height + 8.5;
          bldGroup.add(beacon);
        } else {
          const phGeo = new THREE.BoxGeometry(width * 0.6, 2.5, depth * 0.6);
          const phMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 });
          const ph = new THREE.Mesh(phGeo, phMat);
          ph.position.y = height + 3.75;
          bldGroup.add(ph);
        }

        const bldId = `procedural_${dist.id}_${i}`;
        bldGroup.name = bldId;
        this.scene.add(bldGroup);

        const info: BuildingInfo = {
          id: bldId,
          name: `${dist.name} Tower ${i + 1}`,
          amharicName: `${dist.amharicName} ህንፃ ${i + 1}`,
          district: dist.id,
          type: 'commercial',
          position: [x, 0, z],
          height,
          occupancyOrLoadPct: Math.round(Math.random() * 40 + 55),
          status: 'STABLE',
          metrics: {
            capacity: `${Math.round(height * 45)} Occupants`,
            energyUsageMW: parseFloat((height * 0.12).toFixed(1)),
          },
        };

        this.buildingMeshes.set(bldId, bldGroup);
        this.buildingData.set(bldId, info);
      }
    });
  }

  private createKeyInfrastructureBuildings() {
    for (const bld of INITIAL_BUILDINGS) {
      const bldGroup = new THREE.Group();
      bldGroup.position.set(bld.position[0], 0, bld.position[2]);
      const height = bld.height;

      if (bld.type === 'hospital') {
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(10, 3, 10),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3 })
        );
        base.position.y = 1.5;
        bldGroup.add(base);

        const wing1 = new THREE.Mesh(
          new THREE.BoxGeometry(4.5, height, 11),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.6, roughness: 0.25 })
        );
        wing1.position.y = height / 2 + 3;
        bldGroup.add(wing1);

        const wing2 = new THREE.Mesh(
          new THREE.BoxGeometry(11, height * 0.75, 4.5),
          new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.6, roughness: 0.25 })
        );
        wing2.position.y = (height * 0.75) / 2 + 3;
        bldGroup.add(wing2);

        // Glowing Medical Cross
        const crossH = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 0.8, 0.4),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        crossH.position.set(0, height + 4, 2.3);
        bldGroup.add(crossH);

        const crossV = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 2.5, 0.4),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        crossV.position.set(0, height + 4, 2.3);
        bldGroup.add(crossV);

        const helipad = new THREE.Mesh(
          new THREE.CylinderGeometry(3.5, 3.5, 0.5, 24),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
        );
        helipad.position.set(0, height + 3.25, 0);
        bldGroup.add(helipad);
      } else if (bld.type === 'power') {
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(12, 1.5, 12),
          new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.5 })
        );
        base.position.y = 0.75;
        bldGroup.add(base);

        for (let t = 0; t < 4; t++) {
          const coil = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.2, height * 0.65, 16),
            new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.9, roughness: 0.2 })
          );
          coil.position.set((t % 2) * 5 - 2.5, (height * 0.65) / 2 + 1.5, Math.floor(t / 2) * 5 - 2.5);
          bldGroup.add(coil);
        }

        const beacon = new THREE.PointLight(0xeab308, 1.8, 15);
        beacon.position.set(0, height * 0.8, 0);
        bldGroup.add(beacon);
      } else if (bld.type === 'water') {
        for (let w = 0; w < 3; w++) {
          const tank = new THREE.Mesh(
            new THREE.CylinderGeometry(2.8, 2.8, height * 0.7, 24),
            new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.4, roughness: 0.3 })
          );
          tank.position.set(w * 4.5 - 4.5, (height * 0.7) / 2, 0);
          bldGroup.add(tank);

          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(3.0, 0.2, 8, 24),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.set(w * 4.5 - 4.5, height * 0.5, 0);
          bldGroup.add(ring);
        }
      } else {
        const spire = new THREE.Mesh(
          new THREE.ConeGeometry(5, height, 6),
          new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            metalness: 0.95,
            roughness: 0.15,
          })
        );
        spire.position.y = height / 2;
        bldGroup.add(spire);

        const crest = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.8, 0),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        crest.position.y = height + 1;
        bldGroup.add(crest);
      }

      bldGroup.name = bld.id;
      this.scene.add(bldGroup);

      this.buildingMeshes.set(bld.id, bldGroup);
      this.buildingData.set(bld.id, bld);
    }
  }

  private createTrafficVehicles() {
    const pathA: THREE.Vector3[] = [
      new THREE.Vector3(-40, 0.3, 10),
      new THREE.Vector3(-15, 0.3, 18),
      new THREE.Vector3(2, 0.3, 8),
      new THREE.Vector3(25, 0.3, 22),
      new THREE.Vector3(45, 0.3, 28),
      new THREE.Vector3(25, 0.3, 22),
      new THREE.Vector3(2, 0.3, 8),
      new THREE.Vector3(-15, 0.3, 18),
    ];

    const pathB: THREE.Vector3[] = [
      new THREE.Vector3(0, 0.3, -40),
      new THREE.Vector3(0, 0.3, -15),
      new THREE.Vector3(2, 0.3, 8),
      new THREE.Vector3(-18, 0.3, 30),
      new THREE.Vector3(-35, 0.3, 40),
      new THREE.Vector3(-18, 0.3, 30),
      new THREE.Vector3(2, 0.3, 8),
      new THREE.Vector3(0, 0.3, -15),
    ];

    const carGeo = new THREE.BoxGeometry(0.9, 0.5, 1.8);
    const carMat1 = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
    const carMat2 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
    const carMat3 = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });

    for (let i = 0; i < 16; i++) {
      const vehGroup = new THREE.Group();
      const body = new THREE.Mesh(carGeo, [carMat1, carMat2, carMat3][i % 3]);
      vehGroup.add(body);

      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.15, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      hl.position.set(0, 0.1, 0.9);
      vehGroup.add(hl);

      const tl = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.15, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      tl.position.set(0, 0.1, -0.9);
      vehGroup.add(tl);

      this.scene.add(vehGroup);

      const path = i % 2 === 0 ? pathA : pathB;
      const progress = i / 16;

      this.vehicles.push({
        mesh: vehGroup,
        path,
        currentWaypoint: 0,
        speed: 0.04 + Math.random() * 0.02,
        progress,
        isEmergency: false,
      });
    }

    // 2 Rapid Response Ambulances
    for (let e = 0; e < 2; e++) {
      const emGroup = new THREE.Group();
      const emBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 2.4),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6 })
      );
      emGroup.add(emBody);

      const sirenGeo = new THREE.BoxGeometry(0.6, 0.2, 0.3);
      const sirenMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const siren = new THREE.Mesh(sirenGeo, sirenMat);
      siren.position.y = 0.5;
      emGroup.add(siren);

      const beaconLight = new THREE.PointLight(0xef4444, 2.5, 12);
      beaconLight.position.y = 0.8;
      emGroup.add(beaconLight);

      this.scene.add(emGroup);

      this.vehicles.push({
        mesh: emGroup,
        path: e === 0 ? pathA : pathB,
        currentWaypoint: 0,
        speed: 0.08,
        progress: 0.35 + e * 0.4,
        isEmergency: true,
        beaconLight,
      });
    }
  }

  // Autonomous eVTOL Drones and Flying Air-Taxis
  private createAutonomousDrones() {
    const droneCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2, 34, -48), // Entoto
        new THREE.Vector3(-10, 28, -22), // Tikur Anbessa
        new THREE.Vector3(2, 24, 8), // Meskel
        new THREE.Vector3(24, 30, 26), // Bole Tower
        new THREE.Vector3(12, 26, -4), // Kazanchis
        new THREE.Vector3(-2, 34, -48),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-38, 22, 12), // Kilinto
        new THREE.Vector3(-18, 26, 30), // Gotera
        new THREE.Vector3(2, 20, 8), // Meskel
        new THREE.Vector3(-28, 24, -14), // St. Paul
        new THREE.Vector3(-38, 22, 12),
      ]),
    ];

    droneCurves.forEach((curve, idx) => {
      for (let d = 0; d < 2; d++) {
        const droneGroup = new THREE.Group();

        // Futuristic Carbon-Fiber Fuselage
        const bodyGeo = new THREE.BoxGeometry(1.6, 0.4, 2.2);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: idx === 0 ? 0x0284c7 : 0x10b981,
          metalness: 0.9,
          roughness: 0.2,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        droneGroup.add(body);

        // Cockpit canopy
        const canopyGeo = new THREE.BoxGeometry(1.0, 0.35, 1.2);
        const canopyMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 0.28, 0.2);
        droneGroup.add(canopy);

        // 4 Rotors
        const rotorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 8);
        const rotorMat = new THREE.MeshBasicMaterial({ color: 0x64748b, wireframe: true });
        const rotors: THREE.Mesh[] = [];

        [
          [-1.1, 0.25, -1.0],
          [1.1, 0.25, -1.0],
          [-1.1, 0.25, 1.0],
          [1.1, 0.25, 1.0],
        ].forEach(([rx, ry, rz]) => {
          const r = new THREE.Mesh(rotorGeo, rotorMat);
          r.position.set(rx, ry, rz);
          droneGroup.add(r);
          rotors.push(r);
        });

        // Glowing Drone Beacon
        const light = new THREE.PointLight(idx === 0 ? 0x38bdf8 : 0x10b981, 2.0, 16);
        light.position.y = -0.3;
        droneGroup.add(light);

        this.scene.add(droneGroup);

        this.drones.push({
          mesh: droneGroup,
          curve,
          progress: (d * 0.5 + idx * 0.25) % 1,
          speed: 0.045,
          rotors,
          light,
        });
      }
    });
  }

  // 3D Holographic Neural Beams (Agent Thought Conduits)
  private setupHolographicNeuralBeams() {
    // 3 Curving Arcs connecting Supervisor (Central) to Key Districts (Bole, Kazanchis, Gotera, Entoto)
    const arcPoints = [
      [new THREE.Vector3(0, 42, 0), new THREE.Vector3(14, 38, 12), new THREE.Vector3(28, 18, 22)], // to Bole
      [new THREE.Vector3(0, 42, 0), new THREE.Vector3(6, 35, -2), new THREE.Vector3(12, 22, -4)], // to Kazanchis
      [new THREE.Vector3(0, 42, 0), new THREE.Vector3(-10, 36, 16), new THREE.Vector3(-18, 15, 30)], // to Gotera
      [new THREE.Vector3(0, 42, 0), new THREE.Vector3(-1, 38, -26), new THREE.Vector3(-2, 24, -48)], // to Entoto
    ];

    arcPoints.forEach((pts, i) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.12, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x38bdf8 : 0xf59e0b,
        transparent: true,
        opacity: 0.35,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      this.neuralBeamsGroup.add(tube);

      // Moving Pulse Particle
      const pulseGeo = new THREE.SphereGeometry(0.45, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x38bdf8 : 0xf59e0b,
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      this.neuralBeamsGroup.add(pulse);

      this.neuralPulses.push({
        mesh: pulse,
        curve,
        progress: (i * 0.25) % 1,
      });
    });
  }

  private createRainSystem() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 90;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.45,
      transparent: true,
      opacity: 0.65,
    });

    this.rainParticles = new THREE.Points(geo, mat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  private createSelectionAura() {
    const geo = new THREE.RingGeometry(4, 5.2, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    this.selectionAura = new THREE.Mesh(geo, mat);
    this.selectionAura.rotation.x = -Math.PI / 2;
    this.selectionAura.position.y = 0.12;
    this.selectionAura.visible = false;
    this.scene.add(this.selectionAura);
  }

  // Shading / Heatmap Modes
  public setShadingMode(mode: VisualShadingMode) {
    this.currentShadingMode = mode;

    this.buildingMeshes.forEach((group, id) => {
      const bldData = this.buildingData.get(id);
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mode === 'thermal') {
            // Thermal energy grid mode: yellow / gold / orange based on power load
            const load = bldData?.occupancyOrLoadPct || 65;
            if (mesh.material && !Array.isArray(mesh.material)) {
              (mesh.material as THREE.MeshStandardMaterial).color.setHex(
                load > 80 ? 0xef4444 : load > 60 ? 0xf59e0b : 0xeab308
              );
            }
          } else if (mode === 'traffic') {
            // Cyan-monochrome city to emphasize road heatmaps
            if (mesh.material && !Array.isArray(mesh.material)) {
              (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x0f172a);
            }
          } else if (mode === 'cyberpunk') {
            // Cyberpunk ultra neon
            if (mesh.material && !Array.isArray(mesh.material)) {
              (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x0a0f1d);
            }
          } else {
            // Restore standard
            if (mesh.material && !Array.isArray(mesh.material)) {
              (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x1e293b);
            }
          }
        }
      });
    });

    // Update Roads for Traffic Heatmap
    this.roadMeshes.forEach((road) => {
      if (mode === 'traffic') {
        (road.material as THREE.MeshStandardMaterial).color.setHex(0xb91c1c); // Red congestion glow
      } else {
        (road.material as THREE.MeshStandardMaterial).color.setHex(0x111625);
      }
    });
  }

  public setWeatherRain(enable: boolean) {
    this.isRaining = enable;
    if (this.rainParticles) {
      this.rainParticles.visible = enable;
    }
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).density = enable ? 0.016 : 0.009;
    }
  }

  public updateIncidents(incidents: Incident[]) {
    const currentIds = new Set(incidents.map((i) => i.id));
    for (const [id, marker] of this.incidentMarkers) {
      if (!currentIds.has(id)) {
        this.scene.remove(marker);
        this.incidentMarkers.delete(id);
      }
    }

    for (const inc of incidents) {
      if (!this.incidentMarkers.has(inc.id) && !inc.resolved) {
        const markerGroup = new THREE.Group();
        markerGroup.position.set(inc.worldPosition[0], 0.2, inc.worldPosition[2]);

        const ringGeo = new THREE.RingGeometry(2.5, 3.2, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: inc.severity === 'CRITICAL' ? 0xef4444 : 0xf59e0b,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        markerGroup.add(ring);

        const beacon = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.2, 0),
          new THREE.MeshBasicMaterial({
            color: inc.severity === 'CRITICAL' ? 0xef4444 : 0xf59e0b,
            wireframe: true,
          })
        );
        beacon.position.y = 3.5;
        markerGroup.add(beacon);

        const light = new THREE.PointLight(
          inc.severity === 'CRITICAL' ? 0xef4444 : 0xf59e0b,
          2.0,
          16
        );
        light.position.y = 3.0;
        markerGroup.add(light);

        this.scene.add(markerGroup);
        this.incidentMarkers.set(inc.id, markerGroup);
      }
    }
  }

  // Camera Controls
  public toggleDroneCam(): boolean {
    this.droneCamMode = !this.droneCamMode;
    if (!this.droneCamMode) {
      this.resetOverviewCamera();
    }
    return this.droneCamMode;
  }

  public getIsDroneCam(): boolean {
    return this.droneCamMode;
  }

  public focusOnDistrict(districtId: DistrictId) {
    const dist = ETHIOPIAN_DISTRICTS.find((d) => d.id === districtId);
    if (!dist) return;

    this.droneCamMode = false;
    this.followingVehicle = null;
    this.targetCameraPos = new THREE.Vector3(
      dist.centerCoord[0] + 18,
      32,
      dist.centerCoord[1] + 30
    );
    this.targetLookAt = new THREE.Vector3(dist.centerCoord[0], 0, dist.centerCoord[1]);
  }

  public focusOnBuilding(buildingId: string) {
    const bld = this.buildingData.get(buildingId);
    if (!bld) return;

    this.droneCamMode = false;
    this.followingVehicle = null;
    this.targetCameraPos = new THREE.Vector3(
      bld.position[0] + 16,
      bld.height * 0.7 + 14,
      bld.position[2] + 24
    );
    this.targetLookAt = new THREE.Vector3(bld.position[0], bld.height * 0.4, bld.position[2]);
    this.selectBuilding(buildingId);
  }

  public focusOnIncident(incident: Incident) {
    this.droneCamMode = false;
    this.followingVehicle = null;
    this.targetCameraPos = new THREE.Vector3(
      incident.worldPosition[0] + 14,
      22,
      incident.worldPosition[2] + 20
    );
    this.targetLookAt = new THREE.Vector3(
      incident.worldPosition[0],
      1,
      incident.worldPosition[2]
    );
  }

  public followEmergencyVehicle() {
    this.droneCamMode = false;
    const em = this.vehicles.find((v) => v.isEmergency);
    if (em) {
      this.followingVehicle = em;
    }
  }

  public resetOverviewCamera() {
    this.droneCamMode = false;
    this.followingVehicle = null;
    this.targetCameraPos = new THREE.Vector3(0, 75, 110);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);
  }

  public selectBuilding(id: string | null) {
    this.selectedBuildingId = id;
    if (id && this.selectionAura) {
      const bldMesh = this.buildingMeshes.get(id);
      if (bldMesh) {
        this.selectionAura.position.set(bldMesh.position.x, 0.12, bldMesh.position.z);
        this.selectionAura.visible = true;
      }
    } else if (this.selectionAura) {
      this.selectionAura.visible = false;
    }

    const data = id ? this.buildingData.get(id) || null : null;
    this.callbacks.onBuildingSelect(data);
  }

  private onPointerMove(e: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerDown(_e: MouseEvent) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes: THREE.Object3D[] = [];
    this.buildingMeshes.forEach((group) => {
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          meshes.push(child);
        }
      });
    });

    const intersects = this.raycaster.intersectObjects(meshes, false);
    if (intersects.length > 0) {
      let curr: THREE.Object3D | null = intersects[0].object;
      while (curr && curr.parent && curr.parent !== this.scene) {
        curr = curr.parent;
      }
      if (curr && this.buildingMeshes.has(curr.name)) {
        this.selectBuilding(curr.name);
      }
    }
  }

  private onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate() {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.clock.update();
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsed();

    // 1. Vehicles
    for (const v of this.vehicles) {
      v.progress = (v.progress + v.speed * delta) % 1;
      const idx = v.progress * (v.path.length - 1);
      const curIdx = Math.floor(idx);
      const nextIdx = (curIdx + 1) % v.path.length;
      const subT = idx - curIdx;

      const p1 = v.path[curIdx];
      const p2 = v.path[nextIdx];
      _vec3.lerpVectors(p1, p2, subT);
      v.mesh.position.copy(_vec3);
      v.mesh.lookAt(p2.x, _vec3.y, p2.z);

      if (v.isEmergency && v.beaconLight) {
        const strobe = Math.sin(time * 16) > 0;
        v.beaconLight.color.setHex(strobe ? 0xef4444 : 0x38bdf8);
      }
    }

    // 2. Autonomous Drones Kinematics
    for (const drone of this.drones) {
      drone.progress = (drone.progress + drone.speed * delta) % 1;
      drone.curve.getPointAt(drone.progress, _dronePos);
      drone.mesh.position.copy(_dronePos);

      // Tangent for look-ahead
      const tangent = drone.curve.getTangentAt(drone.progress);
      _vec3.copy(_dronePos).add(tangent);
      drone.mesh.lookAt(_vec3);

      // Spin rotors
      for (const r of drone.rotors) {
        r.rotation.y += delta * 45;
      }
    }

    // 3. Maglev
    if (this.maglevTrain) {
      this.maglevProgress = (this.maglevProgress + 0.08 * delta) % 1;
      const x = Math.sin(this.maglevProgress * Math.PI * 2) * 38;
      const z = Math.cos(this.maglevProgress * Math.PI * 2) * 22 + 8;
      this.maglevTrain.position.set(x, 7.2, z);
      this.maglevTrain.rotation.y = -this.maglevProgress * Math.PI * 2 + Math.PI / 2;
    }

    // 4. Moving Neural Pulse Particles
    for (const pulse of this.neuralPulses) {
      pulse.progress = (pulse.progress + delta * 0.45) % 1;
      pulse.curve.getPointAt(pulse.progress, _vec3);
      pulse.mesh.position.copy(_vec3);
    }

    // 5. Rain particles
    if (this.isRaining && this.rainParticles) {
      const pos = this.rainParticles.geometry.attributes.position;
      for (let i = 0; i < this.rainCount; i++) {
        let y = pos.getY(i) - 65 * delta;
        if (y < 0) y = 90;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // 6. Incident markers
    for (const marker of this.incidentMarkers.values()) {
      marker.rotation.y += delta * 1.5;
      const beacon = marker.children[1];
      if (beacon) {
        beacon.position.y = 3.5 + Math.sin(time * 5) * 0.4;
      }
    }

    // 7. Camera follow: Drone-Eye Cockpit Cam OR Vehicle Follow OR Orbit Damping
    if (this.droneCamMode && this.drones.length > 0) {
      // First-person chase camera right behind drone 0
      const heroDrone = this.drones[0];
      const dPos = heroDrone.mesh.position;
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(heroDrone.mesh.quaternion);

      // Camera sits slightly above and behind the cockpit
      _camTarget.copy(dPos).sub(forward.clone().multiplyScalar(6)).add(new THREE.Vector3(0, 2.5, 0));
      this.camera.position.lerp(_camTarget, 0.12);

      const lookAhead = dPos.clone().add(forward.clone().multiplyScalar(15));
      this.controls.target.lerp(lookAhead, 0.15);
    } else if (this.followingVehicle) {
      const vPos = this.followingVehicle.mesh.position;
      _camTarget.set(vPos.x - 14, 18, vPos.z + 18);
      this.camera.position.lerp(_camTarget, 0.05);
      this.controls.target.lerp(vPos, 0.08);
    } else if (this.targetCameraPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetLookAt, 0.05);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.5) {
        this.targetCameraPos = null;
        this.targetLookAt = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);

    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
