# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Development stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
