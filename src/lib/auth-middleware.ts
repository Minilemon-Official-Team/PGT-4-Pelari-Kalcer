import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name?: string | null;
  role?: string | null;
  email?: string | null;
};

export type AuthContext = {
  user: SessionUser;
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
};

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();

  if (!request?.headers) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return next({
    context: {
      user: {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
        email: session.user.email,
      },
      session,
    },
  });
});

export const authMiddleware = requireAuth;

export const requireAdmin = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();

  if (!request?.headers) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const notAuthorized = !session?.user || session.user.role !== "admin";

  if (notAuthorized) {
    throw new Error("Authorization error: Admin access required");
  }

  return next({
    context: {
      user: {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
        email: session.user.email,
      },
      session,
    },
  });
});

export const requireMember = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();

  if (!request?.headers) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const notAuthorized = !session?.user || session.user.role !== "member";

  if (notAuthorized) {
    throw new Error("Authorization error: Member access required");
  }

  return next({
    context: {
      user: {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
        email: session.user.email,
      },
      session,
    },
  });
});

export const requireCreator = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();

  if (!request?.headers) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  const notAuthorized = !session?.user || session.user.role !== "creator";

  if (notAuthorized) {
    throw new Error("Authorization error: Creator access required");
  }

  return next({
    context: {
      user: {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
        email: session.user.email,
      },
      session,
    },
  });
});
