# Build-Stage
FROM node:18-alpine AS builder
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Production-Stage
FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/build ./build
COPY --from=builder /app/start-server.js .
COPY --from=builder /app/public ./public

# Expose the port the app runs on
EXPOSE 8080

# Set the command to run the app
CMD ["sh", "-c", "npx prisma migrate deploy && node start-server.js"]
