import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { ConvexHttpClient } from "convex/browser";
const env = parseEnv(readFileSync(".env.local", "utf8"));
assert.match(env.NEXT_PUBLIC_CONVEX_URL, /^http:\/\/(127\.0\.0\.1|localhost):/);
const admin = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const participant = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
const anonymous = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
async function signIn(client, email, password) {
  const result = await client.action("auth:signIn", {
    provider: "password",
    params: { flow: "signIn", email, password },
  });
  assert.ok(result.tokens?.token);
  client.setAuth(result.tokens.token);
}
await signIn(admin, "demo.admin@example.com", "OceanAdmin!2026");
await signIn(participant, "demo.participant@example.com", "OceanDemo!2026");
await assert.rejects(() => anonymous.query("attendance:adminOverview", {}));
await assert.rejects(() => participant.query("attendance:adminOverview", {}));
await assert.rejects(() =>
  participant.mutation("participants:promoteToAdmin", {}),
);
let overview = await admin.query("attendance:adminOverview", {});
const person = overview.participants.find(
  (p) => p.email === "demo.participant@example.com",
);
assert.ok(person);
const sessionId = "2026-10-17";
const old = person.records.find((r) => r.sessionId === sessionId);
const row = {
  participantId: person.id,
  email: person.email,
  sessionId,
  status: "absent",
  note: "Local integration test",
  row: 2,
};
let preview = await admin.query("attendance:previewImport", {
  rows: [row],
  sessionId,
});
assert.equal(preview.errors.length, 0);
const duplicate = await admin.query("attendance:previewImport", {
  rows: [row, { ...row, row: 3 }],
  sessionId,
});
assert.ok(duplicate.errors.some((e) => e.includes("duplicate")));
const unknown = await admin.query("attendance:previewImport", {
  rows: [{ ...row, participantId: "unknown" }],
  sessionId,
});
assert.equal(unknown.errors.length, 1);
await assert.rejects(() =>
  participant.mutation("attendance:importRecords", {
    rows: [row],
    sessionId,
    filename: "test.xlsx",
    expectedRevision: preview.revision,
  }),
);
await assert.rejects(() =>
  admin.mutation("attendance:importRecords", {
    rows: [row, row],
    sessionId,
    filename: "test.xlsx",
    expectedRevision: preview.revision,
  }),
);
try {
  await admin.mutation("attendance:importRecords", {
    rows: [row],
    sessionId,
    filename: "local-test.xlsx",
    expectedRevision: preview.revision,
  });
  const progress = await participant.query("attendance:myProgress", {});
  assert.equal(
    progress.score,
    person.score - (old.status === "present" ? 25 : 0),
  );
  await assert.rejects(() =>
    admin.mutation("attendance:importRecords", {
      rows: [row],
      sessionId,
      filename: "stale.xlsx",
      expectedRevision: preview.revision,
    }),
  );
  await assert.rejects(() =>
    participant.mutation("attendance:issueCertificate", { demo: true }),
  );
  overview = await admin.query("attendance:adminOverview", {});
  const changed = overview.participants
    .find((p) => p.id === person.id)
    .records.find((r) => r.sessionId === sessionId);
  await assert.rejects(() =>
    admin.mutation("attendance:setRecord", {
      participantId: person.id,
      sessionId,
      status: "present",
      note: "Stale manual edit",
      expectedUpdatedAt: old.updatedAt,
    }),
  );
  await admin.mutation("attendance:setRecord", {
    participantId: person.id,
    sessionId,
    status: old.status,
    note: old.note,
    expectedUpdatedAt: changed.updatedAt,
  });
} finally {
  const latest = await admin.query("attendance:adminOverview", {});
  const record = latest.participants
    .find((p) => p.id === person.id)
    .records.find((r) => r.sessionId === sessionId);
  if (record.status !== old.status || record.note !== old.note)
    await admin.mutation("attendance:setRecord", {
      participantId: person.id,
      sessionId,
      status: old.status,
      note: old.note,
      expectedUpdatedAt: record.updatedAt,
    });
}
const demo = await participant.mutation("attendance:issueCertificate", {
  demo: true,
});
assert.equal(demo.name, "Demo Participant");
assert.equal(demo.demo, true);
assert.equal(demo.score, person.score);
await assert.rejects(() =>
  participant.mutation("attendance:issueCertificate", {}),
);
const progress = await participant.query("attendance:myProgress", {});
assert.equal(progress.state, "scheduled");
assert.equal(progress.releasedAt, Date.parse("2026-11-02T00:00:00+06:30"));
assert.equal(progress.expiresAt, Date.parse("2026-12-02T00:00:00+06:30"));
const publicRows = await anonymous.query("attendance:publicProgress", {
  search: "Ocean",
});
assert.ok(publicRows.length > 0);
assert.ok(
  publicRows.every(
    (row) => !Object.hasOwn(row, "email") && !Object.hasOwn(row, "records"),
  ),
);
console.log(
  "PASS: admin authorization, weighted recalculation, atomic overwrite, duplicate/identifier validation, stale imports and edits, threshold gates, local demo, real release lock, public privacy.",
);
