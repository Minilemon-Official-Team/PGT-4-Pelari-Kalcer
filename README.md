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
- **Face Detection:** [face‑api.js](https://justadudewhohacks.github.io/face-api.js/docs/index.html) for face detection and embedding creation

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
├── drizzle.config.ts         # Drizzle Kit configuration (uses DATABASE_URL)
├── scripts/seed.ts           # Bun script to seed sample users
├── src/
│   ├── components/           # Layout pieces + UI primitives (Button, Input, Navbar, etc.)
│   ├── contracts/            # Shared Zod contracts for server/client data boundaries
│   ├── db/                   # Drizzle client + schema definitions
│   ├── features/             # Domain-specific logic & server functions
│   ├── lib/                  # Server utilities (env parsing, S3 helpers, classnames)
│   ├── routes/               # TanStack Start file-based routes
│   ├── workers/              # Background processors (image/embedding jobs, etc.)
│   └── styles/               # Global styles & Tailwind entrypoint
└── .github/workflows/ci.yml  # CI pipeline (lint, build, db smoke test)
```

If you’re new to the repo, good entry points are:

- `src/routes/` — how pages and demos are wired.
- `src/features/` — where domain logic and server functions will live.
- `src/contracts/` — shared Zod schemas for request/response shapes.

### Contracts Folder

`src/contracts/` hosts Zod schemas that describe the data flowing between routes, server functions, and workers. Each contract usually maps to either:

- a feature boundary (e.g., `auth.contract.ts` for login/register payloads),
- or a core entity/table (e.g., `users.contract.ts` mirrors the demo `users` table and powers the CRUD sample).

These schemas let server functions validate input and give components fully typed helpers without maintaining a separate public API spec.
For example, the `/demo/start/db-users` route uses `users.contract.ts` to validate payloads before touching the database.

## Database & Storage Workflow

- Connection string lives in `.env` (`DATABASE_URL`). `src/lib/env.ts` validates it during startup.
- Drizzle schema changes go into `src/db/schema.ts`. Use `db:push` for quick local syncing or `db:generate` + `db:migrate` when you want migration files committed.
- MinIO is optional for now but ready to support future features. Credentials are defined in `compose.yaml`; feel free to add more buckets via the `create-bucket` service or `mc` CLI.

## Quality Checks & CI

- Run `bun run check` before opening a PR to catch lint and type issues.
- CI (`.github/workflows/ci.yml`) runs `check`, `build`, and `db:reset` against a PostgreSQL service (`postgres:18-alpine`) to ensure the app still builds and seeds correctly.
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
