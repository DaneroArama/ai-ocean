import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { Value } from "convex/values";

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
    }),
    Google({
      // will read AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from env
    }),
    GitHub,
  ],
});
