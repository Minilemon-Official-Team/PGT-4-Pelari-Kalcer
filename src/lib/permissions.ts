import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

export const statement = { defaultStatements };

export const ac = createAccessControl({
  ...defaultStatements,
  creatorRequest: ["submit", "approve", "list"],
});

export const member = ac.newRole({
  ...userAc.statements,
  creatorRequest: ["submit"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  creatorRequest: ["approve", "list"]
})

export const creator = ac.newRole({
  ...userAc.statements,
})
