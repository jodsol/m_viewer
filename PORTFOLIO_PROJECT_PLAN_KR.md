# Medical 3D Viewer 포트폴리오 프로젝트 기획서

## 1. 프로젝트 개요

**프로젝트명**  
Medical 3D Viewer

**한 줄 소개**  
STL, OBJ와 같은 의료용 3D 메쉬 데이터를 불러오고 분석하고 렌더링할 수 있도록, `C++ 지오메트리 엔진`과 `JavaScript + Three.js 웹 뷰어`를 결합한 하이브리드 그래픽스 프로젝트입니다.

**목표**  
이 프로젝트의 목표는 다음 역량을 포트폴리오에서 설득력 있게 보여주는 것입니다.

- C++
- WebGL / Three.js
- 3D 그래픽스 프로그래밍
- 메쉬 데이터 처리
- 렌더링 중심 애플리케이션 설계

즉, 단순한 웹 프론트엔드 프로젝트가 아니라 실제 3D 데이터를 다루는 그래픽 애플리케이션을 설계하고 구현할 수 있다는 점을 보여주는 것이 핵심입니다.

## 2. 왜 이 프로젝트가 좋은가

이 프로젝트는 다음과 같은 역량을 함께 요구하는 직무와 잘 맞습니다.

- C++
- WebGL
- GPU 및 그래픽스에 대한 이해
- 3D 애플리케이션 개발 경험

중요한 점은 이 프로젝트를 단순히 `Three.js로 만든 3D 뷰어`로 보이게 하지 않는 것입니다.  
대신 다음처럼 포지셔닝할 수 있습니다.

> C++ 기반 지오메트리 코어와 웹 기반 시각화 레이어를 결합한 의료용 3D 그래픽 애플리케이션

이 설명은 그래픽스 엔지니어 성격의 면접에서 훨씬 더 강한 인상을 줍니다.

## 3. 프로젝트 컨셉

프로젝트는 아래와 같은 하이브리드 구조를 갖습니다.

```text
                C++
         (Geometry Engine Core)

                  ↓

      STL / OBJ Parsing and Analysis
      Mesh Data Structure
      Bounding Box
      BVH
      Ray Casting
      Mesh Utilities

                  ↓

      WebAssembly 또는 명확한 모듈 경계

                  ↓

       JavaScript + Three.js Viewer

                  ↓

           WebGL Rendering and UI
```

이 구조를 통해 메쉬 처리 로직과 렌더링/UI 로직을 분리해서 설계했다는 점을 분명하게 보여줄 수 있습니다.

## 4. 레이어별 역할

### C++ Geometry Core

C++ 영역은 데이터 처리와 지오메트리 연산을 담당합니다.

- STL Loader
- OBJ Loader
- Mesh 데이터 구조
- Vertex / Face 저장 구조
- Normal 처리
- Bounding Box 계산
- Triangle 수 및 메쉬 통계 계산
- BVH 생성
- Ray Intersection 지원
- 간단한 메쉬 전처리 및 정리 유틸리티

### JavaScript / Three.js Viewer

웹 뷰어는 시각화와 사용자 인터랙션을 담당합니다.

- 파일 입력 UI
- Scene 초기화
- 카메라 제어
- OrbitControls 적용
- Three.js Mesh 생성
- Material 전환
- Wireframe 토글
- Picking 시각화
- Clipping / Section Plane UI
- 거리 측정 UI
- FPS 및 메쉬 정보 패널 표시

## 5. 사용자 시나리오

이 뷰어는 의료용 메쉬 데이터를 가볍게 확인하고 분석하는 도구를 목표로 합니다.

예시 시나리오는 다음과 같습니다.

1. 사용자가 치아 STL 파일을 업로드합니다.
2. 시스템이 메쉬를 파싱하고 기본 메타데이터를 계산합니다.
3. 브라우저에서 Three.js를 통해 모델을 렌더링합니다.
4. 사용자는 회전, 확대, 축소를 하며 모델을 확인합니다.
5. 필요에 따라 Wireframe, Section Plane, Picking 기능을 사용합니다.
6. Triangle 수, Bounding Box, 메쉬 정보 등을 확인합니다.

이 흐름은 의료 3D 데이터를 다루는 회사와 자연스럽게 연결되는 도메인 스토리를 만들어 줍니다.

## 6. MVP 범위

추천하는 MVP는 현실적인 구현 가능성과 면접 설득력을 함께 고려한 범위입니다.

### 필수 기능

- STL 파일 로드
- OBJ 파일 로드
- Orbit 카메라 제어
- Solid / Wireframe 모드 전환
- 메쉬 정보 패널
- Triangle 수 표시
- Bounding Box 시각화
- Picking
- Section Plane
- FPS 표시

### 추가하면 좋은 기능

- 거리 측정
- BVH 기반 Picking 가속
- 메쉬 분석 요약
- 대용량 메쉬 로딩 최적화
- 여러 모델 동시 표시

## 7. 권장 기술 범위

3~4주 안에 완성도를 높이기 위해서는 아래 항목을 우선해야 합니다.

- 안정적인 메쉬 로딩
- 깔끔한 뷰어 인터랙션
- Geometry 로직과 Rendering 로직의 명확한 분리
- 그래픽스 / 지오메트리 이해를 보여주는 구현

반대로, 초반부터 고급 렌더링 기능에 범위를 넓히는 것은 피하는 편이 좋습니다.

예를 들어 아래 기능은 분명 인상적이지만, 완성 전에 반드시 넣어야 하는 핵심은 아닙니다.

- LOD
- Frustum Culling
- GPU Instancing
- Occlusion Culling
- Deferred Rendering
- Shadow Mapping

이 기능들은 멋지지만, 이번 포트폴리오의 핵심 메시지인 `의료용 메쉬 데이터를 다루는 그래픽 애플리케이션`보다 우선순위가 높지는 않습니다.

## 8. 제안 아키텍처

```text
medical-3d-viewer/

├── cpp-core/
│   ├── STL Loader
│   ├── OBJ Loader
│   ├── Mesh Class
│   ├── Bounding Box
│   ├── BVH
│   └── Geometry Utilities
│
├── web-viewer/
│   ├── Three.js Scene
│   ├── UI Controls
│   ├── Viewer Logic
│   ├── Picking
│   └── Section Plane
│
└── README.md
```

시간이 허락하면 C++ 모듈을 WebAssembly로 빌드해 웹 뷰어에서 직접 호출하는 구조까지 확장할 수 있습니다.  
만약 일정상 어렵다면, 우선은 `C++ 지오메트리 엔진 설계`와 `웹 시각화 레이어 설계`를 분리해서 보여주는 것만으로도 충분히 좋은 포트폴리오가 됩니다.

## 9. 이 포트폴리오의 강점

이 프로젝트는 한 번에 여러 강점을 보여줄 수 있습니다.

- 3D 메쉬 데이터에 대한 이해
- 단순하지 않은 C++ 로직 구현 능력
- 인터랙티브 WebGL 뷰어 개발 경험
- 그래픽 애플리케이션 아키텍처에 대한 이해
- 의료 / 치과 3D 데이터와 연결되는 도메인 적합성

또한 면접에서 좋은 질문을 끌어낼 수 있습니다.

- 왜 지오메트리 처리를 C++로 구현했나요?
- 메쉬 처리 로직과 렌더링 로직은 어떻게 분리했나요?
- BVH는 무엇이고, Picking에 왜 유용한가요?
- 큰 STL 파일은 어떻게 최적화할 수 있나요?
- 어떤 작업은 CPU에서, 어떤 작업은 GPU에서 처리하는 것이 적절한가요?

## 10. 면접에서의 포지셔닝

프로젝트는 아래처럼 소개하는 것이 좋습니다.

> STL과 OBJ 데이터를 다루는 의료용 3D Viewer를 구현했습니다.  
> 메쉬 파싱, 메쉬 표현, Bounding 계산, 가속 구조 설계 같은 지오메트리 관련 로직은 C++로 구현했고, 브라우저 쪽은 Three.js 기반으로 렌더링과 인터랙션, 시각화를 담당하도록 분리했습니다.

이 설명은 단순히

> Three.js로 3D 뷰어를 만들었습니다.

라고 말하는 것보다 훨씬 강합니다.  
앞의 설명은 시스템 설계 관점과 기술적 깊이를 함께 보여주기 때문입니다.

## 11. 기대 결과

이 프로젝트가 완성되면 포트폴리오에서 다음을 보여줄 수 있습니다.

- 실무형 C++ 그래픽스 코딩 역량
- 웹 기반 3D 렌더링 경험
- 메쉬 처리 워크플로우에 대한 이해
- 의료용 3D 데이터와 연결되는 도메인 스토리

즉, 결과물은 단순한 뷰어 하나가 아니라 `그래픽스 엔지니어 포지션에 설득력 있는 포트폴리오 작품`이 됩니다.

## 12. 최종 추천

가장 추천하는 방향은 다음과 같습니다.

**Dental / Medical STL Viewer + C++ Geometry Engine + Three.js Web Viewer**

이 조합은 다음 요구사항을 가장 자연스럽게 연결합니다.

- C++
- Three.js
- WebGL
- 3D 그래픽스
- 도메인 적합성

제한된 일정 안에서는 아래 3가지를 우선해야 합니다.

1. 완성도 있는 MVP를 먼저 끝낸다.
2. C++ Geometry Layer가 실제 차별점으로 보이도록 만든다.
3. 프로젝트를 단순한 웹 데모가 아니라 의료용 3D 그래픽 애플리케이션으로 설명한다.

이 방향이 서류 단계와 면접 단계 모두에서 가장 좋은 인상을 줄 가능성이 높습니다.
