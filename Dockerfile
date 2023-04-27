# Build stage
FROM node:20-buster-slim AS build

# Create a non-root user for better security
RUN useradd -m appuser
WORKDIR /app
COPY package*.json ./

# Install all dependencies, including development dependencies
RUN npm ci
COPY --chown=appuser:appuser . .
RUN npm run build

# Final stage
FROM node:20-buster-slim

RUN useradd -m appuser
WORKDIR /app
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files and set ownership
COPY --chown=appuser:appuser --from=build /app/dist/src /app/dist/src

# Switch to the non-root user
USER appuser

# Expose the port the app will run on
EXPOSE 3000

# Run the Node.js service
CMD ["npm", "start"]