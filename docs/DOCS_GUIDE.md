# 문서 가이드

## 문서 목적

이 문서는 `docs/` 아래 문서들이 각각 무엇을 설명하는지 빠르게 찾기 위한 가이드입니다.

## 문서 목록

### 구조 / 방향

- `PROJECT_STRUCTURE.md`
  - 프로젝트 전체 구조
  - `cpp-core`, `web-viewer`, `backend`, `docs`의 역할
  - 장기적으로 어떤 형태로 확장할지

### 기능 정책

- `FEATURE_POLICIES.md`
  - 기능별 동작 원칙
  - 어떤 기능을 어느 계층이 담당하는지
  - 실패 처리, 상태 표시, 분석 책임

### viewer 범위

- `VIEWER_MVP_CHECKLIST.md`
  - 현재 단계에서 먼저 완성해야 할 viewer MVP 범위
  - 기능 우선순위와 완료 기준

### cpp-core 설계

- `CPP_CORE_REQUIREMENTS.md`
  - cpp-core가 왜 필요한지
  - 지금 단계와 이후 단계에서 무엇을 가져야 하는지

- `CPP_CORE_API_DRAFT.md`
  - cpp-core 외부 API 초안
  - `MeshAnalysisResult`, `MeshAnalyzer`, wasm export 방향

### wasm 전환

- `WASM_MIGRATION_PLAN.md`
  - 현재 backend 구조에서 wasm 구조로 넘어가는 계획
  - 어떤 파일과 API가 바뀌어야 하는지

## 추천 읽기 순서

처음 구조를 이해할 때:

1. `PROJECT_STRUCTURE.md`
2. `FEATURE_POLICIES.md`
3. `CPP_CORE_REQUIREMENTS.md`

cpp-core를 실제로 리팩터링할 때:

1. `CPP_CORE_REQUIREMENTS.md`
2. `CPP_CORE_API_DRAFT.md`
3. `WASM_MIGRATION_PLAN.md`

viewer 작업에 집중할 때:

1. `VIEWER_MVP_CHECKLIST.md`
2. `FEATURE_POLICIES.md`
