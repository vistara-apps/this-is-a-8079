# Reddit Digest - Multi-service Docker Configuration

# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY index.html ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/

# Build frontend for production
RUN npm run build

# Build stage for backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Production stage - serves both frontend and backend
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy backend dependencies and code
COPY --from=backend-builder /app/node_modules ./node_modules
COPY server/ ./

# Copy built frontend assets to be served by backend
COPY --from=frontend-builder /app/dist ./public

# Create necessary directories
RUN mkdir -p logs uploads
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (backend serves both API and frontend)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
