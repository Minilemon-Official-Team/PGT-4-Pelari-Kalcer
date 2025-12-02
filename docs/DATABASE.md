# Database Workflow Guide

This guide covers the database workflow for RunCam contributors. It explains when and how to generate migrations, what to do if you need to regenerate them, and best practices for keeping schema changes clean.

## Overview

RunCam uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL and pgvector. There are two ways to sync schema changes to the database:

| Command                                      | Use case                               | Creates migration files? |
| -------------------------------------------- | -------------------------------------- | ------------------------ |
| `bun run db:push`                            | Quick local development, throwaway DBs | No                       |
| `bun run db:generate` + `bun run db:migrate` | Team workflows, staging, production    | Yes                      |

For **feature branches that touch the schema**, always use `db:generate` so reviewers can see exactly what SQL will run.

## Quick Reference

```bash
# Local development (no migration files)
bun run db:push         # Sync schema directly to DB
bun run db:seed         # Insert demo data
bun run db:reset        # Shortcut: push + seed

# Team workflow (with migration files)
bun run db:generate     # Generate SQL migration from schema changes
bun run db:migrate      # Apply pending migrations to DB

# Troubleshooting
bun run db:drop         # Interactively remove a migration (see below)
```

## When to Generate Migrations

Generate migrations **once your feature is complete and tested**, right before requesting a PR review. This keeps the migration history clean and avoids unnecessary churn.

### Recommended Workflow

1. **During development:** Use `db:reset` freely to iterate on schema changes.

   ```bash
   # Edit src/db/schema.ts
   bun run db:reset   # Sync changes + re-seed
   ```

2. **Before PR review:** Generate the migration file.

   ```bash
   bun run db:generate
   ```

   This creates files in the `drizzle/` folder:
   - `XXXX_<name>.sql` — The actual SQL migration
   - `meta/XXXX_snapshot.json` — Schema snapshot at this point
   - `meta/_journal.json` — Migration history tracker

3. **Test the migration:** Apply it using the migration command (not push).

   ```bash
   bun run db:migrate   # Apply the generated migration
   bun run db:seed      # Then seed
   ```

4. **Commit the migration files** along with your schema changes.

## Regenerating Migrations

Sometimes you need to regenerate a migration. For example, after a PR review requests schema changes, or if you generated too early and made further edits.

### Using `db:drop` (Recommended)

Drizzle Kit provides an interactive command to safely remove migrations:

```bash
bun run db:drop
```

This command will:

1. Show you a list of all migrations
2. Let you select which one(s) to drop
3. Automatically clean up all related files (SQL, snapshot, and journal entry)

After dropping, regenerate:

```bash
bun run db:generate
```

### Manual Cleanup (If Needed)

If `db:drop` doesn’t work for some reason, manually remove:

1. The SQL file: `drizzle/XXXX_<name>.sql`
2. The snapshot: `drizzle/meta/XXXX_snapshot.json`
3. The journal entry in `drizzle/meta/_journal.json` (remove the entire object for that migration)

Then regenerate with `bun run db:generate`.

## Important Notes

### ⚠️ Only Drop Unapplied Migrations

The `db:drop` command should **only be used for migrations not yet applied to production or shared environments**. Once a migration has been run on a shared database, removing it will cause drift between your schema and the actual database state.

### Migration Naming

Drizzle Kit auto-generates migration names like `0000_nostalgic_skaar`. These names are random and harmless.

### Reviewing Migrations in PRs

When reviewing a PR with schema changes:

1. Check the `.sql` file to understand what DDL will run
2. Verify it matches the intent described in the PR
3. Look for potentially destructive operations (DROP, ALTER with data loss)

### Keeping Migrations Clean

- Generate migrations **once per feature**, not during iterative development
- If you need to make changes after generating, drop and regenerate rather than creating additional migrations
- Each PR should ideally have at most one new migration

## Troubleshooting

### “Migration already applied” Error

If you see this error after dropping and regenerating, your local DB still has the old migration recorded. Reset with:

```bash
bun run db:reset
```

### Schema Drift

If your local schema gets out of sync:

```bash
# Nuclear option: reset everything locally
bun run db:down -v      # Stop containers and remove volumes
bun run db:up           # Start fresh containers
bun run db:reset        # Push schema + seed
```

### Viewing Current Schema

Use Adminer at [http://localhost:8080](http://localhost:8080) to inspect the actual database schema and compare it against your Drizzle definitions.

## Further Reading

- [Drizzle Kit CLI Reference](https://orm.drizzle.team/docs/kit-overview)
- [Drizzle Migrations Guide](https://orm.drizzle.team/docs/migrations)
