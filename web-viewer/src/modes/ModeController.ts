import type * as THREE from "three";

import type { ViewerInteractionMode } from "../types/viewer";

export interface ModeController {
  readonly id: ViewerInteractionMode;
  readonly statusMessage: string;
  enter(): void;
  exit(): void;
  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void;
  dispose(): void;
}
