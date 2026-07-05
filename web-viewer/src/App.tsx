import { useEffect, useRef, useState } from "react";

import { parseObj, parseStl } from "./parsers";
import { MeshViewer } from "./viewer";

interface MeshInfo {
  name: string;
  format: string;
  vertexCount: string | number;
  triangleCount: string | number;
  boundsText: string;
}

const defaultInfo: MeshInfo = {
  name: "-",
  format: "-",
  vertexCount: "-",
  triangleCount: "-",
  boundsText: "-"
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewerRef = useRef<MeshViewer | null>(null);
  const [status, setStatus] = useState("샘플 STL 또는 사용자 파일을 로드할 수 있습니다.");
  const [meshInfo, setMeshInfo] = useState<MeshInfo>(defaultInfo);
  const [wireframe, setWireframe] = useState(false);
  const [showBounds, setShowBounds] = useState(true);
  const [clipOffset, setClipOffset] = useState(1.5);

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    const viewer = new MeshViewer(canvasRef.current, setStatus);
    viewerRef.current = viewer;
    viewer.setBoundsVisible(showBounds);
    viewer.setClipOffset(clipOffset);

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

  function updateViewer(name: string, content: string | ArrayBuffer): void {
    const extension = name.split(".").pop()?.toLowerCase();
    const meshData = extension === "obj" ? parseObj(content as string) : parseStl(content);

    viewerRef.current?.loadMesh(meshData);
    viewerRef.current?.setBoundsVisible(showBounds);

    setMeshInfo({
      name,
      format: meshData.format,
      vertexCount: meshData.vertexCount,
      triangleCount: meshData.triangleCount,
      boundsText: meshData.boundsText
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      if (file.name.toLowerCase().endsWith(".obj")) {
        const text = await file.text();
        updateViewer(file.name, text);
        return;
      }

      const buffer = await file.arrayBuffer();
      updateViewer(file.name, buffer);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "파일을 읽지 못했습니다.");
    }
  }

  async function handleSampleLoad(): Promise<void> {
    try {
      const response = await fetch("/samples/cube_ascii.stl");
      const text = await response.text();
      updateViewer("cube_ascii.stl", text);
    } catch {
      setStatus("샘플 STL을 불러오지 못했습니다.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="panel">
        <h1>Medical 3D Viewer</h1>
        <p className="lead">React와 Three.js로 구성한 의료용 3D 메쉬 뷰어의 실행 가능한 시작점입니다.</p>

        <div className="control-group">
          <label htmlFor="file-input">파일 불러오기</label>
          <input id="file-input" type="file" accept=".stl,.obj" onChange={handleFileChange} />
          <button type="button" onClick={handleSampleLoad}>샘플 STL 로드</button>
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

        <div className="info-card">
          <h2>Mesh Info</h2>
          <dl>
            <InfoRow label="파일" value={meshInfo.name} />
            <InfoRow label="포맷" value={meshInfo.format} />
            <InfoRow label="Vertices" value={String(meshInfo.vertexCount)} />
            <InfoRow label="Triangles" value={String(meshInfo.triangleCount)} />
            <InfoRow label="Bounds" value={meshInfo.boundsText} />
          </dl>
        </div>
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
