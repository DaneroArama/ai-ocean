import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)", "/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/auth(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  // redirect unauthenticated users to signin
  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, `/auth/signin?next=${request.nextUrl.pathname}`);
  }
  // optional: redirect authenticated away from signin
  if (isAuthRoute(request) && isAuthenticated) {
    // let them stay — don't force redirect, user may want to switch account
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
