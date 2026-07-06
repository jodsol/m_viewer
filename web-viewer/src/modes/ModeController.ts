import type * as THREE from "three";

import type { ViewerInteractionMode } from "../types/viewer";
import type { PickSource } from "../tools/PickQuery";

export interface ModeController {
  readonly id: ViewerInteractionMode;
  readonly statusMessage: string;
  enter(): void;
  exit(): void;
  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void;
  setPickSource?(source: PickSource | null): void;
  dispose(): void;
}
