import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { type SessionUser, sessionUserSchema } from "@/contracts/auth.contract";
import { auth } from "@/lib/auth";

export type AuthContext = {
  user: SessionUser;
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
};

async function getSessionOrThrow() {
  const request = getRequest();
  if (!request?.headers) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const session = await getSessionOrThrow();
  const user = sessionUserSchema.parse(session.user);

  return next({
    context: {
      user,
      session,
    },
  });
});

export const authMiddleware = requireAuth;

function createRoleMiddleware(role: string) {
  return createMiddleware({ type: "function" }).server(async ({ next }) => {
    const session = await getSessionOrThrow();

    if (session.user.role !== role) {
      throw new Response("Forbidden", { status: 403 });
    }

    const user = sessionUserSchema.parse(session.user);

    return next({
      context: {
        user,
        session,
      },
    });
  });
}

export const requireAdmin = createRoleMiddleware("admin");
export const requireMember = createRoleMiddleware("member");
export const requireCreator = createRoleMiddleware("creator");
