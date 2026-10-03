# Liquor House Kenya — standalone Astro storefront, SSR via @astrojs/node.
#
# A project of its own: the build context is this folder and nothing outside it, with its own
# pnpm root (pnpm-workspace.yaml) and lockfile. Build it with `docker compose up --build` here,
# or point any host (Dokploy, a VPS) at liquorhouse/docker-compose.yml.
#
# NOTE: Astro inlines every PUBLIC_* var at BUILD time, so they are passed as build args
# (not runtime env). Changing the backend URL or the publishable key means rebuilding the
# image — there is no runtime override.
#
# Built with PUBLIC_MEDUSA_KEY_LIQUORHOUSE empty, the image serves the demo cellar
# (src/data/catalog.ts, photographs in public/bottles/) with WhatsApp checkout. With the key,
# the shelf, basket and checkout come from the shop's Medusa sales channel.
# ---------------------------------------------------------------- build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.32.0 --activate

# build-time public config (baked into the bundle)
ARG PUBLIC_MEDUSA_URL
ARG PUBLIC_MEDUSA_KEY_LIQUORHOUSE
ARG PUBLIC_MEDUSA_REGION_ID
ARG PUBLIC_SITE_URL
ENV PUBLIC_MEDUSA_URL=$PUBLIC_MEDUSA_URL \
    PUBLIC_MEDUSA_KEY_LIQUORHOUSE=$PUBLIC_MEDUSA_KEY_LIQUORHOUSE \
    PUBLIC_MEDUSA_REGION_ID=$PUBLIC_MEDUSA_REGION_ID \
    PUBLIC_SITE_URL=$PUBLIC_SITE_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# ---------------------------------------------------------------- runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4321
# /healthz touches nothing — never point this at a page that calls the backend. Checked with
# Node's own fetch, so the image needs no curl (and no package download to get it).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://localhost:4321/healthz').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

CMD ["node", "./dist/server/entry.mjs"]
