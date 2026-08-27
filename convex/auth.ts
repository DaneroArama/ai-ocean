import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      // will read AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from env
    }),
    GitHub,
  ],
});
