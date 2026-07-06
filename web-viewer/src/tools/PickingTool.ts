import * as THREE from "three";

import type { PickHit } from "../types/viewer";
import type { PickQuery, PickSource, SceneRay } from "./PickQuery";

export class PickingTool {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly canvas: HTMLCanvasElement;
  private readonly scene: THREE.Scene;
  private readonly onPickChange: (pickHit: PickHit | null) => void;
  private readonly pointer = new THREE.Vector2();
  private readonly marker: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  private readonly handlePointerDownBound: (event: PointerEvent) => void;
  private readonly pickQuery: PickQuery;

  private enabled = true;

  constructor(options: {
    camera: THREE.PerspectiveCamera;
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    pickQuery: PickQuery;
    onPickChange: (pickHit: PickHit | null) => void;
  }) {
    this.camera = options.camera;
    this.canvas = options.canvas;
    this.scene = options.scene;
    this.pickQuery = options.pickQuery;
    this.onPickChange = options.onPickChange;

    this.marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshBasicMaterial({ color: "#ff5a36" })
    );
    this.marker.visible = false;
    this.scene.add(this.marker);

    this.handlePointerDownBound = (event: PointerEvent) => {
      void this.handlePointerDown(event);
    };
    this.canvas.addEventListener("pointerdown", this.handlePointerDownBound);
  }

  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void {
    this.pickQuery.setMesh(mesh);
    this.clearSelection();
  }

  setSource(source: PickSource | null): void {
    this.pickQuery.setSource(source);
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

  private makeSceneRay(event: PointerEvent): SceneRay {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(this.pointer.x, this.pointer.y, 0.5)
      .unproject(this.camera)
      .sub(this.camera.position)
      .normalize();

    origin.copy(this.camera.position);

    return {
      origin: { x: origin.x, y: origin.y, z: origin.z },
      direction: { x: direction.x, y: direction.y, z: direction.z }
    };
  }

  private async handlePointerDown(event: PointerEvent): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const pickedHit = await this.pickQuery.pick(this.makeSceneRay(event));
    if (!this.enabled) {
      return;
    }

    if (!pickedHit) {
      this.clearSelection();
      return;
    }

    this.marker.position.set(pickedHit.position.x, pickedHit.position.y, pickedHit.position.z);
    this.marker.visible = true;
    this.onPickChange(pickedHit);
  }

  dispose(): void {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDownBound);
    this.scene.remove(this.marker);
    this.marker.geometry.dispose();
    this.marker.material.dispose();
  }
}
