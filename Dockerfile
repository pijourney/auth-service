FROM  node:slim

# Create a non-root user for better security
RUN useradd -m appuser
WORKDIR /app
COPY package*.json ./
# Move over code and install dependencies
RUN npm ci --only=production
COPY . .
# Change ownership of the /app directory to the appuser
RUN chown -R appuser:appuser /app
# Switch to the non-root user
USER appuser

# Expose the port the app will run on
EXPOSE 3000

# Run the Node.js service
CMD ["npm", "start"]