#pragma once

#include <cstddef>

#include "core/math/AABB.h"

struct MeshAnalysisResult {
    std::size_t triangleCount = 0;
    std::size_t vertexCount = 0;
    BoundingBox bounds;
};
