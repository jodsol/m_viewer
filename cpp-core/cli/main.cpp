#include <cstdlib>
#include <iostream>
#include <string>

#include "analysis/MeshAnalysisResult.h"
#include "analysis/MeshAnalyzer.h"
#include "io/STLLoader.h"
#include "physics/raycast/MeshRaycaster.h"

namespace {
void printAnalysisJson(const MeshAnalysisResult& result) {
    const BoundingBox& bounds = result.bounds;

    std::cout << "{";
    std::cout << "\"triangleCount\":" << result.triangleCount << ",";
    std::cout << "\"vertexCount\":" << result.vertexCount << ",";
    std::cout << "\"bounds\":{";
    std::cout << "\"min\":{\"x\":" << bounds.min.x << ",\"y\":" << bounds.min.y << ",\"z\":" << bounds.min.z << "},";
    std::cout << "\"max\":{\"x\":" << bounds.max.x << ",\"y\":" << bounds.max.y << ",\"z\":" << bounds.max.z << "}";
    std::cout << "}}";
}

void printRaycastJson(const RaycastHit& hit) {
    std::cout << "{";
    std::cout << "\"hit\":" << (hit.hit ? "true" : "false") << ",";
    std::cout << "\"triangleIndex\":" << hit.triangleIndex << ",";
    std::cout << "\"distance\":" << hit.distance << ",";
    std::cout << "\"position\":{";
    std::cout << "\"x\":" << hit.position.x << ",";
    std::cout << "\"y\":" << hit.position.y << ",";
    std::cout << "\"z\":" << hit.position.z;
    std::cout << "}}";
}

double parseDouble(const char* value) {
    return std::strtod(value, nullptr);
}
}  // namespace

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: mesh_info_cli <stl-path> | mesh_info_cli raycast <stl-path> ox oy oz dx dy dz\n";
        return 1;
    }

    try {
        if (std::string(argv[1]) == "raycast") {
            if (argc != 9) {
                std::cerr << "Usage: mesh_info_cli raycast <stl-path> ox oy oz dx dy dz\n";
                return 1;
            }

            STLLoader loader;
            Mesh mesh = loader.load(argv[2]);

            Ray ray;
            ray.origin = {parseDouble(argv[3]), parseDouble(argv[4]), parseDouble(argv[5])};
            ray.direction = {parseDouble(argv[6]), parseDouble(argv[7]), parseDouble(argv[8])};

            MeshRaycaster raycaster;
            RaycastHit hit = raycaster.raycast(mesh, ray);
            printRaycastJson(hit);
            return 0;
        }

        MeshAnalyzer analyzer;
        MeshAnalysisResult result = analyzer.analyzeStlFile(argv[1]);
        printAnalysisJson(result);
    } catch (const std::exception& ex) {
        std::cerr << ex.what() << "\n";
        return 1;
    }

    return 0;
}
