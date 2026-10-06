# One image = the whole app: the API serves the built React bundle.

# ── 1. Build the frontend ──────────────────────────────────────────────────────
FROM oven/bun:1.3 AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

# ── 2. Runtime: API + static files ─────────────────────────────────────────────
FROM oven/bun:1.3-slim
WORKDIR /app/backend
ENV NODE_ENV=production \
    STATIC_DIR=/app/frontend/dist \
    PORT=3001
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production
COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist

USER bun
EXPOSE 3001
# Migrations are idempotent, so running them on every start keeps the schema current.
CMD ["sh", "-c", "bun run migrate && exec bun index.ts"]
