#include <iostream>
#include <string>

#include "Mesh.h"
#include "STLLoader.h"

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: mesh_info_cli <ascii-stl-path>\n";
        return 1;
    }

    try {
        STLLoader loader;
        Mesh mesh = loader.loadAscii(argv[1]);
        const BoundingBox& bounds = mesh.bounds();

        std::cout << "Mesh loaded successfully\n";
        std::cout << "Triangles: " << mesh.triangleCount() << "\n";
        std::cout << "Vertices: " << mesh.vertexCount() << "\n";
        std::cout << "Bounds Min: (" << bounds.min.x << ", " << bounds.min.y << ", " << bounds.min.z << ")\n";
        std::cout << "Bounds Max: (" << bounds.max.x << ", " << bounds.max.y << ", " << bounds.max.z << ")\n";
    } catch (const std::exception& ex) {
        std::cerr << ex.what() << "\n";
        return 1;
    }

    return 0;
}
