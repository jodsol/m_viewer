export interface Bounds {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export interface MeshData {
  format: "STL" | "OBJ";
  positions: number[];
  vertexCount: number;
  triangleCount: number;
  bounds: Bounds;
  boundsText: string;
}

function makeBounds(): Bounds {
  return {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity
  };
}

function expandBounds(bounds: Bounds, x: number, y: number, z: number): void {
  bounds.minX = Math.min(bounds.minX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.minZ = Math.min(bounds.minZ, z);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.maxY = Math.max(bounds.maxY, y);
  bounds.maxZ = Math.max(bounds.maxZ, z);
}

function formatBounds(bounds: Bounds): string {
  return `(${bounds.minX.toFixed(2)}, ${bounds.minY.toFixed(2)}, ${bounds.minZ.toFixed(2)}) ~ (${bounds.maxX.toFixed(2)}, ${bounds.maxY.toFixed(2)}, ${bounds.maxZ.toFixed(2)})`;
}

function makeMeshResult(format: MeshData["format"], positions: number[], bounds: Bounds): MeshData {
  return {
    format,
    positions,
    vertexCount: positions.length / 3,
    triangleCount: positions.length / 9,
    bounds,
    boundsText: formatBounds(bounds)
  };
}

export function parseAsciiStl(text: string): MeshData {
  const matches = [...text.matchAll(/vertex\s+([-\d+.eE]+)\s+([-\d+.eE]+)\s+([-\d+.eE]+)/g)];
  if (matches.length < 3) {
    throw new Error("ASCII STL 정점을 찾지 못했습니다.");
  }

  const positions: number[] = [];
  const bounds = makeBounds();

  for (const match of matches) {
    const x = Number(match[1]);
    const y = Number(match[2]);
    const z = Number(match[3]);
    positions.push(x, y, z);
    expandBounds(bounds, x, y, z);
  }

  return makeMeshResult("STL", positions, bounds);
}

function looksLikeBinaryStl(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) {
    return false;
  }

  const view = new DataView(buffer);
  const triangleCount = view.getUint32(80, true);
  return 84 + triangleCount * 50 === buffer.byteLength;
}

function parseBinaryStl(buffer: ArrayBuffer): MeshData {
  const view = new DataView(buffer);

  if (buffer.byteLength < 84) {
    throw new Error("Binary STL 크기가 너무 작습니다.");
  }

  const triangleCount = view.getUint32(80, true);
  const expectedLength = 84 + triangleCount * 50;

  if (expectedLength > buffer.byteLength) {
    throw new Error("Binary STL 데이터 길이가 올바르지 않습니다.");
  }

  const positions: number[] = [];
  const bounds = makeBounds();

  for (let i = 0; i < triangleCount; i += 1) {
    const triangleOffset = 84 + i * 50 + 12;

    for (let vertex = 0; vertex < 3; vertex += 1) {
      const vertexOffset = triangleOffset + vertex * 12;
      const x = view.getFloat32(vertexOffset, true);
      const y = view.getFloat32(vertexOffset + 4, true);
      const z = view.getFloat32(vertexOffset + 8, true);

      positions.push(x, y, z);
      expandBounds(bounds, x, y, z);
    }
  }

  return makeMeshResult("STL", positions, bounds);
}

export function parseStl(input: string | ArrayBuffer): MeshData {
  if (typeof input === "string") {
    return parseAsciiStl(input);
  }

  if (looksLikeBinaryStl(input)) {
    return parseBinaryStl(input);
  }

  const text = new TextDecoder().decode(input);
  return parseAsciiStl(text);
}

export function parseObj(text: string): MeshData {
  const lines = text.split(/\r?\n/);
  const sourceVertices: [number, number, number][] = [];
  const positions: number[] = [];
  const bounds = makeBounds();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts[0] === "v" && parts.length >= 4) {
      const vertex: [number, number, number] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
      sourceVertices.push(vertex);
      expandBounds(bounds, vertex[0], vertex[1], vertex[2]);
      continue;
    }

    if (parts[0] === "f" && parts.length >= 4) {
      const faceIndices = parts.slice(1).map((entry) => Number(entry.split("/")[0]) - 1);
      for (let i = 1; i < faceIndices.length - 1; i += 1) {
        const tri = [faceIndices[0], faceIndices[i], faceIndices[i + 1]];
        tri.forEach((index) => {
          const vertex = sourceVertices[index];
          if (!vertex) {
            throw new Error("OBJ face가 존재하지 않는 vertex를 참조합니다.");
          }

          positions.push(vertex[0], vertex[1], vertex[2]);
        });
      }
    }
  }

  if (positions.length === 0) {
    throw new Error("OBJ face 데이터를 찾지 못했습니다.");
  }

  return makeMeshResult("OBJ", positions, bounds);
}
