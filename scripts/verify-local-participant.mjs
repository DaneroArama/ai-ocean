import { ConvexHttpClient } from "convex/browser";
const client = new ConvexHttpClient("http://127.0.0.1:3210");
const result = await client.action("auth:signIn", {
  provider: "password", params: { flow: "signIn", email: "demo.participant@example.com", password: "OceanDemo!2026" },
});
if (!result.tokens?.token) throw new Error("Password sign-in failed");
client.setAuth(result.tokens.token);
const participant = await client.query("participants:getCurrentParticipant", {});
const team = await client.query("teams:getMyTeam", {});
if (participant?.role !== "participant" || team?.code !== "DEMO01" || !team.memberIds.includes(participant._id)) {
  throw new Error("Participant role or team membership is incorrect");
}
console.log(JSON.stringify({ signedIn: true, email: participant.email, role: participant.role, team: team.name, teamCode: team.code }));
