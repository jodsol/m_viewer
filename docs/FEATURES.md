# 구현 기능 정리

## 목표

이 문서는 `Medical 3D Viewer` 프로젝트에서 구현할 기능을 우선순위별로 정리한 문서입니다.

핵심 방향은 다음과 같습니다.

- 짧은 기간 안에 완성도 높은 MVP 구현
- 의료용 STL / OBJ 데이터를 다루는 흐름 강조
- 그래픽스 엔지니어 포트폴리오로 보이도록 기능 선정

## 1차 구현 목표: MVP

아래 기능은 반드시 구현하는 것을 목표로 합니다.

### 파일 로딩

- STL 파일 로드
- OBJ 파일 로드
- 파일명 표시
- 로드 성공 / 실패 상태 표시

### 뷰어 기본 기능

- Orbit 카메라 제어
- 확대 / 축소 / 회전
- 모델 중심 정렬
- 배경 및 조명 기본 설정

### 렌더링 모드

- Solid 렌더링
- Wireframe 모드 전환
- 기본 Material 변경
- 앞면 / 양면 렌더링 옵션 검토

### 메쉬 정보 표시

- Triangle 수 표시
- Vertex 수 표시
- Bounding Box 크기 표시
- 파일 포맷 표시
- FPS 표시

### 분석 및 시각화

- Bounding Box 시각화
- Picking
- 선택 지점 또는 선택 객체 하이라이트
- Section Plane

## 2차 구현 목표: 있으면 강해지는 기능

MVP 이후 여유가 있을 때 추가하면 좋은 기능입니다.

### 측정 도구

- 두 점 사이 거리 측정
- 선택한 지점 좌표 표시

### 메쉬 분석

- 메쉬 중심점 계산
- 노말 상태 확인
- 간단한 메쉬 통계 요약

### 성능 개선

- BVH 기반 Picking 가속
- 큰 STL 로딩 최적화
- 불필요한 계산 최소화

### UX 개선

- 모델 리셋 버튼
- 프리셋 뷰 제공
- 토글형 툴바
- 로딩 인디케이터

## 3차 확장 목표: 시간 여유가 있을 때

아래 기능은 분명 인상적이지만, MVP보다 우선하면 위험할 수 있습니다.

- LOD
- Frustum Culling
- GPU Instancing
- Occlusion Culling
- Shadow
- 고급 Material 표현
- Deferred Rendering

이 기능들은 확장 포인트로는 좋지만, 이번 프로젝트의 핵심 메시지는 `의료용 3D 메쉬 처리와 시각화`에 있으므로 후순위로 두는 것이 좋습니다.

## C++에서 구현할 기능

아래 기능은 가능하면 C++ 코어에서 담당하도록 설계합니다.

- STL 파서
- OBJ 파서
- Mesh 자료구조
- Bounding Box 계산
- Triangle / Vertex 통계 계산
- BVH 생성
- Ray Intersection 보조 로직
- 메쉬 분석 유틸리티

## JavaScript / Three.js에서 구현할 기능

아래 기능은 웹 뷰어에서 담당합니다.

- UI
- Scene 구성
- Camera / Controls
- Three.js Mesh 생성
- 렌더링 루프
- Picking 이벤트 처리
- Section Plane UI
- 정보 패널 출력
- FPS 표시

## 면접 설득력이 높은 기능 조합

아래 조합이 가장 설명하기 좋습니다.

- STL / OBJ 로더 구현
- Bounding Box 계산
- Triangle 수 및 메쉬 정보 표시
- Picking
- Section Plane
- C++ Geometry Core와 Web Viewer의 역할 분리

이 조합은 단순히 화면을 만든 것이 아니라, 실제 3D 데이터를 이해하고 처리하는 애플리케이션을 설계했다는 인상을 줍니다.

## 최종 우선순위

구현 순서는 아래처럼 가져가는 것이 가장 안전합니다.

1. STL / OBJ 로딩
2. 기본 렌더링과 카메라 조작
3. 메쉬 정보 표시
4. Bounding Box
5. Picking
6. Section Plane
7. 거리 측정
8. BVH 최적화

## 완료 기준

이 프로젝트는 아래 상태가 되면 포트폴리오용 MVP로 충분합니다.

- STL과 OBJ를 안정적으로 불러올 수 있다.
- 사용자가 모델을 자유롭게 회전하고 확대할 수 있다.
- Wireframe, Bounding Box, Section Plane을 통해 메쉬를 분석할 수 있다.
- Triangle 수, Bounds, FPS 등 핵심 정보를 확인할 수 있다.
- C++ 코어와 웹 뷰어의 역할 분리를 문서와 코드 구조로 설명할 수 있다.
