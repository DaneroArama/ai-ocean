import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const local = parseEnv(readFileSync(".env.local", "utf8"));
if (
  local.CONVEX_DEPLOYMENT ||
  !/^http:\/\/(localhost|127\.0\.0\.1):/.test(
    local.CONVEX_SELF_HOSTED_URL || "",
  )
)
  throw new Error("Refusing to sync: the backend must be local.");
const cli = fileURLToPath(
  new URL("../node_modules/convex/bin/main.js", import.meta.url),
);
for (const args of [
  ["dev", "--once"],
  ...(process.argv.includes("--seed")
    ? [["run", "seedAttendanceDemo:seed"]]
    : []),
]) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    stdio: "inherit",
    env: {
      ...process.env,
      ...local,
      CONVEX_DEPLOYMENT: "",
      CONVEX_DEPLOY_KEY: "",
      CONVEX_DEPLOYMENT_TOKEN: "",
    },
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
