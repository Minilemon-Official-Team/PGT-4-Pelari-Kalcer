import { createMiddleware } from "@tanstack/react-start";
import { getRequest, getRequestHeaders } from "@tanstack/react-start/server";
import { authClient } from "@/lib/auth-client";
import { auth } from "./auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: getRequestHeaders() as HeadersInit,
    },
  });
  return await next({
    context: {
      user: {
        id: session?.user?.id,
        name: session?.user?.name,
        role: session?.user?.role,
      },
    },
  });
});

export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  const notAuthorized = !session?.user || session.user.role !== "admin";

  if (notAuthorized) {
    throw new Error("Authorization error: Admin access required");
  }

  return await next({
    context: {
      user: {
        id: session?.user?.id,
        name: session?.user?.name,
        role: session?.user?.role,
      },
    },
  });
});

export const requireMember = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  const notAuthorized = !session?.user || session.user.role !== "member";

  if (notAuthorized) {
    throw new Error("Authorization error: Member access required");
  }

  return await next({
    context: {
      user: {
        id: session?.user?.id,
        name: session?.user?.name,
        role: session?.user?.role,
      },
    },
  });
});

export const requireCreator = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const session = await auth.api.getSession({ headers: request.headers });
  const notAuthorized = !session?.user || session.user.role !== "creator";

  if (notAuthorized) {
    throw new Error("Authorization error: Creator access required");
  }

  return await next({
    context: {
      user: {
        id: session?.user?.id,
        name: session?.user?.name,
        role: session?.user?.role,
      },
    },
  });
});
