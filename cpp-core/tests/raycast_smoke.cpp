#include <cmath>
#include <iostream>

#include "Geometry/Mesh.h"
#include "physics/raycast/MeshRaycaster.h"

int main() {
    Mesh mesh;

    Triangle triangle;
    triangle.vertices[0] = {0.0, 0.0, 0.0};
    triangle.vertices[1] = {1.0, 0.0, 0.0};
    triangle.vertices[2] = {0.0, 1.0, 0.0};
    mesh.addTriangle(triangle);

    Ray ray;
    ray.origin = {0.25, 0.25, 1.0};
    ray.direction = {0.0, 0.0, -1.0};

    MeshRaycaster raycaster;
    RaycastHit hit = raycaster.raycast(mesh, ray);

    if (!hit.hit) {
        std::cerr << "Expected hit, but raycast missed.\n";
        return 1;
    }

    if (hit.triangleIndex != 0) {
        std::cerr << "Unexpected triangle index: " << hit.triangleIndex << "\n";
        return 1;
    }

    if (std::abs(hit.position.x - 0.25) > 1e-6 ||
        std::abs(hit.position.y - 0.25) > 1e-6 ||
        std::abs(hit.position.z - 0.0) > 1e-6) {
        std::cerr << "Unexpected hit position: "
                  << hit.position.x << ", "
                  << hit.position.y << ", "
                  << hit.position.z << "\n";
        return 1;
    }

    if (std::abs(hit.distance - 1.0) > 1e-6) {
        std::cerr << "Unexpected hit distance: " << hit.distance << "\n";
        return 1;
    }

    std::cout << "raycast_smoke passed\n";
    return 0;
}
