import type { auth } from "@/lib/auth";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, creator, member } from "./permissions";
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), adminClient({ac, defaultRole: "member", roles: {
    admin, member, creator
  }})],
});

export const { getSession, useSession, signIn, signOut, signUp } = authClient;
