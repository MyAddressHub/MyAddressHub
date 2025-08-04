# Contributing to MyAddressHub

Thank you for considering contributing to MyAddressHub! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

- Use the GitHub issue tracker
- Include detailed steps to reproduce the bug
- Provide environment information (OS, browser, etc.)
- Include error messages and stack traces

### Suggesting Enhancements

- Use the GitHub issue tracker
- Describe the enhancement clearly
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Pull Requests

- Fork the repository
- Create a feature branch
- Make your changes
- Add tests for new functionality
- Update documentation
- Submit a pull request

## Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/myaddresshub.git
   cd myaddresshub
   ```

2. **Set up the development environment**
   ```bash
   ./scripts/setup_development.sh
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update the changelog** if applicable
5. **Follow the existing code style**
6. **Write clear commit messages**

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

## Issue Guidelines

### Bug Reports

- Use the bug report template
- Include steps to reproduce
- Provide expected vs actual behavior
- Include environment details

### Feature Requests

- Use the feature request template
- Describe the feature clearly
- Explain the use case
- Consider implementation complexity

## Coding Standards

### Python (Django)

- Follow PEP 8 style guide
- Use meaningful variable names
- Add docstrings to functions and classes
- Keep functions small and focused
- Use type hints where appropriate

### JavaScript/TypeScript (Next.js)

- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions
- Use TypeScript for type safety
- Follow React best practices

### General

- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Use consistent naming conventions

## Testing

### Backend Tests

```bash
cd api
python manage.py test
```

### Frontend Tests

```bash
cd app
npm test
```

### Running All Tests

```bash
./scripts/run_tests.sh
```

## Documentation

- Update README.md for major changes
- Update API documentation for endpoint changes
- Add inline comments for complex code
- Update setup instructions if needed

## Getting Help

- Check existing issues and pull requests
- Ask questions in GitHub discussions
- Review the documentation
- Join our community chat

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- The contributors list

Thank you for contributing to MyAddressHub! 