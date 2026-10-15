import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { ConvexHttpClient } from "convex/browser";

const env = parseEnv(readFileSync(".env.local", "utf8"));
assert.match(
  env.NEXT_PUBLIC_CONVEX_URL,
  /^http:\/\/(127\.0\.0\.1|localhost):/,
  "test-auth-gate requires the local backend (npm run dev:backend).",
);
const shared = env.ROSTER_SHARED_PASSWORD;
assert.ok(
  shared && shared.length >= 8,
  "ROSTER_SHARED_PASSWORD must be set in .env.local.",
);

const admin = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const participant = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const outsider = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const stamp = Date.now();

async function signIn(client, email, password) {
  const result = await client.action("auth:signIn", {
    provider: "password",
    params: { flow: "signIn", email, password },
  });
  assert.ok(result.tokens?.token, `expected a session token for ${email}`);
  client.setAuth(result.tokens.token);
  return result.tokens.token;
}

async function signUp(email, password, name) {
  return await outsider.action("auth:signIn", {
    provider: "password",
    params: { flow: "signUp", email, password, name },
  });
}

// Existing demo accounts keep working (seeded password accounts).
await signIn(admin, "demo.admin@example.com", "OceanAdmin!2026");
await signIn(participant, "demo.participant@example.com", "OceanDemo!2026");

// Outsiders cannot sign in or activate an account.
const outsiderEmail = `gate-outsider-${stamp}@example.com`;
await assert.rejects(
  () => signIn(outsider, outsiderEmail, shared),
  undefined,
  "outsider signIn must fail",
);
await assert.rejects(
  () => signUp(outsiderEmail, shared, "Gate Outsider"),
  (err) => {
    assert.match(String(err), /not on the participant list/i);
    return true;
  },
  "outsider signUp must be rejected as not on the roster",
);

// A rostered participant activates with the shared password…
const newEmail = `gate-participant-${stamp}@example.com`;
await admin.mutation("roster:importRoster", {
  rows: [
    {
      email: newEmail,
      name: "Gate Participant",
      role: "participant",
      team: "",
      position: "",
      row: 2,
    },
  ],
  filename: "gate-test.xlsx",
  expectedRevision: (
    await admin.query("roster:previewRosterImport", {
      rows: [
        {
          email: newEmail,
          name: "Gate Participant",
          role: "participant",
          team: "",
          position: "",
          row: 2,
        },
      ],
    })
  ).revision,
});

// …but not with a wrong activation password.
const newbie = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
await assert.rejects(
  () =>
    signUp(newEmail, "definitely-not-the-shared-password", "Gate Participant"),
  (err) => {
    assert.match(String(err), /activation password/i);
    return true;
  },
  "signUp with a wrong shared password must fail",
);

const newbieToken = await (async () => {
  const result = await newbie.action("auth:signIn", {
    provider: "password",
    params: { flow: "signUp", email: newEmail, password: shared },
  });
  assert.ok(result.tokens?.token);
  newbie.setAuth(result.tokens.token);
  return result.tokens.token;
})();

// Change password, then the old shared password no longer works.
const personal = `Personal-${stamp}!2026`;
await newbie.action("participants:changePassword", {
  currentPassword: shared,
  newPassword: personal,
});
await assert.rejects(
  () => signIn(new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL), newEmail, shared),
  undefined,
  "shared password must stop working after a password change",
);
await signIn(new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL), newEmail, personal);

// changePassword rejects weak / same / shared passwords.
await assert.rejects(
  () =>
    newbie.action("participants:changePassword", {
      currentPassword: personal,
      newPassword: "short",
    }),
  undefined,
  "short new password must be rejected",
);
await assert.rejects(
  () =>
    newbie.action("participants:changePassword", {
      currentPassword: personal,
      newPassword: personal,
    }),
  undefined,
  "unchanged password must be rejected",
);
await assert.rejects(
  () =>
    newbie.action("participants:changePassword", {
      currentPassword: personal,
      newPassword: shared,
    }),
  undefined,
  "re-using the shared activation password must be rejected",
);

// Rostered admins cannot create password accounts (Google only).
const adminEmail = `gate-admin-${stamp}@example.com`;
const adminRow = {
  email: adminEmail,
  name: "Gate Admin",
  role: "admin",
  team: "",
  position: "",
  row: 2,
};
const adminPreview = await admin.query("roster:previewRosterImport", {
  rows: [adminRow],
});
await admin.mutation("roster:importRoster", {
  rows: [adminRow],
  filename: "gate-test.xlsx",
  expectedRevision: adminPreview.revision,
});
await assert.rejects(
  () => signUp(adminEmail, shared, "Gate Admin"),
  (err) => {
    assert.match(String(err), /Google/i);
    return true;
  },
  "rostered admins must not be able to activate password accounts",
);

// Roster import is admin-only.
await assert.rejects(() =>
  participant.mutation("roster:importRoster", {
    rows: [adminRow],
    filename: "gate-test.xlsx",
    expectedRevision: adminPreview.revision,
  }),
);

// The stale-revision guard refuses an outdated preview.
await assert.rejects(() =>
  admin.mutation("roster:importRoster", {
    rows: [adminRow],
    filename: "gate-test.xlsx",
    expectedRevision: 0,
  }),
);

console.log("✅ Auth gate: roster sign-in, activation, and password change OK");
