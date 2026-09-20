# ==============================================================================
# Multi-stage Dockerfile for Weather Intelligence
# Stage 1: Build the Vite production assets
# Stage 2: Serve using lightweight Nginx Alpine container
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Build Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci || npm install

# Copy application source code
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# ------------------------------------------------------------------------------
# 2. Production Runtime Stage
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
