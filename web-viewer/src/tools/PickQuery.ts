import type * as THREE from "three";

import type { PickHit, PickInfo } from "../types/viewer";

export interface SceneRay {
  origin: PickInfo;
  direction: PickInfo;
}

export interface PickSource {
  format: "STL" | "OBJ";
  payloadBase64?: string;
}

export interface PickQuery {
  setMesh(mesh: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> | null): void;
  setSource(source: PickSource | null): void;
  pick(ray: SceneRay): Promise<PickHit | null>;
}
