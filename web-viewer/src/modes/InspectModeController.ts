import type * as THREE from "three";

import { PickingTool } from "../tools/PickingTool";
import type { ModeController } from "./ModeController";

export class InspectModeController implements ModeController {
  readonly id = "inspect" as const;
  readonly statusMessage = "선택 모드입니다. 메시를 클릭해 좌표를 확인하세요.";

  constructor(private readonly pickingTool: PickingTool) {}

  enter(): void {
    this.pickingTool.setEnabled(true);
  }

  exit(): void {
    this.pickingTool.setEnabled(false);
  }

  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void {
    this.pickingTool.setMesh(mesh);
  }

  dispose(): void {
    this.pickingTool.dispose();
  }
}
