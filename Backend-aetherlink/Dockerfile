# Stage 1: Build stage (install dependencies)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev for nodemon if needed, but we use node in prod)
RUN npm ci --only=production

# Stage 2: Production stage (lightweight runtime)
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy your source code
COPY . .

# Expose the port your app uses
EXPOSE 5000

# Use the production start command (we'll update package.json next)
CMD ["npm", "start"]