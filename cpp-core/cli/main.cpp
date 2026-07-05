#include <iostream>
#include <string>

#include "analysis/MeshAnalysisResult.h"
#include "analysis/MeshAnalyzer.h"

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: mesh_info_cli <ascii-stl-path>\n";
        return 1;
    }

    try {
        MeshAnalyzer analyzer;
        MeshAnalysisResult result = analyzer.analyzeStlFile(argv[1]);
        const BoundingBox& bounds = result.bounds;

        std::cout << "{";
        std::cout << "\"triangleCount\":" << result.triangleCount << ",";
        std::cout << "\"vertexCount\":" << result.vertexCount << ",";
        std::cout << "\"bounds\":{";
        std::cout << "\"min\":{\"x\":" << bounds.min.x << ",\"y\":" << bounds.min.y << ",\"z\":" << bounds.min.z << "},";
        std::cout << "\"max\":{\"x\":" << bounds.max.x << ",\"y\":" << bounds.max.y << ",\"z\":" << bounds.max.z << "}";
        std::cout << "}}";
    } catch (const std::exception& ex) {
        std::cerr << ex.what() << "\n";
        return 1;
    }

    return 0;
}
