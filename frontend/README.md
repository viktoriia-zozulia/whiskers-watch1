# WhiskersWatch — Frontend

React + TypeScript SPA for pet health monitoring, bundled and served with Bun.

## Scripts

```bash
bun install      # install dependencies
bun run dev      # dev server with HMR (proxies /api/* to the backend)
bun run start    # production server
bun run build    # build static bundle into dist/
```

## Architecture (Feature-Sliced Design)

The app is organised into layers, from low-level to high-level:

```
src/
  http_client/     # API layer: a shared fetch client + per-entity folders,
                   #   each with its own models (types) and service (calls)
  shared/          # framework-agnostic building blocks
    lib/           #   pure helpers: formatting, icons, styles, toast store
    ui/            #   reusable presentational components (ToastHost, PetAvatar)
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
  (`features/home/lib/healthAnalysis.ts`) that derives a 0–100 health score and
  actionable insights from records, tasks and weight history. Runs fully on the
  client, no external API.
- **Weight trend chart** — a smooth SVG sparkline of recent measurements.
- **Server-side record filtering** — the medical history filters by type and
  free-text search via the backend (`useFilteredRecords` hook).
