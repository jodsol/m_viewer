#include "io/STLLoader.h"

#include <cstdint>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>

namespace {
bool looksLikeBinaryStl(std::istream& input) {
    input.seekg(0, std::ios::end);
    const std::streamoff fileSize = input.tellg();
    if (fileSize < 84) {
        input.clear();
        input.seekg(0, std::ios::beg);
        return false;
    }

    input.seekg(80, std::ios::beg);
    std::uint32_t triangleCount = 0;
    input.read(reinterpret_cast<char*>(&triangleCount), sizeof(triangleCount));

    input.clear();
    input.seekg(0, std::ios::beg);
    const std::uint64_t expectedSize = 84ULL + static_cast<std::uint64_t>(triangleCount) * 50ULL;
    return expectedSize == static_cast<std::uint64_t>(fileSize);
}

bool looksLikeBinaryStlBuffer(const unsigned char* data, std::size_t size) {
    if (size < 84) {
        return false;
    }

    const unsigned char* triangleCountPtr = data + 80;
    const std::uint32_t triangleCount =
        static_cast<std::uint32_t>(triangleCountPtr[0]) |
        (static_cast<std::uint32_t>(triangleCountPtr[1]) << 8) |
        (static_cast<std::uint32_t>(triangleCountPtr[2]) << 16) |
        (static_cast<std::uint32_t>(triangleCountPtr[3]) << 24);

    const std::uint64_t expectedSize = 84ULL + static_cast<std::uint64_t>(triangleCount) * 50ULL;
    return expectedSize == static_cast<std::uint64_t>(size);
}

float readFloat32LE(const unsigned char* bytes) {
    union {
        std::uint32_t integerValue;
        float floatValue;
    } converter{};

    converter.integerValue =
        static_cast<std::uint32_t>(bytes[0]) |
        (static_cast<std::uint32_t>(bytes[1]) << 8) |
        (static_cast<std::uint32_t>(bytes[2]) << 16) |
        (static_cast<std::uint32_t>(bytes[3]) << 24);
    return converter.floatValue;
}
}  // namespace

Mesh STLLoader::load(const std::string& filePath) const {
    std::ifstream input(filePath, std::ios::binary);
    if (!input.is_open()) {
        throw std::runtime_error("Failed to open STL file: " + filePath);
    }

    if (looksLikeBinaryStl(input)) {
        return loadBinary(input);
    }

    return loadAscii(input);
}

Mesh STLLoader::loadFromMemory(const unsigned char* data, std::size_t size) const {
    if (data == nullptr || size == 0) {
        throw std::runtime_error("STL memory input is empty.");
    }

    if (looksLikeBinaryStlBuffer(data, size)) {
        return loadBinaryFromMemory(data, size);
    }

    return loadAsciiFromMemory(reinterpret_cast<const char*>(data), size);
}

Mesh STLLoader::loadAscii(std::istream& input) const {
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
        throw std::runtime_error("No triangles were parsed from ASCII STL input.");
    }

    return mesh;
}

Mesh STLLoader::loadBinary(std::istream& input) const {
    input.seekg(80, std::ios::beg);

    std::uint32_t triangleCount = 0;
    input.read(reinterpret_cast<char*>(&triangleCount), sizeof(triangleCount));

    if (!input) {
        throw std::runtime_error("Failed to read binary STL triangle count.");
    }

    Mesh mesh;

    for (std::uint32_t triangleIndex = 0; triangleIndex < triangleCount; ++triangleIndex) {
        float normal[3] = {0.0f, 0.0f, 0.0f};
        input.read(reinterpret_cast<char*>(normal), sizeof(normal));

        Triangle triangle;
        for (int vertexIndex = 0; vertexIndex < 3; ++vertexIndex) {
            float coordinates[3] = {0.0f, 0.0f, 0.0f};
            input.read(reinterpret_cast<char*>(coordinates), sizeof(coordinates));

            triangle.vertices[vertexIndex] = Vector3{
                static_cast<double>(coordinates[0]),
                static_cast<double>(coordinates[1]),
                static_cast<double>(coordinates[2])
            };
        }

        std::uint16_t attributeByteCount = 0;
        input.read(reinterpret_cast<char*>(&attributeByteCount), sizeof(attributeByteCount));

        if (!input) {
            throw std::runtime_error("Failed to read binary STL triangle data.");
        }

        mesh.addTriangle(triangle);
    }

    if (mesh.triangleCount() == 0) {
        throw std::runtime_error("No triangles were parsed from binary STL.");
    }

    return mesh;
}

Mesh STLLoader::loadAsciiFromMemory(const char* data, std::size_t size) const {
    std::string text(data, size);
    std::istringstream input(text);
    return loadAscii(input);
}

Mesh STLLoader::loadBinaryFromMemory(const unsigned char* data, std::size_t size) const {
    if (size < 84) {
        throw std::runtime_error("Binary STL memory buffer is too small.");
    }

    const unsigned char* triangleCountPtr = data + 80;
    const std::uint32_t triangleCount =
        static_cast<std::uint32_t>(triangleCountPtr[0]) |
        (static_cast<std::uint32_t>(triangleCountPtr[1]) << 8) |
        (static_cast<std::uint32_t>(triangleCountPtr[2]) << 16) |
        (static_cast<std::uint32_t>(triangleCountPtr[3]) << 24);

    const std::uint64_t expectedSize = 84ULL + static_cast<std::uint64_t>(triangleCount) * 50ULL;
    if (expectedSize > static_cast<std::uint64_t>(size)) {
        throw std::runtime_error("Binary STL memory buffer length is invalid.");
    }

    Mesh mesh;

    for (std::uint32_t triangleIndex = 0; triangleIndex < triangleCount; ++triangleIndex) {
        const std::size_t triangleOffset = 84 + static_cast<std::size_t>(triangleIndex) * 50 + 12;

        Triangle triangle;
        for (int vertexIndex = 0; vertexIndex < 3; ++vertexIndex) {
            const std::size_t vertexOffset = triangleOffset + static_cast<std::size_t>(vertexIndex) * 12;
            triangle.vertices[vertexIndex] = Vector3{
                static_cast<double>(readFloat32LE(data + vertexOffset)),
                static_cast<double>(readFloat32LE(data + vertexOffset + 4)),
                static_cast<double>(readFloat32LE(data + vertexOffset + 8))
            };
        }

        mesh.addTriangle(triangle);
    }

    if (mesh.triangleCount() == 0) {
        throw std::runtime_error("No triangles were parsed from binary STL memory input.");
    }

    return mesh;
}
