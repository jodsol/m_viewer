# cpp-core API 설계 초안

## 문서 목적

이 문서는 `cpp-core`를 단순 CLI 프로그램이 아니라 재사용 가능한 코어 라이브러리로 만들기 위한 API 초안을 정리한 문서입니다.

핵심 목적은 다음과 같습니다.

- 현재 backend 연동 단계에서 어떤 API가 필요한지 정리
- 나중에 WebAssembly 전환 시 어떤 API가 필요한지 정리
- `cpp-core` 내부 구조와 외부 노출 인터페이스를 분리

즉 이 문서는 구현 코드보다 `외부에서 cpp-core를 어떻게 호출할 것인가`를 정의하기 위한 초안입니다.

## 1. 설계 원칙

API는 아래 원칙을 따라야 합니다.

### 1. 코어와 진입점을 분리한다

- `Mesh`, `STLLoader`, `BoundingBox` 같은 코어 타입은 재사용 가능해야 한다.
- CLI용 `main.cpp`는 코어 API를 호출하는 얇은 진입점이어야 한다.
- 나중에 wasm export도 같은 코어 API를 호출해야 한다.

### 2. 파일 기반 API와 메모리 기반 API를 분리한다

- 현재 backend 연동에는 file path 기반 API가 유용하다.
- WebAssembly 전환에는 memory buffer 기반 API가 필수다.
- 두 API는 공통 코어 로직을 공유해야 한다.

### 3. 출력은 구조화되어야 한다

- CLI에서는 JSON 출력이 가능해야 한다.
- 내부 코어에서는 구조체 기반 결과를 우선 사용해야 한다.
- wasm에서는 함수 호출 기반 결과 접근이 가능해야 한다.

### 4. 렌더링보다 분석 API를 먼저 안정화한다

- 초기 단계에서는 triangle 수, vertex 수, bounds 같은 분석 API를 우선한다.
- geometry array 반환은 후속 단계로 둔다.

## 2. API 계층 구조

`cpp-core` API는 크게 3층으로 나누는 것이 좋습니다.

### 1. Core Layer

순수 C++ 로직

- `Mesh`
- `BoundingBox`
- `STLLoader`
- 향후 `OBJLoader`, `BVH`, `Ray`

### 2. Service Layer

외부 호출을 위한 고수준 API

- `analyzeStlFile(...)`
- `analyzeStlMemory(...)`
- 향후 `parseStlGeometry(...)`

### 3. Entry Layer

호출 환경별 진입점

- CLI entry
- backend bridge
- wasm export

## 3. 권장 타입 초안

### Vector3

```cpp
struct Vector3 {
    double x;
    double y;
    double z;
};
```

역할:

- bounds
- vertex
- center
- ray 관련 계산

### BoundingBox

```cpp
struct BoundingBox {
    Vector3 min;
    Vector3 max;
    bool initialized;

    void expand(const Vector3& point);
};
```

권장 추가 함수:

```cpp
Vector3 center() const;
Vector3 size() const;
double diagonalLength() const;
```

### Mesh

현재는 triangle 중심 구조이지만, 향후 확장을 고려하면 아래 방향이 좋습니다.

```cpp
class Mesh {
public:
    void addTriangle(const Triangle& triangle);
    std::size_t triangleCount() const;
    std::size_t vertexCount() const;
    const BoundingBox& bounds() const;

private:
    std::vector<Triangle> triangles_;
    BoundingBox bounds_;
};
```

향후 확장 후보:

- normals
- indices
- cached center
- cached bounding sphere

## 4. 분석 결과 타입 초안

현재 backend와 wasm 양쪽에서 모두 재사용할 수 있도록, 먼저 분석 결과 타입을 분리하는 것이 좋습니다.

```cpp
struct MeshAnalysisResult {
    std::size_t triangleCount;
    std::size_t vertexCount;
    BoundingBox bounds;
};
```

향후 확장:

```cpp
struct MeshAnalysisResult {
    std::size_t triangleCount;
    std::size_t vertexCount;
    BoundingBox bounds;
    bool hasNormals;
    bool isBinaryStl;
};
```

이 타입은:

- CLI JSON 출력 원본
- backend 응답 원본
- wasm export 내부 상태 저장용

으로 재사용할 수 있습니다.

## 5. STLLoader API 초안

현재 구조보다 조금 더 명시적으로 나누는 것이 좋습니다.

### 현재에 가까운 형태

```cpp
class STLLoader {
public:
    Mesh load(const std::string& filePath) const;

private:
    Mesh loadAscii(std::istream& input) const;
    Mesh loadBinary(std::istream& input) const;
};
```

### 권장 확장 형태

```cpp
class STLLoader {
public:
    Mesh loadFromFile(const std::string& filePath) const;
    Mesh loadFromMemory(const unsigned char* data, std::size_t size) const;

private:
    Mesh loadAscii(std::istream& input) const;
    Mesh loadBinary(std::istream& input) const;
    Mesh loadAsciiFromMemory(const char* text, std::size_t size) const;
    Mesh loadBinaryFromMemory(const unsigned char* data, std::size_t size) const;
};
```

이 구조의 장점:

- backend에서는 `loadFromFile()`
- wasm에서는 `loadFromMemory()`

를 호출할 수 있습니다.

## 6. 분석 서비스 API 초안

`STLLoader`는 파서 역할에 집중하고, 외부에서 호출하기 좋은 서비스 API를 따로 두는 것이 좋습니다.

예시:

```cpp
class MeshAnalyzer {
public:
    MeshAnalysisResult analyzeStlFile(const std::string& filePath) const;
    MeshAnalysisResult analyzeStlMemory(const unsigned char* data, std::size_t size) const;
};
```

또는 함수 중심으로 단순하게:

```cpp
MeshAnalysisResult analyzeStlFile(const std::string& filePath);
MeshAnalysisResult analyzeStlMemory(const unsigned char* data, std::size_t size);
```

초기 단계에서는 함수형 API가 더 가볍고 구현이 쉽습니다.

## 7. CLI API 초안

CLI는 코어 로직을 직접 구현하지 말고, 서비스 API를 호출하는 얇은 계층이어야 합니다.

예시:

```cpp
int main(int argc, char** argv) {
    MeshAnalysisResult result = analyzeStlFile(argv[1]);
    printJson(result);
}
```

즉 CLI의 책임은 아래까지만 유지하는 것이 좋습니다.

- 인자 파싱
- 예외 처리
- JSON 출력

## 8. backend 연동용 API 초안

현재 backend는 `mesh_info_cli.exe`를 실행하고 stdout의 JSON을 읽습니다.

이 방식은 당장 쓸 수 있지만, 장기적으로는 약간 불편합니다.

현재 유지 가능한 형태:

```text
backend
  ↓
mesh_info_cli.exe <tempfile.stl>
  ↓
JSON stdout
```

이후 개선 가능한 형태:

- backend가 직접 라이브러리 호출
- 혹은 wasm 전환 후 backend 제거

지금 단계에서는 CLI JSON 출력 API만 안정화해도 충분합니다.

## 9. wasm export API 초안

WebAssembly에서는 일반 C++ 클래스 메서드보다 C 스타일 export 함수가 더 다루기 쉽습니다.

1차 목표는 분석 결과만 제공하는 것입니다.

```cpp
extern "C" {
    int analyze_stl(const unsigned char* data, int size);
    int get_triangle_count();
    int get_vertex_count();
    double get_bounds_min_x();
    double get_bounds_min_y();
    double get_bounds_min_z();
    double get_bounds_max_x();
    double get_bounds_max_y();
    double get_bounds_max_z();
}
```

이 방식의 장점:

- JS/TS에서 호출이 단순하다
- 상태를 내부 static 결과로 보관할 수 있다
- 초기 디버깅이 쉽다

단점:

- 상태 기반 API라 확장성이 떨어질 수 있다
- 여러 메쉬를 동시에 다루기엔 불편하다

그래서 1차는 이 방식으로 가고, 나중에 handle 기반 API로 확장하는 것이 좋습니다.

## 10. handle 기반 API 초안

장기적으로는 여러 결과를 동시에 관리할 수 있는 handle 기반 API가 더 좋습니다.

예시:

```cpp
extern "C" {
    int analyze_stl(const unsigned char* data, int size);
    void release_analysis(int handle);
    int get_triangle_count(int handle);
    int get_vertex_count(int handle);
    double get_bounds_min_x(int handle);
    double get_bounds_min_y(int handle);
    double get_bounds_min_z(int handle);
    double get_bounds_max_x(int handle);
    double get_bounds_max_y(int handle);
    double get_bounds_max_z(int handle);
}
```

이 구조는:

- 여러 파일을 동시에 다루기 쉬움
- 상태 충돌을 줄임
- 향후 geometry 데이터까지 확장하기 좋음

## 11. geometry 반환 API 초안

현재 단계에서는 아직 필요하지 않지만, 결국 wasm 구조로 가면 이 부분을 고민해야 합니다.

초기 방식:

- 분석 결과만 cpp-core에서 반환
- geometry는 web-viewer가 계속 직접 생성

이후 확장 방식:

```cpp
extern "C" {
    int parse_stl_geometry(const unsigned char* data, int size);
    const float* get_positions_ptr(int handle);
    int get_positions_count(int handle);
}
```

다만 이 단계는 메모리 관리가 복잡해지므로 나중에 가는 것이 좋습니다.

## 12. 에러 처리 API 초안

외부에서 호출 가능한 API는 실패를 명확히 표현해야 합니다.

### CLI

- 예외 발생 시 stderr 출력
- exit code != 0

### wasm

권장 방식:

```cpp
extern "C" {
    int analyze_stl(const unsigned char* data, int size);
    const char* get_last_error();
}
```

이렇게 하면 JS에서 실패 원인을 읽을 수 있습니다.

## 13. 권장 파일 분리 초안

```text
cpp-core/

├── include/
│   ├── Mesh.h
│   ├── BoundingBox.h
│   ├── STLLoader.h
│   ├── MeshAnalysisResult.h
│   ├── MeshAnalyzer.h
│   └── WasmExports.h
│
├── src/
│   ├── Mesh.cpp
│   ├── BoundingBox.cpp
│   ├── STLLoader.cpp
│   ├── MeshAnalyzer.cpp
│   └── WasmExports.cpp
│
├── cli/
│   └── main.cpp
│
└── tests/
```

핵심은:

- 파싱 책임
- 분석 책임
- wasm export 책임
- CLI 책임

을 나누는 것입니다.

## 14. 지금 당장 우선 설계해야 할 API

지금 단계에서 가장 먼저 확정해야 할 것은 아래입니다.

1. `MeshAnalysisResult`
2. `analyzeStlFile(...)`
3. `analyzeStlMemory(...)`
4. CLI JSON 출력 형식
5. 향후 wasm용 `analyze_stl(...)` 함수 시그니처

이 5개가 정리되면:

- backend 유지도 쉬워지고
- wasm 전환도 쉬워집니다

## 15. 최종 권장 방향

정리하면 `cpp-core` API는 아래 3단계로 가는 것이 가장 좋습니다.

### 현재

- CLI JSON 출력 API
- backend가 CLI 실행

### 다음

- 서비스 함수 API
- memory buffer 기반 분석 API 추가

### 최종

- wasm export API
- web-viewer가 직접 호출

이 흐름으로 가면 지금 만든 구조를 버리지 않고 점진적으로 발전시킬 수 있습니다.
