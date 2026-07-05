#include "wasm/WasmExports.h"

#include <exception>
#include <string>

#include "analysis/MeshAnalysisResult.h"
#include "analysis/MeshAnalyzer.h"

namespace {
MeshAnalysisResult g_lastResult{};
std::string g_lastError;
bool g_hasResult = false;

void clearLastResult() {
    g_lastResult = MeshAnalysisResult{};
    g_hasResult = false;
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
        MeshAnalyzer analyzer;
        g_lastResult = analyzer.analyzeStlMemory(data, static_cast<std::size_t>(size));
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

const char* get_last_error() {
    return g_lastError.c_str();
}
}
