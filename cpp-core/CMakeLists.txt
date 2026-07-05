cmake_minimum_required(VERSION 3.16)
project(mesh_info_cli LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(mesh_info_cli
    src/BoundingBox.cpp
    src/Mesh.cpp
    src/STLLoader.cpp
    src/main.cpp
)

target_include_directories(mesh_info_cli PRIVATE include)
