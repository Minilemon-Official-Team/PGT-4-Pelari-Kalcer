import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { authMiddleware } from "./auth-middleware";

export const getAuthSession = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();

  if (!request?.headers) {
    return { session: null, user: null };
  }

  const userSession = await auth.api.getSession({ headers: request.headers });

  if (!userSession) return null;

  return userSession;
});

export const getUserId = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context?.user?.id;
  });

export const getUserRole = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context?.user?.role;
  });
