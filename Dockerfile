FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source and build
COPY . .
RUN pnpm run build

# Production image
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and install production dependencies only
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --ignore-scripts --frozen-lockfile || pnpm install --prod --ignore-scripts

# Copy compiled output and webui
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/webui ./webui
COPY --from=builder /app/.env* ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the server properly (we mapped start:server in package.json)
CMD ["node", "dist/server.js"]
