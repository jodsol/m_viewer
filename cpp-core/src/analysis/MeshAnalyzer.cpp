#include "analysis/MeshAnalyzer.h"

#include "io/STLLoader.h"

MeshAnalysisResult MeshAnalyzer::analyzeMesh(const Mesh& mesh) const {
    MeshAnalysisResult result;
    result.triangleCount = mesh.triangleCount();
    result.vertexCount = mesh.vertexCount();
    result.bounds = mesh.bounds();
    return result;
}

MeshAnalysisResult MeshAnalyzer::analyzeStlFile(const std::string& filePath) const {
    STLLoader loader;
    Mesh mesh = loader.load(filePath);
    return analyzeMesh(mesh);
}

MeshAnalysisResult MeshAnalyzer::analyzeStlMemory(const unsigned char* data, std::size_t size) const {
    STLLoader loader;
    Mesh mesh = loader.loadFromMemory(data, size);
    return analyzeMesh(mesh);
}
