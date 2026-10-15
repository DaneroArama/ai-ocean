import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";

const binary = join(process.env.LOCALAPPDATA, "convex/binaries/precompiled-2026-10-06-a3538c6/convex-local-backend.exe");
const state = ".convex/demo";
if (!readFileSync(".gitignore", "utf8").split(/\r?\n/).some(line => /^\/?\.convex\/?$/.test(line))) {
  appendFileSync(".gitignore", "\n# Local Convex database and credentials\n.convex/\n");
}
mkdirSync(state, { recursive: true });
const secretFile = join(state, "instance-secret");
const secret = existsSync(secretFile) ? readFileSync(secretFile, "utf8") : randomBytes(32).toString("hex");
writeFileSync(secretFile, secret);
const adminKey = execFileSync(binary, ["keygen", "admin-key", "--instance-name", "local-ai-ocean", "--instance-secret", secret], { encoding: "utf8" }).trim();
const envFile = ".env.local";
const previous = readFileSync(envFile, "utf8").split(/\r?\n/).filter(line => !/^(CONVEX_DEPLOYMENT|CONVEX_SELF_HOSTED_URL|CONVEX_SELF_HOSTED_ADMIN_KEY|NEXT_PUBLIC_CONVEX_URL|NEXT_PUBLIC_CONVEX_SITE_URL)=/.test(line));
writeFileSync(envFile, [...previous, "CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210", `CONVEX_SELF_HOSTED_ADMIN_KEY=${adminKey}`, "NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210", "NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211", ""].join("\n"));
const child = spawn(binary, ["--port", "3210", "--site-proxy-port", "3211", "--instance-name", "local-ai-ocean", "--instance-secret", secret, "--local-storage", join(state, "storage"), join(state, "db.sqlite3")], {
  stdio: "inherit", windowsHide: true,
  env: { ...process.env, CONVEX_SITE_URL: "http://127.0.0.1:3211", CONVEX_CLOUD_URL: "http://127.0.0.1:3210" },
});
child.on("exit", code => process.exit(code ?? 1));
