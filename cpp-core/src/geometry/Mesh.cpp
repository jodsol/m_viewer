#include "geometry/Mesh.h"

void Mesh::addTriangle(const Triangle& triangle) {
    triangles_.push_back(triangle);
    bounds_.expand(triangle.vertices[0]);
    bounds_.expand(triangle.vertices[1]);
    bounds_.expand(triangle.vertices[2]);
}

std::size_t Mesh::triangleCount() const {
    return triangles_.size();
}

std::size_t Mesh::vertexCount() const {
    return triangles_.size() * 3;
}

const BoundingBox& Mesh::bounds() const {
    return bounds_;
}

const std::vector<Triangle>& Mesh::triangles() const {
    return triangles_;
}
