import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/** Minimal identity shape from @convex-dev/auth */
export interface AuthIdentity {
  email?: string;
  emailAddress?: string;
  subject?: string;
  name?: string;
  picture?: string;
  image?: string;
  tokenIdentifier?: string;
}

/** Resolve email from @convex-dev/auth identity — token often has no email, email lives in users table via subject */
export async function getEmailFromIdentity(
  ctx: QueryCtx | MutationCtx,
  identity: AuthIdentity
): Promise<string | null> {
  if (!identity) return null;
  if (identity.email) return identity.email;
  if (identity.emailAddress) return identity.emailAddress;
  const rawSubject = identity.subject;
  const userId = rawSubject?.split("|")[0];
  if (!userId) return null;
  try {
    const authUser = await ctx.db.get(userId as Doc<"users">["_id"]);
    if (authUser && "email" in authUser && typeof (authUser as { email?: unknown }).email === "string") {
      return (authUser as { email: string }).email;
    }
  } catch {}
  try {
    const users = await ctx.db.query("users").collect();
    const match = users.find((u) => u._id === userId);
    if (match && "email" in match && typeof (match as { email?: unknown }).email === "string") {
      return (match as { email: string }).email;
    }
  } catch {}
  return null;
}

export async function getParticipantByIdentity(
  ctx: QueryCtx | MutationCtx,
  identity: AuthIdentity
) {
  const email = await getEmailFromIdentity(ctx, identity);
  if (!email) return null;
  return await ctx.db.query("participants").withIndex("by_email", (q) => q.eq("email", email)).first();
}

/** Require admin role — throws if not authenticated or not admin */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  const p = await getParticipantByIdentity(ctx, identity);
  if (!p || p.role !== "admin") throw new Error("Admin required");
  return p;
}

/** Fisher-Yates shuffle */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
