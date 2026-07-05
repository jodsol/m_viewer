# 프로젝트 구조

## 개요

이 프로젝트는 `C++ Geometry Core`와 `JavaScript + Three.js Viewer`를 분리한 하이브리드 구조를 목표로 합니다.

핵심 의도는 다음과 같습니다.

- 메쉬 파싱, 분석, 기하 계산은 C++에서 담당
- 렌더링과 사용자 인터랙션은 웹 뷰어에서 담당
- 필요 시 WebAssembly로 두 레이어를 연결

## 전체 구조

```text
stl_viewer/

├── cpp-core/
│   ├── include/
│   ├── src/
│   ├── loaders/
│   ├── geometry/
│   ├── acceleration/
│   └── tests/
│
├── web-viewer/
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── viewer/
│   ├── tools/
│   └── styles/
│
├── shared/
│   └── types/
│
└── docs/
    ├── PROJECT_STRUCTURE.md
    └── FEATURES.md
```

## 레이어별 역할

### `cpp-core/`

3D 메쉬 데이터를 읽고 계산하는 코어 레이어입니다.

주요 책임:

- STL Loader
- OBJ Loader
- Mesh 데이터 구조 정의
- Vertex / Face 저장
- Bounding Box 계산
- Normal 계산 및 정리
- Triangle 수 계산
- BVH 생성
- Ray Casting 보조 로직
- 메쉬 분석용 유틸리티

### `web-viewer/`

브라우저에서 모델을 시각화하고 조작하는 레이어입니다.

주요 책임:

- 파일 업로드 UI
- Three.js Scene 구성
- Camera / OrbitControls
- Mesh 렌더링
- Material 전환
- Wireframe 토글
- Picking 시각화
- Section Plane 인터랙션
- 정보 패널 및 성능 표시

### `shared/`

가능하면 C++ 코어와 웹 뷰어 간에 공유할 타입 정의나 데이터 형식을 정리하는 공간입니다.

예시:

- mesh metadata
- bounding box format
- loader result schema

## C++ 코어 내부 구조

```text
cpp-core/

├── include/
│   ├── Mesh.h
│   ├── STLLoader.h
│   ├── OBJLoader.h
│   ├── BoundingBox.h
│   ├── BVH.h
│   └── Ray.h
│
├── src/
│   ├── Mesh.cpp
│   ├── STLLoader.cpp
│   ├── OBJLoader.cpp
│   ├── BoundingBox.cpp
│   ├── BVH.cpp
│   └── Ray.cpp
│
├── loaders/
├── geometry/
├── acceleration/
└── tests/
```

권장 구현 방향:

- `Mesh`는 정점, 인덱스, 노말, bounds 등 기본 정보를 관리
- `STLLoader`, `OBJLoader`는 파일 파싱 결과를 `Mesh`로 반환
- `BoundingBox`는 메쉬 전체 범위를 계산
- `BVH`는 Picking 가속 또는 Ray Intersection 최적화에 사용

## 웹 뷰어 내부 구조

```text
web-viewer/

├── src/
│   ├── main.js
│   ├── app.js
│   ├── scene.js
│   ├── renderer.js
│   └── camera.js
│
├── components/
│   ├── Toolbar.js
│   ├── InfoPanel.js
│   └── StatsPanel.js
│
├── viewer/
│   ├── ModelViewer.js
│   ├── PickingTool.js
│   ├── SectionPlaneTool.js
│   └── MaterialController.js
│
├── tools/
│   ├── measurement.js
│   └── meshInfo.js
│
└── public/
```

권장 구현 방향:

- `ModelViewer`는 scene, renderer, controls를 묶는 중심 모듈
- `PickingTool`은 클릭 기반 선택 기능 담당
- `SectionPlaneTool`은 clipping plane 제어 담당
- `InfoPanel`은 triangle 수, bounds, 파일명 등의 정보를 표시

## 데이터 흐름

```text
파일 업로드
    ↓
STL / OBJ 파싱
    ↓
Mesh 생성
    ↓
Bounds / 통계 계산
    ↓
Three.js Geometry 변환
    ↓
렌더링 및 인터랙션
```

WebAssembly를 사용하는 경우 데이터 흐름은 다음처럼 확장할 수 있습니다.

```text
파일 업로드
    ↓
Cpp Core Parsing / Analysis
    ↓
WebAssembly Interface
    ↓
JavaScript Viewer
    ↓
Three.js Rendering
```

## 설계 포인트

이 구조에서 가장 중요한 점은 단순히 `보여지는 화면`보다 `어떻게 3D 데이터를 처리하도록 설계했는가`를 드러내는 것입니다.

따라서 구현 시 아래를 분명히 가져가는 것이 좋습니다.

- Geometry 처리와 Rendering 처리를 분리
- 메쉬 관련 계산은 C++ 중심으로 설계
- 웹에서는 시각화와 조작 경험에 집중
- 문서와 README에서 이 역할 분리를 명확하게 설명
