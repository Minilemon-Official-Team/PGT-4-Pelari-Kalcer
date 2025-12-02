# 🏃📸 RunCam

RunCam is an experimental, AI‑powered photo‑matching system inspired by the phenomenon known as _pelari kalcer_ in Indonesia.

Photographers upload their photos, the system creates a face embedding for each detected person, and securely stores those embeddings in a database. Later, users can register, match their face against stored embeddings, claim matching photos, and receive the photographer’s contact information. Unclaimed photos are automatically removed after 30 days.

**Project status:** Early scaffolding stage → demo flows are working, core RunCam features are not built yet.

## Tech Stack

- **Framework & Runtime:** [TanStack Start](https://tanstack.com/start) on [Vite](https://vitejs.dev/) running with [Bun](https://bun.sh/)
- **UI Layer:** [React](https://react.dev/) with [Tailwind CSS](https://tailwindcss.com) and [lucide-react](https://lucide.dev/) icons
- **Routing & Data Fetching:** [TanStack Router](https://tanstack.com/router) with [TanStack Query](https://tanstack.com/query) and router/SSR integration helpers
- **Validation & Contracts:** [Zod](https://zod.dev/) for runtime-safe schemas shared between server and client
- **Database & Migrations:** [PostgreSQL](https://www.postgresql.org/) + [pgvector](https://github.com/pgvector/pgvector) via [Drizzle ORM](https://orm.drizzle.team/)
- **Object Storage:** [MinIO](https://min.io/) for local S3‑compatible buckets
- **Tooling & DX:** [Biome](https://biomejs.dev/) for linting/formatting, [TanStack Devtools](https://tanstack.com/devtools) (Router/Query), and [Adminer](https://www.adminer.org/) for quick database inspection
- **Face Detection:** [@vladmandic/human](https://github.com/vladmandic/human) for face detection and embedding extraction (1024-dim vectors via `faceres` model)

## Prerequisites

Install these tools before cloning the repo:

1. **Git** ([Installation guide](https://git-scm.com/install/))
2. **Bun** ([Installation guide](https://bun.sh/docs/installation))
3. **Docker Desktop** ([Installation guide](https://docs.docker.com/get-started/get-docker/)) → recommended for running local PostgreSQL and MinIO via `docker compose`.

If you skip Docker, database-related scripts and demos will not work.

These instructions assume a Unix-like shell (macOS/Linux/WSL 2). Windows PowerShell should work fine with a few adjustments.

## Getting Started

```bash
git clone https://github.com/Minilemon-Official-Team/PGT-4-Pelari-Kalcer.git
cd PGT-4-Pelari-Kalcer

# install dependencies
bun install

# create a local .env (edit if you change credentials)
cp .env.example .env
```

### Running the app locally

Once dependencies are installed and `.env` is in place, start everything with:

```bash
# start Postgres, MinIO, and Adminer
bun run db:up

# apply schema + seed demo users
bun run db:reset

# run the dev server (http://localhost:3000)
bun run dev
```

### Verifying the setup

After running the setup commands, verify everything works:

**1. Check Docker containers are running:**

```bash
docker ps
```

You should see 3 containers: `pgt4-postgres`, `pgt4-adminer`, and `pgt4-minio`.

**2. Verify pgvector extension is active:**

Open Adminer at [http://localhost:8080](http://localhost:8080) and login:

- Server: `postgres`
- Username: `postgres`
- Password: `postgres`
- Database: `pgt4_pelari_kalcer`

Run this SQL query in the SQL command panel:

```sql
SELECT '[1,2,3]'::vector;
```

If it returns `[1,2,3]`, pgvector is working correctly.

**3. Check seed data:**

```sql
-- Users by role (should be 2 members, 2 creators, 2 admins)
SELECT role, COUNT(*) as count FROM "user" GROUP BY role ORDER BY role;

-- User embeddings count (should be 6 - one per user)
SELECT COUNT(*) as total_embeddings FROM user_embedding;

-- Events created (should be 2)
SELECT COUNT(*) as total_events FROM "event";
```

Expected results:

- Users: 2 `member`, 2 `creator`, 2 `admin`
- User embeddings: 6 total (1024-dimensional vectors)
- Events: 2 total

## Feature Highlights (Initial Scaffolding)

- **Database demo** (`/demo/start/db-users`): full CRUD (list, create, edit, delete) via TanStack server functions and shared contracts.
- **SSR and data demos**: routes under `src/routes/demo/start.*` showcase API requests, SSR modes, and TanStack Store usage.

Useful URLs while the stack is running:

| Service       | URL                     | Default credentials                                      |
| ------------- | ----------------------- | -------------------------------------------------------- |
| App           | <http://localhost:3000> | -                                                        |
| Adminer       | <http://localhost:8080> | server: `postgres` · user: `postgres` · pass: `postgres` |
| MinIO API     | <http://localhost:9000> | -                                                        |
| MinIO Console | <http://localhost:9001> | user: `minio` · pass: `minio123`                         |

Stop everything with `bun run db:down` (add `-v` to remove volumes when you want a clean slate).

## Script Reference

All scripts run as `bun run <script>` unless noted. Use these for day‑to‑day development and database work.

### App scripts

| Script           | Description                                         |
| ---------------- | --------------------------------------------------- |
| `dev`            | Start the Bun-powered Vite dev server on port 3000. |
| `build`          | Run a full production build via Vite and Nitro.     |
| `preview`        | Serve the built client bundle with Vite preview.    |
| `start`          | Boot the compiled Nitro server from `.output/`.     |
| `clean`          | Remove build artifacts                              |
| `clean:all`      | Full clean including `node_modules` and lock file.  |
| `lint` / `check` | Run Biome lint or the stricter check suite.         |
| `format`         | Apply Biome code formatting in-place.               |

### Database scripts

| Script              | Description                                                                             |
| ------------------- | --------------------------------------------------------------------------------------- |
| `db:up` / `db:down` | Start or stop the Docker services (PostgreSQL, MinIO, Adminer).                         |
| `db:push`           | Sync the current Drizzle schema directly to PostgreSQL (local dev, no migration files). |
| `db:generate`       | Generate SQL migration files from the TypeScript schema.                                |
| `db:migrate`        | Apply the generated migrations to the database.                                         |
| `db:seed`           | Run the seed script to insert demo data.                                                |
| `db:reset`          | Reset the local database: `db:push` followed by `db:seed`.                              |

> For team workflows and production, prefer `db:generate` + `db:migrate` instead of `db:push`.

## Project Layout

This is the high-level layout; you don’t need to memorize it, but it helps to know where things live:

```text
.
├── drizzle.config.ts         # Drizzle Kit configuration
├── scripts/                  # Scripts to seed samples, enable pgvector, test things, etc.
├── src/
│   ├── components/           # Layout pieces + UI primitives
│   ├── contracts/            # Shared Zod contracts for server/client data boundaries
│   ├── db/                   # Drizzle client + schema definitions
│   ├── features/             # Domain-specific logic & server functions
│   ├── lib/                  # Reusable utilities
│   ├── routes/               # TanStack Start file-based routes
│   ├── workers/              # Background workers (photo processing pipeline)
│   └── styles/               # Global Tailwind CSS entrypoint
└── .github/workflows/ci.yml  # CI pipeline (lint, build, db smoke test)
```

If you’re new to the repo, good entry points are:

- `src/routes/` — how pages are wired.
- `src/features/` — where domain logic and server functions live.
- `src/contracts/` — shared Zod schemas for request/response shapes.
- `src/lib/` — core utilities for handling various things.

### Contracts Folder

`src/contracts/` hosts Zod schemas that describe the data flowing between routes, server functions, and workers. Current contracts include:

- `auth.contract.ts` — authentication-related payloads
- `users.contract.ts` — user entity schemas
- `photos.contract.ts` — photo upload and processing schemas

These schemas let server functions validate input and give components fully typed helpers without maintaining a separate public API spec.
For example, the `/demo/start/db-users` route uses `users.contract.ts` to validate payloads before touching the database.

## Database & Storage Workflow

- Connection string lives in `.env` (`DATABASE_URL`). `src/lib/env.ts` validates environment variables during startup.
- Drizzle schema changes go into `src/db/schema.ts`. Use `db:push` for quick local syncing or `db:generate` + `db:migrate` when you want migration files committed.
- S3 storage uses Bun's native `S3Client` (see `src/lib/s3.ts`), making it provider-agnostic. For local development, MinIO runs via Docker. For production, configure `S3_ENDPOINT_URL` to point to Supabase Storage, Cloudflare R2, or any S3-compatible service.

## Quality Checks & CI

- Run `bun run check` before opening a PR to catch lint and type issues.
- CI (`.github/workflows/ci.yml`) runs `check`, `build`, and `db:reset` against a PostgreSQL service (`pgvector/pgvector:pg18`) to ensure the app still builds and seeds correctly.
- Optionally run `bun run build` locally when you change build or config tooling (Vite, Nitro, env, tsconfig, drizzle config).

## Contributing

We use conventional commits (e.g., `feat:`, `chore:`, `docs:`) and short-lived feature branches. Handy scripts before pushing:

```bash
bun run check
bun run db:reset # optional but catches schema/seed issues
```

Open a draft PR early if you want async feedback. The repo is public, so keep secrets out of `.env` and commits.

See [`CONTRIBUTING.md`](docs/CONTRIBUTING.md) for our full workflow.

## License

This project is distributed under the [MIT License](LICENSE).

## Further Reading

- [TanStack Start Docs](https://tanstack.com/start/latest/docs/framework/react/overview)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Bun Docs](https://bun.sh/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
