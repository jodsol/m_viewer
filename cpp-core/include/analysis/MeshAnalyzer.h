#pragma once

#include <cstddef>
#include <string>

#include "analysis/MeshAnalysisResult.h"
#include "geometry/Mesh.h"

class MeshAnalyzer {
public:
    MeshAnalysisResult analyzeMesh(const Mesh& mesh) const;
    MeshAnalysisResult analyzeStlFile(const std::string& filePath) const;
    MeshAnalysisResult analyzeStlMemory(const unsigned char* data, std::size_t size) const;
};
