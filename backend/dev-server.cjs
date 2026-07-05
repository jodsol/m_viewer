const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const port = Number(process.env.CPP_BACKEND_PORT || 3001);
const root = path.resolve(__dirname, "..");
const cppExe = path.join(root, "cpp-core", "bin", "mesh_info_cli.exe");

function ensureCppCoreBuilt() {
  const compile = spawnSync(
    "g++",
    [
      "-g",
      "-O0",
      "-std=c++17",
      "-Icpp-core/include",
      "cpp-core/src/core/math/AABB.cpp",
      "cpp-core/src/geometry/Mesh.cpp",
      "cpp-core/src/analysis/MeshAnalyzer.cpp",
      "cpp-core/src/io/STLLoader.cpp",
      "cpp-core/src/wasm/WasmExports.cpp",
      "cpp-core/cli/main.cpp",
      "-o",
      "cpp-core/bin/mesh_info_cli.exe"
    ],
    {
      cwd: root,
      encoding: "utf8"
    }
  );

  if (compile.status !== 0) {
    throw new Error(compile.stderr || "Failed to build cpp-core.");
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function runCppAnalysis(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(cppExe, [filePath], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `cpp-core exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Failed to parse cpp-core output: ${stdout}`));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/analyze-stl") {
    try {
      const body = await collectBody(req);
      if (body.length === 0) {
        sendJson(res, 400, { error: "Empty STL payload." });
        return;
      }

      const tempFilePath = path.join(os.tmpdir(), `stl-viewer-${Date.now()}-${process.pid}.stl`);
      await fs.promises.writeFile(tempFilePath, body);

      try {
        const result = await runCppAnalysis(tempFilePath);
        sendJson(res, 200, result);
      } finally {
        fs.promises.unlink(tempFilePath).catch(() => {});
      }
    } catch (error) {
      sendJson(res, 500, { error: error instanceof Error ? error.message : "Unknown backend error." });
    }

    return;
  }

  sendJson(res, 404, { error: "Not found." });
});

try {
  ensureCppCoreBuilt();
  server.listen(port, () => {
    console.log(`cpp backend running at http://localhost:${port}`);
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
