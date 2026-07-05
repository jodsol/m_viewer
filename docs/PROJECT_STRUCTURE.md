# Project Structure

## 목표

이 프로젝트는 장기적으로 범용 코어와 여러 프론트엔드를 갖는 구조를 목표로 합니다.

- `cpp-core`: 범용 코어
- `web-viewer`: Three.js 기반 프론트엔드
- `backend`: 현재 wasm 전환 전까지의 임시 브리지

## cpp-core 구조 철학

`cpp-core`는 처음부터 범용 코어 구조를 따르되, 현재 필요한 기능만 구현합니다.

즉:

- 폴더 구조는 넓게
- 구현은 얇게
- 과한 추상화는 미리 만들지 않기

## 현재 기준 구조

```text
cpp-core/
├── include/
│   ├── core/
│   │   ├── math/
│   │   ├── ecs/
│   │   ├── event/
│   │   └── memory/
│   ├── geometry/
│   ├── io/
│   ├── physics/
│   │   ├── collision/
│   │   ├── broadphase/
│   │   ├── narrowphase/
│   │   ├── raycast/
│   │   └── rigidbody/
│   ├── analysis/
│   └── wasm/
├── src/
│   ├── core/
│   ├── geometry/
│   ├── io/
│   ├── physics/
│   ├── analysis/
│   └── wasm/
├── cli/
└── tests/
```

## 현재 구현된 파일

### `core/math`

- `Vector3`
- `AABB`

### `geometry`

- `Mesh`
- `Triangle`

### `io`

- `STLLoader`

### `analysis`

- `MeshAnalyzer`
- `MeshAnalysisResult`

### `wasm`

- `WasmExports`

## 향후 자연스럽게 추가될 위치

### `core/math`

- `Matrix4`
- `Ray`
- `Frustum`

### `physics/raycast`

- `RaycastHit`
- `MeshRaycaster`

### `physics/broadphase`

- `BVH`
- `AABBTree`

### `physics/narrowphase`

- triangle intersection
- closest point query

## web-viewer와의 관계

현재 `web-viewer`는:

- 파일 로드
- Three.js 렌더링
- UI
- inspect / measure MVP

를 담당합니다.

장기적으로는:

```text
web-viewer
-> wasm bridge
-> cpp-core
-> raycast / analysis / geometry query
-> 결과를 UI에 반영
```

흐름으로 계산 책임이 점점 `cpp-core`로 내려가게 됩니다.
