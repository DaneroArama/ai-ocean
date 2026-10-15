import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { AnyDataModel, GenericMutationCtx } from "convex/server";
import { Value } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { NOT_ON_ROSTER } from "./helpers";

type RosterCtx = GenericMutationCtx<DataModel>;

// The auth callbacks receive an untyped mutation context; retype it against
// this app's schema so roster lookups are type-safe.
function withSchema(ctx: GenericMutationCtx<AnyDataModel>): RosterCtx {
  return ctx as unknown as RosterCtx;
}

async function participantByEmail(ctx: RosterCtx, email: string) {
  return await ctx.db
    .query("participants")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile: (params): { email: string } & Record<string, Value> => {
        const email = String(params.email ?? "")
          .trim()
          .toLowerCase();
        const profile: { email: string } & Record<string, Value> = { email };
        const name = typeof params.name === "string" ? params.name.trim() : "";
        if (name) profile.name = name;
        return profile;
      },
      // Runs only when a password is created (signUp today; reset-verification
      // if email reset is ever enabled). Participants activate their account
      // once with the shared event password, then change it in the dashboard.
      validatePasswordRequirements: (password) => {
        if (!password || password.length < 8)
          throw new Error("Password must be at least 8 characters.");
        const shared = process.env.ROSTER_SHARED_PASSWORD;
        if (!shared || password !== shared)
          throw new Error(
            "Incorrect activation password. Use the shared password given by the event team, then change it after signing in.",
          );
      },
    }),
    Google({
      // will read AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from env
    }),
  ],
  callbacks: {
    // Runs before any user or auth-account document is created
    // (credentials sign-up and every OAuth sign-in). Replaces the default
    // user upsert, so it also performs it after the roster check passes.
    createOrUpdateUser: async (ctx, args) => {
      const db = withSchema(ctx);
      const email = text(args.profile.email)?.toLowerCase();
      if (!email)
        throw new Error(
          "This account has no email address. Sign in with an account that has one.",
        );
      const participant = await participantByEmail(db, email);
      if (!participant) throw new Error(NOT_ON_ROSTER);
      // Admins normally use Google. Block creating a NEW password account for
      // an admin, but let pre-existing password accounts (seeded demos, legacy)
      // keep signing in.
      if (
        args.type === "credentials" &&
        participant.role === "admin" &&
        args.existingUserId === null
      )
        throw new Error("Admin accounts sign in with Google.");
      const name = text(args.profile.name);
      const image = text(args.profile.image);
      const oauth = args.type === "oauth";
      const profile = {
        email,
        ...(name ? { name } : {}),
        ...(image ? { image } : {}),
        ...(oauth ? { emailVerificationTime: Date.now() } : {}),
      };
      if (args.existingUserId !== null) {
        await db.db.patch(args.existingUserId, profile);
        return args.existingUserId;
      }
      if (oauth) {
        const linked = await db.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", email))
          .take(2);
        if (linked.length === 1) {
          await db.db.patch(linked[0]._id, profile);
          return linked[0]._id;
        }
      }
      return await db.db.insert("users", profile);
    },
    // Runs before every session is persisted (password, Google, refresh-adjacent
    // sign-ins). Catches non-roster emails that already have auth accounts.
    beforeSessionCreation: async (ctx, { userId }) => {
      const db = withSchema(ctx);
      const user = await db.db.get(userId);
      const email =
        typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
      if (!email) throw new Error(NOT_ON_ROSTER);
      const participant = await participantByEmail(db, email);
      if (!participant) throw new Error(NOT_ON_ROSTER);
    },
  },
});
