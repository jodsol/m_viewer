export type GeometryFormat = "STL" | "OBJ";
export type GeometryUnit = "mm" | "cm" | "unknown";

export interface Bounds {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export interface GeometryMesh {
  id: string;
  name: string;
  positions: Float32Array;
  vertexCount: number;
  triangleCount: number;
  bounds: Bounds;
}

export interface GeometryDocument {
  id: string;
  name: string;
  format: GeometryFormat;
  meshes: GeometryMesh[];
  units: GeometryUnit;
  metadata: Record<string, string | number>;
}

export function formatBounds(bounds: Bounds): string {
  return `(${bounds.minX.toFixed(2)}, ${bounds.minY.toFixed(2)}, ${bounds.minZ.toFixed(2)}) ~ (${bounds.maxX.toFixed(2)}, ${bounds.maxY.toFixed(2)}, ${bounds.maxZ.toFixed(2)})`;
}

export function formatCenter(bounds: Bounds): string {
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  return `(${centerX.toFixed(2)}, ${centerY.toFixed(2)}, ${centerZ.toFixed(2)})`;
}

export function formatSize(bounds: Bounds): string {
  const sizeX = bounds.maxX - bounds.minX;
  const sizeY = bounds.maxY - bounds.minY;
  const sizeZ = bounds.maxZ - bounds.minZ;
  return `${sizeX.toFixed(2)} x ${sizeY.toFixed(2)} x ${sizeZ.toFixed(2)}`;
}
