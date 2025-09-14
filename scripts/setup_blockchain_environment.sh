#!/bin/bash

# Setup script for blockchain environment
# This script sets up the complete blockchain development environment

set -e

echo "🚀 Setting up MyAddressHub Blockchain Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker/docker-compose.yml" ]; then
    print_error "Please run this script from the MyAddressHub root directory"
    exit 1
fi

print_status "Setting up blockchain environment..."

# Step 1: Generate encryption keys
print_status "Generating encryption keys..."
if [ -f "scripts/generate_encryption_keys.py" ]; then
    python3 scripts/generate_encryption_keys.py
    print_success "Encryption keys generated"
else
    print_error "Encryption key generator script not found"
    exit 1
fi

# Step 2: Create .env file if it doesn't exist
print_status "Setting up environment file..."
if [ ! -f "api/.env" ]; then
    if [ -f "templates/env/development/api.env.template" ]; then
        cp templates/env/development/api.env.template api/.env
        print_success "Environment file created from template"
        print_warning "Please update api/.env with your actual values"
    else
        print_error "Environment template not found"
        exit 1
    fi
else
    print_warning "Environment file already exists, skipping creation"
fi

# Step 3: Install dependencies
print_status "Installing Python dependencies..."
cd api
if [ -f "requirements/base.txt" ]; then
    pip install -r requirements/base.txt
    print_success "Python dependencies installed"
else
    print_error "Requirements file not found"
    exit 1
fi
cd ..

# Step 4: Install Node.js dependencies for contracts
print_status "Installing Node.js dependencies for contracts..."
cd contracts
if [ -f "package.json" ]; then
    npm install
    print_success "Node.js dependencies installed"
else
    print_error "Contract package.json not found"
    exit 1
fi
cd ..

# Step 5: Build and start Docker services
print_status "Building Docker services..."
cd docker
docker-compose build
print_success "Docker services built"

print_status "Starting Docker services..."
docker-compose up -d
print_success "Docker services started"

# Step 6: Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Step 7: Run database migrations
print_status "Running database migrations..."
cd ../api
python manage.py migrate
print_success "Database migrations completed"

# Step 8: Create superuser (optional)
print_status "Creating superuser..."
echo "Would you like to create a superuser? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    python manage.py createsuperuser
    print_success "Superuser created"
fi

# Step 9: Deploy smart contract
print_status "Deploying smart contract..."
cd ../contracts
if [ -f "deploy.js" ]; then
    npx hardhat run deploy.js --network localhost
    print_success "Smart contract deployed"
else
    print_error "Deploy script not found"
    exit 1
fi

cd ..

print_success "Blockchain environment setup completed!"
echo ""
echo "🎉 Your MyAddressHub blockchain environment is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Update api/.env with your encryption keys"
echo "2. Access the API at: http://localhost:8000"
echo "3. Access the frontend at: http://localhost:3000"
echo "4. Access IPFS at: http://localhost:8080"
echo "5. Access Hardhat node at: http://localhost:8546"
echo ""
echo "🔧 Useful commands:"
echo "- View logs: docker-compose -f docker/docker-compose.yml logs -f"
echo "- Stop services: docker-compose -f docker/docker-compose.yml down"
echo "- Restart services: docker-compose -f docker/docker-compose.yml restart"
echo ""
echo "⚠️  Remember to:"
echo "- Keep your encryption keys secure"
echo "- Never commit .env files to version control"
echo "- Use different keys for different environments"
