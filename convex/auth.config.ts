import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google({
      // OAuth client ID and secret will be configured in Convex dashboard
      // as environment variables: AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
    }),
    GitHub({
      // OAuth client ID and secret will be configured in Convex dashboard
      // as environment variables: AUTH_GITHUB_ID and AUTH_GITHUB_SECRET
    }),
  ],
});
