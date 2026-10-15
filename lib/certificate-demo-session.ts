import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";

// This identity exists only in application code. It has no Convex user, participant,
// registration, attendance, or certificate-issue record and grants no real role.
const DEMO_EMAIL = "certificate.demo@aiocean.test";
const DEMO_PASSWORD = "OceanCertificate!2026";
export const CERTIFICATE_DEMO_PROFILE = {
  name: "Demo Participant",
  email: DEMO_EMAIL,
};
export const CERTIFICATE_DEMO_COOKIE = "aiocean_certificate_demo";
export const CERTIFICATE_DEMO_SESSION_SECONDS = 2 * 60 * 60;

function equal(left: string, right: string) {
  return timingSafeEqual(
    createHash("sha256").update(left).digest(),
    createHash("sha256").update(right).digest(),
  );
}
export function matchesDemoCredentials(email: string, password: string) {
  const validEmail = equal(email.trim().toLowerCase(), DEMO_EMAIL);
  const validPassword = equal(password, DEMO_PASSWORD);
  return validEmail && validPassword;
}
function signature(value: string) {
  const secret =
    process.env.CERTIFICATE_DEMO_SECRET ||
    process.env.AUTH_SECRET ||
    DEMO_PASSWORD;
  return createHmac("sha256", `certificate-demo-only:${secret}`)
    .update(value)
    .digest("base64url");
}
export function createDemoSession() {
  const value = `demo-v1.${Date.now() + CERTIFICATE_DEMO_SESSION_SECONDS * 1000}`;
  return `${value}.${signature(value)}`;
}
export function isDemoSession(value: string | undefined) {
  if (!value || value.length > 200) return false;
  const [version, expiry, mac, extra] = value.split(".");
  if (extra !== undefined || version !== "demo-v1" || !/^\d+$/.test(expiry || "") || !mac)
    return false;
  const expiresAt = Number(expiry);
  return (
    expiresAt > Date.now() &&
    expiresAt <= Date.now() + CERTIFICATE_DEMO_SESSION_SECONDS * 1000 &&
    equal(mac, signature(`${version}.${expiry}`))
  );
}
