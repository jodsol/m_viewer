#include "STLLoader.h"

#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>

Mesh STLLoader::loadAscii(const std::string& filePath) const {
    std::ifstream input(filePath);
    if (!input.is_open()) {
        throw std::runtime_error("Failed to open STL file: " + filePath);
    }

    Mesh mesh;
    Triangle currentTriangle;
    int vertexIndex = 0;
    std::string line;

    while (std::getline(input, line)) {
        std::stringstream stream(line);
        std::string token;
        stream >> token;

        if (token != "vertex") {
            continue;
        }

        Vector3 vertex;
        stream >> vertex.x >> vertex.y >> vertex.z;
        currentTriangle.vertices[vertexIndex++] = vertex;

        if (vertexIndex == 3) {
            mesh.addTriangle(currentTriangle);
            vertexIndex = 0;
        }
    }

    if (mesh.triangleCount() == 0) {
        throw std::runtime_error("No triangles were parsed from STL file: " + filePath);
    }

    return mesh;
}
