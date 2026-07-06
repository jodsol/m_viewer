#include "physics/raycast/MeshRaycaster.h"

#include <limits>

namespace {
constexpr double kEpsilon = 1e-8;

bool intersectTriangle(const Ray& ray, const Triangle& triangle, double& outDistance) {
    const Vector3 edge1 = triangle.vertices[1] - triangle.vertices[0];
    const Vector3 edge2 = triangle.vertices[2] - triangle.vertices[0];
    const Vector3 pvec = ray.direction.cross(edge2);
    const double determinant = edge1.dot(pvec);

    if (determinant > -kEpsilon && determinant < kEpsilon) {
        return false;
    }

    const double inverseDeterminant = 1.0 / determinant;
    const Vector3 tvec = ray.origin - triangle.vertices[0];
    const double u = tvec.dot(pvec) * inverseDeterminant;
    if (u < 0.0 || u > 1.0) {
        return false;
    }

    const Vector3 qvec = tvec.cross(edge1);
    const double v = ray.direction.dot(qvec) * inverseDeterminant;
    if (v < 0.0 || u + v > 1.0) {
        return false;
    }

    const double distance = edge2.dot(qvec) * inverseDeterminant;
    if (distance <= kEpsilon) {
        return false;
    }

    outDistance = distance;
    return true;
}
}  // namespace

RaycastHit MeshRaycaster::raycast(const Mesh& mesh, const Ray& ray) const {
    RaycastHit bestHit;
    double bestDistance = std::numeric_limits<double>::max();

    const std::vector<Triangle>& triangles = mesh.triangles();
    for (std::size_t i = 0; i < triangles.size(); ++i) {
        double distance = 0.0;
        if (!intersectTriangle(ray, triangles[i], distance)) {
            continue;
        }

        if (distance >= bestDistance) {
            continue;
        }

        bestDistance = distance;
        bestHit.hit = true;
        bestHit.distance = distance;
        bestHit.triangleIndex = static_cast<int>(i);
        bestHit.position = ray.origin + ray.direction * distance;
    }

    return bestHit;
}
