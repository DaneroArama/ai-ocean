import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

// Use the existing cloud project configuration and explicitly select production.
// Empty self-hosted settings prevent .env.local from selecting the demo backend.
const cloud = parseEnv(readFileSync(".env.local.cloud-backup", "utf8"));
if (!cloud.CONVEX_DEPLOYMENT || !cloud.NEXT_PUBLIC_CONVEX_URL?.endsWith(".convex.cloud")) {
  throw new Error("A cloud project configuration is required for a production export.");
}
const env = { ...process.env, ...cloud, CONVEX_SELF_HOSTED_URL: "", CONVEX_SELF_HOSTED_ADMIN_KEY: "" };
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const directory = `backups/production-${stamp}`;
mkdirSync(directory, { recursive: true });
const path = `${directory}/snapshot.zip`;
const cli = fileURLToPath(new URL("../node_modules/convex/bin/main.js", import.meta.url));
const result = spawnSync(process.execPath, [cli, "export", "--prod", "--include-file-storage", "--path", path], { env, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
const bytes = readFileSync(path);
const verification = spawnSync("py", ["-c", `
import json, sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
    assert archive.testzip() is None, 'Backup ZIP integrity check failed'
    tables = [{'path': name, 'records': len(archive.read(name).splitlines())} for name in archive.namelist() if name.endswith('/documents.jsonl')]
    print(json.dumps(tables))
`, path], { encoding: "utf8" });
if (verification.status !== 0) throw new Error("Backup ZIP integrity check failed: " + verification.stderr);
const tables = JSON.parse(verification.stdout);
if (!tables.length) throw new Error("Export does not contain database tables.");
writeFileSync(`${directory}/manifest.json`, JSON.stringify({
  createdAt: new Date().toISOString(), target: "production", includesFileStorage: true,
  bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"),
  tables,
}, null, 2) + "\n");
console.log(`Verified production backup: ${path} (${bytes.length} bytes, ${tables.length} tables)`);
