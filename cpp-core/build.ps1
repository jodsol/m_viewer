$Output = "cpp-core/bin/mesh_info_cli.exe"

g++ -std=c++17 `
  -Icpp-core/include `
  cpp-core/src/core/math/AABB.cpp `
  cpp-core/src/geometry/Mesh.cpp `
  cpp-core/src/analysis/MeshAnalyzer.cpp `
  cpp-core/src/io/STLLoader.cpp `
  cpp-core/src/wasm/WasmExports.cpp `
  cpp-core/cli/main.cpp `
  -o $Output

if ($LASTEXITCODE -eq 0) {
  Write-Host "Built $Output"
}
