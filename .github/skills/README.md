# Copilot Agent Skills (repo-local)

This repository uses GitHub Copilot Agent Skills.

Skills live under `.github/skills/<skill-name>/SKILL.md`.

## Included skills

- `beads-issue-tracking`: bd (beads) workflow + mandatory end-of-session push steps
- `bun-monorepo-workflows`: bun install/run/filter workflows + pnpm → bun migration checklist for this monorepo
- `pnpm-monorepo-workflows`: setup/dev/build commands for this pnpm monorepo
- `d1-drizzle-migrations`: D1 + Drizzle + Better Auth schema/migration workflow
- `cloudflare-worker-typegen`: regenerate worker binding types when `wrangler.jsonc` changes
- `shadcn-ui-builder`: add/update shadcn/ui components and blocks (monorepo + Tailwind v4)
- `tanstack-server-functions`: TanStack Start server functions + middleware patterns

## Notes

- Skills are loaded automatically by Copilot when relevant to your prompt.
- Keep always-on conventions in `.github/copilot-instructions.md` and use skills for deeper, task-specific procedures.
