#pragma once

#include <array>
#include <cstddef>
#include <vector>

#include "BoundingBox.h"
#include "Vector3.h"

struct Triangle {
    std::array<Vector3, 3> vertices;
};

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
