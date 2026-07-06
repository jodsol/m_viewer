$CliOutput = "cpp-core/bin/mesh_info_cli.exe"
$RaycastSmokeOutput = "cpp-core/bin/raycast_smoke.exe"

g++ -std=c++17 `
  -Icpp-core/include `
  cpp-core/src/core/math/AABB.cpp `
  cpp-core/src/geometry/Mesh.cpp `
  cpp-core/src/physics/raycast/MeshRaycaster.cpp `
  cpp-core/src/analysis/MeshAnalyzer.cpp `
  cpp-core/src/io/STLLoader.cpp `
  cpp-core/src/wasm/WasmExports.cpp `
  cpp-core/cli/main.cpp `
  -o $CliOutput

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

g++ -std=c++17 `
  -Icpp-core/include `
  cpp-core/src/core/math/AABB.cpp `
  cpp-core/src/geometry/Mesh.cpp `
  cpp-core/src/physics/raycast/MeshRaycaster.cpp `
  cpp-core/tests/raycast_smoke.cpp `
  -o $RaycastSmokeOutput

if ($LASTEXITCODE -eq 0) {
  Write-Host "Built $CliOutput"
  Write-Host "Built $RaycastSmokeOutput"
}
