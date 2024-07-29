FROM node:20-alpine AS base

# installing everything necessary and dependencies
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# moving dependencies and building
FROM base as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable pnpm && pnpm run build

# running
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# setting up for background services
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --gid 1001 nextjs

COPY --from=builder /app/public ./public

# creating .next directory and setting owner to nextjs:nodejs (for permissions)
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node server.js