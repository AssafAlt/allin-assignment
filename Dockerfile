FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Use a dummy URL to satisfy build-time generation
RUN DATABASE_URL="postgresql://postgres:password@localhost:5432/db" npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# We need src because your client is inside src/app/generated
COPY --from=builder /app/src ./src
# We need data for the seeder
COPY --from=builder /app/data ./data

RUN rm -f .env .env.local

EXPOSE 3000

CMD ["npm", "run", "prod:start"]