FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "src/server.js"] 