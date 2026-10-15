import { generateKeyPair, exportPKCS8, exportJWK } from "jose";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync, appendFileSync } from "node:fs";

const localEnv = readFileSync(".env.local", "utf8");
const target = localEnv.match(/^CONVEX_SELF_HOSTED_URL=(.+)$/m)?.[1];
if (!target || !["localhost", "127.0.0.1"].includes(new URL(target.trim()).hostname) || /^CONVEX_DEPLOYMENT=.+/m.test(localEnv)) {
  throw new Error("This setup is restricted to the local demo backend.");
}
if (!readFileSync(".gitignore", "utf8").split(/\r?\n/).some(line => /^\/?\.convex\/?$/.test(line))) {
  appendFileSync(".gitignore", "\n# Local Convex database and credentials\n.convex/\n");
}

const cli = new URL("../node_modules/convex/bin/main.js", import.meta.url);
const run = (...args) => {
  const result = spawnSync(process.execPath, [fileURLToPath(cli), ...args], { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) {
    console.error(args[0] === "env" ? "Local authentication environment setup failed." : result.stderr);
    process.exit(1);
  }
  return result.stdout;
};
const { privateKey, publicKey } = await generateKeyPair("RS256", { extractable: true });
run("env", "set", `JWT_PRIVATE_KEY=${await exportPKCS8(privateKey)}`);
run("env", "set", "JWKS", JSON.stringify({ keys: [await exportJWK(publicKey)] }));
run("env", "set", "SITE_URL", "http://localhost:3000");
console.log(run("dev", "--once"));
console.log(run("run", "seedLocalParticipant:seed"));
