import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/generate",
    "/api/generate",
    "/api/generate-questions",
    "/api/generate-review",
    "/api/generate-content",
    "/api/generate-explanation",
    "/api/analysePdf",
    "/pricing",
    "/learn",
    "/sign-in",
    "/sign-up",
  ],
  ignoredRoutes: [
    "/((?!api|trpc))(_next.*|.+.[\\w]+$)", // Ignore static files
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
