import * as THREE from "three";

import type { PickInfo } from "../types/viewer";

export class PickingTool {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly canvas: HTMLCanvasElement;
  private readonly scene: THREE.Scene;
  private readonly onPickChange: (pickInfo: PickInfo | null) => void;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly marker: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  private readonly handlePointerDownBound: (event: PointerEvent) => void;

  private mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null = null;
  private enabled = true;

  constructor(options: {
    camera: THREE.PerspectiveCamera;
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    onPickChange: (pickInfo: PickInfo | null) => void;
  }) {
    this.camera = options.camera;
    this.canvas = options.canvas;
    this.scene = options.scene;
    this.onPickChange = options.onPickChange;

    this.marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshBasicMaterial({ color: "#ff5a36" })
    );
    this.marker.visible = false;
    this.scene.add(this.marker);

    this.handlePointerDownBound = (event: PointerEvent) => this.handlePointerDown(event);
    this.canvas.addEventListener("pointerdown", this.handlePointerDownBound);
  }

  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void {
    this.mesh = mesh;
    this.clearSelection();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearSelection();
    }
  }

  clearSelection(): void {
    this.marker.visible = false;
    this.onPickChange(null);
  }

  private handlePointerDown(event: PointerEvent): void {
    if (!this.enabled || !this.mesh) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersections = this.raycaster.intersectObject(this.mesh, false);

    if (intersections.length === 0) {
      this.clearSelection();
      return;
    }

    const pickedPoint = intersections[0].point;
    this.marker.position.copy(pickedPoint);
    this.marker.visible = true;
    this.onPickChange({
      x: pickedPoint.x,
      y: pickedPoint.y,
      z: pickedPoint.z
    });
  }

  dispose(): void {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDownBound);
    this.scene.remove(this.marker);
    this.marker.geometry.dispose();
    this.marker.material.dispose();
  }
}
