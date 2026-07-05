import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import type { GeometryDocument } from "../models/geometry";
import { createDefaultModeControllers } from "../modes/createDefaultModeControllers";
import type { ModeController } from "../modes/ModeController";
import type { MeasurementInfo, PickInfo, ViewerInteractionMode } from "../types/viewer";

export class MeshViewer {
  private readonly canvas: HTMLCanvasElement;
  private readonly onStatusChange: (message: string) => void;
  private readonly scene: THREE.Scene;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly clipPlane: THREE.Plane;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly modelGroup: THREE.Group;
  private readonly handleResizeBound: () => void;
  private readonly modeControllers: Map<ViewerInteractionMode, ModeController>;

  private mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | null = null;
  private boundsHelper: THREE.BoxHelper | null = null;
  private animationFrame: number | null = null;
  private interactionMode: ViewerInteractionMode = "inspect";

  constructor(
    canvas: HTMLCanvasElement,
    callbacks: {
      onStatusChange?: (message: string) => void;
      onPickChange?: (pickInfo: PickInfo | null) => void;
      onMeasurementChange?: (measurementInfo: MeasurementInfo | null) => void;
    } = {}
  ) {
    this.canvas = canvas;
    this.onStatusChange = callbacks.onStatusChange ?? (() => {});
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#f0ece2");

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.localClippingEnabled = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 5000);
    this.camera.position.set(2.2, 2.2, 2.2);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;

    this.clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10);
    this.material = new THREE.MeshStandardMaterial({
      color: "#d98f5c",
      metalness: 0.05,
      roughness: 0.72,
      clippingPlanes: [this.clipPlane],
      side: THREE.DoubleSide
    });

    this.modelGroup = new THREE.Group();
    this.modeControllers = new Map(
      createDefaultModeControllers({
        camera: this.camera,
        canvas: this.canvas,
        scene: this.scene,
        onPickChange: callbacks.onPickChange ?? (() => {}),
        onMeasurementChange: callbacks.onMeasurementChange ?? (() => {})
      }).map((controller) => [controller.id, controller])
    );

    this.addSceneHelpers();
    this.scene.add(this.modelGroup);
    this.handleResize();
    this.handleResizeBound = () => this.handleResize();
    window.addEventListener("resize", this.handleResizeBound);
    this.activateMode(this.interactionMode, false);
    this.animate();
  }

  private addSceneHelpers(): void {
    this.scene.add(new THREE.AmbientLight("#ffffff", 1.8));

    const keyLight = new THREE.DirectionalLight("#fff5df", 2.2);
    keyLight.position.set(4, 6, 3);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#d4f0ff", 1.2);
    fillLight.position.set(-3, 2, -4);
    this.scene.add(fillLight);

    const grid = new THREE.GridHelper(10, 20, "#5b7c99", "#cad6df");
    this.scene.add(grid);

    const axes = new THREE.AxesHelper(1.2);
    this.scene.add(axes);
  }

  private handleResize(): void {
    const width = this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || 1;
    const height = this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private getModeController(mode: ViewerInteractionMode): ModeController {
    const controller = this.modeControllers.get(mode);
    if (!controller) {
      throw new Error(`등록되지 않은 모드입니다: ${mode}`);
    }
    return controller;
  }

  private activateMode(mode: ViewerInteractionMode, updateStatus: boolean): void {
    for (const controller of this.modeControllers.values()) {
      if (controller.id === mode) {
        controller.enter();
      } else {
        controller.exit();
      }
    }

    if (updateStatus) {
      this.onStatusChange(this.getModeController(mode).statusMessage);
    }
  }

  private updateModeMeshes(): void {
    for (const controller of this.modeControllers.values()) {
      controller.setMesh(this.mesh);
    }
  }

  setInteractionMode(mode: ViewerInteractionMode): void {
    this.interactionMode = mode;
    this.activateMode(mode, true);
  }

  getInteractionMode(): ViewerInteractionMode {
    return this.interactionMode;
  }

  getAvailableModes(): ViewerInteractionMode[] {
    return [...this.modeControllers.keys()];
  }

  setWireframe(enabled: boolean): void {
    this.material.wireframe = enabled;
  }

  setBoundsVisible(visible: boolean): void {
    if (this.boundsHelper) {
      this.boundsHelper.visible = visible;
    }
  }

  setClipOffset(value: number): void {
    this.clipPlane.constant = value;
  }

  loadDocument(document: GeometryDocument): void {
    const primaryMesh = document.meshes[0];
    if (!primaryMesh) {
      throw new Error("렌더링할 메시가 없습니다.");
    }

    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.modelGroup.remove(this.mesh);
    }

    if (this.boundsHelper) {
      this.boundsHelper.geometry.dispose();
      if (Array.isArray(this.boundsHelper.material)) {
        this.boundsHelper.material.forEach((material) => material.dispose());
      } else {
        this.boundsHelper.material.dispose();
      }
      this.modelGroup.remove(this.boundsHelper);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(primaryMesh.positions, 3));
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.center();
    geometry.computeBoundingSphere();

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.modelGroup.add(this.mesh);
    this.updateModeMeshes();

    this.boundsHelper = new THREE.BoxHelper(this.mesh, "#0b6e4f");
    this.modelGroup.add(this.boundsHelper);

    const radius = Math.max(geometry.boundingSphere?.radius ?? 0, 1);
    this.camera.position.set(radius * 2.8, radius * 2.1, radius * 2.8);
    this.camera.near = Math.max(radius / 100, 0.01);
    this.camera.far = radius * 200;
    this.camera.updateProjectionMatrix();

    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.handleResize();
    this.activateMode(this.interactionMode, false);
    this.onStatusChange(`${document.format} 메시를 렌더링했습니다.`);
  }

  private animate(): void {
    this.animationFrame = window.requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    if (this.animationFrame !== null) {
      window.cancelAnimationFrame(this.animationFrame);
    }

    window.removeEventListener("resize", this.handleResizeBound);
    for (const controller of this.modeControllers.values()) {
      controller.dispose();
    }
    this.controls.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
