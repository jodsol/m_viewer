import type * as THREE from "three";

import { MeasurementTool } from "../tools/MeasurementTool";
import type { ModeController } from "./ModeController";

export class MeasureModeController implements ModeController {
  readonly id = "measure" as const;
  readonly statusMessage = "측정 모드입니다. 메시를 두 번 클릭해 거리를 측정하세요.";

  constructor(private readonly measurementTool: MeasurementTool) {}

  enter(): void {
    this.measurementTool.setEnabled(true);
  }

  exit(): void {
    this.measurementTool.setEnabled(false);
  }

  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void {
    this.measurementTool.setMesh(mesh);
  }

  dispose(): void {
    this.measurementTool.dispose();
  }
}
