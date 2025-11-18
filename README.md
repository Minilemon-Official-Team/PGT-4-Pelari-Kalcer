# 🏃📸 RunCam

RunCam is an experimental AI-powered photo-matching system inspired by the phenomenon known as _pelari kalcer_ in Indonesia.

With RunCam, a photographer can upload their photos, and the system will create a face embedding of each detected person and safely store it in a database. Later, a user can register and match their face with photos already in the database. The user can then claim that photo and get the photographer’s contact information. The photo is removed after 30 days if it’s not claimed.

## Tech Stack

- [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/overview) for Vite-powered full-stack React framework
- [Bun](https://bun.sh/docs) for runtime & package manager
- [Tailwind CSS](https://tailwindcss.com) for CSS tooling
- [Drizzle](https://orm.drizzle.team/docs) for ORM (Object–relational mapping)
- [PostgreSQL](https://www.postgresql.org/) + [pgvector](https://github.com/pgvector/pgvector) for DB and vector similarity search
  - [Adminer](https://www.adminer.org/) for quick DB inspection
- [MinIO](https://min.io/) for local S3-compatible object storage
- [Biome](https://biomejs.dev/) for linting/formatting and [Vitest](https://vitest.dev/) for tests
- [face-api.js](https://justadudewhohacks.github.io/face-api.js/docs/index.html) for face detection and embedding creation (not added yet)

## Prerequisites

Install these tools before cloning the repo:

1. **Git** - [Installation](https://git-scm.com/install/)
2. **Bun** - [Installation](https://bun.sh/docs/installation)
3. **Docker Desktop** (or Engine) - [Installation](https://docs.docker.com/get-started/get-docker/) (for local Postgres/MinIO services)

These instructions assume a Unix-like shell (macOS/Linux/WSL 2). Windows PowerShell should work fine—just adapt the commands accordingly.

## Getting Started

```bash
git clone https://github.com/Minilemon-Official-Team/PGT-4-Pelari-Kalcer.git
cd PGT-4-Pelari-Kalcer

# install dependencies
bun install

# create a local .env (edit if you change credentials)
cp .env.example .env
```

### Launch the local stack

```bash
# start Postgres, MinIO, and Adminer
bun run db:up

# apply schema + seed demo users
bun run db:reset

# run the dev server (http://localhost:3000)
bun run dev

```

Useful URLs while the stack is running:

| Service       | URL                     | Default credentials                                      |
| ------------- | ----------------------- | -------------------------------------------------------- |
| App           | <http://localhost:3000> | –                                                        |
| Adminer       | <http://localhost:8080> | server: `postgres` · user: `postgres` · pass: `postgres` |
| MinIO API     | <http://localhost:9000> | –                                                        |
| MinIO Console | <http://localhost:9001> | user: `minio` · pass: `minio123`                         |

Stop everything with `bun run db:down` (add `-v` to remove volumes when you want a clean slate).

## Script Reference

All scripts run as `bun run <script>` unless noted.

| Script                      | Description                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| `db:up` / `db:down`         | Start or stop the Docker services (Postgres, MinIO, Adminer).           |
| `db:push`                   | Apply the current Drizzle schema directly to Postgres (fast iteration). |
| `db:generate`               | Produce SQL migration files from the TypeScript schema.                 |
| `db:migrate`                | Execute generated migrations.                                           |
| `db:seed`                   | Insert the three sample users.                                          |
| `db:reset`                  | Convenience combo: `db:push` + `db:seed`.                               |
| `dev` / `start`             | Launch the dev server on port 3000.                                     |
| `build` / `preview`         | Create and serve a production build.                                    |
| `test` / `test:watch`       | Run Vitest in CI or watch mode.                                         |
| `lint` / `format` / `check` | Run Biome lint, formatter (write), or read-only checks.                 |
| `verify`                    | Sequential `lint`, `check`, and `test` for pre-flight validation.       |

Our GitHub Actions workflow runs `verify`, `build`, and `db:reset` on pull requests to catch regressions early.

## Project Layout (Abridged)

```text
.
├── compose.yaml              # Postgres + MinIO + Adminer stack (with bucket bootstrap)
├── drizzle.config.ts         # Drizzle Kit configuration (uses DATABASE_URL)
├── scripts/seed.ts           # Bun script to seed sample users
├── src/
│   ├── components/Header.tsx # Persistent navigation with demo shortcuts
│   ├── config/env.server.ts  # Zod-backed server-only environment validation
│   ├── data/users.server.ts  # TanStack server functions for user CRUD
│   ├── db/client.ts          # Drizzle client singleton for Bun
│   ├── db/schema.ts          # Drizzle schema (users table)
│   ├── routes/demo/…         # Assortment of TanStack Start demos (SSR, API, etc.)
│   └── routes/demo/start.db-users.tsx # UI for the database demo
└── .github/workflows/ci.yml  # CI pipeline (lint, build, db smoke test)
```

Feel free to trim or extend the demo routes as features evolve.

## Feature Highlights

- **Database demo** (`/demo/start/db-users`): lists seeded users and lets you add new ones via TanStack server functions. Error states are surfaced when duplicate emails are submitted.
- **MinIO bucket bootstrap**: `create-bucket` service provisions a `photos` bucket automatically so future features can rely on object storage.
- **Generated routes**: `src/routeTree.gen.ts` is regenerated by TanStack; it’s excluded from lint formatting in `biome.json` for safety.
- **Tailwind 4**: located in `src/styles.css` with `@import "tailwindcss";`.

Additional demo routes under `src/routes/demo/start.*` showcase API requests, SSR modes, and TanStack Store usage if you want deeper explorations.

## Database & Storage Workflow

- Connection string lives in `.env` (`DATABASE_URL`). `src/config/env.server.ts` validates it during startup.
- Drizzle schema changes go into `src/db/schema.ts`. Use `db:push` for quick local syncing or `db:generate` + `db:migrate` when you want migration files committed.
- MinIO is optional for now but ready to support future features. Credentials are defined in `compose.yaml`; feel free to add more buckets via the `create-bucket` service or `mc` CLI.

## Quality Checks & CI

- Run `bun run verify` before opening a PR to catch lint/test issues quickly.
- GitHub Actions mirrors the same steps and runs `bun run db:reset` against a Postgres service (`postgres:18-alpine`) to ensure schema and seeds stay valid.
- CI currently focuses on the app and database; MinIO smoke tests can be added later when required.

## Contributing

We use conventional commits (e.g., `feat:`, `chore:`, `docs:`) and short-lived feature branches. Handy scripts before pushing:

```bash
bun run verify
bun run db:reset # optional but catches schema/seed issues
```

Open a draft PR early if you want async feedback. The repo is public, so keep secrets out of `.env` and commits.

See [`CONTRIBUTING.md`](docs/CONTRIBUTING.md) for our full workflow, rebase tips, and pull-request checklist.

## License

This project is distributed under the [MIT License](LICENSE).

## Further Reading

- [TanStack Start Docs](https://tanstack.com/start/latest/docs/framework/react/overview)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Bun Docs](https://bun.sh/docs)
