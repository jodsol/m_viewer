import type { MeasurementInfo, MeshInfo, PickHit, ViewerInteractionMode } from "../types/viewer";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatPickPosition(pickHit: PickHit | null): string {
  if (!pickHit) {
    return "-";
  }

  return `(${pickHit.position.x.toFixed(2)}, ${pickHit.position.y.toFixed(2)}, ${pickHit.position.z.toFixed(2)})`;
}

function formatTriangleIndex(pickHit: PickHit | null): string {
  if (!pickHit) {
    return "-";
  }

  return String(pickHit.triangleIndex);
}

function formatHitDistance(pickHit: PickHit | null, units: string): string {
  if (!pickHit) {
    return "-";
  }

  return `${pickHit.distance.toFixed(2)} ${units}`;
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
  pickHit,
  measurementInfo,
  interactionMode
}: {
  meshInfo: MeshInfo;
  pickHit: PickHit | null;
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
        <InfoRow label="분석 경로" value={meshInfo.source} />
        <InfoRow label="모드" value={formatInteractionMode(interactionMode)} />
        <InfoRow label="선택 좌표" value={formatPickPosition(pickHit)} />
        <InfoRow label="Triangle Index" value={formatTriangleIndex(pickHit)} />
        <InfoRow label="Hit Distance" value={formatHitDistance(pickHit, meshInfo.units)} />
        <InfoRow label="측정 거리" value={formatMeasurementInfo(measurementInfo, meshInfo.units)} />
      </dl>
    </div>
  );
}
