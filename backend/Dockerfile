FROM oven/bun:1.1-alpine AS base
WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN bun install

COPY . .

RUN bunx prisma generate

EXPOSE 4000

CMD ["bun", "run", "start:dev"]
