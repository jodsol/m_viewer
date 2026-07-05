# Web Viewer Status

## 현재 구현된 기능

- Vite + React + TypeScript 기반 `web-viewer`
- Three.js 기반 메시 렌더링
- STL 로드
  - ASCII STL 파싱
  - Binary STL 파싱
- OBJ 로드
- OrbitControls 카메라 조작
- Wireframe 토글
- Bounding Box 표시 토글
- Section Plane 슬라이더
- PickingTool
  - 메시 클릭 좌표 표시
- MeasurementTool
  - 두 점 클릭 거리 측정
- Mesh Info 패널
- STL 업로드 시 `backend -> cpp-core` 분석 요청

## 현재 결정된 정책

- `SectionPlaneTool`은 아직 분리하지 않음
  - 현재는 슬라이더 기반 MVP 기능으로 유지
  - section 기능이 더 늘어날 때 tool/controller 분리 예정
- 측정 단위는 `unknown` 유지
  - 현재 측정값은 모델 좌표계 기준
  - 향후 mm 스케일 정책이나 메타데이터 연결 후 확정 예정
- Mesh Info 패널은 중간형으로 고도화
  - 파일명
  - 형식
  - 메시 수
  - 정점 수
  - 삼각형 수
  - 중심
  - 크기
  - 단위
  - bounds
  - 분석 소스
  - 현재 모드
  - 선택 좌표
  - 측정 거리

## 표준 데이터 구조

포맷 파서는 `GeometryDocument`를 반환합니다.

```ts
interface GeometryDocument {
  id: string;
  name: string;
  format: "STL" | "OBJ";
  meshes: GeometryMesh[];
  units: "mm" | "cm" | "unknown";
  metadata: Record<string, string | number>;
}
```

즉 viewer, tool, panel은 raw format이 아니라 표준 문서 모델만 바라봅니다.

## modes 계층

현재 구성:

- `modes/ModeController.ts`
- `modes/InspectModeController.ts`
- `modes/MeasureModeController.ts`
- `modes/createDefaultModeControllers.ts`

`MeshViewer`는 툴 개별 분기를 직접 들고 있지 않고:

- mode controller 등록
- 현재 모드 전환
- 메시 변경 시 controller에 mesh 전달

만 담당합니다.

## 현재 데이터 흐름

```text
파일 선택
-> loadGeometryDocument()
-> GeometryDocument 생성
-> MeshViewer.loadDocument()
-> ModeController.setMesh(...)
-> Three.js 렌더링
-> MeshInfoPanel 표시
```

STL 분석 값 일부는 추가로:

```text
web-viewer -> backend -> cpp-core
```

를 통해 받아와 panel 정보에 반영합니다.

## 다음 추천 작업

- `SectionModeController`가 필요해질 만큼 section 기능이 늘어나는지 판단
- `tools/ViewerTool` 공통 인터페이스 도입
- `mode registry` 외부 주입형 확장
- `GeometryDocument.metadata` 확장
  - 환자/케이스/스캔 정보
  - 단위 정책
  - 다중 메시 정보
- wasm 직결 시 `cpp-core` 결과를 `GeometryDocument` 계열로 직접 매핑
