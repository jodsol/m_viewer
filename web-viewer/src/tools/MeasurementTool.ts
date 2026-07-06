import * as THREE from "three";

import type { MeasurementInfo } from "../types/viewer";
import type { PickQuery, PickSource, SceneRay } from "./PickQuery";

export class MeasurementTool {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly canvas: HTMLCanvasElement;
  private readonly scene: THREE.Scene;
  private readonly onMeasurementChange: (measurementInfo: MeasurementInfo | null) => void;
  private readonly pointer = new THREE.Vector2();
  private readonly startMarker: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  private readonly endMarker: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  private readonly line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private readonly handlePointerDownBound: (event: PointerEvent) => void;
  private readonly pickQuery: PickQuery;

  private enabled = false;
  private startPoint: THREE.Vector3 | null = null;

  constructor(options: {
    camera: THREE.PerspectiveCamera;
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    pickQuery: PickQuery;
    onMeasurementChange: (measurementInfo: MeasurementInfo | null) => void;
  }) {
    this.camera = options.camera;
    this.canvas = options.canvas;
    this.scene = options.scene;
    this.pickQuery = options.pickQuery;
    this.onMeasurementChange = options.onMeasurementChange;

    this.startMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      new THREE.MeshBasicMaterial({ color: "#0b6e4f" })
    );
    this.startMarker.visible = false;
    this.scene.add(this.startMarker);

    this.endMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      new THREE.MeshBasicMaterial({ color: "#ff5a36" })
    );
    this.endMarker.visible = false;
    this.scene.add(this.endMarker);

    this.line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({ color: "#1d4ed8" })
    );
    this.line.visible = false;
    this.scene.add(this.line);

    this.handlePointerDownBound = (event: PointerEvent) => {
      void this.handlePointerDown(event);
    };
    this.canvas.addEventListener("pointerdown", this.handlePointerDownBound);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearMeasurement();
    }
  }

  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void {
    this.pickQuery.setMesh(mesh);
    this.clearMeasurement();
  }

  setSource(source: PickSource | null): void {
    this.pickQuery.setSource(source);
  }

  clearMeasurement(): void {
    this.startPoint = null;
    this.startMarker.visible = false;
    this.endMarker.visible = false;
    this.line.visible = false;
    this.onMeasurementChange(null);
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
    if (!this.enabled || !pickedHit) {
      return;
    }

    const point = new THREE.Vector3(pickedHit.position.x, pickedHit.position.y, pickedHit.position.z);

    if (!this.startPoint) {
      this.startPoint = point;
      this.startMarker.position.copy(point);
      this.startMarker.visible = true;
      this.endMarker.visible = false;
      this.line.visible = false;
      this.onMeasurementChange(null);
      return;
    }

    this.endMarker.position.copy(point);
    this.endMarker.visible = true;
    this.line.geometry.setFromPoints([this.startPoint, point]);
    this.line.visible = true;

    this.onMeasurementChange({
      start: {
        x: this.startPoint.x,
        y: this.startPoint.y,
        z: this.startPoint.z
      },
      end: {
        x: point.x,
        y: point.y,
        z: point.z
      },
      distance: this.startPoint.distanceTo(point)
    });

    this.startPoint = null;
  }

  dispose(): void {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDownBound);
    this.scene.remove(this.startMarker);
    this.scene.remove(this.endMarker);
    this.scene.remove(this.line);
    this.startMarker.geometry.dispose();
    this.startMarker.material.dispose();
    this.endMarker.geometry.dispose();
    this.endMarker.material.dispose();
    this.line.geometry.dispose();
    this.line.material.dispose();
  }
}
