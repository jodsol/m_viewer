#pragma once

#include <string>

#include "Mesh.h"

class STLLoader {
public:
    Mesh loadAscii(const std::string& filePath) const;
};
