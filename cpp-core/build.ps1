$Output = "cpp-core/bin/mesh_info_cli.exe"

g++ -std=c++17 `
  -Icpp-core/include `
  cpp-core/src/BoundingBox.cpp `
  cpp-core/src/Mesh.cpp `
  cpp-core/src/STLLoader.cpp `
  cpp-core/src/main.cpp `
  -o $Output

if ($LASTEXITCODE -eq 0) {
  Write-Host "Built $Output"
}
