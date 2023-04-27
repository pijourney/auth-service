FROM  node:20-buster-slim

# Create a non-root user for better security
RUN useradd -m appuser
WORKDIR /app
COPY package*.json ./
# Move over code and install dependencies
RUN npm ci --only=production
COPY --chown=appuser:appuser . .
RUN npm run build
# Switch to the non-root user
USER appuser

# Expose the port the app will run on
EXPOSE 3000

# Run the Node.js service
CMD ["npm", "start"]