# MyAddressHub

A modern, full-stack web application template with Django backend and Next.js frontend, featuring authentication, user management, and a comprehensive development environment.

## 🚀 Features

- **Full-Stack Architecture**: Django REST API + Next.js frontend
- **Authentication System**: Complete user registration, login, and password reset
- **Modern UI**: Built with Tailwind CSS and responsive design
- **Development Environment**: Docker-based setup with hot reloading
- **Production Ready**: Optimized for deployment with monitoring and logging
- **Database**: PostgreSQL with Redis for caching
- **Task Queue**: Celery with RabbitMQ for background tasks
- **Email Integration**: SMTP email functionality
- **API Documentation**: Auto-generated with Swagger/OpenAPI

## 📚 Documentation

- [Development Guide](docs/DEVELOPMENT.md) - How to set up and run the development environment
- [Production Guide](docs/PRODUCTION.md) - How to deploy to production
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to MyAddressHub
- [API Handling Guide](API_HANDLING_GUIDE.md) - Frontend API integration patterns

## 🛠️ Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Getting Started

1. **Fork the repository**
   - This creates your own copy of MyAddressHub in your GitHub account
   - You can then clone your fork and make changes

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MyAddressHub.git
   cd MyAddressHub
   ```

3. **Set up the upstream remote**
   ```bash
   git remote add upstream https://github.com/ShovanSarker/MyAddressHub.git
   ```

4. **Run the development setup script**
   ```bash
   chmod +x scripts/setup_development.sh
   ./scripts/setup_development.sh
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs/

## 🏗️ Architecture

MyAddressHub uses a modern architecture consisting of:

### Backend (Django)
- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL with Django ORM
- **Authentication**: JWT-based authentication
- **API**: RESTful API with automatic documentation
- **Task Queue**: Celery with RabbitMQ
- **Caching**: Redis
- **Email**: SMTP integration with templates

### Frontend (Next.js)
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **TypeScript**: Full TypeScript support
- **Responsive Design**: Mobile-first approach

### Development Environment
- **Containerization**: Docker and Docker Compose
- **Hot Reloading**: Both frontend and backend
- **Database**: PostgreSQL with persistent data
- **Monitoring**: Health checks and logging
- **Environment**: Isolated development environment

## 📁 Project Structure

```
MyAddressHub/
├── api/                    # Django backend
│   ├── apps/              # Django applications
│   ├── project/           # Django project settings
│   ├── requirements/      # Python dependencies
│   └── manage.py         # Django management
├── app/                   # Next.js frontend
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json      # Node.js dependencies
├── docs/                 # Documentation
├── scripts/              # Setup and deployment scripts
└── templates/            # Environment templates
```

## 🔧 Development

### Backend Development
```bash
cd api
python manage.py runserver
```

### Frontend Development
```bash
cd app
npm run dev
```

### Database Migrations
```bash
cd api
python manage.py makemigrations
python manage.py migrate
```

### Running Tests
```bash
# Backend tests
cd api
python manage.py test

# Frontend tests
cd app
npm test
```

## 🚀 Deployment

### Development Deployment
```bash
./scripts/setup_development.sh
```

### Production Deployment
```bash
./scripts/deploy_production.sh
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Django and Django REST Framework for the robust backend
- Next.js team for the excellent React framework
- Tailwind CSS for the utility-first CSS framework
- All contributors who help improve MyAddressHub

## 📞 Support

If you need help or have questions:
- Check the [documentation](docs/)
- Open an [issue](https://github.com/ShovanSarker/MyAddressHub/issues)
- Join our community discussions

---

**MyAddressHub** - Your complete full-stack web application template 