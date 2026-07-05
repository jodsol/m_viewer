# STL Viewer

`React + Three.js + Vite + TypeScript` 기반 웹 뷰어를 중심으로 시작하는 의료용 3D 메쉬 뷰어 프로젝트입니다.

## 실행

### 웹 뷰어

```powershell
npm.cmd install
npm.cmd run dev
```

브라우저에서 Vite가 안내하는 로컬 주소로 접속합니다. 기본값은 `http://localhost:3000`입니다.

### C++ 코어

```powershell
g++ -std=c++17 -Icpp-core/include cpp-core/src/BoundingBox.cpp cpp-core/src/Mesh.cpp cpp-core/src/STLLoader.cpp cpp-core/src/main.cpp -o cpp-core/bin/mesh_info_cli.exe
cpp-core/bin/mesh_info_cli.exe samples/cube_ascii.stl
```

## 현재 포함된 것

- `web-viewer/`: React UI와 Three.js 렌더링으로 구성된 Vite 기반 웹 뷰어
- `cpp-core/`: ASCII STL을 파싱하고 메쉬 통계를 출력하는 최소 실행형 C++ 코어
- `docs/`: 프로젝트 구조와 구현 기능 문서
