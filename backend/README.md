# WhiskersWatch — API

Bun + Elysia + Kysely + PostgreSQL. See the [root README](../README.md) for the full picture.

```bash
cp .env.example .env   # DATABASE_URL, JWT_SECRET (+ optional Google / SMTP)
bun install
bun run migrate        # idempotent schema migration
bun run seed           # (re)creates demo@whiskers.app / demo1234
bun run dev            # http://localhost:3001
bun test               # unit tests; set API_URL to also run API integration tests
```

In production (see the root `Dockerfile`) set `STATIC_DIR` to the built
frontend and this process serves the whole app.
