# cpp-core 요구사항 정리

## 문서 목적

이 문서는 `cpp-core`가 어떤 책임을 가져야 하는지, 현재 단계와 이후 WebAssembly 전환 단계에서 무엇이 들어가야 하는지를 정리한 문서입니다.

핵심 질문은 다음과 같습니다.

- `cpp-core`는 왜 존재하는가
- `web-viewer`와 무엇을 나눠 가져야 하는가
- 지금 당장 어떤 기능까지 넣어야 하는가
- 나중에 WebAssembly 전환을 위해 무엇을 준비해야 하는가

## 1. cpp-core의 역할

`cpp-core`는 렌더링 엔진이 아니라 `지오메트리 / 메쉬 처리 코어`입니다.

즉 역할은 다음과 같습니다.

- STL / OBJ 같은 3D 파일 형식 처리
- 메쉬 데이터 구조 관리
- triangle / vertex / bounds 같은 통계 계산
- ray, BVH, picking 가속 같은 기하 계산
- 향후 WebAssembly 전환 시 브라우저에서 호출할 계산 엔진 역할

## 2. web-viewer와의 역할 분리

### cpp-core가 맡아야 할 것

- 파일 파싱
- 메쉬 검증
- 메쉬 통계
- Bounding Box 계산
- Normal 관련 계산
- BVH
- Ray intersection
- 메쉬 분석용 유틸리티

### web-viewer가 맡아야 할 것

- UI
- scene 관리
- camera / controls
- material
- section plane UI
- picking 결과 시각화
- 상태 표시

즉:

- `cpp-core` = 계산
- `web-viewer` = 시각화

## 3. 현재 단계에서 반드시 들어가야 할 것

현재는 viewer MVP를 우선 완성하는 단계이므로, `cpp-core`는 아래 범위까지만 명확히 동작하면 충분합니다.

### 필수

- STL 로더
- ASCII STL 지원
- Binary STL 지원
- Triangle 수 계산
- Vertex 수 계산
- Bounding Box 계산
- JSON 형태 결과 출력 또는 구조화된 결과 반환

### 권장

- 잘못된 STL 데이터 에러 처리
- 파일 열기 실패 처리
- triangle이 하나도 없는 경우 예외 처리

## 4. 현재 단계에서 아직 없어도 되는 것

지금 당장 없어도 되는 기능은 아래와 같습니다.

- OBJ 로더
- BVH
- ray casting
- distance measurement
- vertex / index 압축
- 메쉬 최적화
- 정교한 topology 분석

이 항목들은 후속 단계에서 추가해도 충분합니다.

## 5. 현재 코드 구조에서 필요한 방향

현재 `cpp-core`는 CLI 실행 파일 형태로 시작되어 있습니다.  
이건 디버깅과 초기 검증에는 유리하지만, 장기적으로는 코어와 진입점을 분리해야 합니다.

필요한 방향은 아래와 같습니다.

- 코어 로직은 `src/`에 유지
- 실행용 진입점은 별도로 유지
- 나중에 wasm export 진입점을 별도 파일로 분리

즉 구조는 점점 아래처럼 가야 합니다.

```text
cpp-core/
  include/
  src/
  cli/
  wasm/
  tests/
```

## 6. STLLoader에 요구되는 기능

STLLoader는 현재 가장 중요한 컴포넌트입니다.

### 현재 필수 요구사항

- file path 기반 로딩
- ASCII STL 파싱
- Binary STL 파싱
- `Mesh` 객체 반환

### 이후 요구사항

- memory buffer 기반 로딩
- 파일 경로 없이도 `ArrayBuffer` 수준 입력 처리
- wasm 친화적인 API 제공

예시 방향:

```cpp
Mesh load(const std::string& filePath) const;
Mesh loadFromMemory(const unsigned char* data, std::size_t size) const;
```

## 7. Mesh 구조에 필요한 것

`Mesh`는 단순 컨테이너가 아니라 최소한 아래 정보를 안정적으로 담을 수 있어야 합니다.

- triangle 목록 또는 vertex/index 데이터
- triangle count
- vertex count
- bounds

이후 확장을 생각하면 아래도 고려할 수 있습니다.

- normals
- indices
- center
- bounding sphere
- mesh name

## 8. BoundingBox에 필요한 것

BoundingBox는 `cpp-core`의 가장 기본적인 분석 결과입니다.

필수 요구사항:

- point를 반복적으로 확장할 수 있어야 한다
- min / max가 항상 유효해야 한다
- 초기화되지 않은 상태를 명확히 표현해야 한다

추후 확장:

- size 계산
- center 계산
- diagonal length 계산

## 9. 출력 형식 요구사항

현재는 backend 연동 때문에 `cpp-core`가 결과를 JSON으로 내보내고 있습니다.  
이건 임시 연결에는 적절합니다.

현재 단계 요구사항:

- triangleCount
- vertexCount
- bounds.min
- bounds.max

예시:

```json
{
  "triangleCount": 12,
  "vertexCount": 36,
  "bounds": {
    "min": { "x": 0, "y": 0, "z": 0 },
    "max": { "x": 1, "y": 1, "z": 1 }
  }
}
```

나중에 wasm 전환 후에는 콘솔 출력보다 메모리 기반 반환 구조로 바뀌어야 합니다.

## 10. 디버깅 가능성 요구사항

`cpp-core`는 나중에도 독립적으로 디버깅 가능해야 합니다.

그래서 아래를 유지하는 것이 좋습니다.

- CLI 실행 경로 유지
- 샘플 STL 파일로 단독 테스트 가능
- 디버그 빌드 가능
- gdb 또는 IDE 디버깅 가능

즉 wasm 전환 후에도 CLI 경로를 완전히 없애지 않는 것이 좋습니다.

## 11. 테스트 관점 요구사항

최소한 아래 케이스는 커버되어야 합니다.

- 정상 ASCII STL
- 정상 Binary STL
- triangle 0개인 STL
- 잘못된 길이의 Binary STL
- 존재하지 않는 파일 경로

이건 나중에 단위 테스트 또는 샘플 기반 테스트로 확장하면 좋습니다.

## 12. backend 연동 기준에서 cpp-core 요구사항

현재 backend 연동 구조에서는 아래 조건이 중요합니다.

- 실행 시간이 너무 길지 않아야 한다
- stdout은 파싱 가능한 형식이어야 한다
- stderr는 오류 메시지에 집중해야 한다
- 실패 시 exit code가 0이 아니어야 한다

즉 `backend`가 호출하기 쉬운 CLI 특성을 유지해야 합니다.

## 13. WebAssembly 전환을 위해 반드시 준비해야 할 것

backend를 제거하고 wasm으로 가려면 아래가 필요합니다.

### 필수

- file path 기반 API와 별도로 memory 기반 API 추가
- `main.cpp` 의존도 축소
- export 함수 설계
- 결과를 함수 호출로 읽을 수 있는 구조 준비

### 권장

- OBJ 파서도 같은 방식으로 분리
- 결과 타입 통일
- geometry 반환 전략 설계

## 14. 최종 목표 구조에서의 cpp-core

최종적으로 `cpp-core`는 아래처럼 설명될 수 있어야 합니다.

> STL / OBJ 메쉬 데이터를 파싱하고, bounds, triangle 수, vertex 수, 가속 구조 등 기하 분석을 담당하는 C++ 코어이며, 필요 시 WebAssembly로 컴파일되어 web-viewer에서 직접 호출된다.

이 설명이 가능해지면 `cpp-core`는 단순 보조 코드가 아니라, 프로젝트의 핵심 기반 자산이 됩니다.
