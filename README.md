# STL Viewer

`cpp-core`를 중심으로 `web-viewer`, 향후 `wasm`, 그리고 다른 렌더러까지 확장할 수 있도록 설계하는 의료용 3D geometry project입니다.

## 실행

### 웹 뷰어

```powershell
npm.cmd run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

`npm.cmd run dev`는 아래 두 프로세스를 함께 실행합니다.

- Vite 기반 `web-viewer`
- 업로드된 STL을 `cpp-core`로 분석하는 로컬 backend

### C++ 코어

```powershell
g++ -std=c++17 -Icpp-core/include cpp-core/src/core/BoundingBox.cpp cpp-core/src/core/Mesh.cpp cpp-core/src/analysis/MeshAnalyzer.cpp cpp-core/src/io/STLLoader.cpp cpp-core/src/wasm/WasmExports.cpp cpp-core/cli/main.cpp -o cpp-core/bin/mesh_info_cli.exe
cpp-core/bin/mesh_info_cli.exe web-viewer/public/samples/cube_ascii.stl
```

## 현재 포함된 것

- `cpp-core/`: geometry parsing, analysis, wasm export 준비를 담당하는 C++ 코어
- `web-viewer/`: React + Three.js 기반 viewer frontend
- `backend/`: 현재 단계에서 `web-viewer`와 `cpp-core`를 연결하는 임시 로컬 브리지
- `docs/`: 구조, 정책, 요구사항, API 초안 문서

## 구조 방향

이 저장소는 장기적으로 아래 구조를 목표로 합니다.

```text
cpp-core
  ├─ core
  ├─ io
  ├─ analysis
  ├─ acceleration
  └─ wasm

web-viewer
  ├─ app
  ├─ viewer
  ├─ tools
  ├─ panels
  ├─ wasm
  └─ types
```

자세한 구조 설명은 [docs/PROJECT_STRUCTURE.md](C:/git/stl_viewer/docs/PROJECT_STRUCTURE.md)를 참고하면 됩니다.
