# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy all application files (respects .dockerignore)
COPY . .

# Set build-time environment variables (can be overridden)
ARG NEXT_PUBLIC_API_BASE_URL=http://172.20.10.168:9001
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Set Node.js options for better memory handling
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the Next.js application
RUN set -e && \
    echo "=========================================" && \
    echo "Starting Next.js build..." && \
    echo "NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}" && \
    echo "Node version: $(node --version)" && \
    echo "NPM version: $(npm --version)" && \
    echo "=========================================" && \
    npm run build && \
    echo "=========================================" && \
    echo "Build command completed. Checking output..." && \
    echo "Contents of /app:" && \
    ls -la /app && \
    echo "=========================================" && \
    if [ ! -d "/app/out" ]; then \
      echo "ERROR: Build output directory '/app/out' not found!"; \
      echo "Checking for .next directory:"; \
      if [ -d "/app/.next" ]; then \
        echo ".next directory exists:"; \
        ls -la /app/.next | head -10; \
      else \
        echo ".next directory not found"; \
      fi; \
      echo "Checking next.config.js:"; \
      cat next.config.js 2>/dev/null || echo "next.config.js not found"; \
      echo "Checking package.json build script:"; \
      cat package.json | grep -A 2 '"build"' || echo "Could not read package.json"; \
      exit 1; \
    fi && \
    echo "Build successful! Output directory found." && \
    echo "Contents of /app/out:" && \
    ls -la /app/out && \
    echo "========================================="

# Stage 2: Production image with nginx
FROM nginx:alpine

# Copy the built static files from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

