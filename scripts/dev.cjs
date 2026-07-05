const { spawn } = require("child_process");

function quote(arg) {
  if (/[\s"]/u.test(arg)) {
    return `"${arg.replace(/"/gu, '\\"')}"`;
  }
  return arg;
}

function run(command, args) {
  const commandLine = [command, ...args].map(quote).join(" ");
  const child = spawn(commandLine, {
    stdio: "inherit",
    shell: true,
    windowsHide: false
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      process.exit(code || 1);
    }
  });

  return child;
}

const nodeCommand = process.execPath;
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const backend = run(nodeCommand, ["backend/dev-server.cjs"]);
const vite = run(npmCommand, ["run", "dev:web"]);

function shutdown() {
  backend.kill();
  vite.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
