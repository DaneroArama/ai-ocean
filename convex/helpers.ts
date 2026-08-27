import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/** Minimal identity shape from @convex-dev/auth */
interface AuthIdentity {
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
