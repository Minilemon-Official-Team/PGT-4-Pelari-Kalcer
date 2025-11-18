# Contributing to RunCam

Welcome! This guide explains how we collaborate on the RunCam project. Our goal is to keep the workflow lightweight, predictable, and friendly for contributors with different experience levels.

- We follow a **feature-branch workflow** (see the [Atlassian guide](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)) and keep `main` protected.
- Day-to-day development mirrors [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow): branch off `main`, push updates frequently, open a pull request (PR), and iterate together.
- Everyone on the team has write access, so **forks are optional**. Create branches directly on this repository unless you prefer using a personal fork.

## Project Expectations

- **Language**: Write code, commits, and documentation in English when possible. Indonesian is fine in discussion threads if it helps the team move faster, but keep code readable for everyone.
- **Issues first**: Pick up work items from GitHub Issues (or the related Huly board). Leave a short comment when you start; assign yourself if it is unclaimed.
- **Security**: Never commit secrets or production credentials. Store them in `.env` files locally and add new variables to `.env.example` when needed.

## Local Setup Checklist

1. Clone the repository and follow the environment steps in [`README.md`](../README.md).
2. Copy `.env.example` to `.env`, then adjust values as needed.
3. Start the supporting services (`bun run db:up`) and reset the database (`bun run db:reset`).
4. Run the dev server with `bun run dev` and ensure the demo routes load.

The `README` also lists helpful scripts (`bun run verify`, `bun run db:push`, etc.).

## Standard Workflow

1. **Sync `main`**

   ```bash
   git checkout main
   git pull --ff-only origin main
   ```

   `--ff-only` ensures your local `main` matches the remote without unexpected merge commits.

2. **Create a feature branch**

   ```bash
   git checkout -b feat/<short-description>
   ```

   - Prefix with `feat/`, `fix/`, `chore/`, or `docs/` when it helps identify the type of work.
   - Reference the issue number if it exists (example: `feat/123-user-onboarding`).

3. **Develop & document**
   - Keep commits small and focused.
   - Update tests, docs, and sample data when behaviour changes.
   - Run key quality checks locally:
     ```bash
     bun run verify      # lint + type check + tests
     bun run db:reset    # optional safety net for schema/seed changes
     ```

4. **Commit using Conventional Commits** (see below).

5. **Push frequently**

   ```bash
   git push -u origin feat/<short-description>
   ```

6. **Open a PR** when the branch is ready for review (draft PRs are encouraged for early feedback).

7. A maintainer will [squash-merge](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-commits) PRs into `main` after review. Keep your branch up to date throughout the review process (see the next section).

## Keeping Your Branch Up to Date

When `main` changes while you are still working, rebase so you can integrate upstream updates cleanly.

```bash
# stay inside your feature branch
git fetch origin

git rebase origin/main
# resolve conflicts if they appear, then
#   git add <files>
#   git rebase --continue

# double-check everything still works
bun run verify

# force-push the updated history for your PR
git push --force-with-lease
```

Notes:

- `git fetch` pulls the latest data without touching your working tree.
- `git rebase origin/main` replays your commits on top of the newest `main`. If you prefer merges, talk with the team first—rebasing keeps the PR diffs tidy for squash merges.
- `--force-with-lease` prevents you from accidentally overwriting teammates' work on the same branch.

If a rebase feels risky or the conflicts are heavy, ask for a pairing session. It is faster to resolve together than to debug a broken branch later.

## Conventional Commits (Quick Guide)

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to make history searchable and changelog-friendly. Each commit message has the structure `type(scope?): subject`.

Common types:

| Type       | When to use it                          | Example                              |
| ---------- | --------------------------------------- | ------------------------------------ |
| `feat`     | New user-facing feature or endpoint     | `feat(auth): allow magic link login` |
| `fix`      | Bug fix                                 | `fix(db): prevent duplicate emails`  |
| `chore`    | Tooling and maintenance                 | `chore(ci): cache bun dependencies`  |
| `docs`     | Documentation changes                   | `docs: clarify seed instructions`    |
| `refactor` | Internal change without behaviour shift | `refactor(core): split env parser`   |
| `test`     | Add or improve automated tests          | `test(api): cover 404 responses`     |

Guidelines:

- Keep the subject line concise and in the imperative mood (“add”, “fix”, “update”).
- Link the related issue in the commit body or the PR description when appropriate.
- If a commit introduces a breaking change, mention it in the footer: `BREAKING CHANGE: short explanation`.

## Pull Request Checklist

Before you hit “Ready for review”:

- [ ] The branch is based on the latest `main`.
- [ ] `bun run verify` passes locally.
- [ ] Database migrations and seeds (if any) are tested with `bun run db:reset`.
- [ ] Documentation and `.env.example` reflect new environment variables or manual steps.
- [ ] Screenshots or short notes are added for visual changes.
- [ ] The PR description links the relevant issue and outlines testing steps for reviewers.

After approval, a maintainer will squash-merge the PR. Double-check the final squash commit message so it follows Conventional Commit guidelines.

## After Your PR Is Merged

Clean up your local environment so you are ready for the next task:

1. Sync `main` locally.

   ```bash
   git checkout main
   git pull --ff-only origin main
   ```

2. Remove the remote branch (if you created it on this repo).

   ```bash
   git push origin --delete feat/<short-description>
   ```

   If the branch lives on your fork, delete it there instead.

3. Delete the local branch.

   ```bash
   git branch -d feat/<short-description>
   ```

   Use `git branch -D <branch>` only when Git refuses to delete the branch because of unmerged commits.

4. Optionally prune stale references.

   ```bash
   git fetch origin --prune
   ```

These steps keep your workspace tidy and prevent accidental pushes to branches that are already merged.

## Working on Issues & Enhancements

- Use GitHub labels to signal scope (`enhancement`, `bug`, `good first issue`, etc.).
- For significant features, sketch the approach in the issue or PR description so others can review the plan before you invest too much time.
- If you discover a bug while working on something else, decide whether to fix it within the same PR (if related) or create a dedicated issue for visibility.

## Communication & Support

- Ask questions early—in Discord, GitHub, or Huly. [“Rubber-duck” explanations](https://en.wikipedia.org/wiki/Rubber_duck_debugging) often uncover the solution.
- Mention teammates when you need feedback or when you hand off work.
- Pairing is encouraged, especially for database changes or tricky rebases.

## Additional Resources

- [Feature Branch Workflow (Atlassian)](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md)
- [Git rebase documentation](https://git-scm.com/docs/git-rebase)
- [How to Write Better Git Commit Messages – A Step-By-Step Guide](https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/)
