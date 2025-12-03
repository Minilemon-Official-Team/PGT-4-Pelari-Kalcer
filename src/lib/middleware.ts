import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return next({ context: { session: session.session, user: session.user } });
});
