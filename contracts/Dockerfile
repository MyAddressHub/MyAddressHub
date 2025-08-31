FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy contract source files
COPY . .

# Compile contracts (with error handling)
RUN npx hardhat compile || echo "Compilation failed, but continuing..."

# Expose Hardhat node port
EXPOSE 8545

# Default command (can be overridden)
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
