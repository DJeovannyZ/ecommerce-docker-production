# syntax=docker/dockerfile:1.7

# =============================================================================
# Frontend Next.js 16 (App Router) - imagen de produccion
#
# Etapas:
#   base    -> Node + pnpm (Corepack) y variables comunes
#   deps    -> solo manifiestos y lockfile, capa cacheable
#   builder -> compila `next build` con salida `standalone`
#   runner  -> imagen final minima: server.js + assets, usuario no-root
#
# Nota sobre la version de Node: la consigna recomienda node:20-alpine, pero
# el repositorio fija `packageManager: pnpm@11.28.5`, cuyo engine exige
# Node >= 22.13. Next.js 16 solo exige >= 20.9, por lo que Node 22 es la
# version mas baja compatible con todo el toolchain.
# =============================================================================

ARG NODE_VERSION=22

# --- Base -------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME=/pnpm \
    PATH=$PNPM_HOME:$PATH \
    NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@11.28.5 --activate
WORKDIR /app

# --- Dependencias -----------------------------------------------------------
# Se copian solo los manifiestos para que esta capa se reutilice mientras no
# cambie el lockfile. El store de pnpm se cachea con BuildKit.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# --- Build ------------------------------------------------------------------
# Las variables NEXT_PUBLIC_* se inlinean en el bundle durante el build, por
# eso se reciben como build args y no como variables de runtime.
FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_SITE_NAME="Web Vitals Store"
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- Runtime ----------------------------------------------------------------
# La salida `standalone` ya incluye solo las dependencias rastreadas por Next:
# no se copia node_modules completo ni el codigo fuente TypeScript.
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# libc6-compat evita problemas de binarios precompilados (sharp) en musl.
RUN apk add --no-cache libc6-compat \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Next puede escribir cache de imagenes/ISR en .next/cache.
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 3000

# server.js es el entrypoint generado por `output: "standalone"`.
CMD ["node", "server.js"]
