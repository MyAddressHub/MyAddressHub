# DevOps & Deployment - MyAddressHub

## 9. DevOps & Deployment

### 9.1 Containerization Strategy

#### 9.1.1 Docker Configuration

**API Service Dockerfile**:
```dockerfile
# api/Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements/ /app/requirements/
RUN pip install --no-cache-dir -r requirements/base.txt

# Copy application code
COPY . /app/

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health/ || exit 1

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

**Frontend Dockerfile**:
```dockerfile
# app/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 9.1.2 Docker Compose Configuration

**Development Environment**:
```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  # API service
  api:
    build:
      context: ../api
      dockerfile: Dockerfile
    container_name: MyAddressHub_api
    volumes:
      - ../api:/app
    env_file:
      - ../api/.env
    environment:
      - DJANGO_SETTINGS_MODULE=project.settings.development
      - DEBUG=True
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POLYGON_RPC_URL=http://hardhat-node:8545
      - IPFS_API_URL=http://ipfs-node:5001
      - CELERY_BROKER_URL=amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@rabbitmq:5672/${RABBITMQ_DEFAULT_VHOST}
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
      hardhat-node:
        condition: service_healthy
      ipfs-node:
        condition: service_healthy
    ports:
      - "8000:8000"
    command: python manage.py runserver 0.0.0.0:8000

  # Frontend service
  frontend:
    build:
      context: ../app
      dockerfile: Dockerfile
    container_name: MyAddressHub_frontend
    volumes:
      - ../app:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - api
    ports:
      - "3000:3000"
    command: npm run dev

  # Database service
  postgres:
    image: postgres:15-alpine
    container_name: MyAddressHub_postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for caching and Celery results backend
  redis:
    image: redis:7-alpine
    container_name: MyAddressHub_redis
    volumes:
      - redisdata:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RabbitMQ for message broker
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: MyAddressHub_rabbitmq
    environment:
      - RABBITMQ_DEFAULT_USER=${RABBITMQ_DEFAULT_USER}
      - RABBITMQ_DEFAULT_PASS=${RABBITMQ_DEFAULT_PASS}
      - RABBITMQ_DEFAULT_VHOST=${RABBITMQ_DEFAULT_VHOST}
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Hardhat Node for Smart Contract Development
  hardhat-node:
    build:
      context: ../contracts
      dockerfile: Dockerfile
    container_name: MyAddressHub_hardhat_node
    volumes:
      - ../contracts:/app
      - hardhat-data:/app/node_modules
    ports:
      - "8546:8545"
    environment:
      - NODE_ENV=development
      - HARDHAT_NETWORK=hardhat
    command: npx hardhat node --hostname 0.0.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8545"]
      interval: 30s
      timeout: 10s
      retries: 5

  # IPFS Node
  ipfs-node:
    image: ipfs/kubo:latest
    container_name: MyAddressHub_ipfs_node
    volumes:
      - ipfs-data:/data/ipfs
      - ipfs-staging:/export
    ports:
      - "4001:4001"
      - "5001:5001"
      - "8080:8080"
    environment:
      - IPFS_PROFILE=server
    command: daemon --migrate=true --agent-version-suffix=docker
    healthcheck:
      test: ["CMD", "ipfs", "dag", "stat", "/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  pgdata:
  redisdata:
  hardhat-data:
  ipfs-data:
  ipfs-staging:
```

### 9.2 Environment Management

#### 9.2.1 Environment Variables

**API Environment (.env)**:
```bash
# Django Configuration
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
POSTGRES_DB=MyAddressHub
POSTGRES_USER=MyAddressHub
POSTGRES_PASSWORD=your-db-password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Celery Configuration
CELERY_BROKER_URL=amqp://user:password@rabbitmq:5672/vhost
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Blockchain Configuration
POLYGON_RPC_URL=http://hardhat-node:8545
ADDRESS_HUB_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# IPFS Configuration
IPFS_API_URL=http://ipfs-node:5001

# Encryption Configuration
ADDRESS_ENCRYPTION_KEY=your-encryption-key
ADDRESS_ENCRYPTION_PASSWORD=your-encryption-password
ADDRESS_ENCRYPTION_SALT=your-encryption-salt

# RabbitMQ Configuration
RABBITMQ_DEFAULT_USER=user
RABBITMQ_DEFAULT_PASS=password
RABBITMQ_DEFAULT_VHOST=vhost
```

**Frontend Environment (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=MyAddressHub
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Blockchain-integrated address management system
```

#### 9.2.2 Environment Templates

**Development Template**:
```bash
# templates/env/development/api.env.template
DJANGO_SECRET_KEY=change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

POSTGRES_DB=MyAddressHub
POSTGRES_USER=MyAddressHub
POSTGRES_PASSWORD=change-this-password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_URL=redis://redis:6379/0

CELERY_BROKER_URL=amqp://user:password@rabbitmq:5672/vhost
CELERY_RESULT_BACKEND=redis://redis:6379/0

POLYGON_RPC_URL=http://hardhat-node:8545
ADDRESS_HUB_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

IPFS_API_URL=http://ipfs-node:5001

ADDRESS_ENCRYPTION_KEY=change-this-encryption-key
ADDRESS_ENCRYPTION_PASSWORD=change-this-encryption-password
ADDRESS_ENCRYPTION_SALT=change-this-encryption-salt

RABBITMQ_DEFAULT_USER=user
RABBITMQ_DEFAULT_PASS=password
RABBITMQ_DEFAULT_VHOST=vhost
```

### 9.3 Deployment Strategies

#### 9.3.1 Development Deployment

**Setup Script**:
```bash
#!/bin/bash
# scripts/setup_development.sh

set -e

echo "🚀 Setting up MyAddressHub development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Generate encryption keys
echo "🔐 Generating encryption keys..."
python3 scripts/generate_encryption_keys.py

# Copy environment templates
echo "📝 Setting up environment files..."
cp templates/env/development/api.env.template api/.env
cp templates/env/development/app.env.template app/.env.local

# Build and start services
echo "🏗️ Building and starting services..."
cd docker
docker-compose build
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec api python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
docker-compose exec api python manage.py createsuperuser --noinput --username admin --email admin@example.com || true

echo "✅ Development environment setup complete!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/api/docs/"
echo "🐰 RabbitMQ Management: http://localhost:15672"
echo "🗄️ PostgreSQL: localhost:5432"
echo "🔗 Redis: localhost:6379"
echo "⛓️ Hardhat Node: http://localhost:8546"
echo "📁 IPFS Gateway: http://localhost:8080"
```

#### 9.3.2 Production Deployment

**Production Docker Compose**:
```yaml
# docker/docker-compose.prod.yml
version: '3.8'

services:
  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: MyAddressHub_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
      - frontend
    restart: unless-stopped

  # API service (production)
  api:
    build:
      context: ../api
      dockerfile: Dockerfile.prod
    container_name: MyAddressHub_api_prod
    environment:
      - DJANGO_SETTINGS_MODULE=project.settings.production
      - DEBUG=False
    env_file:
      - ../api/.env.prod
    depends_on:
      - postgres
      - redis
      - rabbitmq
    restart: unless-stopped
    command: gunicorn project.wsgi:application --bind 0.0.0.0:8000 --workers 4

  # Frontend service (production)
  frontend:
    build:
      context: ../app
      dockerfile: Dockerfile.prod
    container_name: MyAddressHub_frontend_prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.myaddresshub.com
    restart: unless-stopped

  # Database service (production)
  postgres:
    image: postgres:15-alpine
    container_name: MyAddressHub_postgres_prod
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    restart: unless-stopped

  # Redis service (production)
  redis:
    image: redis:7-alpine
    container_name: MyAddressHub_redis_prod
    volumes:
      - redisdata:/data
    restart: unless-stopped

  # RabbitMQ service (production)
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: MyAddressHub_rabbitmq_prod
    environment:
      - RABBITMQ_DEFAULT_USER=${RABBITMQ_DEFAULT_USER}
      - RABBITMQ_DEFAULT_PASS=${RABBITMQ_DEFAULT_PASS}
      - RABBITMQ_DEFAULT_VHOST=${RABBITMQ_DEFAULT_VHOST}
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

**Production Nginx Configuration**:
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api_backend {
        server api:8000;
    }

    upstream frontend_backend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        listen 80;
        server_name myaddresshub.com www.myaddresshub.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name myaddresshub.com www.myaddresshub.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API Proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 9.4 CI/CD Pipeline

#### 9.4.1 GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install Python dependencies
      run: |
        cd api
        pip install -r requirements/base.txt
        pip install -r requirements/dev.txt

    - name: Install Node.js dependencies
      run: |
        cd app
        npm ci

    - name: Run Python tests
      run: |
        cd api
        python manage.py test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379/0

    - name: Run Node.js tests
      run: |
        cd app
        npm test

    - name: Run linting
      run: |
        cd api
        flake8 .
        cd ../app
        npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha

    - name: Build and push API image
      uses: docker/build-push-action@v4
      with:
        context: ./api
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/api:${{ github.sha }}
        labels: ${{ steps.meta.outputs.labels }}

    - name: Build and push Frontend image
      uses: docker/build-push-action@v4
      with:
        context: ./app
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/frontend:${{ github.sha }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add deployment commands here
```

### 9.5 Monitoring & Logging

#### 9.5.1 Health Checks

**API Health Check Endpoint**:
```python
# apps/core/urls/health.py
from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError
from redis.exceptions import RedisError
import redis
import os
import datetime

def health_check(request):
    """Health check endpoint for monitoring and load balancers."""
    # Check database connection
    db_healthy = True
    try:
        connections['default'].cursor()
    except OperationalError:
        db_healthy = False
    
    # Check Redis connection
    redis_healthy = True
    try:
        redis_url = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
        redis_client = redis.from_url(redis_url)
        redis_client.ping()
    except RedisError:
        redis_healthy = False
    
    # Overall health status
    status = 'healthy' if db_healthy and redis_healthy else 'unhealthy'
    status_code = 200 if status == 'healthy' else 503
    
    response_data = {
        'status': status,
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'components': {
            'database': 'healthy' if db_healthy else 'unhealthy',
            'redis': 'healthy' if redis_healthy else 'unhealthy',
        }
    }
    
    return JsonResponse(response_data, status=status_code)
```

#### 9.5.2 Logging Configuration

**Production Logging**:
```python
# settings/production.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/app/logs/django.log',
            'formatter': 'json',
            'maxBytes': 1024 * 1024 * 100,  # 100 MB
            'backupCount': 5,
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 9.6 Backup & Recovery

#### 9.6.1 Database Backup

**Automated Backup Script**:
```bash
#!/bin/bash
# scripts/backup_database.sh

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="MyAddressHub"
DB_USER="MyAddressHub"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_DIR/backup_$DATE.dump"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete

echo "Backup completed: backup_$DATE.dump"
```

**Cron Job for Automated Backups**:
```bash
# Add to crontab
0 2 * * * /path/to/scripts/backup_database.sh
```

#### 9.6.2 Recovery Process

**Database Recovery Script**:
```bash
#!/bin/bash
# scripts/restore_database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring database from: $BACKUP_FILE"

# Stop the application
docker-compose stop api

# Restore from backup
pg_restore -h localhost -U MyAddressHub -d MyAddressHub \
    --clean \
    --if-exists \
    --verbose \
    $BACKUP_FILE

# Start the application
docker-compose start api

echo "Database restore completed"
```

### 9.7 Security Hardening

#### 9.7.1 Container Security

**Security Scanning**:
```bash
# Scan Docker images for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image myaddresshub/api:latest

# Scan for secrets
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image --security-checks secret myaddresshub/api:latest
```

**Non-root User Configuration**:
```dockerfile
# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app
```

#### 9.7.2 Network Security

**Firewall Configuration**:
```bash
# UFW firewall rules
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**Docker Network Isolation**:
```yaml
# docker-compose.yml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
  database:
    driver: bridge

services:
  api:
    networks:
      - backend
      - database
  
  frontend:
    networks:
      - frontend
      - backend
  
  postgres:
    networks:
      - database
```

---

*This section provides comprehensive DevOps and deployment documentation including containerization, environment management, CI/CD pipelines, monitoring, backup strategies, and security hardening.*
