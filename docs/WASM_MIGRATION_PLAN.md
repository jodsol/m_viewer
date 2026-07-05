# WebAssembly 전환 시 cpp-core 구조 변경 계획

## 문서 목적

이 문서는 나중에 `cpp-core`를 WebAssembly 기반으로 전환할 때 어떤 구조 변경이 필요한지 정리한 문서입니다.

목표는 다음과 같습니다.

- 현재의 `local backend bridge`를 임시 구조로만 유지
- 최종적으로 `C++ -> WebAssembly -> web-viewer` 구조로 전환
- `cpp-core`를 CLI 프로그램이 아니라 브라우저에서 호출 가능한 코어로 재구성

## 1. 현재 구조와 목표 구조

### 현재 구조

```text
web-viewer
  ↓
local backend
  ↓
cpp-core exe
```

특징:

- 브라우저가 C++를 직접 실행하지 않음
- backend가 STL 파일을 받아 임시 파일로 저장
- `mesh_info_cli.exe`를 실행해 결과를 JSON으로 받음

### 목표 구조

```text
web-viewer
  ↓
wasm bridge
  ↓
cpp-core compiled with Emscripten
```

특징:

- 브라우저가 `.wasm` 모듈을 직접 로드
- JavaScript / TypeScript가 wasm export 함수를 직접 호출
- backend 없이도 C++ 코어를 웹에서 사용 가능

## 2. 왜 cpp-core 구조를 바꿔야 하는가

현재 `cpp-core`는 CLI 프로그램 중심 구조입니다.

예를 들어:

- `main.cpp`가 진입점 역할
- 파일 경로를 인자로 받음
- 콘솔 출력으로 결과를 반환

하지만 WebAssembly에서는 이런 구조보다 아래가 필요합니다.

- 함수 단위 API
- 파일 경로 대신 메모리 버퍼 입력
- 콘솔 출력 대신 구조화된 결과 반환

즉 WebAssembly 전환의 핵심은:

> `실행 파일 구조`에서 `라이브러리 구조`로 바꾸는 것

## 3. cpp-core에서 필요한 구조 변화

### 현재 상태

```text
main.cpp
  ↓
STLLoader::load(filePath)
  ↓
Mesh 생성
  ↓
콘솔 출력
```

### 바뀌어야 할 상태

```text
parseStlFromMemory(buffer, size)
  ↓
Mesh 생성
  ↓
분석 결과 반환
```

즉, 파일 경로 기반 API보다 메모리 기반 API가 필요합니다.

## 4. 권장 폴더 구조

WebAssembly 전환 이후 권장 구조는 아래와 같습니다.

```text
cpp-core/

├── include/
│   ├── Mesh.h
│   ├── BoundingBox.h
│   ├── STLLoader.h
│   └── WasmExports.h
│
├── src/
│   ├── Mesh.cpp
│   ├── BoundingBox.cpp
│   ├── STLLoader.cpp
│   └── WasmExports.cpp
│
├── cli/
│   └── main.cpp
│
├── wasm/
│   ├── build_wasm.bat
│   ├── build_wasm.ps1
│   └── emcc flags 정리
│
└── tests/
```

핵심 아이디어:

- `src/`는 공통 코어 로직
- `cli/`는 디버깅용 실행 파일 진입점
- `wasm/`은 브라우저용 빌드 스크립트

이렇게 나누면 CLI와 wasm이 같은 코어를 공유할 수 있습니다.

## 5. STLLoader에서 바뀌어야 할 점

현재는 아래 개념이 중심입니다.

- file path 입력
- file stream 기반 파싱

WebAssembly 전환을 위해서는 아래를 추가해야 합니다.

- memory buffer 기반 파싱
- `const unsigned char* data`, `size_t size` 같은 입력

예시 방향:

```cpp
Mesh loadFromMemory(const unsigned char* data, std::size_t size);
Mesh loadAsciiFromMemory(const char* text, std::size_t size);
Mesh loadBinaryFromMemory(const unsigned char* data, std::size_t size);
```

이렇게 하면 브라우저에서 업로드한 STL `ArrayBuffer`를 바로 C++로 넘길 수 있습니다.

## 6. main.cpp의 역할 축소

현재 `main.cpp`는 실질적인 진입점입니다.  
WebAssembly 전환 후에는 이 파일의 중요도가 낮아져야 합니다.

추천 방향:

- `main.cpp`는 CLI 디버깅 전용으로 유지
- wasm에서는 `main.cpp`를 사용하지 않음
- 대신 export 함수가 진입점이 됨

즉:

- CLI용 진입점
- wasm용 진입점

을 분리해야 합니다.

## 7. WebAssembly export 함수 설계

가장 중요한 부분입니다.  
브라우저에서 C++를 직접 호출하려면 export 함수가 필요합니다.

초기 단계에서는 너무 복잡하게 가지 말고, 아래 정도면 충분합니다.

### 1차 export 목표

- STL 버퍼 입력
- Triangle 수 반환
- Vertex 수 반환
- Bounds 반환

예시 개념:

```cpp
extern "C" {
  int analyze_stl(const unsigned char* data, int size);
  int get_triangle_count();
  int get_vertex_count();
  float get_bounds_min_x();
  float get_bounds_min_y();
  float get_bounds_min_z();
  float get_bounds_max_x();
  float get_bounds_max_y();
  float get_bounds_max_z();
}
```

처음에는 이런 단순 API가 구현과 디버깅이 쉽습니다.

### 2차 export 목표

- 정점 배열 포인터 반환
- 인덱스 배열 반환
- 노말 배열 반환

이 단계까지 가면 렌더링용 geometry도 C++ 쪽에서 넘길 수 있습니다.

## 8. JavaScript / TypeScript에서 바뀌는 점

현재는 `parsers.ts`가 STL을 직접 파싱합니다.

WebAssembly 전환 후에는 역할이 이렇게 바뀝니다.

### 현재

```text
ArrayBuffer
  ↓
TypeScript parser
  ↓
Mesh data
```

### 전환 후

```text
ArrayBuffer
  ↓
WASM memory copy
  ↓
cpp-core analyze / parse
  ↓
JS wrapper
  ↓
Mesh data
```

즉 `parsers.ts`는 없어지거나, wasm 호출 래퍼 역할로 축소됩니다.

## 9. web-viewer에 추가될 파일

권장 예시는 아래와 같습니다.

```text
web-viewer/src/wasm/

├── cppCore.ts
├── cppCoreTypes.ts
└── loadCppCore.ts
```

역할:

- `loadCppCore.ts`: wasm 모듈 로딩
- `cppCore.ts`: export 함수 호출 래퍼
- `cppCoreTypes.ts`: 결과 타입 정의

예를 들어 `cppCore.ts`는 이런 역할을 합니다.

- wasm 메모리 할당
- 업로드한 STL 버퍼 복사
- `analyze_stl` 호출
- 결과 읽기
- JS 객체로 반환

## 10. backend 제거 시점

backend는 다음 조건이 만족되면 제거해도 됩니다.

- wasm 빌드가 안정적이다
- STL 분석 결과가 browser-only 경로로 나온다
- TypeScript 래퍼가 정상 동작한다
- viewer가 backend 없이도 완전히 동작한다

그 전까지는 backend를 남겨두는 것이 안전합니다.

## 11. 단계별 전환 순서

추천 전환 순서는 아래와 같습니다.

1. `cpp-core`를 file path 기반 + memory 기반 API 둘 다 지원하게 만든다
2. `main.cpp`를 CLI 전용으로 축소한다
3. wasm export 함수 파일을 분리한다
4. Emscripten으로 `.wasm`과 JS glue 코드를 빌드한다
5. web-viewer에서 wasm 모듈을 로드한다
6. STL 분석을 backend 대신 wasm으로 수행한다
7. backend를 제거한다

## 12. 우선순위가 높은 cpp-core 변경 항목

가장 먼저 바꿔야 할 것은 아래입니다.

- `STLLoader`에 memory buffer 입력 추가
- `main.cpp` 의존도 낮추기
- export 함수 진입점 설계
- 결과를 구조적으로 반환할 방법 정리

그 다음 항목은 아래입니다.

- vertex / index / normal 반환 API
- OBJ 지원 확장
- BVH 등 고급 기능 이관

## 13. 최종 목표

최종적으로는 아래 설명이 가능해야 합니다.

> React와 Three.js로 뷰어를 구현했고, STL 파싱과 메쉬 분석은 C++ 코어를 Emscripten으로 WebAssembly로 컴파일해 브라우저에서 직접 호출하도록 구성했습니다.

이 구조가 되면:

- C++
- WebAssembly
- TypeScript
- Three.js
- 3D 데이터 처리

를 한 프로젝트 안에서 모두 자연스럽게 설명할 수 있습니다.
