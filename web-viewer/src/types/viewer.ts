export type ViewerInteractionMode = "inspect" | "measure";

export interface MeshInfo {
  name: string;
  format: string;
  meshCount: string | number;
  vertexCount: string | number;
  triangleCount: string | number;
  centerText: string;
  sizeText: string;
  boundsText: string;
  source: string;
  units: string;
}

export interface PickInfo {
  x: number;
  y: number;
  z: number;
}

export interface PickHit {
  position: PickInfo;
  triangleIndex: number;
  distance: number;
}

export interface MeasurementInfo {
  start: PickInfo;
  end: PickInfo;
  distance: number;
}
