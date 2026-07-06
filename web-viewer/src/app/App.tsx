import { useEffect, useRef, useState } from "react";

import type { GeometryDocument } from "../models/geometry";
import { formatBounds, formatCenter, formatSize } from "../models/geometry";
import { MeshInfoPanel } from "../panels/MeshInfoPanel";
import type { PickSource } from "../tools/PickQuery";
import type { MeasurementInfo, MeshInfo, PickHit, ViewerInteractionMode } from "../types/viewer";
import { MeshViewer } from "../viewer/MeshViewer";
import { loadGeometryDocument } from "./parsers";

const defaultInfo: MeshInfo = {
  name: "-",
  format: "-",
  meshCount: "-",
  vertexCount: "-",
  triangleCount: "-",
  centerText: "-",
  sizeText: "-",
  boundsText: "-",
  source: "-",
  units: "unknown"
};

const interactionModes: Array<{ value: ViewerInteractionMode; label: string }> = [
  { value: "inspect", label: "Inspect" },
  { value: "measure", label: "Measure" }
];

function makeMeshInfo(document: GeometryDocument, source: string): MeshInfo {
  const primaryMesh = document.meshes[0];
  if (!primaryMesh) {
    return defaultInfo;
  }

  return {
    name: document.name,
    format: document.format,
    meshCount: document.meshes.length,
    vertexCount: primaryMesh.vertexCount,
    triangleCount: primaryMesh.triangleCount,
    centerText: formatCenter(primaryMesh.bounds),
    sizeText: formatSize(primaryMesh.bounds),
    boundsText: formatBounds(primaryMesh.bounds),
    source,
    units: document.units
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function textToBase64(text: string): string {
  return arrayBufferToBase64(new TextEncoder().encode(text).buffer);
}

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<MeshViewer | null>(null);
  const [status, setStatus] = useState("샘플 STL 또는 사용자 파일을 로드할 수 있습니다.");
  const [meshInfo, setMeshInfo] = useState<MeshInfo>(defaultInfo);
  const [pickHit, setPickHit] = useState<PickHit | null>(null);
  const [measurementInfo, setMeasurementInfo] = useState<MeasurementInfo | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [showBounds, setShowBounds] = useState(true);
  const [interactionMode, setInteractionMode] = useState<ViewerInteractionMode>("inspect");
  const [clipOffset, setClipOffset] = useState(1.5);

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    const viewer = new MeshViewer(canvasRef.current, {
      onStatusChange: setStatus,
      onPickChange: setPickHit,
      onMeasurementChange: setMeasurementInfo
    });

    viewerRef.current = viewer;
    viewer.setBoundsVisible(showBounds);
    viewer.setClipOffset(clipOffset);
    viewer.setInteractionMode(interactionMode);

    return () => {
      viewer.dispose();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewerRef.current?.setWireframe(wireframe);
  }, [wireframe]);

  useEffect(() => {
    viewerRef.current?.setBoundsVisible(showBounds);
  }, [showBounds]);

  useEffect(() => {
    viewerRef.current?.setClipOffset(clipOffset);
  }, [clipOffset]);

  useEffect(() => {
    viewerRef.current?.setInteractionMode(interactionMode);
  }, [interactionMode]);

  function updateViewer(document: GeometryDocument, pickSource: PickSource | null): void {
    viewerRef.current?.loadDocument(document);
    viewerRef.current?.setBoundsVisible(showBounds);
    viewerRef.current?.setInteractionMode(interactionMode);
    viewerRef.current?.setPickSource(pickSource);

    setMeshInfo(makeMeshInfo(document, document.format === "OBJ" ? "TypeScript" : "TypeScript + cpp-core"));
    setPickHit(null);
    setMeasurementInfo(null);
  }

  async function analyzeWithCppCore(file: File): Promise<void> {
    if (!file.name.toLowerCase().endsWith(".stl")) {
      return;
    }

    try {
      const response = await fetch("/api/analyze-stl", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream"
        },
        body: await file.arrayBuffer()
      });

      if (!response.ok) {
        throw new Error("cpp-core 분석 요청이 실패했습니다.");
      }

      const analysis = (await response.json()) as {
        triangleCount: number;
        vertexCount: number;
        bounds: {
          min: { x: number; y: number; z: number };
          max: { x: number; y: number; z: number };
        };
      };

      setMeshInfo((previous) => ({
        ...previous,
        vertexCount: analysis.vertexCount,
        triangleCount: analysis.triangleCount,
        centerText: `(${((analysis.bounds.min.x + analysis.bounds.max.x) / 2).toFixed(2)}, ${((analysis.bounds.min.y + analysis.bounds.max.y) / 2).toFixed(2)}, ${((analysis.bounds.min.z + analysis.bounds.max.z) / 2).toFixed(2)})`,
        sizeText: `${(analysis.bounds.max.x - analysis.bounds.min.x).toFixed(2)} x ${(analysis.bounds.max.y - analysis.bounds.min.y).toFixed(2)} x ${(analysis.bounds.max.z - analysis.bounds.min.z).toFixed(2)}`,
        boundsText: `(${analysis.bounds.min.x.toFixed(2)}, ${analysis.bounds.min.y.toFixed(2)}, ${analysis.bounds.min.z.toFixed(2)}) ~ (${analysis.bounds.max.x.toFixed(2)}, ${analysis.bounds.max.y.toFixed(2)}, ${analysis.bounds.max.z.toFixed(2)})`,
        source: "cpp-core"
      }));
      setStatus("STL 메시를 로드했고 cpp-core 분석까지 완료했습니다.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "cpp-core 분석에 실패했습니다.");
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      if (file.name.toLowerCase().endsWith(".obj")) {
        const text = await file.text();
        updateViewer(loadGeometryDocument(file.name, text), { format: "OBJ" });
        return;
      }

      const buffer = await file.arrayBuffer();
      updateViewer(loadGeometryDocument(file.name, buffer), {
        format: "STL",
        payloadBase64: arrayBufferToBase64(buffer)
      });
      await analyzeWithCppCore(file);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "파일을 읽지 못했습니다.");
    }
  }

  async function handleSampleLoad(): Promise<void> {
    try {
      const response = await fetch("/samples/cube_ascii.stl");
      const text = await response.text();
      updateViewer(loadGeometryDocument("cube_ascii.stl", text), {
        format: "STL",
        payloadBase64: textToBase64(text)
      });
    } catch {
      setStatus("샘플 STL을 불러오지 못했습니다.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="panel">
        <h1>Medical 3D Viewer</h1>
        <p className="lead">React와 Three.js로 구성한 의료용 3D 메시 뷰어의 실행 가능한 시작점입니다.</p>

        <div className="control-group">
          <label htmlFor="file-input">파일 불러오기</label>
          <input id="file-input" type="file" accept=".stl,.obj" onChange={handleFileChange} />
          <button type="button" onClick={handleSampleLoad}>샘플 STL 로드</button>
        </div>

        <div className="control-group">
          <label htmlFor="interaction-mode">Interaction Mode</label>
          <select
            id="interaction-mode"
            value={interactionMode}
            onChange={(event) => setInteractionMode(event.currentTarget.value as ViewerInteractionMode)}
          >
            {interactionModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={wireframe}
              onChange={(event) => setWireframe(event.target.checked)}
            />
            <span>Wireframe</span>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={showBounds}
              onChange={(event) => setShowBounds(event.target.checked)}
            />
            <span>Bounding Box</span>
          </label>
        </div>

        <div className="control-group">
          <label htmlFor="clip-slider">Section Plane</label>
          <input
            id="clip-slider"
            type="range"
            min="-10"
            max="10"
            step="0.01"
            value={clipOffset}
            onInput={(event) => setClipOffset(Number(event.currentTarget.value))}
            onChange={(event) => setClipOffset(Number(event.currentTarget.value))}
          />
          <div className="range-caption">Offset: {clipOffset.toFixed(2)}</div>
        </div>

        <MeshInfoPanel
          meshInfo={meshInfo}
          pickHit={pickHit}
          measurementInfo={measurementInfo}
          interactionMode={interactionMode}
        />
      </aside>

      <main className="viewer-area">
        <canvas id="viewer-canvas" ref={canvasRef}></canvas>
        <div className="viewer-overlay">
          <span>{status}</span>
        </div>
      </main>
    </div>
  );
}
