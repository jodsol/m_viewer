cmake_minimum_required(VERSION 3.16)
project(mesh_info_cli LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(mesh_info_cli
    src/core/math/AABB.cpp
    src/geometry/Mesh.cpp
    src/physics/raycast/MeshRaycaster.cpp
    src/analysis/MeshAnalyzer.cpp
    src/io/STLLoader.cpp
    src/wasm/WasmExports.cpp
    cli/main.cpp
)

target_include_directories(mesh_info_cli PRIVATE include)

add_executable(raycast_smoke
    src/core/math/AABB.cpp
    src/geometry/Mesh.cpp
    src/physics/raycast/MeshRaycaster.cpp
    tests/raycast_smoke.cpp
)

target_include_directories(raycast_smoke PRIVATE include)
