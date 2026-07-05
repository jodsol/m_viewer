#pragma once

#include <cstddef>
#include <istream>
#include <string>

#include "geometry/Mesh.h"

class STLLoader {
public:
    Mesh load(const std::string& filePath) const;
    Mesh loadFromMemory(const unsigned char* data, std::size_t size) const;

private:
    Mesh loadAscii(std::istream& input) const;
    Mesh loadBinary(std::istream& input) const;
    Mesh loadAsciiFromMemory(const char* data, std::size_t size) const;
    Mesh loadBinaryFromMemory(const unsigned char* data, std::size_t size) const;
};
