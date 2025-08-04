# Production Deployment Guide

This guide provides detailed instructions for deploying MyAddressHub to production.

## Prerequisites

Before deploying to production, ensure you have:

- A server with Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- A domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- Basic knowledge of Linux server administration

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone the Repository

```bash
git clone https://github.com/ShovanSarker/MyAddressHub.git
cd MyAddressHub
```

### 3. Configure Environment

```bash
# Copy environment template
cp templates/env/production/api.env.template .env

# Edit environment variables
nano .env
```

Key environment variables for production:

```env
# Django settings
DEBUG=False
SECRET_KEY=your-secure-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
POSTGRES_DB=myaddresshub
POSTGRES_USER=myaddresshub
POSTGRES_PASSWORD=your-secure-password

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Redis
REDIS_URL=redis://redis:6379/0

# RabbitMQ
RABBITMQ_DEFAULT_USER=myaddresshub
RABBITMQ_DEFAULT_PASS=your-secure-password
```

## Database Setup

### PostgreSQL Configuration

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE myaddresshub;
CREATE USER myaddresshub WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE myaddresshub TO myaddresshub;
\q
```

### Database Backup Strategy

```bash
# Create backup directory
sudo mkdir -p /backup
sudo chown $USER:$USER /backup

# Backup script
cat > /backup/backup.sh << 'EOL'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U myaddresshub myaddresshub > /backup/myaddresshub_backup_$DATE.sql
find /backup -name "myaddresshub_backup_*.sql" -mtime +7 -delete
EOL

chmod +x /backup/backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /backup/backup.sh
```

## Deployment

### 1. Build and Deploy

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec api python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml exec api python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml exec api python manage.py collectstatic --noinput
```

### 2. Nginx Configuration

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/myaddresshub
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Admin interface
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location /static/ {
        alias /path/to/myaddresshub/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /path/to/myaddresshub/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/myaddresshub /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Monitoring and Logging

### 1. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'myaddresshub'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

### 2. Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/myaddresshub
```

Logrotate configuration:

```
/path/to/myaddresshub/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        docker-compose -f /path/to/myaddresshub/docker-compose.prod.yml restart nginx
    endscript
}
```

### 3. Health Checks

```bash
# Create health check script
cat > /path/to/myaddresshub/health_check.sh << 'EOL'
#!/bin/bash
if curl -f http://localhost:8000/health/; then
    echo "API is healthy"
else
    echo "API is down"
    # Send notification or restart services
fi
EOL

chmod +x /path/to/myaddresshub/health_check.sh

# Add to crontab
crontab -e
# Add: */5 * * * * /path/to/myaddresshub/health_check.sh
```

## Maintenance

### Database Maintenance

```bash
# Connect to database
docker-compose -f docker-compose.prod.yml exec db psql -U myaddresshub

# Restore from backup
sudo -u postgres psql myaddresshub < /backup/myaddresshub_backup.sql

# Database optimization
docker-compose -f docker-compose.prod.yml exec db vacuumdb -U myaddresshub -d myaddresshub
```

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec api python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec api python manage.py collectstatic --noinput
```

### Log Management

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f api

# Clean old logs
docker system prune -f
```

## Security Considerations

1. **Firewall Configuration**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Regular Security Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Database Security**
   - Use strong passwords
   - Limit database access
   - Regular backups
   - Monitor access logs

4. **Application Security**
   - Keep dependencies updated
   - Use HTTPS everywhere
   - Implement rate limiting
   - Monitor for suspicious activity

## Performance Optimization

1. **Caching**
   - Redis for session storage
   - CDN for static files
   - Database query optimization

2. **Load Balancing**
   - Multiple application instances
   - Database read replicas
   - CDN for global distribution

3. **Monitoring**
   - Application performance metrics
   - Server resource usage
   - Database performance
   - User experience metrics

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check environment variables
   - Verify database connection
   - Review application logs

2. **Database connection issues**
   - Verify PostgreSQL is running
   - Check credentials
   - Test network connectivity

3. **SSL certificate issues**
   - Verify domain configuration
   - Check certificate expiration
   - Test SSL configuration

### Emergency Procedures

1. **Rollback to previous version**
   ```bash
   git checkout <previous-tag>
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Database recovery**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   # Restore from backup
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Support

For production deployment support:
- Check the [Development Guide](DEVELOPMENT.md)
- Review the [Contributing Guide](../CONTRIBUTING.md)
- Open an issue on GitHub
- Contact the maintainers 