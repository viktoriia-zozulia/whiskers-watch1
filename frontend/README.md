# WhiskersWatch — Frontend

React + TypeScript SPA for pet health monitoring, bundled and served with Bun.

## Scripts

```bash
bun install      # install dependencies
bun run dev      # dev server with HMR (proxies /api/* to the backend)
bun run build    # build static bundle into dist/ (served by the backend in production)
bun test         # unit tests (helpers, streaks, health engine)
bun run typecheck
```

## Architecture (Feature-Sliced Design)

The app is organised into layers, from low-level to high-level:

```
src/
  api/     # API layer: a shared fetch client + per-entity folders,
                   #   each with its own models (types) and service (calls)
  shared/          # framework-agnostic building blocks
    lib/           #   pure helpers: formatting, tasks, theme, fonts, toast store
    ui/            #   reusable components (Modal, Logo, PetAvatar, ThemeToggle, ToastHost)
  assets/          # images bundled with the app (landing screenshots)
  context/         # React contexts: Auth (session), Pet (data + actions), Nav
  hooks/           # custom hooks: useAuth, usePet, useNav, useFilteredRecords
  features/        # interactive units grouped per page (lists, modals, widgets)
    auth/  home/  medical/  profile/  settings/  pets/
  pages/           # composition only — assemble features, no business logic
  app/             # application shell: providers wiring + layout
```

**Rule of thumb:** business logic and state live in `context` + `hooks`; UI
behaviour lives in `features`; `pages` only arrange features on screen.

### Notable features

- **WhiskersAI** — a rule-based health-analysis engine
  (`features/home/healthAnalysis.ts`) that derives a 0–100 health score and
  actionable insights from records, tasks and weight history. Runs fully on the
  client, no external API.
- **Weight trend chart** — a smooth SVG sparkline of recent measurements.
- **Server-side record filtering** — the medical history filters by type and
  free-text search via the backend (`useFilteredRecords` hook).
- **Health passport** — `features/passport` renders a printable summary into a
  body-level portal; print CSS hides everything else, so "Save as PDF" yields
  a clean one-pager.
- **Dark mode** — `shared/lib/theme.ts` + palette remapping in `index.css`
  (no `dark:` variants in components).
- **Hash routing** — `NavContext` syncs the page with `#/medical` etc., so
  reloads, deep links and back/forward work without server rewrites.
- **Shared `Modal`** — Esc / backdrop close, focus, scroll lock, bottom sheet
  on mobile.
