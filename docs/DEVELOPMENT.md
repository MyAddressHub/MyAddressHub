# Development Guide

This guide will help you set up and run the MyAddressHub development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Git](https://git-scm.com/downloads)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ShovanSarker/MyAddressHub.git
cd MyAddressHub
```

### 2. Run the Setup Script

```bash
chmod +x scripts/setup_development.sh
./scripts/setup_development.sh
```

This script will:
- Create necessary environment files
- Set up Docker containers
- Initialize the database
- Install dependencies

### 3. Start the Development Environment

```bash
./scripts/run_dev.sh
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs/
- **Admin Interface**: http://localhost:8000/admin

## Development Workflow

### Backend Development

The Django backend is located in the `api/` directory.

```bash
# Navigate to the API directory
cd api

# Run Django development server
python manage.py runserver

# Create a new Django app
python manage.py startapp myapp apps/

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser

# Run tests
python manage.py test
```

### Frontend Development

The Next.js frontend is located in the `app/` directory.

```bash
# Navigate to the app directory
cd app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Database Management

```bash
# Access PostgreSQL database
docker-compose exec db psql -U myaddresshub -d myaddresshub

# Reset database
docker-compose down -v
docker-compose up -d db
```

### Environment Variables

The development environment uses the following key environment variables:

```bash
# Database
POSTGRES_DB=myaddresshub
POSTGRES_USER=myaddresshub
POSTGRES_PASSWORD=myaddresshub

# Redis
REDIS_URL=redis://redis:6379/0

# RabbitMQ
RABBITMQ_DEFAULT_USER=myaddresshub
RABBITMQ_DEFAULT_PASS=myaddresshub

# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Email (optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Project Structure

```
MyAddressHub/
├── api/                    # Django backend
│   ├── apps/              # Django applications
│   │   ├── accounts/      # User authentication
│   │   └── core/          # Core functionality
│   ├── project/           # Django project settings
│   ├── requirements/      # Python dependencies
│   └── manage.py         # Django management
├── app/                   # Next.js frontend
│   ├── src/              # Source code
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── docs/                 # Documentation
├── scripts/              # Setup and deployment scripts
└── templates/            # Environment templates
```

## Common Tasks

### Adding New API Endpoints

1. Create a new Django app or use existing one
2. Define models in `models.py`
3. Create serializers in `serializers.py`
4. Add views in `views.py`
5. Configure URLs in `urls.py`
6. Run migrations

### Adding New Frontend Pages

1. Create new page in `app/src/app/`
2. Add components in `app/src/components/`
3. Update navigation if needed
4. Add API integration in `app/src/shared/api/`

### Running Tests

```bash
# Backend tests
cd api
python manage.py test

# Frontend tests
cd app
npm test

# All tests
./scripts/run_tests.sh
```

### Code Quality

```bash
# Backend linting
cd api
flake8 .
black .
isort .

# Frontend linting
cd app
npm run lint
npm run format
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Database connection**: Ensure PostgreSQL container is running
3. **Dependencies**: Run `docker-compose build --no-cache`
4. **Permissions**: Ensure scripts are executable

### Reset Development Environment

```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache

# Start fresh
./scripts/setup_development.sh
```

## Next Steps

- Read the [Production Guide](PRODUCTION.md) for deployment
- Check the [API Documentation](http://localhost:8000/api/docs/)
- Explore the [Contributing Guide](../CONTRIBUTING.md)
- Review the [Code of Conduct](../CODE_OF_CONDUCT.md) 