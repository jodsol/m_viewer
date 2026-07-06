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
│   │   └── math/
│   ├── geometry/
│   ├── io/
│   ├── physics/
│   │   └── raycast/
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

### `physics/raycast`

- `Ray`
- `RaycastHit`
- `MeshRaycaster`

### `analysis`

- `MeshAnalyzer`
- `MeshAnalysisResult`

### `wasm`

- `WasmExports`

## 현재 기능 개발 상태

raycast의 첫 단계가 들어갔습니다.

- `MeshRaycaster`는 메시 전체 triangle을 순회하는 기본 raycast를 수행합니다.
- 현재는 BVH 없는 선형 탐색입니다.
- 다음 단계에서 inspect 기능을 이 raycast API에 연결할 수 있습니다.

## 다음 추천 작업

- `MeshRaycaster` 테스트 추가
- `Ray` 정규화 정책 정의
- `RaycastHit`를 wasm/JS 친화적으로 내보내는 API 설계
- 이후 inspect를 core 기반으로 전환
