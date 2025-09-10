FROM oven/bun:1 as base
WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

FROM oven/bun:1-alpine as production
WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile --production

COPY --from=base /app/dist ./dist

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 3000

CMD ["bun", "run", "start:prod"]