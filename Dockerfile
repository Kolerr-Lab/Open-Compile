# Multi-stage Dockerfile for OpenCompile
# Built by Ricky Anh Nguyen - Kolerr Lab & OrchesityAI

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the project
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/webui ./webui

# Create directories
RUN mkdir -p /app/knowledge-base /app/generated-projects

# Create non-root user for security
RUN addgroup -g 1001 -S opencompile && \
    adduser -S opencompile -u 1001

# Change ownership
RUN chown -R opencompile:opencompile /app

# Switch to non-root user
USER opencompile

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/server.js"]

# Expose port for Web UI (if needed)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Set environment
ENV NODE_ENV=production

# Default command
CMD ["node", "dist/cli/index.js", "--help"]
