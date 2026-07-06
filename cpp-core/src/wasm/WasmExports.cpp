#include "wasm/WasmExports.h"

#include <exception>
#include <string>

#include "analysis/MeshAnalysisResult.h"
#include "analysis/MeshAnalyzer.h"
#include "io/STLLoader.h"
#include "physics/raycast/MeshRaycaster.h"

namespace {
Mesh g_lastMesh;
MeshAnalysisResult g_lastResult{};
RaycastHit g_lastRaycastHit{};
std::string g_lastError;
bool g_hasResult = false;
bool g_hasMesh = false;
bool g_hasRaycastHit = false;

void clearLastResult() {
    g_lastMesh = Mesh{};
    g_lastResult = MeshAnalysisResult{};
    g_lastRaycastHit = RaycastHit{};
    g_hasResult = false;
    g_hasMesh = false;
    g_hasRaycastHit = false;
}

double getMinOrDefault(char axis) {
    if (!g_hasResult || !g_lastResult.bounds.initialized) {
        return 0.0;
    }

    switch (axis) {
    case 'x':
        return g_lastResult.bounds.min.x;
    case 'y':
        return g_lastResult.bounds.min.y;
    case 'z':
        return g_lastResult.bounds.min.z;
    default:
        return 0.0;
    }
}

double getMaxOrDefault(char axis) {
    if (!g_hasResult || !g_lastResult.bounds.initialized) {
        return 0.0;
    }

    switch (axis) {
    case 'x':
        return g_lastResult.bounds.max.x;
    case 'y':
        return g_lastResult.bounds.max.y;
    case 'z':
        return g_lastResult.bounds.max.z;
    default:
        return 0.0;
    }
}
}  // namespace

extern "C" {
int analyze_stl(const unsigned char* data, int size) {
    clearLastResult();
    g_lastError.clear();

    if (data == nullptr || size <= 0) {
        g_lastError = "STL input buffer is empty.";
        return 0;
    }

    try {
        STLLoader loader;
        g_lastMesh = loader.loadFromMemory(data, static_cast<std::size_t>(size));
        g_hasMesh = true;

        MeshAnalyzer analyzer;
        g_lastResult = analyzer.analyzeMesh(g_lastMesh);
        g_hasResult = true;
        return 1;
    } catch (const std::exception& ex) {
        g_lastError = ex.what();
        return 0;
    } catch (...) {
        g_lastError = "Unknown cpp-core error.";
        return 0;
    }
}

int get_triangle_count() {
    return g_hasResult ? static_cast<int>(g_lastResult.triangleCount) : 0;
}

int get_vertex_count() {
    return g_hasResult ? static_cast<int>(g_lastResult.vertexCount) : 0;
}

double get_bounds_min_x() {
    return getMinOrDefault('x');
}

double get_bounds_min_y() {
    return getMinOrDefault('y');
}

double get_bounds_min_z() {
    return getMinOrDefault('z');
}

double get_bounds_max_x() {
    return getMaxOrDefault('x');
}

double get_bounds_max_y() {
    return getMaxOrDefault('y');
}

double get_bounds_max_z() {
    return getMaxOrDefault('z');
}

int raycast_last_mesh(
    double origin_x,
    double origin_y,
    double origin_z,
    double direction_x,
    double direction_y,
    double direction_z
) {
    g_lastRaycastHit = RaycastHit{};
    g_hasRaycastHit = false;
    g_lastError.clear();

    if (!g_hasMesh) {
      g_lastError = "No analyzed STL mesh is available for raycast.";
      return 0;
    }

    try {
        MeshRaycaster raycaster;
        Ray ray;
        ray.origin = {origin_x, origin_y, origin_z};
        ray.direction = {direction_x, direction_y, direction_z};
        g_lastRaycastHit = raycaster.raycast(g_lastMesh, ray);
        g_hasRaycastHit = true;
        return 1;
    } catch (const std::exception& ex) {
        g_lastError = ex.what();
        return 0;
    } catch (...) {
        g_lastError = "Unknown cpp-core raycast error.";
        return 0;
    }
}

int get_raycast_hit() {
    return g_hasRaycastHit && g_lastRaycastHit.hit ? 1 : 0;
}

int get_raycast_triangle_index() {
    return g_hasRaycastHit ? g_lastRaycastHit.triangleIndex : -1;
}

double get_raycast_distance() {
    return g_hasRaycastHit ? g_lastRaycastHit.distance : 0.0;
}

double get_raycast_position_x() {
    return g_hasRaycastHit ? g_lastRaycastHit.position.x : 0.0;
}

double get_raycast_position_y() {
    return g_hasRaycastHit ? g_lastRaycastHit.position.y : 0.0;
}

double get_raycast_position_z() {
    return g_hasRaycastHit ? g_lastRaycastHit.position.z : 0.0;
}

const char* get_last_error() {
    return g_lastError.c_str();
}
}
