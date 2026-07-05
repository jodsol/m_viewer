import type { MeasurementInfo, MeshInfo, PickInfo, ViewerInteractionMode } from "../types/viewer";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatPickInfo(pickInfo: PickInfo | null): string {
  if (!pickInfo) {
    return "-";
  }

  return `(${pickInfo.x.toFixed(2)}, ${pickInfo.y.toFixed(2)}, ${pickInfo.z.toFixed(2)})`;
}

function formatMeasurementInfo(measurementInfo: MeasurementInfo | null, units: string): string {
  if (!measurementInfo) {
    return "-";
  }

  return `${measurementInfo.distance.toFixed(2)} ${units}`;
}

function formatInteractionMode(mode: ViewerInteractionMode): string {
  return mode === "measure" ? "Measure" : "Inspect";
}

export function MeshInfoPanel({
  meshInfo,
  pickInfo,
  measurementInfo,
  interactionMode
}: {
  meshInfo: MeshInfo;
  pickInfo: PickInfo | null;
  measurementInfo: MeasurementInfo | null;
  interactionMode: ViewerInteractionMode;
}) {
  return (
    <div className="info-card">
      <h2>Mesh Info</h2>
      <dl>
        <InfoRow label="파일" value={meshInfo.name} />
        <InfoRow label="형식" value={meshInfo.format} />
        <InfoRow label="메시 수" value={String(meshInfo.meshCount)} />
        <InfoRow label="정점 수" value={String(meshInfo.vertexCount)} />
        <InfoRow label="삼각형 수" value={String(meshInfo.triangleCount)} />
        <InfoRow label="중심" value={meshInfo.centerText} />
        <InfoRow label="크기" value={meshInfo.sizeText} />
        <InfoRow label="단위" value={meshInfo.units} />
        <InfoRow label="Bounds" value={meshInfo.boundsText} />
        <InfoRow label="분석" value={meshInfo.source} />
        <InfoRow label="모드" value={formatInteractionMode(interactionMode)} />
        <InfoRow label="선택 좌표" value={formatPickInfo(pickInfo)} />
        <InfoRow label="측정 거리" value={formatMeasurementInfo(measurementInfo, meshInfo.units)} />
      </dl>
    </div>
  );
}
